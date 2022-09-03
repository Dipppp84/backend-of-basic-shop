import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  /**Validate*/
  app.useGlobalPipes(new ValidationPipe());

  /**Swagger*/
  const config = new DocumentBuilder()
    .setTitle('Shop')
    .setDescription('Your mini backend shop')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(process.env.PORT || 4000);
}

bootstrap();
