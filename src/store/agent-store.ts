/**
 * Agent Store — BotanIA IA unifiée avec Ollama + Qdrant
 * Mode passif: si désactivé, utilise l'IA classique (Groq/Ollama existant)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AgentNotification {
  id: string;
  type: 'alert' | 'suggestion' | 'reminder' | 'info';
  title: string;
  message: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  timestamp: number;
  read: boolean;
  actionLabel?: string;
  actionPayload?: Record<string, unknown>;
}

export interface AgentSuggestion {
  id: string;
  category: 'water' | 'plant' | 'calendar' | 'disease' | 'purchase' | 'harvest';
  title: string;
  description: string;
  reasoning?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  timestamp: number;
}

export interface LiaMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  engine?: 'ollama' | 'groq' | 'fallback' | 'ollama-qdrant';
  actions?: string[];
}

export interface AgentStatus {
  isLocalAIActive: boolean;    // toggle utilisateur
  canUseLocalAI: boolean;      // ollama && qdrant disponibles
  isOllamaAvailable: boolean;  // détecté au startup
  isQdrantAvailable: boolean;  // détecté au startup
  ollamaModel: string;
  qdrantCollectionsCount: number;
  lastIndexing: number | null;
  lastProactiveScan: number | null;
  indexingProgress: 'idle' | 'scanning' | 'indexing' | 'error';
  errorMessage?: string;
}

export type GapType = 'sprite' | 'card_data' | 'tsx_file' | 'documentation';
export type GapSeverity = 'critical' | 'warning' | 'info';
export type GapStatus = 'detected' | 'proposed' | 'approved' | 'rejected' | 'generating' | 'done' | 'failed';

export interface AssetGap {
  id: string;
  type: GapType;
  plantDefId: string;
  severity: GapSeverity;
  message: string;
  proposedPrompt: string;
  existingPaths: string[];
  missingPaths: string[];
  stageCount: number;
  status: GapStatus;
  generatedImageUrl?: string;
  generationError?: string;
  timestamp: number;
}

// ─── Store Interface ──────────────────────────────────────────────────────────

interface AgentStore {
  // Status
  status: AgentStatus;

  // Proactif
  pendingNotifications: AgentNotification[];
  pendingSuggestions: AgentSuggestion[];
  dismissedSuggestions: Set<string>;

  // Missing sprites (detected client-side via img onError)
  missingSprites: Set<string>;

  // Asset gaps (detected automatically, awaiting user validation)
  detectedGaps: AssetGap[];

  // Chat
  messages: LiaMessage[];
  isThinking: boolean;

  // ─── Actions ─────────────────────────────────────────────────────────────

  setLocalAIActive(v: boolean): void;
  setStatus(update: Partial<AgentStatus>): void;

  addNotification(n: Omit<AgentNotification, 'id' | 'timestamp' | 'read'>): void;
  dismissNotification(id: string): void;
  markNotificationRead(id: string): void;
  clearNotifications(): void;

  addSuggestion(s: Omit<AgentSuggestion, 'id' | 'timestamp'>): void;
  dismissSuggestion(id: string): void;
  clearSuggestions(): void;

  addMissingSprite(plantDefId: string): void;
  clearMissingSprite(plantDefId?: string): void;

  addGaps(gaps: Omit<AssetGap, 'id' | 'timestamp'>[]): void;
  approveGap(id: string): void;
  rejectGap(id: string): void;
  updateGapStatus(id: string, status: AssetGap['status'], extra?: { generatedImageUrl?: string; generationError?: string }): void;
  clearGaps(): void;

  addMessage(m: Omit<LiaMessage, 'id' | 'timestamp'>): void;
  clearMessages(): void;
  setThinking(v: boolean): void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAgentStore = create<AgentStore>()(
  persist(
    (set, get) => ({
      status: {
        isLocalAIActive: false, // Defaults to false (passive mode)
        canUseLocalAI: false,
        isOllamaAvailable: false,
        isQdrantAvailable: false,
        ollamaModel: 'qwen2.5:7b',
        qdrantCollectionsCount: 0,
        lastIndexing: null,
        lastProactiveScan: null,
        indexingProgress: 'idle',
      },

      pendingNotifications: [],
      pendingSuggestions: [],
      dismissedSuggestions: new Set(),

      missingSprites: new Set<string>(),

      detectedGaps: [],

      messages: [],
      isThinking: false,

      // ─── Status Actions ─────────────────────────────────────────────────

      setLocalAIActive: (v) =>
        set((s) => ({
          status: { ...s.status, isLocalAIActive: v },
        })),

      setStatus: (update) =>
        set((s) => ({
          status: { ...s.status, ...update },
        })),

      // ─── Notification Actions ───────────────────────────────────────────

      addNotification: (n) =>
        set((s) => {
          const alreadyUnread = s.pendingNotifications.find(
            (p) => p.title === n.title && !p.read
          );
          if (alreadyUnread) return s; // skip duplicate
          return {
            pendingNotifications: [
              {
                ...n,
                id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                timestamp: Date.now(),
                read: false,
              },
              ...s.pendingNotifications,
            ].slice(0, 50), // max 50 notifications
          };
        }),

      dismissNotification: (id) =>
        set((s) => ({
          pendingNotifications: s.pendingNotifications.filter((n) => n.id !== id),
        })),

      markNotificationRead: (id) =>
        set((s) => ({
          pendingNotifications: s.pendingNotifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      clearNotifications: () =>
        set({ pendingNotifications: [] }),

      // ─── Suggestion Actions ────────────────────────────────────────────

      addSuggestion: (s) =>
        set((state) => {
          // Avoid duplicate suggestions (dismissed or already pending)
          if (state.dismissedSuggestions.has(s.title)) return state;
          const alreadyPending = state.pendingSuggestions.find(
            (p) => p.title === s.title
          );
          if (alreadyPending) return state;

          return {
            pendingSuggestions: [
              {
                ...s,
                id: `suggest-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                timestamp: Date.now(),
              },
              ...state.pendingSuggestions,
            ].slice(0, 20), // max 20 suggestions
          };
        }),

      dismissSuggestion: (id) => {
        const suggestion = get().pendingSuggestions.find((s) => s.id === id);
        if (suggestion) {
          get().dismissedSuggestions.add(suggestion.title);
        }
        set((s) => ({
          pendingSuggestions: s.pendingSuggestions.filter((sug) => sug.id !== id),
        }));
      },

      clearSuggestions: () =>
        set({ pendingSuggestions: [], dismissedSuggestions: new Set() }),

      // ─── Missing Sprite Actions ───────────────────────────────────────────

      addMissingSprite: (plantDefId) =>
        set((s) => ({
          missingSprites: new Set([...s.missingSprites, plantDefId]),
        })),

      clearMissingSprite: (plantDefId) =>
        set((s) => {
          if (!plantDefId) return { missingSprites: new Set<string>() };
          const next = new Set(s.missingSprites);
          next.delete(plantDefId);
          return { missingSprites: next };
        }),

      // ─── Asset Gap Actions ───────────────────────────────────────────────

      addGaps: (gaps) =>
        set((s) => ({
          detectedGaps: [
            ...gaps.map((g) => ({
              ...g,
              id: `gap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              timestamp: Date.now(),
            })),
            ...s.detectedGaps,
          ].slice(0, 100), // max 100 gaps
        })),

      approveGap: (id) =>
        set((s) => ({
          detectedGaps: s.detectedGaps.map((g) =>
            g.id === id ? { ...g, status: 'approved' as const } : g
          ),
        })),

      rejectGap: (id) =>
        set((s) => ({
          detectedGaps: s.detectedGaps.map((g) =>
            g.id === id ? { ...g, status: 'rejected' as const } : g
          ),
        })),

      updateGapStatus: (id, status, extra) =>
        set((s) => ({
          detectedGaps: s.detectedGaps.map((g) =>
            g.id === id
              ? { ...g, status, ...(extra || {}) }
              : g
          ),
        })),

      clearGaps: () =>
        set({ detectedGaps: [] }),

      // ─── Chat Actions ──────────────────────────────────────────────────

      addMessage: (m) =>
        set((s) => ({
          messages: [
            ...s.messages,
            {
              ...m,
              id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              timestamp: Date.now(),
            },
          ].slice(-100), // keep last 100 messages
        })),

      clearMessages: () =>
        set({ messages: [] }),

      setThinking: (v) =>
        set({ isThinking: v }),
    }),
    {
      name: 'botania-agent-store',
      partialize: (state) => ({
        // Only persist settings, not runtime state
        status: {
          isLocalAIActive: state.status.isLocalAIActive,
        },
        dismissedSuggestions: Array.from(state.dismissedSuggestions),
      }),
      merge: (persisted, current) => {
        const persistedData = persisted as { status?: Partial<AgentStatus>; dismissedSuggestions?: string[] } | undefined;
        return {
          ...current,
          status: {
            ...current.status,
            ...(persistedData?.status ?? {}),
          },
          dismissedSuggestions: new Set(persistedData?.dismissedSuggestions ?? []),
        };
      },
    }
  )
);

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectUnreadNotifications = (s: AgentStore) =>
  s.pendingNotifications.filter((n) => !n.read);

export const selectUnreadCount = (s: AgentStore) =>
  selectUnreadNotifications(s).length;

export const selectCriticalSuggestions = (s: AgentStore) =>
  s.pendingSuggestions.filter((sug) => sug.priority === 'critical');
