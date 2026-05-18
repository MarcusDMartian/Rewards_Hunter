// ============================================
// MAIN ENTRY POINT
// ============================================

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import type { Request, Response } from 'express';
import { AppModule } from './app.module';
import { initSentry } from './common/monitoring/sentry';
import { PrismaService } from './prisma/prisma.service';

function assertProductionSecrets() {
  const isProd = process.env.NODE_ENV === 'production';
  const secret = process.env.JWT_SECRET;
  const dbUrl = process.env.DATABASE_URL;

  if (!secret || secret.length < 32) {
    if (isProd) {
      console.error(
        '[FATAL] JWT_SECRET is missing or shorter than 32 chars. Refusing to start in production.',
      );
      process.exit(1);
    } else {
      console.warn(
        '[WARN] JWT_SECRET is weak or missing. Set a strong secret before deploying.',
      );
    }
  }

  if (!dbUrl) {
    if (isProd) {
      console.error(
        '[FATAL] DATABASE_URL is missing. Refusing to start in production.',
      );
      process.exit(1);
    } else {
      console.warn('[WARN] DATABASE_URL is missing.');
    }
  }
}

function buildCorsOriginList(): (string | RegExp)[] {
  const fromEnv = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (fromEnv.length > 0) return fromEnv;

  // Fallback defaults — keep existing known origins for backwards compatibility
  return [
    'https://rewardshunter.vercel.app',
    'http://localhost:5173',
    'https://rewardhunter.fastyear.tech',
  ];
}

async function bootstrap() {
  assertProductionSecrets();
  initSentry();

  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: true,
  });

  // Trust proxy headers (Render / Railway / Vercel run behind reverse proxies)
  app.set('trust proxy', 1);

  // Limit body sizes to reduce abuse surface
  app.useBodyParser('json', { limit: '200kb' });
  app.useBodyParser('urlencoded', { limit: '200kb', extended: true });

  // Security headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false, // API only — CSP enforced at frontend
    }),
  );

  // CORS — driven by env CORS_ORIGINS (comma-separated) with safe defaults
  app.enableCors({
    origin: buildCorsOriginList(),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type,Accept,Authorization,X-Requested-With',
  });

  // Strict validation: drop unknown props AND error on them
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  // Health check endpoints (both / and /health for platform probes)
  const prisma = app.get(PrismaService);
  const server = app.getHttpAdapter().getInstance();
  const healthPayload = (dbOk: boolean) => ({
    status: dbOk ? 'ok' : 'degraded',
    db: dbOk ? 'up' : 'down',
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
  const handler = (_req: Request, res: Response) => {
    const dbOk = prisma.isHealthy();
    res.status(dbOk ? 200 : 503).json(healthPayload(dbOk));
  };
  server.get('/', handler);
  server.get('/health', handler);

  // Graceful shutdown
  app.enableShutdownHooks();

  const port = Number(process.env.PORT) || 3000;
  try {
    await app.listen(port, '0.0.0.0');
    logger.log(`Reward Hunter API running on http://0.0.0.0:${port}/api`);
    logger.log(`Env: ${process.env.NODE_ENV || 'development'} | Port: ${port}`);
  } catch (err) {
    logger.error('Failed to start application', err as Error);
    process.exit(1);
  }
}
void bootstrap();
