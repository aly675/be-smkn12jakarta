import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common'; // <-- 1. Import ini

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    transform: true, 
    whitelist: true, 
  }));

  // Setup konfigurasi Swagger
  const config = new DocumentBuilder()
    .setTitle('Portal API SMKN 12')
    .setDescription('Dokumentasi API untuk Portal Web')
    .setVersion('1.0')
    .addBearerAuth() 
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  
  // URL untuk buka dokumentasinya (di /api/docs)
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
  console.log(`🚀 Server jalan di http://localhost:3000`);
  console.log(`📚 Swagger Docs di http://localhost:3000/api/docs`);
}
bootstrap();