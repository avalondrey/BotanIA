import { describe, it, expect } from 'vitest';
import { getPlantFamily, PLANT_FAMILY_MAP } from '@/lib/botany-constants';

describe('getPlantFamily', () => {
  it('returns exact match for base IDs', () => {
    expect(getPlantFamily('tomato')).toBe('Solanaceae');
    expect(getPlantFamily('apple')).toBe('Rosaceae');
    expect(getPlantFamily('oak')).toBe('Fagaceae');
  });

  it('falls back to base ID for varieties', () => {
    expect(getPlantFamily('escallonia-iveyi')).toBe('Escalloniaceae');
    expect(getPlantFamily('apple-gala')).toBe('Rosaceae');
    expect(getPlantFamily('zucchini-verte-italie')).toBe('Cucurbitaceae');
  });

  it('returns Unknown for unknown plants', () => {
    expect(getPlantFamily('nonexistent-plant')).toBe('Unknown');
    expect(getPlantFamily('unknown')).toBe('Unknown');
  });

  it('covers all entries in PLANT_FAMILY_MAP', () => {
    for (const [id, family] of Object.entries(PLANT_FAMILY_MAP)) {
      expect(getPlantFamily(id)).toBe(family);
    }
  });
});
