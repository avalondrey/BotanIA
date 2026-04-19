/**
 * Rate Limiter Tests
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock setInterval/clearInterval avant l'import
const intervals: ReturnType<typeof setInterval>[] = [];
vi.stubGlobal('setInterval', (fn: Function, ms: number) => {
  const id = setInterval(fn, ms) as unknown as ReturnType<typeof setInterval>;
  intervals.push(id);
  return id;
});
vi.stubGlobal('clearInterval', (id: ReturnType<typeof setInterval>) => {
  clearInterval(id);
});

import { createRateLimiter, aiRateLimiter, scanRateLimiter, memoryRateLimiter, resetRateLimiterStore } from '@/lib/rate-limiter';

function mockRequest(ip: string, headers: Record<string, string> = {}): Request {
  const h = new Headers(headers);
  if (ip !== '127.0.0.1') {
    h.set('x-forwarded-for', ip);
  }
  return new Request('http://localhost/', { headers: h });
}

describe('Rate Limiter', () => {
  beforeEach(() => {
    resetRateLimiterStore();
  });

  describe('createRateLimiter', () => {
    it('allows requests within limit', () => {
      const limiter = createRateLimiter({ maxRequests: 10, windowMs: 60000 });
      const req = mockRequest('192.168.1.1');
      const result = limiter.check(req);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it('blocks requests exceeding limit', () => {
      const limiter = createRateLimiter({ maxRequests: 3, windowMs: 60000 });
      const req = mockRequest('192.168.1.2');

      limiter.check(req);
      limiter.check(req);
      const result3 = limiter.check(req);
      expect(result3.success).toBe(true);
      expect(result3.remaining).toBe(0);

      const blocked = limiter.check(req);
      expect(blocked.success).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.retryAfter).toBeGreaterThan(0);
    });

    it('resets after window expires', async () => {
      const limiter = createRateLimiter({ maxRequests: 2, windowMs: 100 });
      const req = mockRequest('192.168.1.3');

      limiter.check(req);
      limiter.check(req);
      const blocked = limiter.check(req);
      expect(blocked.success).toBe(false);

      // Wait for window to reset
      await new Promise(r => setTimeout(r, 120));
      const reset = limiter.check(req);
      expect(reset.success).toBe(true);
      expect(reset.remaining).toBe(1);
    });

    it('uses X-Forwarded-For header for IP', () => {
      const limiter = createRateLimiter({ maxRequests: 1, windowMs: 60000 });
      const req1 = mockRequest('10.0.0.1', { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' });
      const req2 = mockRequest('10.0.0.2', { 'x-forwarded-for': '9.8.7.6, 5.4.3.2' });

      limiter.check(req1);
      const r1 = limiter.check(req1);
      expect(r1.success).toBe(false);

      // Different IP should succeed
      const r2 = limiter.check(req2);
      expect(r2.success).toBe(true);
    });

    it('supports custom key function', () => {
      const limiter = createRateLimiter({
        maxRequests: 1,
        windowMs: 60000,
        keyFn: (req) => req.headers.get('x-user-id') || 'anonymous',
      });
      const req1 = mockRequest('1.1.1.1', { 'x-user-id': 'user-a' });
      const req2 = mockRequest('1.1.1.2', { 'x-user-id': 'user-b' });

      limiter.check(req1);
      const blocked = limiter.check(req1);
      expect(blocked.success).toBe(false);

      const allowed = limiter.check(req2);
      expect(allowed.success).toBe(true);
    });

    it('reset() clears entry for key', () => {
      const limiter = createRateLimiter({ maxRequests: 2, windowMs: 60000 });
      const req = mockRequest('192.168.1.5');

      limiter.check(req);
      limiter.check(req);
      expect(limiter.check(req).success).toBe(false);

      limiter.reset(req);
      expect(limiter.check(req).success).toBe(true);
    });
  });

  describe('preset limiters', () => {
    it('aiRateLimiter has correct limits', () => {
      const req = mockRequest('127.0.0.1');
      const result = aiRateLimiter.check(req);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(19);
    });

    it('scanRateLimiter has correct limits', () => {
      const req = mockRequest('127.0.0.1');
      const result = scanRateLimiter.check(req);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('memoryRateLimiter has correct limits', () => {
      const req = mockRequest('127.0.0.1');
      const result = memoryRateLimiter.check(req);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(29);
    });
  });
});
