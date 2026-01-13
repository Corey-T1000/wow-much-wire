"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { DiagramCircuit } from "./types";

export type ViewId = "full" | string; // "full" or circuit ID

interface CircuitTabsProps {
  circuits: DiagramCircuit[];
  activeView: ViewId;
  onViewChange: (viewId: ViewId) => void;
  /** Optional: show modified indicator for views with custom positions */
  modifiedViews?: Set<ViewId>;
}

/**
 * IDE-style tabs for switching between circuit views.
 * "Full Diagram" shows all circuits, individual circuit tabs show focused views.
 */
function CircuitTabsComponent({
  circuits,
  activeView,
  onViewChange,
  modifiedViews = new Set(),
}: CircuitTabsProps) {
  return (
    <div className="flex-shrink-0 bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-300 dark:border-neutral-700">
      <div className="flex flex-wrap items-center gap-1.5 px-3 py-2">
        {/* Full Diagram Tab */}
        <Tab
          label="Full Diagram"
          isActive={activeView === "full"}
          onClick={() => onViewChange("full")}
          isModified={modifiedViews.has("full")}
        />

        {/* Separator */}
        <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-600 mx-1 flex-shrink-0" />

        {/* Circuit Tabs */}
        {circuits.map((circuit) => (
          <Tab
            key={circuit.id}
            label={circuit.name}
            color={circuit.color}
            isActive={activeView === circuit.id}
            onClick={() => onViewChange(circuit.id)}
            isModified={modifiedViews.has(circuit.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface TabProps {
  label: string;
  color?: string;
  isActive: boolean;
  onClick: () => void;
  isModified?: boolean;
}

function Tab({ label, color, isActive, onClick, isModified }: TabProps) {
  return (
    <button
      onClick={onClick}
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

      {/* Modified indicator (dot) */}
      {isModified && (
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
      )}
    </button>
  );
}

export const CircuitTabs = memo(CircuitTabsComponent);
