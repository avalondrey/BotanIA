import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCircuitState, BOTANIA_VERSION } from './micro-client';

describe('micro-client circuit breaker', () => {
  it('starts closed', () => {
    expect(getCircuitState()).toBe('closed');
  });

  it('exposes BOTANIA_VERSION', () => {
    expect(BOTANIA_VERSION).toBe('2.2.0');
  });

  // Note: real circuit breaker logic is tested via integration; here we assert the module exports.
});
