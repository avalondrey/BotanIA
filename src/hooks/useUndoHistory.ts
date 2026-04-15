'use client';

import { useCallback, useRef, useState } from 'react';

export interface UndoAction {
  type: string;
  description: string;
  undo: () => void;
  redo: () => void;
}

export function useUndoHistory(maxSize = 50) {
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);
  const [redoStack, setRedoStack] = useState<UndoAction[]>([]);
  const skipRef = useRef(false);

  const push = useCallback((action: UndoAction) => {
    setUndoStack(prev => {
      const next = [...prev, action];
      return next.length > maxSize ? next.slice(-maxSize) : next;
    });
    setRedoStack([]);
  }, [maxSize]);

  const undo = useCallback(() => {
    setUndoStack(prev => {
      if (prev.length === 0) return prev;
      const action = prev[prev.length - 1];
      action.undo();
      setRedoStack(r => [...r, action]);
      return prev.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setRedoStack(prev => {
      if (prev.length === 0) return prev;
      const action = prev[prev.length - 1];
      action.redo();
      setUndoStack(u => [...u, action]);
      return prev.slice(0, -1);
    });
  }, []);

  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  return { push, undo, redo, canUndo, canRedo };
}