import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global API prefix
  app.setGlobalPrefix('api');

  const frontendOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (process.env.NODE_ENV !== 'production') {
    frontendOrigins.push('http://localhost:3000');
  }

  app.enableCors({
    origin: frontendOrigins,
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  });

  const port = process.env.PORT || 4000;

  await app.listen(port, '0.0.0.0');

  console.log(`MandiSetu backend listening on port ${port}`);
}

bootstrap();