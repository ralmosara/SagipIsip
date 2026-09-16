import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');
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
   * Step 1: Ingest all PDFs from the books directory.
   * Parses text, chunks it, generates embeddings via Ollama, stores in DB.
   */
  async processBooksDirectory() {
    const booksDir = path.join(process.cwd(), '..', 'books');
    this.logger.log(`Scanning books directory: ${booksDir}`);

    if (!fs.existsSync(booksDir)) {
      this.logger.warn('Books directory not found.');
      return;
    }

    const files = fs.readdirSync(booksDir);

    for (const file of files) {
      const filePath = path.join(booksDir, file);

      if (file.endsWith('.pdf')) {
        // Check if already ingested
        const existing = await this.prisma.documentChunk.findFirst({
          where: { bookTitle: file },
        });
        if (existing) {
          this.logger.log(`Skipping ${file} — already ingested.`);
          continue;
        }
        await this.ingestPdf(filePath, file);
      } else if (file.endsWith('.epub')) {
        this.logger.log(`Skipping EPUB ${file} (epub parser not installed).`);
      }
    }

    this.logger.log('All books processed.');
  }

  /**
   * Step 2: RAG Query — given a user question, find the most relevant book chunks.
   * Returns a string of context to inject into the AI system prompt.
   */
  async retrieveRelevantContext(query: string, topK = 4): Promise<string> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);
      if (!queryEmbedding) return '';

      const vectorString = `[${queryEmbedding.join(',')}]`;

      // Cosine similarity search using pgvector's <=> operator via raw SQL
      const results: Array<{ content: string; bookTitle: string }> =
        await this.prisma.$queryRawUnsafe(
          `SELECT content, "bookTitle"
           FROM "DocumentChunk"
           WHERE embedding IS NOT NULL
           ORDER BY embedding <=> $1::vector
           LIMIT $2`,
          vectorString,
          topK,
        );

      if (!results || results.length === 0) return '';

      const context = results
        .map(
          (r, i) =>
            `[Source ${i + 1}: "${r.bookTitle}"]\n${r.content}`,
        )
        .join('\n\n---\n\n');

      this.logger.log(`RAG: Found ${results.length} relevant chunks for query.`);
      return context;
    } catch (err) {
      this.logger.error('RAG retrieval failed:', err);
      return '';
    }
  }

  // ─── Private Methods ──────────────────────────────────────────────────────

  private async ingestPdf(filePath: string, title: string) {
    this.logger.log(`Processing PDF: ${title}`);
    const dataBuffer = fs.readFileSync(filePath);

    try {
      const data = await pdfParse(dataBuffer);
      const text: string = data.text;

      const chunks = this.chunkText(text, 800);
      this.logger.log(`Generated ${chunks.length} chunks for "${title}"`);

      let embedded = 0;
      for (const chunk of chunks) {
        const embedding = await this.generateEmbedding(chunk);

        if (embedding) {
          const vectorString = `[${embedding.join(',')}]`;
          // Use raw SQL to insert with vector type (Prisma doesn't support Unsupported types natively)
          await this.prisma.$executeRawUnsafe(
            `INSERT INTO "DocumentChunk" (id, "bookTitle", content, embedding, "createdAt")
             VALUES (gen_random_uuid(), $1, $2, $3::vector, NOW())`,
            title,
            chunk,
            vectorString,
          );
          embedded++;
        } else {
          // Store without embedding (fallback)
          await this.prisma.documentChunk.create({
            data: { bookTitle: title, content: chunk },
          });
        }
      }

      this.logger.log(
        `Finished ingesting "${title}": ${embedded}/${chunks.length} chunks embedded.`,
      );
    } catch (err) {
      this.logger.error(`Failed to parse PDF "${title}"`, err);
    }
  }

  /**
   * Generate a vector embedding for text using Ollama's nomic-embed-text model.
   * Falls back to llama3 if nomic-embed-text is not available.
   */
  private async generateEmbedding(text: string): Promise<number[] | null> {
    try {
      const response = await ollama.embeddings({
        model: 'nomic-embed-text',
        prompt: text,
      });
      return response.embedding;
    } catch {
      // Try llama3 as fallback embedding model
      try {
        const response = await ollama.embeddings({
          model: 'llama3',
          prompt: text,
        });
        return response.embedding;
      } catch (err2) {
        this.logger.warn(`Embedding generation failed: ${err2}`);
        return null;
      }
    }
  }

  private chunkText(text: string, chunkSize: number): string[] {
    const paragraphs = text.split(/\n\s*\n/);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const p of paragraphs) {
      const cleaned = p.replace(/\s+/g, ' ').trim();
      if (!cleaned || cleaned.length < 20) continue; // Skip very short paragraphs

      if (currentChunk.length + cleaned.length > chunkSize) {
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
