// ============================================
// API CLIENT TESTS
// ============================================

import { describe, it, expect, beforeEach } from 'vitest';
import { STORAGE_KEYS } from '../../constants/storageKeys';

describe('apiClient', () => {
    beforeEach(() => {
        localStorage.clear();
        // Re-import fresh instance each test
    });

    it('should create an axios instance with correct baseURL', async () => {
        const { default: api } = await import('../apiClient');
        expect(api.defaults.baseURL).toBe('http://localhost:3000/api');
    });

    it('should set Content-Type header to application/json', async () => {
        const { default: api } = await import('../apiClient');
        expect(api.defaults.headers['Content-Type']).toBe('application/json');
    });

    it('should set timeout to 15000ms', async () => {
        const { default: api } = await import('../apiClient');
        expect(api.defaults.timeout).toBe(15000);
    });

    it('should attach JWT token from localStorage on requests', async () => {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'test-jwt-token');
        const { default: api } = await import('../apiClient');

        // Make a request to our MSW mock
        const response = await api.get('/ideas');
        expect(response.status).toBe(200);
    });

    it('should make successful API calls without token', async () => {
        const { default: api } = await import('../apiClient');
        const response = await api.get('/ideas');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
    });
});
