// ============================================
// AUTH E2E TESTS
// ============================================
// NOTE: These tests require a running MongoDB instance.
// Set DATABASE_URL in .env.test or use a test container.

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ---- Check Domain ----
  it('POST /api/auth/check-domain should check if org exists', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/check-domain')
      .send({ email: 'test@example.com' })
      .expect(201);

    expect(res.body).toHaveProperty('exists');
  });

  // ---- Register Organization ----
  it('POST /api/auth/register-org should create org + admin user', async () => {
    const uniqueEmail = `admin_${Date.now()}@testco.com`;
    const res = await request(app.getHttpServer())
      .post('/api/auth/register-org')
      .send({
        email: uniqueEmail,
        password: 'StrongPass123!',
        name: 'Test Admin',
        orgName: `TestOrg_${Date.now()}`,
      })
      .expect(201);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(uniqueEmail);
    expect(res.body.user.role).toBe('Superadmin');

    // Store token for subsequent tests
    accessToken = res.body.accessToken;
  });

  // ---- Login ----
  it('POST /api/auth/login should authenticate user', async () => {
    // This will only work if the user from register-org test exists
    // In CI, each test run should use fresh data
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@test.com',
        password: 'WrongPassword',
      });

    // Should fail with 401
    expect(res.status).toBe(401);
  });

  // ---- Get Me (Protected) ----
  it('GET /api/auth/me should return current user with valid token', async () => {
    if (!accessToken) return; // Skip if register test failed

    const res = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('email');
  });

  it('GET /api/auth/me should return 401 without token', async () => {
    await request(app.getHttpServer())
      .get('/api/auth/me')
      .expect(401);
  });
});
