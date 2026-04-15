import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UIPreset = 'compact' | 'normal' | 'grand' | 'ultra';

export interface UIDimensions {
  containerMax: number;
  panelWidth: number;
  modalWidth: number;
  tabFont: number;
  tabPaddingX: number;
  tabPaddingY: number;
  tabIcon: number;
  tabGap: number;
  cardWidth: number;
  cardImageHeight: number;
  packetImage: number;
  spriteWidth: number;
  spriteHeight: number;
  fontScale: number;
  hudFont: number;
  hudPaddingX: number;
  hudPaddingY: number;
  borderWidth: number;
  shadowOffset: number;
  modalShadowOffset: number;
  buttonShadowOffset: number;
  modalMaxHeight: number;
}

export type UISettings = UIPreset & UIDimensions & { preset: UIPreset };

export const UI_PRESETS: Record<UIPreset, UIDimensions> = {
  compact: {
    containerMax: 1100,
    panelWidth: 320,
    modalWidth: 448,
    tabFont: 11,
    tabPaddingX: 8,
    tabPaddingY: 4,
    tabIcon: 12,
    tabGap: 2,
    cardWidth: 180,
    cardImageHeight: 120,
    packetImage: 192,
    spriteWidth: 90,
    spriteHeight: 105,
    fontScale: 0.85,
    hudFont: 7,
    hudPaddingX: 6,
    hudPaddingY: 3,
    borderWidth: 2,
    shadowOffset: 4,
    modalShadowOffset: 6,
    buttonShadowOffset: 1,
    modalMaxHeight: 90,
  },
  normal: {
    containerMax: 1400,
    panelWidth: 384,
    modalWidth: 512,
    tabFont: 13,
    tabPaddingX: 12,
    tabPaddingY: 6,
    tabIcon: 14,
    tabGap: 4,
    cardWidth: 240,
    cardImageHeight: 160,
    packetImage: 256,
    spriteWidth: 120,
    spriteHeight: 140,
    fontScale: 1,
    hudFont: 8,
    hudPaddingX: 8,
    hudPaddingY: 4,
    borderWidth: 3,
    shadowOffset: 6,
    modalShadowOffset: 8,
    buttonShadowOffset: 2,
    modalMaxHeight: 90,
  },
  grand: {
    containerMax: 1600,
    panelWidth: 448,
    modalWidth: 640,
    tabFont: 15,
    tabPaddingX: 16,
    tabPaddingY: 8,
    tabIcon: 18,
    tabGap: 6,
    cardWidth: 300,
    cardImageHeight: 200,
    packetImage: 320,
    spriteWidth: 150,
    spriteHeight: 175,
    fontScale: 1.2,
    hudFont: 10,
    hudPaddingX: 10,
    hudPaddingY: 5,
    borderWidth: 4,
    shadowOffset: 8,
    modalShadowOffset: 10,
    buttonShadowOffset: 3,
    modalMaxHeight: 90,
  },
  ultra: {
    containerMax: 2400,
    panelWidth: 512,
    modalWidth: 800,
    tabFont: 17,
    tabPaddingX: 20,
    tabPaddingY: 10,
    tabIcon: 22,
    tabGap: 8,
    cardWidth: 360,
    cardImageHeight: 240,
    packetImage: 384,
    spriteWidth: 180,
    spriteHeight: 210,
    fontScale: 1.4,
    hudFont: 12,
    hudPaddingX: 12,
    hudPaddingY: 6,
    borderWidth: 5,
    shadowOffset: 10,
    modalShadowOffset: 12,
    buttonShadowOffset: 4,
    modalMaxHeight: 90,
  },
};

const DEFAULT_PRESET: UIPreset = 'normal';
const DEFAULTS = UI_PRESETS[DEFAULT_PRESET];

interface UISettingsState extends UIDimensions {
  preset: UIPreset;
  setPreset: (preset: UIPreset) => void;
  setSetting: <K extends keyof UIDimensions>(key: K, value: UIDimensions[K]) => void;
  resetGroup: (keys: (keyof UIDimensions)[]) => void;
}

export const useUISettingsStore = create<UISettingsState>()(
  persist(
    (set, get) => ({
      preset: DEFAULT_PRESET,
      ...DEFAULTS,

      setPreset: (preset: UIPreset) => {
        set({ preset, ...UI_PRESETS[preset] });
      },

      setSetting: (key, value) => {
        set({ [key]: value } as Partial<UISettingsState>);
      },

      resetGroup: (keys) => {
        const currentPreset = get().preset;
        const presetValues = UI_PRESETS[currentPreset];
        const updates: Partial<UIDimensions> = {};
        for (const key of keys) {
          updates[key] = presetValues[key];
        }
        set(updates);
      },
    }),
    {
      name: 'botania-ui-settings',
    }
  )
);

/** Slider config for the admin panel */
export const UI_SLIDER_GROUPS: { label: string; icon: string; keys: { key: keyof UIDimensions; label: string; min: number; max: number; step: number; unit: string }[] }[] = [
  {
    label: 'Disposition',
    icon: '📐',
    keys: [
      { key: 'containerMax', label: 'Largeur max', min: 900, max: 2400, step: 50, unit: 'px' },
      { key: 'panelWidth', label: 'Panneau', min: 280, max: 600, step: 16, unit: 'px' },
      { key: 'modalWidth', label: 'Fenêtre', min: 400, max: 900, step: 16, unit: 'px' },
    ],
  },
  {
    label: 'Onglets',
    icon: '📑',
    keys: [
      { key: 'tabFont', label: 'Police', min: 9, max: 22, step: 1, unit: 'px' },
      { key: 'tabPaddingX', label: 'Espacement X', min: 4, max: 24, step: 2, unit: 'px' },
      { key: 'tabPaddingY', label: 'Espacement Y', min: 2, max: 12, step: 1, unit: 'px' },
      { key: 'tabIcon', label: 'Icône', min: 10, max: 28, step: 2, unit: 'px' },
      { key: 'tabGap', label: 'Espace', min: 1, max: 10, step: 1, unit: 'px' },
    ],
  },
  {
    label: 'Cartes',
    icon: '🃏',
    keys: [
      { key: 'cardWidth', label: 'Largeur carte', min: 140, max: 420, step: 10, unit: 'px' },
      { key: 'cardImageHeight', label: 'Hauteur image', min: 80, max: 300, step: 10, unit: 'px' },
      { key: 'packetImage', label: 'Image paquet', min: 128, max: 448, step: 16, unit: 'px' },
    ],
  },
  {
    label: 'Jardin',
    icon: '🌱',
    keys: [
      { key: 'spriteWidth', label: 'Largeur plante', min: 60, max: 220, step: 10, unit: 'px' },
      { key: 'spriteHeight', label: 'Hauteur plante', min: 70, max: 260, step: 10, unit: 'px' },
    ],
  },
  {
    label: 'Typographie',
    icon: '🔤',
    keys: [
      { key: 'fontScale', label: 'Échelle', min: 0.7, max: 1.6, step: 0.05, unit: '×' },
    ],
  },
  {
    label: 'HUD',
    icon: '📊',
    keys: [
      { key: 'hudFont', label: 'Police', min: 6, max: 14, step: 1, unit: 'px' },
      { key: 'hudPaddingX', label: 'Espacement X', min: 4, max: 16, step: 2, unit: 'px' },
      { key: 'hudPaddingY', label: 'Espacement Y', min: 2, max: 10, step: 1, unit: 'px' },
    ],
  },
  {
    label: 'Bordures',
    icon: '🔲',
    keys: [
      { key: 'borderWidth', label: 'Épaisseur', min: 1, max: 6, step: 1, unit: 'px' },
      { key: 'shadowOffset', label: 'Ombre carte', min: 2, max: 12, step: 1, unit: 'px' },
      { key: 'modalShadowOffset', label: 'Ombre fenêtre', min: 4, max: 16, step: 1, unit: 'px' },
      { key: 'buttonShadowOffset', label: 'Ombre bouton', min: 1, max: 6, step: 1, unit: 'px' },
    ],
  },
];