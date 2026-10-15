import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { Agent, setGlobalDispatcher } from 'undici';

// Configure generous timeouts for local LLM inference
setGlobalDispatcher(
  new Agent({
    headersTimeout: 600000,
    bodyTimeout: 600000,
    connectTimeout: 60000,
  }),
);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
