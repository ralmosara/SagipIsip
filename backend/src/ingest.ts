import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentIngestionService } from './document-ingestion/document-ingestion.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const ingestionService = app.get(DocumentIngestionService);
  
  console.log('Starting document ingestion...');
  await ingestionService.processBooksDirectory();
  console.log('Document ingestion completed.');
  
  await app.close();
}

bootstrap().catch(err => {
  console.error(err);
  process.exit(1);
});
