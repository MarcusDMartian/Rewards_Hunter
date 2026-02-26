// ============================================
// IDEAS E2E TESTS
// ============================================
// NOTE: These tests require a running MongoDB instance.
// They depend on the auth e2e tests creating a user.

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Ideas (e2e)', () => {
    let app: INestApplication<App>;
    let accessToken: string;
    let ideaId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.setGlobalPrefix('api');
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();

        // Register a test user to get a token
        const uniqueEmail = `ideas_tester_${Date.now()}@testco.com`;
        const registerRes = await request(app.getHttpServer())
            .post('/api/auth/register-org')
            .send({
                email: uniqueEmail,
                password: 'StrongPass123!',
                name: 'Ideas Tester',
                orgName: `IdeasTestOrg_${Date.now()}`,
            });
        accessToken = registerRes.body.accessToken;
    });

    afterAll(async () => {
        await app.close();
    });

    // ---- Create Idea ----
    it('POST /api/ideas should create a new idea', async () => {
        const res = await request(app.getHttpServer())
            .post('/api/ideas')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                title: 'Test Idea',
                problem: 'Test problem description',
                proposal: 'Test solution proposal',
                impact: 'Speed',
            })
            .expect(201);

        expect(res.body).toHaveProperty('id');
        expect(res.body.title).toBe('Test Idea');
        ideaId = res.body.id;
    });

    // ---- Get All Ideas ----
    it('GET /api/ideas should return ideas list', async () => {
        const res = await request(app.getHttpServer())
            .get('/api/ideas')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    // ---- Get Single Idea ----
    it('GET /api/ideas/:id should return a single idea', async () => {
        if (!ideaId) return;

        const res = await request(app.getHttpServer())
            .get(`/api/ideas/${ideaId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

        expect(res.body.id).toBe(ideaId);
        expect(res.body.title).toBe('Test Idea');
    });

    // ---- Vote on Idea ----
    it('POST /api/ideas/:id/vote should toggle vote', async () => {
        if (!ideaId) return;

        const res = await request(app.getHttpServer())
            .post(`/api/ideas/${ideaId}/vote`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(201);

        expect(res.body).toHaveProperty('votes');
    });

    // ---- Unauthenticated Access ----
    it('GET /api/ideas should return 401 without token', async () => {
        await request(app.getHttpServer())
            .get('/api/ideas')
            .expect(401);
    });

    it('POST /api/ideas should return 401 without token', async () => {
        await request(app.getHttpServer())
            .post('/api/ideas')
            .send({ title: 'Test', problem: 'Test', proposal: 'Test', impact: 'Speed' })
            .expect(401);
    });
});
