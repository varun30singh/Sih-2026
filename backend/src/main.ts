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

  // Allow frontend to communicate with backend
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = process.env.BACKEND_PORT || process.env.PORT || 4000;

  await app.listen(port);

  console.log(`MandiSetu backend running on http://localhost:${port}`);
  console.log(`Health: http://localhost:${port}/api/health`);
  console.log(`Chatbot: http://localhost:${port}/api/chatbot`);
}

bootstrap();