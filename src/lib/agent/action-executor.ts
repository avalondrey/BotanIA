/**
 * Action Executor — BotanIA Agent
 *
 * Executes Lia's actions: notifications, badges, vibrations, etc.
 */

import { useAgentStore } from '@/store/agent-store';
import { showGameNotification } from '@/lib/notification-system';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ExecutableAction {
  type: 'notify' | 'suggest' | 'badge' | 'vibrate' | 'sound';
  payload: Record<string, unknown>;
}

/**
 * Execute a single action
 */
export async function executeAction(action: ExecutableAction): Promise<void> {
  switch (action.type) {
    case 'notify':
      await executeNotify(action.payload);
      break;
    case 'suggest':
      executeSuggest(action.payload);
      break;
    case 'badge':
      executeBadge(action.payload);
      break;
    case 'vibrate':
      executeVibrate(action.payload);
      break;
    case 'sound':
      executeSound(action.payload);
      break;
  }
}

/**
 * Execute a notification action
 */
async function executeNotify(payload: Record<string, unknown>): Promise<void> {
  const { title, message, type, priority } = payload as {
    title: string;
    message: string;
    type?: string;
    priority?: string;
  };

  // Add to agent store
  useAgentStore.getState().addNotification({
    type: type as 'alert' | 'suggestion' | 'reminder' | 'info' || 'info',
    title: title || 'Lia',
    message: message || '',
    priority: priority as 'critical' | 'high' | 'medium' | 'low' || 'medium',
  });

  // Also show browser notification if permitted
  try {
    showGameNotification((type || 'info') as Parameters<typeof showGameNotification>[0], { emoji: '🌿', message: message || title });
  } catch {
    // Notification permission not granted, ignore
  }

  // Vibration on mobile for critical
  if (priority === 'critical') {
    executeVibrate({});
  }
}

/**
 * Execute a suggestion action
 */
function executeSuggest(payload: Record<string, unknown>): void {
  const { title, description, category, reasoning } = payload as {
    title: string;
    description?: string;
    category?: string;
    reasoning?: string;
  };

  useAgentStore.getState().addSuggestion({
    category: category as 'water' | 'plant' | 'calendar' | 'disease' | 'purchase' | 'harvest' || 'plant',
    title: title || 'Suggestion',
    description: description || '',
    reasoning: reasoning,
    priority: 'medium',
  });
}

/**
 * Execute a badge update (for tabs, etc.)
 */
function executeBadge(payload: Record<string, unknown>): void {
  const { tabId, count, color } = payload as {
    tabId: string;
    count?: number;
    color?: string;
  };

  // This would integrate with the tab system to show a badge
  // For now, just add to store
  if (count && count > 0) {
    useAgentStore.getState().addNotification({
      type: 'info',
      title: `Badge: ${tabId}`,
      message: `${count} item${count > 1 ? 's' : ''}`,
      priority: 'low',
    });
  }
}

/**
 * Execute vibration on mobile
 */
function executeVibrate(_payload: Record<string, unknown>): void {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([200, 100, 200]);
  }
}

/**
 * Execute sound notification
 */
function executeSound(payload: Record<string, unknown>): void {
  const { sound } = payload as { sound?: string };

  // Would integrate with sound-manager.ts
  // For now, just log
  console.log(`[ActionExecutor] Sound: ${sound || 'default'}`);
}

/**
 * Process all pending actions from an agent response
 */
export function processActions(actions: string[]): void {
  for (const actionStr of actions) {
    try {
      // Actions come as formatted strings like "[ACTION: NOTIFY][Message: ...]"
      const match = actionStr.match(/\[ACTION: (\w+)\]\s*\[Message: ([^\]]+)\]/i);
      if (match) {
        const [, type, message] = match;
        executeAction({
          type: type.toLowerCase() as ExecutableAction['type'],
          payload: { message },
        });
      }
    } catch (err) {
      console.warn('[ActionExecutor] Failed to process action:', actionStr, err);
    }
  }
}
