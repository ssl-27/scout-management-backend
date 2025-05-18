import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { GlobalMethodLoggingInterceptor } from './common/interceptors/global-method-logging.interceptor';
import * as express from 'express';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  console.log('Current NODE_ENV:', process.env.NODE_ENV);
  const logger = new Logger('SMIS');
  // Create a custom logger to override the default console methods
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'], // Log everything in development
  });

  // Apply global interceptor for HTTP request/response logging
  app.useGlobalInterceptors(new LoggingInterceptor(), new GlobalMethodLoggingInterceptor());

  // Create uploads directory if it doesn't exist
  const uploadsDir = join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Serve static files from the uploads directory
  app.use('/uploads', express.static(uploadsDir));

  app.enableCors({
    origin: "*"
  })
  const config = new DocumentBuilder()
    .setTitle('SMIS API Documentation')
    .setDescription('The API description')
    .setVersion('1.0')
    .addTag('api')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  const port = process.env.PORT || 8080;
  console.log(`Application starting on port: ${port}`);
  await app.listen(port, '0.0.0.0');
}
bootstrap();
