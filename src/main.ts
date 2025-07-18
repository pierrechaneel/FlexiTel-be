import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import * as cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger))
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(cookieParser());
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('FlexiTel API')
    .setDescription('Endpoints pour l’authentification et la gestion utilisateur')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'Authorization',
    )
    .build();

  // Swagger document
  const document = SwaggerModule.createDocument(app, config);

  // Swagger UI
  SwaggerModule.setup('api-docs', app, document);


  const port = app.get(ConfigService).get<number>('PORT', 3001);
  await app.listen(port);
  app.get(Logger).log(`FlexiTel API running on http://localhost:${port}`);
}
bootstrap();
