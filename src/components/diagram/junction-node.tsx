"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { cn } from "@/lib/utils";
import type { JunctionNodeData } from "./types";

/**
 * Custom React Flow node for wire junctions (splices, distribution points).
 *
 * Renders a dog emoji 🐕 as the junction symbol, with:
 * - Input handle on the left (trunk wire)
 * - Output handles on the right (branch wires)
 * - Visual sizing based on connection count
 */

const JUNCTION_TYPE_LABELS: Record<string, string> = {
  splice: "Splice",
  distribution: "Distribution",
  tap: "Tap",
  "ground-bus": "Ground Bus",
};

interface JunctionNodeProps {
  data: JunctionNodeData;
  selected?: boolean;
}

function JunctionNodeComponent({ data, selected }: JunctionNodeProps) {
  const { junction, isSelected, isDimmed, trunkCount, branchCount, circuitColors } = data;

  // Size based on connection count
  const connectionCount = trunkCount + branchCount;
  const size = Math.max(48, Math.min(80, 40 + connectionCount * 8));

  // Get primary circuit color for accent
  const primaryColor = circuitColors[0] || "#6b7280";

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full transition-all",
        "bg-white dark:bg-neutral-800",
        "border-2 shadow-md",
        selected || isSelected
          ? "border-blue-500 ring-2 ring-blue-500/30"
          : "border-neutral-300 dark:border-neutral-600",
        isDimmed && "opacity-30"
      )}
      style={{
        width: size,
        height: size,
        borderColor: selected || isSelected ? undefined : primaryColor,
      }}
    >
      {/* Trunk input handle (left side) */}
      <Handle
        type="target"
        position={Position.Left}
        id={`${junction.id}-trunk`}
        className={cn(
          "!w-3 !h-3 !min-w-0 !min-h-0 !border-2 transition-colors",
          "!bg-amber-500 !border-amber-700"
        )}
        style={{
          left: "-6px",
        }}
      />

      {/* Branch output handles (right side) */}
      {Array.from({ length: Math.max(1, branchCount) }).map((_, index) => {
        // Distribute handles vertically on the right side
        const spacing = size / (branchCount + 1);
        const topOffset = spacing * (index + 1);

        return (
          <Handle
            key={`branch-${index}`}
            type="source"
            position={Position.Right}
            id={`${junction.id}-branch-${index}`}
            className={cn(
              "!w-2.5 !h-2.5 !min-w-0 !min-h-0 !border-2 transition-colors",
              "!bg-emerald-500 !border-emerald-700"
            )}
            style={{
              right: "-5px",
              top: topOffset,
              transform: "translateY(-50%)",
            }}
          />
        );
      })}

      {/* Dog emoji as junction symbol */}
      <span
        className="text-2xl select-none"
        style={{ fontSize: size * 0.5 }}
        role="img"
        aria-label="Junction"
      >
        🐕
      </span>

      {/* Label below */}
      {junction.label && (
        <div
          className={cn(
            "absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap",
            "text-xs font-medium text-neutral-600 dark:text-neutral-400",
            "bg-white/80 dark:bg-neutral-900/80 px-1.5 py-0.5 rounded"
          )}
        >
          {junction.label}
        </div>
      )}

      {/* Type badge */}
      <div
        className={cn(
          "absolute -top-5 left-1/2 -translate-x-1/2",
          "text-[10px] font-medium px-1.5 py-0.5 rounded",
          "bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
        )}
      >
        {JUNCTION_TYPE_LABELS[junction.type] || junction.type}
      </div>

      {/* Connection count badge */}
      <div
        className={cn(
          "absolute -bottom-1 -right-1",
          "w-5 h-5 rounded-full flex items-center justify-center",
          "bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-800",
          "text-[10px] font-bold"
        )}
      >
        {branchCount}
      </div>

      {/* Installation status indicator */}
      {junction.isInstalled && (
        <div
          className={cn(
            "absolute -top-1 -left-1",
            "w-4 h-4 rounded-full flex items-center justify-center",
            "bg-emerald-500 text-white text-[10px]"
          )}
        >
          ✓
        </div>
      )}
    </div>
  );
}

export const JunctionNode = memo(JunctionNodeComponent);
