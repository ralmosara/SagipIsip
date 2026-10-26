import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function exportVectors() {
  console.log('Exporting all DocumentChunks from PostgreSQL...');
  const chunks: Array<{
    id: string;
    bookTitle: string;
    content: string;
    createdAt: Date;
    embedding: string;
  }> = await prisma.$queryRawUnsafe(
    `SELECT id, "bookTitle", content, embedding::text, "createdAt" FROM "DocumentChunk"`
  );

  console.log(`Fetched ${chunks.length} records. Writing to JSON file...`);
  const outputPath = path.resolve(process.cwd(), '..', 'sagipisip_vectors.json');
  fs.writeFileSync(outputPath, JSON.stringify(chunks, null, 2), 'utf-8');

  console.log(`✅ Export complete: ${outputPath}`);
  console.log(`Total records exported: ${chunks.length}`);
}

exportVectors()
  .catch((e) => {
    console.error('Export failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
