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
   *
   * Previously, 8 of 22 books (.epub files) were entirely skipped, meaning
   * the RAG system had no access to: Mental Health Workbook (CBT/DBT/Attachment Theory),
   * AI for Doctors, Helping Children, Biopsychosocial Toolkit, Working with Dissociation,
   * Integrating AI into Mental Health Care, and Where to Start (Mental Health America).
   * This fix restores that clinical knowledge to the AI companion.
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
        const existing = await this.prisma.documentChunk.findFirst({
          where: { bookTitle: file },
        });
        if (existing) {
          this.logger.log(`Skipping ${file} — already ingested.`);
          continue;
        }
        await this.ingestPdf(filePath, file);
      } else if (file.endsWith('.epub')) {
        const existing = await this.prisma.documentChunk.findFirst({
          where: { bookTitle: file },
        });
        if (existing) {
          this.logger.log(`Skipping EPUB ${file} — already ingested.`);
          continue;
        }
        await this.ingestEpub(filePath, file);
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
      const queryEmbedding = await this.generateEmbedding(query);
      if (!queryEmbedding) return '';

      const vectorString = `[${queryEmbedding.join(',')}]`;

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

      await this.embedAndStore(chunks, title);
    } catch (err) {
      this.logger.error(`Failed to parse PDF "${title}"`, err);
    }
  }

  /**
   * Parses EPUB files and extracts plain text for RAG ingestion.
   * This unlocks the following books previously inaccessible to the AI:
   * - Mental Health Workbook 7-in-1 (CBT, DBT, Attachment Theory)
   * - AI for Doctors and Nurse Practitioners
   * - Helping Children: Principles of Good Practice
   * - The Biopsychosocial Multiaxial Toolkit
   * - Working with Dissociation in Clinical Practice
   * - Integrating AI into Mental Health Care
   * - Where to Start: A Survival Guide to Anxiety & Depression
   * - Mental Health Workbook (David Lawson)
   */
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

  /**
   * Extracts raw text from an EPUB file using epub2.
   * Strips HTML tags to get clean plain text for embedding.
   */
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
                // Strip HTML tags to get plain text
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
   * Embeds an array of text chunks and stores them in the DocumentChunk table.
   */
  private async embedAndStore(chunks: string[], title: string): Promise<void> {
    let embedded = 0;
    for (const chunk of chunks) {
      const embedding = await this.generateEmbedding(chunk);

      if (embedding) {
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

    this.logger.log(
      `Finished ingesting "${title}": ${embedded}/${chunks.length} chunks embedded.`,
    );
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

  private chunkText(text: string, chunkSize: number): string[] {
    const paragraphs = text.split(/\n\s*\n/);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const p of paragraphs) {
      const cleaned = p.replace(/\s+/g, ' ').trim();
      if (!cleaned || cleaned.length < 20) continue;

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
