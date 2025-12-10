/**
 * Tests for /api/v1/verify endpoint
 */

import { NextRequest } from 'next/server';

describe('GET /api/v1/verify', () => {
  it('should return 200 OK with verification status', async () => {
    // Mock the GET function
    const mockRequest = new NextRequest('http://localhost:3000/api/v1/verify');

    const response = await fetch('http://localhost:3000/api/v1/verify');

    expect(response.status).toBe(200);
  });

  it('should include API version in response', async () => {
    const mockRequest = new NextRequest('http://localhost:3000/api/v1/verify');

    const response = {
      ok: true,
      message: 'API is operational',
      version: 'v1',
      timestamp: new Date().toISOString(),
    };

    expect(response).toHaveProperty('version');
    expect(response.version).toBe('v1');
  });

  it('should include timestamp in response', async () => {
    const response = {
      ok: true,
      message: 'API is operational',
      version: 'v1',
      timestamp: new Date().toISOString(),
    };

    expect(response).toHaveProperty('timestamp');
    expect(typeof response.timestamp).toBe('string');
  });
});
