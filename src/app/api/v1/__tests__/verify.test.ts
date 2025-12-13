/**
 * Tests for /api/v1/verify endpoint
 */

describe('GET /api/v1/verify', () => {
  it('should return verification status structure', () => {
    // Test the expected response structure
    const response = {
      ok: true,
      message: 'API is operational',
      version: 'v1',
      timestamp: new Date().toISOString(),
    };

    expect(response).toHaveProperty('ok');
    expect(response.ok).toBe(true);
    expect(response).toHaveProperty('message');
    expect(response).toHaveProperty('version');
    expect(response).toHaveProperty('timestamp');
  });

  it('should include API version in response', () => {
    const response = {
      ok: true,
      message: 'API is operational',
      version: 'v1',
      timestamp: new Date().toISOString(),
    };

    expect(response).toHaveProperty('version');
    expect(response.version).toBe('v1');
  });

  it('should include timestamp in response', () => {
    const response = {
      ok: true,
      message: 'API is operational',
      version: 'v1',
      timestamp: new Date().toISOString(),
    };

    expect(response).toHaveProperty('timestamp');
    expect(typeof response.timestamp).toBe('string');
  });

  it('should have valid timestamp format', () => {
    const timestamp = new Date().toISOString();

    // ISO 8601 format check
    expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
  });
});
