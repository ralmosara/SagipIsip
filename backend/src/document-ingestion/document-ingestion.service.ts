import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
const pdfParseRaw = require('pdf-parse');
const pdfParse = pdfParseRaw.default || pdfParseRaw;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const EPubRaw = require('epub2');
const EPub = EPubRaw.default || EPubRaw.EPub || EPubRaw;
import { PrismaService } from '../prisma/prisma.service';
import { Ollama } from 'ollama';

const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434',
});

@Injectable()
export class DocumentIngestionService {
  private readonly logger = new Logger(DocumentIngestionService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Step 1: Ingest all PDFs and EPUBs from the books directory.
   * Parses text, chunks it, generates embeddings via Ollama, stores in DB.
   */
  async processBooksDirectory() {
    let booksDir = path.resolve(process.cwd(), '..', 'books');
    if (!fs.existsSync(booksDir)) {
      booksDir = path.resolve(process.cwd(), 'books');
    }
    if (!fs.existsSync(booksDir)) {
      booksDir = path.resolve(__dirname, '..', '..', '..', 'books');
    }

    this.logger.log(`Scanning books directory: ${booksDir}`);

    if (!fs.existsSync(booksDir)) {
      this.logger.warn(`Books directory not found at ${booksDir}`);
      return;
    }

    const files = fs.readdirSync(booksDir);
    this.logger.log(`Found ${files.length} items in books directory.`);

    for (const file of files) {
      const filePath = path.join(booksDir, file);
      if (!file.endsWith('.pdf') && !file.endsWith('.epub')) {
        continue;
      }

      // Check if already fully embedded
      const existingRows: any[] = await this.prisma.$queryRawUnsafe(
        `SELECT COUNT(*) as total, COUNT(embedding) as embedded FROM "DocumentChunk" WHERE "bookTitle" = $1`,
        file,
      );
      const total = Number(existingRows[0]?.total || 0);
      const embedded = Number(existingRows[0]?.embedded || 0);

      if (total > 0 && embedded === total && embedded >= 10) {
        this.logger.log(`Skipping ${file} — already fully embedded (${embedded} chunks).`);
        continue;
      }

      if (total > 0) {
        this.logger.log(`Re-ingesting ${file} — cleaning up incomplete ${total} chunks (${embedded} embedded).`);
        await this.prisma.$executeRawUnsafe(
          `DELETE FROM "DocumentChunk" WHERE "bookTitle" = $1`,
          file,
        );
      }

      if (file.endsWith('.pdf')) {
        await this.ingestPdf(filePath, file);
      } else if (file.endsWith('.epub')) {
        await this.ingestEpub(filePath, file);
      }
    }

    // Ensure pgvector HNSW index for fast similarity search
    await this.ensureVectorIndex();
    this.logger.log('All books processed successfully.');
  }

  /**
   * Step 2: RAG Query — given a user question, find the most relevant book chunks.
   * Returns a string of context to inject into the AI system prompt.
   */
  async retrieveRelevantContext(query: string, topK = 4): Promise<string> {
    const { context } = await this.retrieveContextWithSources(query, topK);
    return context;
  }

  /**
   * Retrieves relevant chunks along with the distinct book source titles.
   */
  async retrieveContextWithSources(
    query: string,
    topK = 4,
  ): Promise<{
    context: string;
    sources: string[];
    chunks: Array<{ content: string; bookTitle: string; distance: number; similarity: number }>;
  }> {
    const chunks = await this.retrieveRelevantChunks(query, topK);
    if (!chunks || chunks.length === 0) {
      return { context: '', sources: [], chunks: [] };
    }

    const uniqueSources = Array.from(new Set(chunks.map((c) => c.bookTitle)));
    const context = chunks
      .map(
        (r, i) =>
          `[Source ${i + 1}: "${r.bookTitle}" (Relevance: ${(r.similarity * 100).toFixed(1)}%)]\n${r.content}`,
      )
      .join('\n\n---\n\n');

    this.logger.log(`RAG: Found ${chunks.length} relevant chunks across ${uniqueSources.length} books for query.`);
    return { context, sources: uniqueSources, chunks };
  }

  /**
   * Low-level vector similarity search using PostgreSQL pgvector <=> cosine distance operator.
   */
  async retrieveRelevantChunks(
    query: string,
    topK = 4,
  ): Promise<Array<{ content: string; bookTitle: string; distance: number; similarity: number }>> {
    try {
      const queryEmbedding = await this.generateEmbedding(query);
      if (!queryEmbedding) return [];

      const vectorString = `[${queryEmbedding.join(',')}]`;

      const results: Array<{ content: string; bookTitle: string; distance: number }> =
        await this.prisma.$queryRawUnsafe(
          `SELECT content, "bookTitle", (embedding <=> $1::vector) as distance
           FROM "DocumentChunk"
           WHERE embedding IS NOT NULL
           ORDER BY embedding <=> $1::vector
           LIMIT $2`,
          vectorString,
          topK,
        );

      if (!results || results.length === 0) return [];

      return results.map((r) => ({
        content: r.content,
        bookTitle: r.bookTitle,
        distance: Number(r.distance),
        similarity: Math.max(0, Math.min(1, 1 - Number(r.distance))),
      }));
    } catch (err) {
      this.logger.error('RAG chunk retrieval failed:', err);
      return [];
    }
  }

  /**
   * Direct Clinical Consultation: Answers a clinical or psychological inquiry
   * grounded strictly in the 22-book vectorized library with cited sources.
   */
  async clinicalConsult(
    query: string,
    topK = 4,
  ): Promise<{
    query: string;
    answer: string;
    sources: string[];
    chunks: Array<{ content: string; bookTitle: string; similarity: number }>;
  }> {
    const { context, sources, chunks } = await this.retrieveContextWithSources(query, topK);

    const systemPrompt =
      `You are a Senior Clinical Consultation AI for SagipIsip. ` +
      `Your role is to assist therapists, counselors, and patients by providing evidence-based, compassionate psychoeducation and clinical strategies.\n\n` +
      `You have access to 22 authoritative mental health textbooks (CBT, DBT, Attachment Theory, Dissociation, Youth Mental Health, Behavioral Activation).\n\n` +
      `Ground your answer in the clinical reference material provided below. When helpful, mention the underlying concepts (e.g., Beck's cognitive model, DBT PLEASE/TIPP skills, attachment styles) and provide actionable, structured guidance.\n\n` +
      (context
        ? `## Clinical Reference Material (Retrieved from pgvector):\n${context}\n\n`
        : `No direct reference material found. Use evidence-based clinical psychology best practices.\n\n`);

    const response = await ollama.chat({
      model: process.env.OLLAMA_MODEL || 'llama3',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      options: {
        temperature: 0.6,
        top_p: 0.9,
      },
    });

    return {
      query,
      answer: response.message.content,
      sources,
      chunks: chunks.map((c) => ({
        bookTitle: c.bookTitle,
        content: c.content,
        similarity: c.similarity,
      })),
    };
  }

  /**
   * Create HNSW index on DocumentChunk.embedding if it does not already exist.
   */
  async ensureVectorIndex(): Promise<void> {
    try {
      await this.prisma.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "DocumentChunk_embedding_hnsw_idx" 
         ON "DocumentChunk" USING hnsw (embedding vector_cosine_ops);`,
      );
      this.logger.log('HNSW vector index verified on DocumentChunk.');
    } catch (err) {
      this.logger.warn(`Could not create HNSW vector index: ${err}`);
    }
  }

  // ─── Private Methods ──────────────────────────────────────────────────────

  private async ingestPdf(filePath: string, title: string) {
    this.logger.log(`Processing PDF: ${title}`);
    const dataBuffer = fs.readFileSync(filePath);

    try {
      let text = '';
      if (pdfParseRaw && pdfParseRaw.PDFParse) {
        const parser = new pdfParseRaw.PDFParse({ data: dataBuffer });
        await parser.load();
        const res = await parser.getText();
        text = res?.text || '';
        await parser.destroy();
      } else if (typeof pdfParse === 'function') {
        const data = await pdfParse(dataBuffer);
        text = data?.text || '';
      }

      if (!text || text.trim().length < 50) {
        this.logger.warn(`PDF "${title}" produced insufficient text. Skipping.`);
        return;
      }

      const chunks = this.chunkText(text, 800);
      this.logger.log(`Generated ${chunks.length} chunks for "${title}"`);

      await this.embedAndStore(chunks, title);
    } catch (err) {
      this.logger.error(`Failed to parse PDF "${title}"`, err);
    }
  }

  private async ingestEpub(filePath: string, title: string) {
    this.logger.log(`Processing EPUB: ${title}`);

    try {
      const text = await this.extractEpubText(filePath);
      if (!text || text.trim().length < 100) {
        this.logger.warn(`EPUB "${title}" produced insufficient text. Skipping.`);
        return;
      }

      const chunks = this.chunkText(text, 800);
      this.logger.log(`Generated ${chunks.length} chunks for EPUB "${title}"`);

      await this.embedAndStore(chunks, title);
    } catch (err) {
      this.logger.error(`Failed to parse EPUB "${title}"`, err);
    }
  }

  private extractEpubText(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const epub = new EPub(filePath);

      epub.on('error', (err: Error) => reject(err));

      epub.on('end', async () => {
        const textParts: string[] = [];
        const chapterIds: string[] = epub.flow.map((chapter: any) => chapter.id);

        for (const chapterId of chapterIds) {
          await new Promise<void>((res) => {
            epub.getChapter(chapterId, (err: Error | null, text: string) => {
              if (!err && text) {
                const plain = text
                  .replace(/<[^>]+>/g, ' ')
                  .replace(/&nbsp;/g, ' ')
                  .replace(/&amp;/g, '&')
                  .replace(/&lt;/g, '<')
                  .replace(/&gt;/g, '>')
                  .replace(/&quot;/g, '"')
                  .replace(/&#\d+;/g, ' ')
                  .replace(/\s+/g, ' ')
                  .trim();
                if (plain.length > 50) {
                  textParts.push(plain);
                }
              }
              res();
            });
          });
        }

        resolve(textParts.join('\n\n'));
      });

      epub.parse();
    });
  }

  /**
   * Embeds text chunks in batches of 10 and stores them in DocumentChunk.
   */
  private async embedAndStore(chunks: string[], title: string): Promise<void> {
    let embedded = 0;
    const batchSize = 10;

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const embeddings = await Promise.all(
        batch.map((chunk) => this.generateEmbedding(chunk)),
      );

      for (let j = 0; j < batch.length; j++) {
        const chunk = batch[j];
        const embedding = embeddings[j];

        if (embedding && embedding.length === 768) {
          const vectorString = `[${embedding.join(',')}]`;
          await this.prisma.$executeRawUnsafe(
            `INSERT INTO "DocumentChunk" (id, "bookTitle", content, embedding, "createdAt")
             VALUES (gen_random_uuid(), $1, $2, $3::vector, NOW())`,
            title,
            chunk,
            vectorString,
          );
          embedded++;
        } else {
          await this.prisma.documentChunk.create({
            data: { bookTitle: title, content: chunk },
          });
        }
      }

      if ((i + batchSize) % 100 < batchSize || i + batchSize >= chunks.length) {
        this.logger.log(
          `Ingesting "${title}": ${Math.min(i + batchSize, chunks.length)}/${chunks.length} chunks (${embedded} embedded)...`,
        );
      }
    }

    this.logger.log(
      `Finished ingesting "${title}": ${embedded}/${chunks.length} chunks embedded.`,
    );
  }

  /**
   * Generate a vector embedding for text using Ollama's nomic-embed-text model.
   */
  private async generateEmbedding(text: string): Promise<number[] | null> {
    try {
      const response = await ollama.embeddings({
        model: 'nomic-embed-text',
        prompt: text,
      });
      return response.embedding;
    } catch {
      try {
        const response = await ollama.embeddings({
          model: process.env.OLLAMA_MODEL || 'llama3',
          prompt: text,
        });
        return response.embedding;
      } catch (err2) {
        this.logger.warn(`Embedding generation failed: ${err2}`);
        return null;
      }
    }
  }

  /**
   * Splits text into coherent chunks of ~chunkSize characters,
   * respecting sentence and paragraph boundaries.
   */
  private chunkText(text: string, chunkSize = 800): string[] {
    const paragraphs = text.split(/\n\s*\n/);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const p of paragraphs) {
      const cleaned = p.replace(/\s+/g, ' ').trim();
      if (!cleaned || cleaned.length < 20) continue;

      if (cleaned.length > chunkSize) {
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
        let remaining = cleaned;
        while (remaining.length > chunkSize) {
          let splitIdx = remaining.lastIndexOf('. ', chunkSize);
          if (splitIdx === -1 || splitIdx < chunkSize / 2) {
            splitIdx = remaining.lastIndexOf(' ', chunkSize);
          }
          if (splitIdx === -1) {
            splitIdx = chunkSize;
          }
          chunks.push(remaining.substring(0, splitIdx + 1).trim());
          remaining = remaining.substring(splitIdx + 1).trim();
        }
        currentChunk = remaining;
      } else if (currentChunk.length + cleaned.length > chunkSize) {
        if (currentChunk.trim()) chunks.push(currentChunk.trim());
        currentChunk = cleaned;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + cleaned;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }
}
