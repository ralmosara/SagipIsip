import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentIngestionService } from './document-ingestion/document-ingestion.service';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const ingestionService = app.get(DocumentIngestionService);
  const prisma = app.get(PrismaService);
  
  console.log('========================================================');
  console.log('🚀 SAGIPISIP: Starting Books Vector Ingestion...');
  console.log('========================================================');
  
  await ingestionService.processBooksDirectory();
  
  console.log('\n========================================================');
  console.log('📊 VECTOR DATABASE INGESTION SUMMARY:');
  console.log('========================================================');
  
  const stats: Array<{ bookTitle: string; total: string; embedded: string }> =
    await prisma.$queryRawUnsafe(
      `SELECT "bookTitle", COUNT(*) as total, COUNT(embedding) as embedded 
       FROM "DocumentChunk" 
       GROUP BY "bookTitle" 
       ORDER BY "bookTitle" ASC;`
    );

  console.table(
    stats.map((row) => ({
      'Book Title': row.bookTitle.length > 60 ? row.bookTitle.substring(0, 57) + '...' : row.bookTitle,
      'Total Chunks': Number(row.total),
      'Vectors Stored': Number(row.embedded),
      'Status': Number(row.total) === Number(row.embedded) ? '✅ 100% Embedded' : '⚠️ Partial',
    }))
  );

  const totalChunks: any[] = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*) as total, COUNT(embedding) as embedded FROM "DocumentChunk";`
  );
  console.log(`\n🎉 Grand Total: ${totalChunks[0].embedded} / ${totalChunks[0].total} chunks vectorized in PostgreSQL pgvector.`);

  console.log('\n🔍 Running Test Vector Similarity Search:');
  console.log('Query: "cognitive restructuring negative thoughts Beck CBT"');
  const testContext = await ingestionService.retrieveRelevantContext(
    'cognitive restructuring negative thoughts Beck CBT',
    2
  );
  console.log('\n--- Retrieved Top 2 Context Chunks ---');
  console.log(testContext.substring(0, 500) + '...\n');
  console.log('========================================================');
  console.log('✅ Document Ingestion Completed Successfully!');
  console.log('========================================================');
  
  await app.close();
}

bootstrap().catch((err) => {
  console.error('Ingestion failed:', err);
  process.exit(1);
});

