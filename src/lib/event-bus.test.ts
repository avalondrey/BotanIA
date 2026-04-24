import { describe, it, expect, vi } from 'vitest';
import { eventBus } from './event-bus';

describe('eventBus', () => {
  it('emits and receives events', () => {
    const handler = vi.fn();
    const unsub = eventBus.on('plant:harvested', handler);

    eventBus.emit({ type: 'plant:harvested', plantDefId: 'tomato', coins: 8 });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'plant:harvested', plantDefId: 'tomato', coins: 8 })
    );

    unsub();
    eventBus.emit({ type: 'plant:harvested', plantDefId: 'tomato', coins: 8 });
    expect(handler).toHaveBeenCalledTimes(1); // no more calls after unsub
  });

  it('handles multiple listeners', () => {
    const h1 = vi.fn();
    const h2 = vi.fn();
    eventBus.on('plant:watered', h1);
    eventBus.on('plant:watered', h2);

    eventBus.emit({ type: 'plant:watered', plantDefId: 'carrot', waterLevel: 80 });
    expect(h1).toHaveBeenCalledOnce();
    expect(h2).toHaveBeenCalledOnce();

    eventBus.offAll('plant:watered');
  });

  it('does not crash when emitting without listeners', () => {
    expect(() => {
      eventBus.emit({ type: 'frost:warning', dayOffset: 1, minTemp: -2 });
    }).not.toThrow();
  });

  it('emits async without blocking', () => {
    const handler = vi.fn();
    eventBus.on('coins:earned', handler);
    eventBus.emitAsync({ type: 'coins:earned', amount: 10, source: 'harvest' });
    // async means handler may not be called immediately
    expect(handler).not.toHaveBeenCalled();
    eventBus.offAll('coins:earned');
  });
});
