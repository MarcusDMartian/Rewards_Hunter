// ============================================
// MAIN ENTRY POINT
// ============================================

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS with fixed settings for production
  app.enableCors({
    origin: ['https://rewardshunter.vercel.app', 'http://localhost:5173'], // Explicitly allow Vercel and local dev
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type,Accept,Authorization,X-Requested-With',
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  // Simple Root Route for Health Check
  const server = app.getHttpAdapter().getInstance();
  server.get('/', (req: any, res: any) => {
    res.status(200).json({
      status: 'ok',
      message: 'Reward Hunter API is Live! 🚀',
      env: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    });
  });

  const port = process.env.PORT || 3000;
  try {
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Reward Hunter API running on http://0.0.0.0:${port}/api`);
    console.log(`Port: ${port} | Host: 0.0.0.0`);
  } catch (err) {
    console.error('💥 Failed to start application:', err);
    process.exit(1);
  }
}
bootstrap();
