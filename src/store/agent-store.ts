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
  isOllamaAvailable: boolean;  // détecté au startup
  isQdrantAvailable: boolean;  // détecté au startup
  ollamaModel: string;
  qdrantCollectionsCount: number;
  lastIndexing: number | null;
  lastProactiveScan: number | null;
  indexingProgress: 'idle' | 'scanning' | 'indexing' | 'error';
  errorMessage?: string;
}

// ─── Store Interface ──────────────────────────────────────────────────────────

interface AgentStore {
  // Status
  status: AgentStatus;

  // Proactif
  pendingNotifications: AgentNotification[];
  pendingSuggestions: AgentSuggestion[];
  dismissedSuggestions: Set<string>;

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
        set((s) => ({
          pendingNotifications: [
            {
              ...n,
              id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              timestamp: Date.now(),
              read: false,
            },
            ...s.pendingNotifications,
          ].slice(0, 50), // max 50 notifications
        })),

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
          // Avoid duplicate suggestions
          const existing = state.dismissedSuggestions.has(s.title);
          if (existing) return state;

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
