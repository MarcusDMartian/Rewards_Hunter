// ============================================
// TEST SETUP - Global test configuration
// ============================================

import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './mocks/server';
import axios from 'axios';

// Force axios to use http adapter instead of XHR in test environment
axios.defaults.adapter = 'http';

// Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));

// Reset handlers between tests + clear localStorage
afterEach(() => {
    server.resetHandlers();
});

// Clean up after all tests
afterAll(() => server.close());
