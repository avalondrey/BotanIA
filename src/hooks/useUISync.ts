'use client';

import { useEffect } from 'react';
import { useUISettingsStore } from '@/store/ui-settings-store';

const CSS_VAR_MAP: Record<string, string> = {
  containerMax: '--ui-container-max',
  panelWidth: '--ui-panel-width',
  modalWidth: '--ui-modal-width',
  tabFont: '--ui-tab-font',
  tabPaddingX: '--ui-tab-padding-x',
  tabPaddingY: '--ui-tab-padding-y',
  tabIcon: '--ui-tab-icon',
  tabGap: '--ui-tab-gap',
  cardWidth: '--ui-card-width',
  cardImageHeight: '--ui-card-image-height',
  packetImage: '--ui-packet-image',
  spriteWidth: '--ui-sprite-width',
  spriteHeight: '--ui-sprite-height',
  fontScale: '--ui-font-scale',
  hudFont: '--ui-hud-font',
  hudPaddingX: '--ui-hud-padding-x',
  hudPaddingY: '--ui-hud-padding-y',
  borderWidth: '--ui-border-width',
  shadowOffset: '--ui-shadow-offset',
  modalShadowOffset: '--ui-modal-shadow-offset',
  buttonShadowOffset: '--ui-button-shadow-offset',
  modalMaxHeight: '--ui-modal-max-height',
};

function formatValue(key: string, value: number): string {
  if (key === 'fontScale') return String(value);
  if (key === 'modalMaxHeight') return `${value}vh`;
  if (key === 'containerMax') return value >= 2400 ? '100%' : `${value}px`;
  return `${value}px`;
}

export function useUISync() {
  const settings = useUISettingsStore();

  useEffect(() => {
    const root = document.documentElement;
    for (const [storeKey, cssVar] of Object.entries(CSS_VAR_MAP)) {
      const value = settings[storeKey as keyof typeof settings];
      if (value !== undefined) {
        root.style.setProperty(cssVar, formatValue(storeKey, value as number));
      }
    }
  }, [
    settings.containerMax, settings.panelWidth, settings.modalWidth,
    settings.tabFont, settings.tabPaddingX, settings.tabPaddingY,
    settings.tabIcon, settings.tabGap,
    settings.cardWidth, settings.cardImageHeight, settings.packetImage,
    settings.spriteWidth, settings.spriteHeight,
    settings.fontScale,
    settings.hudFont, settings.hudPaddingX, settings.hudPaddingY,
    settings.borderWidth, settings.shadowOffset,
    settings.modalShadowOffset, settings.buttonShadowOffset,
    settings.modalMaxHeight,
  ]);
}