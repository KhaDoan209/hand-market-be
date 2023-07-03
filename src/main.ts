import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RoleGuard } from 'src/shared/middlewares/guards/role.guard';
import { Reflector } from '@nestjs/core';
import * as express from 'express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true, credentials: true })
  const config = new DocumentBuilder()
    .setTitle('Fiverr Final')
    .setDescription('The final project for Node 30 class')
    .addBearerAuth()
    .build()
  app.setGlobalPrefix('hand-market-api')
  app.useGlobalGuards(new RoleGuard(app.get(Reflector)));
  app.use(express.static('.'))
  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('', app, document);
  app.use(cookieParser());
  await app.listen(8080);
}
bootstrap();
