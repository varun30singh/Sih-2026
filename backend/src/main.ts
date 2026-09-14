import { NestFactory } from './common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configure global API prefix
  app.setGlobalPrefix('api');

  // Enable CORS for frontend connection (port 3000, 5000, etc.)
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = process.env.BACKEND_PORT || process.env.PORT || 4000;
  
  await app.listen(port, () => {
    console.log('==============================================');
    console.log('🚀 MandiSetu NestJS Application Backend');
    console.log('==============================================');
    console.log(`🌐 Server running at: http://localhost:${port}`);
    console.log(`📡 REST API endpoint: http://localhost:${port}/api`);
    console.log(`🩺 Health check URL:  http://localhost:${port}/api/health`);
    console.log(`🤖 Chatbot Bridge:    http://127.0.0.1:5000/api`);
    console.log('==============================================');
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start MandiSetu backend:', err);
  process.exit(1);
});
