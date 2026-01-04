"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { cn } from "@/lib/utils";
import {
  type ComponentNodeData,
  type DiagramConnector,
  type DiagramPin,
  COMPONENT_STYLES,
} from "./types";

/**
 * Custom React Flow node for automotive components
 *
 * Displays the component with its connectors and pins,
 * styled based on component type (PDU, ECU, relay, etc.)
 */

interface ConnectorSectionProps {
  connector: DiagramConnector;
  onPinClick?: ((pinId: string) => void) | undefined;
}

function ConnectorSection({
  connector,
  onPinClick,
}: ConnectorSectionProps) {
  // Single-column pin rendering - required for left-side wire handles
  const renderPin = (pin: DiagramPin, _index: number) => {
    return (
      <div
        key={pin.id}
        className={cn(
          "group relative flex items-center gap-2 px-2 py-1 text-xs rounded cursor-pointer transition-colors min-h-[28px]",
          pin.isUsed
            ? "bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20"
            : "bg-black/[0.02] dark:bg-white/5 text-gray-400 dark:text-gray-500"
        )}
        onClick={() => onPinClick?.(pin.id)}
        title={`${pin.position}: ${pin.function || "Not connected"}${pin.wireGauge ? ` (${pin.wireGauge})` : ""}`}
      >
        {/* Connection handles on LEFT side only for clean routing */}
        <Handle
          type="target"
          position={Position.Left}
          id={pin.id}
          className={cn(
            "!w-2 !h-2 !min-w-0 !min-h-0 !border-2 transition-colors",
            pin.isUsed
              ? "!bg-emerald-500 dark:!bg-emerald-400 !border-emerald-700 dark:!border-emerald-600"
              : "!bg-gray-300 dark:!bg-gray-600 !border-gray-400 dark:!border-gray-700"
          )}
          style={{
            top: "50%",
            left: "-4px",
          }}
        />
        <Handle
          type="source"
          position={Position.Left}
          id={`${pin.id}-out`}
          className={cn(
            "!w-2 !h-2 !min-w-0 !min-h-0 !border-2 transition-colors",
            pin.isUsed
              ? "!bg-emerald-500 dark:!bg-emerald-400 !border-emerald-700 dark:!border-emerald-600"
              : "!bg-gray-300 dark:!bg-gray-600 !border-gray-400 dark:!border-gray-700"
          )}
          style={{
            top: "50%",
            left: "-4px",
          }}
        />

        {/* Pin position - fixed width */}
        <span className="font-mono font-bold w-8 shrink-0 text-neutral-800 dark:text-white/90">
          {pin.position}
        </span>

        {/* Pin label/function - flexible with ellipsis */}
        <span className="flex-1 truncate text-neutral-600 dark:text-white/70">
          {pin.label || pin.function || "—"}
        </span>

        {/* Wire gauge indicator */}
        {pin.wireGauge && (
          <span className="shrink-0 text-cyan-600 dark:text-cyan-400 text-[10px] font-mono">
            {pin.wireGauge}
          </span>
        )}

        {/* Fuse indicator */}
        {pin.fuseRating && (
          <span className="shrink-0 text-yellow-600 dark:text-yellow-400 text-[10px] font-mono">
            {pin.fuseRating}
          </span>
        )}
      </div>
    );
  };

  // Always render pins in a single column - required for left-side wire handles
  return (
    <div className="border-t border-black/10 dark:border-white/10 pt-2">
      <div className="text-xs font-semibold text-neutral-600 dark:text-white/70 px-2 mb-1">
        {connector.name} ({connector.pinCount} pins)
      </div>
      <div className="space-y-0.5">
        {connector.pins.map((pin, i) => renderPin(pin, i))}
      </div>
    </div>
  );
}

interface ComponentNodeProps {
  data: ComponentNodeData;
}

function ComponentNodeComponent({ data }: ComponentNodeProps) {
  const { component, isSelected, isDimmed, onPinClick } = data;
  const style = COMPONENT_STYLES[component.type] || COMPONENT_STYLES.generic;

  return (
    <div
      className={cn(
        "w-[300px] rounded-lg border-2 shadow-lg dark:shadow-none transition-all duration-200",
        style.bg,
        style.border,
        isSelected && "ring-2 ring-blue-500 dark:ring-white ring-offset-2 ring-offset-white dark:ring-offset-black",
        isDimmed && "opacity-20 grayscale"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-2 border-b border-black/10 dark:border-white/10">
        <span className="text-lg">{style.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-neutral-900 dark:text-white truncate">
            {component.name}
          </div>
          {component.partNumber && (
            <div className="text-xs text-neutral-500 dark:text-white/60 truncate">
              {component.manufacturer && `${component.manufacturer} `}
              {component.partNumber}
            </div>
          )}
        </div>
      </div>

      {/* Connectors */}
      <div className="p-2 space-y-2">
        {component.connectors.map((connector) => (
          <ConnectorSection
            key={connector.id}
            connector={connector}
            onPinClick={onPinClick}
          />
        ))}
      </div>

      {/* Notes */}
      {component.notes && (
        <div className="px-2 pb-2">
          <div className="text-xs text-neutral-400 dark:text-white/50 italic">{component.notes}</div>
        </div>
      )}
    </div>
  );
}

export const ComponentNode = memo(ComponentNodeComponent);
