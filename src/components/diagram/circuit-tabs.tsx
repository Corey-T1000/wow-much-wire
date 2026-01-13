"use client";

import { memo, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { DiagramCircuit } from "./types";

export type ViewId = "full" | string; // "full" or circuit ID

interface CircuitTabsProps {
  circuits: DiagramCircuit[];
  /** Currently selected circuits - empty set means "full" view */
  selectedCircuits: Set<string>;
  /** Called when selection changes */
  onSelectionChange: (circuits: Set<string>) => void;
}

/**
 * IDE-style tabs for switching between circuit views.
 * "Full Diagram" shows all circuits, individual circuit tabs show focused views.
 *
 * Interaction:
 * - Click: Select single circuit (replaces selection)
 * - Cmd/Ctrl+Click: Toggle circuit in multi-select
 * - "Full Diagram": Always resets to full view (all circuits)
 */
function CircuitTabsComponent({
  circuits,
  selectedCircuits,
  onSelectionChange,
}: CircuitTabsProps) {
  const isFullView = selectedCircuits.size === 0;

  const handleCircuitClick = useCallback(
    (circuitId: string, event: React.MouseEvent) => {
      const isMultiSelect = event.metaKey || event.ctrlKey;

      if (isMultiSelect) {
        // Toggle circuit in selection
        const newSelection = new Set(selectedCircuits);
        if (newSelection.has(circuitId)) {
          newSelection.delete(circuitId);
        } else {
          newSelection.add(circuitId);
        }
        onSelectionChange(newSelection);
      } else {
        // Single select - replace with just this circuit
        onSelectionChange(new Set([circuitId]));
      }
    },
    [selectedCircuits, onSelectionChange]
  );

  const handleFullDiagramClick = useCallback(() => {
    // Reset to full view (empty selection = all circuits)
    onSelectionChange(new Set());
  }, [onSelectionChange]);

  return (
    <div className="flex-shrink-0 bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-300 dark:border-neutral-700">
      <div className="flex flex-wrap items-center gap-1.5 px-3 py-2">
        {/* Full Diagram Tab */}
        <Tab
          label="Full Diagram"
          isActive={isFullView}
          onClick={handleFullDiagramClick}
        />

        {/* Separator */}
        <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-600 mx-1 flex-shrink-0" />

        {/* Circuit Tabs */}
        {circuits.map((circuit) => (
          <Tab
            key={circuit.id}
            label={circuit.name}
            color={circuit.color}
            isActive={selectedCircuits.has(circuit.id)}
            onClick={(e) => handleCircuitClick(circuit.id, e)}
          />
        ))}

        {/* Multi-select hint */}
        {selectedCircuits.size > 1 && (
          <>
            <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-600 mx-1 flex-shrink-0" />
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 px-1">
              {selectedCircuits.size} circuits
            </span>
          </>
        )}
      </div>
    </div>
  );
}

interface TabProps {
  label: string;
  color?: string;
  isActive: boolean;
  onClick: (event: React.MouseEvent) => void;
}

function Tab({ label, color, isActive, onClick }: TabProps) {
  return (
    <button
      onClick={(e) => onClick(e)}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full transition-colors",
        "border",
        isActive
          ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border-neutral-300 dark:border-neutral-600 shadow-sm"
          : "bg-transparent text-neutral-600 dark:text-neutral-400 border-transparent hover:bg-white/50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white"
      )}
    >
      {/* Circuit color indicator */}
      {color && (
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
      )}

      {/* Full diagram icon (grid pattern) */}
      {!color && (
        <svg
          className="w-3 h-3 flex-shrink-0 text-neutral-500 dark:text-neutral-400"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <rect x="1" y="1" width="6" height="6" rx="1" />
          <rect x="9" y="1" width="6" height="6" rx="1" />
          <rect x="1" y="9" width="6" height="6" rx="1" />
          <rect x="9" y="9" width="6" height="6" rx="1" />
        </svg>
      )}

      {/* Label */}
      <span className="truncate max-w-[100px]">{label}</span>
    </button>
  );
}

export const CircuitTabs = memo(CircuitTabsComponent);
