// ═══════════════════════════════════════════════════
//  Sound System — Audio feedback for game events
// ═══════════════════════════════════════════════════

export type SoundType =
  | "water"
  | "harvest"
  | "plant"
  | "alert"
  | "click"
  | "coin"
  | "error"
  | "rain"
  | "sunny"
  | "season";

export interface SoundConfig {
  enabled: boolean;
  volume: number; // 0-1
}

// Default configuration
export const DEFAULT_SOUND_CONFIG: SoundConfig = {
  enabled: true,
  volume: 0.5,
};

// Load/Save sound config
export function loadSoundConfig(): SoundConfig {
  if (typeof window === "undefined") return DEFAULT_SOUND_CONFIG;
  try {
    const stored = localStorage.getItem("botania-sound-config");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore
  }
  return DEFAULT_SOUND_CONFIG;
}

export function saveSoundConfig(config: SoundConfig) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("botania-sound-config", JSON.stringify(config));
  } catch {
    // ignore
  }
}

// Web Audio API context (lazy initialization)
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

// Generate a simple beep/frequency sound
function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume: number = 0.5
) {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available
  }
}

// Sound definitions based on game events
const SOUNDS: Record<SoundType, { freq: number; duration: number; type: OscillatorType; description: string }> = {
  water: { freq: 400, duration: 0.15, type: "sine", description: "Water drop sound" },
  harvest: { freq: 523, duration: 0.2, type: "triangle", description: "Happy harvest chime" },
  plant: { freq: 330, duration: 0.12, type: "sine", description: "Soft planting sound" },
  alert: { freq: 660, duration: 0.3, type: "square", description: "Warning alert" },
  click: { freq: 800, duration: 0.05, type: "sine", description: "UI click" },
  coin: { freq: 880, duration: 0.15, type: "triangle", description: "Coin sound" },
  error: { freq: 220, duration: 0.3, type: "sawtooth", description: "Error buzzer" },
  rain: { freq: 200, duration: 0.5, type: "sine", description: "Rain ambience" },
  sunny: { freq: 600, duration: 0.2, type: "sine", description: "Sunny chirp" },
  season: { freq: 440, duration: 0.4, type: "triangle", description: "Season change fanfare" },
};

// Play a sound by type
export function playSound(type: SoundType, volume?: number) {
  try {
    const config = loadSoundConfig();
    if (!config.enabled) return;

    const sound = SOUNDS[type];
    if (!sound) return;

    const vol = volume ?? config.volume;
    playTone(sound.freq, sound.duration, sound.type, vol);
  } catch {
    // Silently fail if audio not available
  }
}

// Play a sequence of sounds (for more complex audio)
export function playSoundSequence(sounds: SoundType[], interval: number = 100) {
  sounds.forEach((sound, index) => {
    setTimeout(() => playSound(sound), index * interval);
  });
}

// Background ambient sounds (looping)
let ambientOscillator: OscillatorNode | null = null;
let ambientGain: GainNode | null = null;

export function startAmbientSound(type: "rain" | "sunny") {
  try {
    const ctx = getAudioContext();
    if (ambientOscillator) {
      ambientOscillator.stop();
      ambientOscillator = null;
    }

    const config = loadSoundConfig();
    if (!config.enabled) return;

    ambientOscillator = ctx.createOscillator();
    ambientGain = ctx.createGain();

    ambientOscillator.type = "sine";
    ambientOscillator.frequency.setValueAtTime(type === "rain" ? 100 : 300, ctx.currentTime);

    ambientGain.gain.setValueAtTime(config.volume * 0.05, ctx.currentTime);

    ambientOscillator.connect(ambientGain);
    ambientGain.connect(ctx.destination);

    ambientOscillator.start();
  } catch {
    // Audio not available
  }
}

export function stopAmbientSound() {
  if (ambientOscillator) {
    try {
      ambientOscillator.stop();
    } catch {
      // ignore
    }
    ambientOscillator = null;
  }
}

// Resume audio context (needed for some browsers after user interaction)
export function resumeAudioContext() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
      ctx.resume();
    }
  } catch {
    // ignore
  }
}
