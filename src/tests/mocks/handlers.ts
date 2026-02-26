// ============================================
// MSW HANDLERS - Mock API request handlers
// ============================================

import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:3000/api';

// Mock data
const mockUser = {
    id: 'user_1',
    name: 'Test User',
    email: 'test@company.com',
    role: 'Member',
    team: 'Engineering',
    teamId: 'team_1',
    position: 'Developer',
    avatar: 'https://i.pravatar.cc/150?u=test',
    points: 100,
    monthlyPoints: 50,
    quarterlyPoints: 100,
    level: 2,
    nextLevelPoints: 200,
    streak: 3,
    badges: [],
    orgId: 'org_1',
};

const mockIdeas = [
    {
        id: 'idea_1',
        title: 'Improve CI/CD pipeline',
        problem: 'Builds take too long',
        proposal: 'Use caching and parallel steps',
        impact: 'Speed',
        status: 'New',
        votes: 5,
        votedBy: [],
        author: mockUser,
        teamId: 'team_1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        comments: [],
        followers: [],
    },
];

const mockKudos = [
    {
        id: 'kudos_1',
        sender: mockUser,
        receiver: { ...mockUser, id: 'user_2', name: 'Jane Doe' },
        coreValue: 'Kaizen',
        message: 'Great work on the deployment!',
        createdAt: new Date().toISOString(),
        likes: 2,
        likedBy: [],
    },
];

const mockMissions = [
    {
        id: 'mission_1',
        title: 'Submit 3 ideas',
        description: 'Submit 3 kaizen ideas this week',
        progress: 1,
        total: 3,
        reward: 50,
        completed: false,
        claimed: false,
        type: 'weekly',
    },
];

const mockTransactions = [
    {
        id: 'tx_1',
        userId: 'user_1',
        description: 'Submitted idea',
        amount: 50,
        type: 'earn',
        source: 'idea_created',
        referenceId: 'idea_1',
        date: new Date().toISOString(),
    },
];

export const handlers = [
    // ---- AUTH ----
    http.post(`${API_URL}/auth/login`, async ({ request }) => {
        const body = await request.json() as { email: string; password: string };
        if (body.email === 'test@company.com' && body.password === 'password123') {
            return HttpResponse.json({ access_token: 'mock-jwt-token', user: mockUser });
        }
        return new HttpResponse(null, { status: 401 });
    }),

    http.post(`${API_URL}/auth/register`, async () => {
        return HttpResponse.json({ access_token: 'mock-jwt-token', user: mockUser });
    }),

    http.get(`${API_URL}/auth/me`, ({ request }) => {
        const auth = request.headers.get('Authorization');
        if (auth === 'Bearer mock-jwt-token') {
            return HttpResponse.json(mockUser);
        }
        return new HttpResponse(null, { status: 401 });
    }),

    http.post(`${API_URL}/auth/check-domain`, async ({ request }) => {
        const body = await request.json() as { email: string };
        if (body.email?.includes('@company.com')) {
            return HttpResponse.json({ exists: true, organization: { id: 'org_1', name: 'Company', domain: 'company.com' } });
        }
        return HttpResponse.json({ exists: false });
    }),

    // ---- IDEAS ----
    http.get(`${API_URL}/ideas`, () => {
        return HttpResponse.json(mockIdeas);
    }),

    http.post(`${API_URL}/ideas`, async () => {
        return HttpResponse.json({ ...mockIdeas[0], id: `idea_${Date.now()}` }, { status: 201 });
    }),

    http.patch(`${API_URL}/ideas/:id`, async () => {
        return HttpResponse.json({ ...mockIdeas[0], status: 'Approved' });
    }),

    // ---- KUDOS ----
    http.get(`${API_URL}/kudos`, () => {
        return HttpResponse.json(mockKudos);
    }),

    http.post(`${API_URL}/kudos`, async () => {
        return HttpResponse.json(mockKudos[0], { status: 201 });
    }),

    // ---- MISSIONS ----
    http.get(`${API_URL}/missions`, () => {
        return HttpResponse.json(mockMissions);
    }),

    // ---- TRANSACTIONS ----
    http.get(`${API_URL}/transactions`, () => {
        return HttpResponse.json(mockTransactions);
    }),

    // ---- REDEMPTIONS ----
    http.get(`${API_URL}/redemptions`, () => {
        return HttpResponse.json([]);
    }),

    http.post(`${API_URL}/redemptions`, async () => {
        return HttpResponse.json({ id: 'red_1', status: 'Pending' }, { status: 201 });
    }),

    // ---- GAMIFICATION ----
    http.post(`${API_URL}/events`, async () => {
        return HttpResponse.json({
            missionsUpdated: ['Submit 3 ideas'],
            badgesUnlocked: [],
            streakUpdated: false,
        });
    }),
];
