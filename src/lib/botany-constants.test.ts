import { describe, it, expect } from 'vitest';
import { getPlantFamily, PLANT_FAMILY_MAP, resolveBasePlantId, PLANT_VARIETY_MAP } from '@/lib/botany-constants';

describe('getPlantFamily', () => {
  it('returns exact match for base IDs', () => {
    expect(getPlantFamily('tomato')).toBe('Solanaceae');
    expect(getPlantFamily('apple')).toBe('Rosaceae');
    expect(getPlantFamily('oak')).toBe('Fagaceae');
  });

  it('resolves known varieties via PLANT_VARIETY_MAP', () => {
    expect(getPlantFamily('escallonia-iveyi')).toBe('Escalloniaceae');
    expect(getPlantFamily('apple-gala')).toBe('Rosaceae');
    expect(getPlantFamily('zucchini-verte-italie')).toBe('Cucurbitaceae');
    expect(getPlantFamily('cassis-blanc-ojeblanc')).toBe('Grossulariaceae');
    expect(getPlantFamily('zucchini-verte-milan-black-beauty')).toBe('Cucurbitaceae');
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

describe('resolveBasePlantId', () => {
  it('returns base ID for known varieties', () => {
    expect(resolveBasePlantId('escallonia-iveyi')).toBe('escallonia');
    expect(resolveBasePlantId('apple-gala')).toBe('apple');
    expect(resolveBasePlantId('cassis-blanc-ojeblanc')).toBe('blackcurrant');
  });

  it('returns original ID for non-varieties', () => {
    expect(resolveBasePlantId('tomato')).toBe('tomato');
    expect(resolveBasePlantId('oak')).toBe('oak');
  });
});

describe('PLANT_VARIETY_MAP', () => {
  it('every variety resolves to a base ID in PLANT_FAMILY_MAP', () => {
    for (const [varietyId, baseId] of Object.entries(PLANT_VARIETY_MAP)) {
      expect(PLANT_FAMILY_MAP[baseId], `baseId "${baseId}" for variety "${varietyId}" must exist in PLANT_FAMILY_MAP`).toBeDefined();
    }
  });
});
