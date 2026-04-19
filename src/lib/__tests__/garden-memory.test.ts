/**
 * Garden Memory Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  PlantMemory,
  HarvestRecord,
  DiseaseRecord,
  ObservationRecord,
  MemoryError,
} from '@/lib/garden-memory';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('Garden Memory', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('MemoryError', () => {
    it('has correct name and properties', () => {
      const error = new MemoryError('test', 'save', { cause: 'oops' });
      expect(error.name).toBe('MemoryError');
      expect(error.operation).toBe('save');
      expect(error.message).toBe('test');
    });
  });

  describe('loadPlantMemory', () => {
    it('returns null for 404 response', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(null, { status: 404 })
      );
      const { loadPlantMemory } = await import('@/lib/garden-memory');
      const result = await loadPlantMemory('nonexistent');
      expect(result).toBeNull();
    });

    it('throws MemoryError for non-404 error', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(null, { status: 500 })
      );
      const { loadPlantMemory } = await import('@/lib/garden-memory');
      await expect(loadPlantMemory('test')).rejects.toThrow(MemoryError);
    });
  });
});
