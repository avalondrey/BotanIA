import { describe, it, expect } from 'vitest';
import { getPlantDef, plantExists, getPlantDisplay, PLANTS } from '@/lib/plant-db';

describe('plant-db', () => {
  it('getPlantDef returns known plants', () => {
    const tomato = getPlantDef('tomato');
    expect(tomato).toBeDefined();
    expect(tomato?.name).toBe('Tomate');
    expect(tomato?.plantFamily).toBe('Solanaceae');
  });

  it('getPlantDef returns undefined for unknown plant', () => {
    expect(getPlantDef('this-does-not-exist')).toBeUndefined();
  });

  it('plantExists checks known plants', () => {
    expect(plantExists('tomato')).toBe(true);
    expect(plantExists('nonexistent')).toBe(false);
  });

  it('getPlantDisplay returns fallback for unknown plant', () => {
    const display = getPlantDisplay('unknown-thing');
    expect(display.name).toBe('unknown-thing');
    expect(display.emoji).toBe('🌱');
  });

  it('PLANTS contains tomato with correct family', () => {
    expect(PLANTS['tomato']).toBeDefined();
    expect(PLANTS['tomato'].plantFamily).toBe('Solanaceae');
  });
});
