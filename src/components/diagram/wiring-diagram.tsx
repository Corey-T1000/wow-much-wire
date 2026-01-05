"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  type Node,
  type Edge,
  type OnConnect,
  type NodeChange,
  type OnSelectionChangeFunc,
  addEdge,
  BackgroundVariant,
  SelectionMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Loader2 } from "lucide-react";
import { calculateAutoLayout } from "./auto-layout";
import { ComponentNode } from "./component-node";
import { DiagramMenu } from "./diagram-menu";
import { PrintDialog } from "./print/print-dialog";
import { usePrintCapture } from "./print/use-print-capture";
import { useUndoRedo } from "./use-undo-redo";
import { WireEdge } from "./wire-edge";
import type { DiagramData, DiagramPosition, ComponentNodeData } from "./types";

// Define node type for the diagram
type DiagramNode = Node<ComponentNodeData>;

interface WiringDiagramProps {
  data: DiagramData;
  highlightedCircuits?: string[];
  onWireCreate?: (sourcePinId: string, targetPinId: string) => void;
  onComponentSelect?: (componentId: string | null) => void;
  onPinSelect?: (pinId: string | null) => void;
  /** Called when component positions change (drag, auto-layout) */
  onPositionsChange?: (positions: Record<string, DiagramPosition>) => void;
  /** Called when user wants to reset diagram to source data */
  onResetToSource?: () => void;
  /** Called when user wants to share the diagram */
  onShare?: () => void;
  /** Whether a share is currently being created */
  isSharing?: boolean;
  /** Read-only mode for shared/view-only diagrams */
  readOnly?: boolean;
}

// Register custom node types
const nodeTypes = {
  component: ComponentNode,
} as const;

// Register custom edge types
const edgeTypes = {
  wire: WireEdge,
} as const;

// Create initial placeholder nodes (will be replaced by auto-layout)
function createInitialNodes(
  data: DiagramData,
  onPinClick?: (pinId: string) => void
): DiagramNode[] {
  return data.components.map((component, index) => {
    // Use saved position if available, otherwise use grid placeholder
    const savedPosition = data.positions?.[component.id];
    return {
      id: component.id,
      type: "component",
      position: savedPosition || {
        x: (index % 3) * 400,
        y: Math.floor(index / 3) * 400,
      },
      data: {
        component,
        isSelected: false,
        onPinClick,
      },
    };
  });
}

// Helper to determine which components are relevant to highlighted circuits
function getRelevantComponents(
  data: DiagramData,
  highlightedCircuits: string[]
): Set<string> {
  const relevantComponents = new Set<string>();

  // Find all wires in highlighted circuits
  const highlightedWires = data.wires.filter(
    (wire) => wire.circuitId && highlightedCircuits.includes(wire.circuitId)
  );

  // Find all components that have pins connected by these wires
  for (const wire of highlightedWires) {
    for (const component of data.components) {
      for (const connector of component.connectors) {
        for (const pin of connector.pins) {
          if (pin.id === wire.sourcePinId || pin.id === wire.targetPinId) {
            relevantComponents.add(component.id);
          }
        }
      }
    }
  }

  return relevantComponents;
}

// Extract positions from nodes
function extractPositions(nodes: Node[]): Record<string, DiagramPosition> {
  const positions: Record<string, DiagramPosition> = {};
  for (const node of nodes) {
    positions[node.id] = { x: node.position.x, y: node.position.y };
  }
  return positions;
}

function WiringDiagramInner({
  data,
  highlightedCircuits = [],
  onWireCreate,
  onComponentSelect,
  onPinSelect,
  onPositionsChange,
  onResetToSource,
  onShare,
  isSharing = false,
  readOnly = false,
}: WiringDiagramProps) {
  const isFiltering = highlightedCircuits.length > 0;
  const relevantComponents = useMemo(
    () =>
      isFiltering
        ? getRelevantComponents(data, highlightedCircuits)
        : new Set<string>(),
    [isFiltering, data, highlightedCircuits]
  );
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [isLayouting, setIsLayouting] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const { fitView } = useReactFlow();

  // Print capture hook
  const { getDiagramBounds } = usePrintCapture();

  // Track if we have positions in the data (for showing "has saved" state)
  const hasSavedPositions = Boolean(data.positions && Object.keys(data.positions).length > 0);

  // Track if initial layout has been done
  const initialLayoutDone = useRef(false);

  // Track pending position changes (to safely notify parent after render)
  const pendingPositionChangeRef = useRef(false);

  // Undo/redo for position changes
  const {
    canUndo,
    canRedo,
    initialize: initializeHistory,
    recordChange: recordPositionChange,
    undo,
    redo,
  } = useUndoRedo();

  const handlePinClick = useCallback(
    (pinId: string) => {
      if (selectedPin && selectedPin !== pinId) {
        onWireCreate?.(selectedPin, pinId);
        setSelectedPin(null);
        onPinSelect?.(null);
      } else if (selectedPin === pinId) {
        setSelectedPin(null);
        onPinSelect?.(null);
      } else {
        setSelectedPin(pinId);
        onPinSelect?.(pinId);
      }
    },
    [selectedPin, onWireCreate, onPinSelect]
  );

  const initialNodes = createInitialNodes(data, handlePinClick);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Update node and edge dimming when highlighted circuits change
  useEffect(() => {
    setNodes((currentNodes) =>
      currentNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isDimmed: isFiltering && !relevantComponents.has(node.id),
        },
      }))
    );

    setEdges((currentEdges) =>
      currentEdges.map((edge) => {
        // Find the wire data for this edge
        const wire = data.wires.find((w) => w.id === edge.id);
        const isHighlighted =
          !isFiltering ||
          (wire?.circuitId && highlightedCircuits.includes(wire.circuitId));

        return {
          ...edge,
          style: {
            ...edge.style,
            opacity: isHighlighted ? 1 : 0.15,
          },
          animated: Boolean(isHighlighted && isFiltering),
        };
      })
    );
  }, [isFiltering, relevantComponents, highlightedCircuits, data.wires, setNodes, setEdges]);

  // Run auto-layout (ignoring saved positions to recalculate)
  const runAutoLayout = useCallback(async () => {
    setIsLayouting(true);
    try {
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        await calculateAutoLayout(data, nodes);

      // Apply pin click handler
      const nodesWithHandlers = layoutedNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onPinClick: handlePinClick,
        },
      }));

      setNodes(nodesWithHandlers);
      setEdges(layoutedEdges);

      // Notify parent of new positions and initialize undo/redo history
      const positions = extractPositions(nodesWithHandlers);
      onPositionsChange?.(positions);
      initializeHistory(positions);

      // Fit view after layout with a small delay
      setTimeout(() => {
        fitView({ padding: 0.1, duration: 300 });
      }, 50);
    } catch (error) {
      console.error("Auto-layout failed:", error);
    } finally {
      setIsLayouting(false);
    }
  }, [data, nodes, handlePinClick, setNodes, setEdges, fitView, onPositionsChange, initializeHistory]);

  // Apply saved positions without recalculating layout
  const applyPositions = useCallback(async (positions: Record<string, DiagramPosition>) => {
    setIsLayouting(true);
    try {
      // Calculate edges without repositioning nodes
      const { edges: layoutedEdges } = await calculateAutoLayout(data, nodes);

      // Apply saved positions and pin click handler
      setNodes((currentNodes) =>
        currentNodes.map((node) => ({
          ...node,
          position: positions[node.id] || node.position,
          data: {
            ...node.data,
            onPinClick: handlePinClick,
          },
        }))
      );
      setEdges(layoutedEdges);

      // Initialize undo/redo history with loaded positions
      initializeHistory(positions);

      // Fit view after layout with a small delay
      setTimeout(() => {
        fitView({ padding: 0.1, duration: 300 });
      }, 50);
    } catch (error) {
      console.error("Apply positions failed:", error);
    } finally {
      setIsLayouting(false);
    }
  }, [data, nodes, handlePinClick, setNodes, setEdges, fitView, initializeHistory]);

  // Run layout on initial mount - use saved positions if available
  useEffect(() => {
    if (initialLayoutDone.current) return;
    initialLayoutDone.current = true;

    if (data.positions && Object.keys(data.positions).length > 0) {
      // Apply saved positions
      applyPositions(data.positions);
    } else {
      // Run auto-layout
      runAutoLayout();
    }
  }, [data.positions, applyPositions, runAutoLayout]);

  // Handle node changes and flag position updates for deferred reporting
  const handleNodesChange = useCallback(
    (changes: NodeChange<DiagramNode>[]) => {
      onNodesChange(changes);

      // Check if any position changes occurred (drag end)
      const hasPositionChange = changes.some(
        (change) => change.type === "position" && !change.dragging
      );

      if (hasPositionChange) {
        // Flag for deferred update (will be handled in useEffect below)
        pendingPositionChangeRef.current = true;
      }
    },
    [onNodesChange]
  );

  // Safely notify parent of position changes AFTER render is complete
  // This prevents "setState during render" errors
  useEffect(() => {
    if (pendingPositionChangeRef.current) {
      pendingPositionChangeRef.current = false;
      const positions = extractPositions(nodes);
      onPositionsChange?.(positions);
      recordPositionChange(positions); // Record for undo/redo
    }
  }, [nodes, onPositionsChange, recordPositionChange]);

  // Handle undo action
  const handleUndo = useCallback(() => {
    const positions = undo();
    if (positions) {
      setNodes((currentNodes) =>
        currentNodes.map((node) => ({
          ...node,
          position: positions[node.id] || node.position,
        }))
      );
      onPositionsChange?.(positions);
    }
  }, [undo, setNodes, onPositionsChange]);

  // Handle redo action
  const handleRedo = useCallback(() => {
    const positions = redo();
    if (positions) {
      setNodes((currentNodes) =>
        currentNodes.map((node) => ({
          ...node,
          position: positions[node.id] || node.position,
        }))
      );
      onPositionsChange?.(positions);
    }
  }, [redo, setNodes, onPositionsChange]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+Z (Windows/Linux) or Cmd+Z (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        if (e.shiftKey) {
          // Ctrl+Shift+Z or Cmd+Shift+Z = Redo
          e.preventDefault();
          handleRedo();
        } else {
          // Ctrl+Z or Cmd+Z = Undo
          e.preventDefault();
          handleUndo();
        }
      }
      // Also support Ctrl+Y for redo (Windows convention)
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);

  const onConnect: OnConnect = useCallback(
    (params) => {
      setEdges((eds) => addEdge(params, eds));
      if (params.sourceHandle && params.targetHandle) {
        onWireCreate?.(params.sourceHandle, params.targetHandle);
      }
    },
    [setEdges, onWireCreate]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onComponentSelect?.(node.id);
    },
    [onComponentSelect]
  );

  // Handle selection changes to update visual state
  const onSelectionChange: OnSelectionChangeFunc = useCallback(
    ({ nodes: selectedNodes }) => {
      const selectedIds = new Set(selectedNodes.map((n) => n.id));
      setNodes((currentNodes) =>
        currentNodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            isSelected: selectedIds.has(node.id),
          },
        }))
      );
    },
    [setNodes]
  );

  return (
    <div className="h-full w-full bg-neutral-100 dark:bg-neutral-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        // Pan with two-finger scroll, zoom only with pinch
        panOnScroll
        zoomOnScroll={false}
        zoomOnPinch
        // Disable editing in read-only mode
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        // Multi-selection: Shift+click to add/remove, Shift+drag for box select
        selectionOnDrag={!readOnly}
        selectionMode={SelectionMode.Partial}
        selectionKeyCode={readOnly ? null : "Shift"}
        multiSelectionKeyCode={readOnly ? null : "Shift"}
        deleteKeyCode={null} // Disable delete key to prevent accidental deletions
        defaultEdgeOptions={{
          type: "smoothstep",
        }}
        className="[&_.react-flow__background]:dark:[--xy-background-pattern-color:#374151] [&_.react-flow__background]:[--xy-background-pattern-color:#d1d5db]"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
        />
        <Controls className="!bg-white dark:!bg-neutral-800 !border-neutral-200 dark:!border-neutral-700 !rounded-lg [&>button]:!bg-white dark:[&>button]:!bg-neutral-800 [&>button]:!border-neutral-200 dark:[&>button]:!border-neutral-700 [&>button]:!text-neutral-700 dark:[&>button]:!text-white [&>button:hover]:!bg-neutral-100 dark:[&>button:hover]:!bg-neutral-700" />
        <MiniMap
          className="!bg-white dark:!bg-neutral-900 !rounded-lg !border !border-neutral-200 dark:!border-neutral-700"
          nodeColor={(node) => {
            const nodeData = node.data as unknown as ComponentNodeData;
            const type = nodeData?.component?.type;
            switch (type) {
              case "pdu":
                return "#3b82f6";
              case "ecu":
                return "#ef4444";
              case "relay":
                return "#f59e0b";
              default:
                return "#6b7280";
            }
          }}
          maskColor="rgba(255, 255, 255, 0.8)"
        />
      </ReactFlow>

      {/* Menu - positioned in top right (hidden in read-only mode) */}
      {!readOnly && (
        <div className="absolute top-4 right-4">
          <DiagramMenu
            onAutoLayout={runAutoLayout}
            {...(onResetToSource && { onResetToSource })}
            {...(onShare && { onShare })}
            onPrint={() => setIsPrintOpen(true)}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={canUndo}
            canRedo={canRedo}
            hasSavedPositions={hasSavedPositions}
            isLayouting={isLayouting}
            isSharing={isSharing}
          />
        </div>
      )}

      {/* View-only badge */}
      {readOnly && (
        <div className="absolute top-4 right-4 bg-neutral-800/90 text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          View Only
        </div>
      )}

      {/* Circuit Legend - positioned higher on mobile to avoid bottom bar */}
      {data.circuits.length > 0 && (
        <div className="absolute bottom-20 md:bottom-4 left-4 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-lg p-3 border border-neutral-200 dark:border-neutral-700 max-h-[40vh] overflow-y-auto">
          <div className="text-xs font-semibold text-neutral-900 dark:text-white mb-2">Circuits</div>
          <div className="space-y-1">
            {data.circuits.map((circuit) => (
              <div key={circuit.id} className="flex items-center gap-2 text-xs">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: circuit.color }}
                />
                <span className="text-neutral-700 dark:text-white/80 truncate">{circuit.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selection indicators */}
      {selectedPin && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
          Click another pin to create connection
        </div>
      )}

      {/* Multi-selection count */}
      {nodes.filter((n) => n.data?.isSelected).length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-2">
          <span>{nodes.filter((n) => n.data?.isSelected).length} components selected</span>
          <span className="text-blue-200">• Drag to move together</span>
        </div>
      )}

      {/* Keyboard hints - bottom right (hidden on mobile/touch devices) */}
      <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-500 dark:text-neutral-400 hidden md:block">
        <div className="flex items-center gap-3">
          <span><kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[10px] font-mono">⇧ Shift</kbd> + click to multi-select</span>
          <span><kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[10px] font-mono">⇧ Shift</kbd> + drag for box select</span>
        </div>
      </div>

      {/* Loading overlay */}
      {isLayouting && (
        <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 flex items-center gap-3 border border-neutral-200 dark:border-neutral-700">
            <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
            <span className="text-neutral-900 dark:text-white">Calculating layout...</span>
          </div>
        </div>
      )}

      {/* Print Dialog */}
      <PrintDialog
        data={data}
        getDiagramBounds={getDiagramBounds}
        open={isPrintOpen}
        onOpenChange={setIsPrintOpen}
      />
    </div>
  );
}

// Wrap with ReactFlowProvider for useReactFlow hook
export function WiringDiagram(props: WiringDiagramProps) {
  return (
    <ReactFlowProvider>
      <WiringDiagramInner {...props} />
    </ReactFlowProvider>
  );
}
