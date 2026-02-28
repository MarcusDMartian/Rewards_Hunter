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

const mockCoreValues = [
    { id: 'cv_1', name: 'Kaizen', color: 'bg-rose-500', description: 'Continuous improvement' },
    { id: 'cv_2', name: 'Teamwork', color: 'bg-indigo-500', description: 'Working together' },
    { id: 'cv_3', name: 'Innovation', color: 'bg-amber-500', description: 'New ideas' },
];

const mockImpactTypes = [
    { id: 'im_1', name: 'Speed', icon: '⚡', color: 'bg-blue-500' },
    { id: 'im_2', name: 'Quality', icon: '⭐', color: 'bg-emerald-500' },
    { id: 'im_3', name: 'Cost', icon: '💰', color: 'bg-amber-500' },
    { id: 'im_4', name: 'Safety', icon: '🛡️', color: 'bg-rose-500' },
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

    http.post(`${API_URL}/auth/register`, async ({ request }) => {
        const body = await request.json() as any;
        if (!body.otp) {
            return HttpResponse.json({ message: 'OTP is required' }, { status: 400 });
        }
        if (body.otp !== '123456') {
            return HttpResponse.json({ message: 'Invalid OTP code' }, { status: 400 });
        }
        return HttpResponse.json({ access_token: 'mock-jwt-token', user: mockUser });
    }),

    http.post(`${API_URL}/auth/register-org`, async ({ request }) => {
        const body = await request.json() as any;
        if (!body.otp) {
            return HttpResponse.json({ message: 'OTP is required' }, { status: 400 });
        }
        if (body.otp !== '123456') {
            return HttpResponse.json({ message: 'Invalid OTP code' }, { status: 400 });
        }
        return HttpResponse.json({
            accessToken: 'mock-jwt-token',
            user: { ...mockUser, orgId: 'org_new', role: 'Superadmin' },
            organization: { id: 'org_new', name: body.orgName, domain: body.email.split('@')[1] }
        });
    }),

    http.post(`${API_URL}/auth/join-request`, async ({ request }) => {
        const body = await request.json() as any;
        if (!body.otp) {
            return HttpResponse.json({ message: 'OTP is required' }, { status: 400 });
        }
        if (body.otp !== '123456') {
            return HttpResponse.json({ message: 'Invalid OTP code' }, { status: 400 });
        }
        return HttpResponse.json({ success: true }, { status: 201 });
    }),

    http.post(`${API_URL}/auth/send-otp`, async () => {
        // Mock sending OTP, always succeeds
        return HttpResponse.json({ success: true });
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

    // ---- SETTINGS ----
    http.get(`${API_URL}/settings/core-values`, () => {
        return HttpResponse.json(mockCoreValues);
    }),

    http.get(`${API_URL}/settings/impact-types`, () => {
        return HttpResponse.json(mockImpactTypes);
    }),

    http.get(`${API_URL}/settings/point-rules`, () => {
        return HttpResponse.json({ idea_created: 50, kudos_sent: 10, kudos_received: 15, daily_login: 5 });
    }),

    http.post(`${API_URL}/settings/point-rules`, async ({ request }) => {
        const body = await request.json();
        return HttpResponse.json(body);
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

    // ---- ADMIN REWARDS ----
    http.get(`${API_URL}/rewards`, () => {
        return HttpResponse.json([
            { id: 'rew_1', name: 'Mock Voucher', description: 'Test', cost: 100, stock: 5, isActive: true }
        ]);
    }),

    http.post(`${API_URL}/admin/rewards`, async ({ request }) => {
        const body = await request.json() as any;
        return HttpResponse.json({ ...body, id: `rew_${Date.now()}`, isActive: true });
    }),

    http.delete(`${API_URL}/admin/rewards/:id`, () => {
        return new HttpResponse(null, { status: 204 });
    }),

    // ---- ADMIN BADGES ----
    http.get(`${API_URL}/badges`, () => {
        return HttpResponse.json([
            { id: 'bdg_1', name: 'Early Bird', icon: '🐦', color: 'bg-emerald-100', description: 'Log in early' }
        ]);
    }),

    http.post(`${API_URL}/admin/badges`, async ({ request }) => {
        const body = await request.json() as any;
        return HttpResponse.json({ ...body, id: `bdg_${Date.now()}` });
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
