import { useCallback, useRef, useState } from "react";
import type { DiagramPosition } from "./types";

/**
 * History entry representing a snapshot of all node positions
 */
interface HistoryEntry {
  positions: Record<string, DiagramPosition>;
  timestamp: number;
}

/**
 * Hook for managing undo/redo functionality for diagram positions.
 *
 * Design decisions:
 * - Tracks position snapshots (not individual moves) for simplicity
 * - Debounces rapid changes (e.g., during drag) to avoid flooding history
 * - Limits history depth to prevent memory bloat
 * - Separates "past" and "future" stacks for standard undo/redo behavior
 */
export function useUndoRedo(maxHistory = 50) {
  // Past states (for undo) - most recent at the end
  const [past, setPast] = useState<HistoryEntry[]>([]);
  // Future states (for redo) - most recent at the end
  const [future, setFuture] = useState<HistoryEntry[]>([]);

  // Current positions (the "present")
  const currentPositionsRef = useRef<Record<string, DiagramPosition>>({});

  // Debounce timer for batching rapid changes
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingPositionsRef = useRef<Record<string, DiagramPosition> | null>(null);

  /**
   * Initialize with starting positions (call once on mount)
   */
  const initialize = useCallback((positions: Record<string, DiagramPosition>) => {
    currentPositionsRef.current = { ...positions };
    setPast([]);
    setFuture([]);
  }, []);

  /**
   * Record a position change. Debounced to batch rapid changes (like during drag).
   * Call this whenever positions change from user interaction.
   */
  const recordChange = useCallback((newPositions: Record<string, DiagramPosition>) => {
    // Store pending positions
    pendingPositionsRef.current = { ...newPositions };

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce: wait 300ms of no changes before committing to history
    debounceTimerRef.current = setTimeout(() => {
      if (!pendingPositionsRef.current) return;

      const oldPositions = currentPositionsRef.current;
      const positions = pendingPositionsRef.current;

      // Only record if positions actually changed
      const hasChanges = Object.keys(positions).some((id) => {
        const oldPos = oldPositions[id];
        const newPos = positions[id];
        if (!newPos) return false;
        if (!oldPos) return true;
        return oldPos.x !== newPos.x || oldPos.y !== newPos.y;
      });

      if (hasChanges) {
        // Push current state to past stack
        setPast((prevPast) => {
          const newPast = [
            ...prevPast,
            { positions: oldPositions, timestamp: Date.now() },
          ];
          // Trim to max history
          return newPast.slice(-maxHistory);
        });

        // Clear future (new action invalidates redo stack)
        setFuture([]);

        // Update current
        currentPositionsRef.current = positions;
      }

      pendingPositionsRef.current = null;
      debounceTimerRef.current = null;
    }, 300);
  }, [maxHistory]);

  /**
   * Undo: restore the previous position state
   * Returns the positions to apply, or null if nothing to undo
   */
  const undo = useCallback((): Record<string, DiagramPosition> | null => {
    if (past.length === 0) return null;

    const newPast = [...past];
    const previous = newPast.pop()!;

    // Move current to future
    setFuture((prevFuture) => [
      ...prevFuture,
      { positions: currentPositionsRef.current, timestamp: Date.now() },
    ]);

    // Update past
    setPast(newPast);

    // Update current
    currentPositionsRef.current = previous.positions;

    return previous.positions;
  }, [past]);

  /**
   * Redo: restore the next position state
   * Returns the positions to apply, or null if nothing to redo
   */
  const redo = useCallback((): Record<string, DiagramPosition> | null => {
    if (future.length === 0) return null;

    const newFuture = [...future];
    const next = newFuture.pop()!;

    // Move current to past
    setPast((prevPast) => [
      ...prevPast,
      { positions: currentPositionsRef.current, timestamp: Date.now() },
    ]);

    // Update future
    setFuture(newFuture);

    // Update current
    currentPositionsRef.current = next.positions;

    return next.positions;
  }, [future]);

  return {
    // State
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    historyLength: past.length,

    // Actions
    initialize,
    recordChange,
    undo,
    redo,
  };
}
