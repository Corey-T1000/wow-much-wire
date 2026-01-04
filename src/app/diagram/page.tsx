"use client";

import { useState, useCallback, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { WiringDiagram, WiringChat, HistoryPanel, SaveDialog, CircuitFilter } from "@/components/diagram";
import type { DiagramData, DiagramWire, DiagramPosition } from "@/components/diagram/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClientId } from "@/lib/client-id";
import { sampleDiagramData } from "@/lib/sample-data";

export default function DiagramPage() {
  // Make diagram data stateful so AI can modify it
  const [diagramData, setDiagramData] = useState<DiagramData>(sampleDiagramData);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [, setSelectedPin] = useState<string | null>(null);
  const [highlightedCircuits, setHighlightedCircuits] = useState<string[]>([]);
  const [currentVersion, setCurrentVersion] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedData, setLastSavedData] = useState<DiagramData | null>(null);

  // Load diagram from database on mount
  useEffect(() => {
    async function loadDiagram() {
      try {
        const clientId = getClientId();
        const response = await fetch(`/api/diagram?clientId=${clientId}`);
        const result = await response.json();

        if (result.success) {
          setDiagramData(result.data);
          setLastSavedData(result.data);
          setCurrentVersion(result.version);
        }
      } catch (error) {
        console.error("Failed to load diagram:", error);
        toast.error("Failed to load diagram", {
          description: "Using sample data instead",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadDiagram();
  }, []);

  // Track unsaved changes
  useEffect(() => {
    if (lastSavedData === null) return;

    const hasChanges =
      diagramData.components.length !== lastSavedData.components.length ||
      diagramData.wires.length !== lastSavedData.wires.length ||
      JSON.stringify(diagramData) !== JSON.stringify(lastSavedData);

    setHasUnsavedChanges(hasChanges);
  }, [diagramData, lastSavedData]);

  // Save diagram to database
  const handleSave = useCallback(async (message: string) => {
    try {
      const clientId = getClientId();
      const response = await fetch("/api/diagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: diagramData,
          message,
          clientId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setCurrentVersion(result.version);
        setLastSavedData(diagramData);
        setHasUnsavedChanges(false);
        toast.success(`Saved as version ${result.version}`, {
          description: message,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Failed to save diagram:", error);
      toast.error("Failed to save diagram");
      throw error; // Re-throw so the dialog knows it failed
    }
  }, [diagramData]);

  // Handle restore from history
  const handleRestore = useCallback((data: DiagramData, version: number) => {
    setDiagramData(data);
    setCurrentVersion(version);
    setLastSavedData(data);
    setHasUnsavedChanges(false);
  }, []);

  // Handle sync with source data (sample-data.ts) - preserves positions
  const handleResetToSource = useCallback(async () => {
    if (!confirm("Sync diagram with source data?\n\n✓ Your layout positions will be preserved\n✓ New components and wires will be added\n✓ Component data will be updated")) {
      return;
    }

    setIsLoading(true);
    try {
      const clientId = getClientId();
      const response = await fetch(`/api/diagram?clientId=${clientId}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (result.success) {
        // Reload the diagram data
        const loadResponse = await fetch(`/api/diagram?clientId=${clientId}`);
        const loadResult = await loadResponse.json();

        if (loadResult.success) {
          setDiagramData(loadResult.data);
          setLastSavedData(loadResult.data);
          setCurrentVersion(loadResult.version);
          setHasUnsavedChanges(false);
          toast.success("Diagram synced with source data", {
            description: `+${result.newComponents} components, +${result.newWires} wires (${result.positionsPreserved} positions preserved)`,
          });
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Failed to sync diagram:", error);
      toast.error("Failed to sync diagram");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleWireCreate = useCallback(
    (sourcePinId: string, targetPinId: string) => {
      // Create a new wire
      const newWire: DiagramWire = {
        id: `wire-${Date.now()}`,
        sourcePinId,
        targetPinId,
        color: null,
        gauge: null,
        circuitId: null,
        isInstalled: false,
      };

      setDiagramData((prev) => ({
        ...prev,
        wires: [...prev.wires, newWire],
      }));

      toast.success("Wire created", {
        description: `Connected ${sourcePinId} → ${targetPinId}`,
      });
    },
    []
  );

  const handleComponentSelect = useCallback((componentId: string | null) => {
    setSelectedComponent(componentId);
  }, []);

  const handlePinSelect = useCallback((pinId: string | null) => {
    setSelectedPin(pinId);
  }, []);

  // Handle position changes from the diagram (drag, auto-layout)
  const handlePositionsChange = useCallback(
    (positions: Record<string, DiagramPosition>) => {
      setDiagramData((prev) => ({
        ...prev,
        positions,
      }));
    },
    []
  );

  // Get details of selected component
  const selectedComponentData = selectedComponent
    ? diagramData.components.find((c) => c.id === selectedComponent)
    : null;

  // Show loading state while fetching from database
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-neutral-950 z-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-neutral-600 dark:text-neutral-400">Loading diagram...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex bg-white dark:bg-neutral-950 z-50">
      {/* Main diagram area */}
      <div className="flex-1 relative">
        <WiringDiagram
          data={diagramData}
          highlightedCircuits={highlightedCircuits}
          onWireCreate={handleWireCreate}
          onComponentSelect={handleComponentSelect}
          onPinSelect={handlePinSelect}
          onPositionsChange={handlePositionsChange}
          onResetToSource={handleResetToSource}
        />

        {/* Header overlay - just the title, menu is in diagram component */}
        <div className="absolute top-4 left-4 pointer-events-none">
          <div className="pointer-events-auto">
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
              1993 NA Miata - Wiring Diagram
            </h1>
            <p className="text-sm text-neutral-500 dark:text-white/60">
              Full rewire with Bussmann PDM & MS3Pro Mini
            </p>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 bg-neutral-100 dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Save & Version Controls */}
          <div className="flex gap-2">
            <SaveDialog
              onSave={handleSave}
              disabled={!hasUnsavedChanges}
            />
            {hasUnsavedChanges && (
              <Badge variant="outline" className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/50">
                Unsaved
              </Badge>
            )}
          </div>

          {/* Version History */}
          <HistoryPanel
            currentVersion={currentVersion}
            onRestore={handleRestore}
          />

          {/* Circuit Focus Filter */}
          <Card className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
            <CardContent className="p-3">
              <CircuitFilter
                circuits={diagramData.circuits}
                selectedCircuits={highlightedCircuits}
                onSelectionChange={setHighlightedCircuits}
              />
            </CardContent>
          </Card>

          {/* Project Info */}
          <Card className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-neutral-900 dark:text-white">Project Stats</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="grid grid-cols-2 gap-2 text-neutral-500 dark:text-white/70">
                <div>Components:</div>
                <div className="text-neutral-900 dark:text-white">{diagramData.components.length}</div>
                <div>Circuits:</div>
                <div className="text-neutral-900 dark:text-white">{diagramData.circuits.length}</div>
                <div>Connections:</div>
                <div className="text-neutral-900 dark:text-white">{diagramData.wires.length}</div>
                <div>Version:</div>
                <div className="text-neutral-900 dark:text-white">
                  {currentVersion !== undefined ? `v${currentVersion}` : "—"}
                </div>
                <div>Status:</div>
                <div>
                  <Badge variant="outline" className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/50">
                    In Progress
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Component Details */}
          {selectedComponentData && (
            <Card className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-neutral-900 dark:text-white flex items-center justify-between">
                  {selectedComponentData.name}
                  <Badge variant="outline" className="text-xs">
                    {selectedComponentData.type}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                {selectedComponentData.manufacturer && (
                  <div className="text-neutral-600 dark:text-white/70">
                    <span className="text-neutral-400 dark:text-white/50">Manufacturer: </span>
                    {selectedComponentData.manufacturer}
                  </div>
                )}
                {selectedComponentData.partNumber && (
                  <div className="text-neutral-600 dark:text-white/70">
                    <span className="text-neutral-400 dark:text-white/50">Part #: </span>
                    {selectedComponentData.partNumber}
                  </div>
                )}
                {selectedComponentData.notes && (
                  <div className="text-neutral-400 dark:text-white/50 italic text-xs">
                    {selectedComponentData.notes}
                  </div>
                )}

                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
                  <div className="text-neutral-400 dark:text-white/50 text-xs mb-2">Connectors</div>
                  {selectedComponentData.connectors.map((conn) => (
                    <div key={conn.id} className="flex justify-between items-center py-1">
                      <span className="text-neutral-900 dark:text-white">{conn.name}</span>
                      <span className="text-neutral-400 dark:text-white/50">{conn.pinCount} pins</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Circuits */}
          <Card className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-neutral-900 dark:text-white">Circuits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {diagramData.circuits.map((circuit) => (
                  <div
                    key={circuit.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: circuit.color }}
                    />
                    <span className="text-neutral-700 dark:text-white/80 flex-1">{circuit.name}</span>
                    <Badge
                      variant="outline"
                      className="text-xs text-neutral-400 dark:text-white/50 border-neutral-300 dark:border-white/20"
                    >
                      {circuit.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Wiring Assistant */}
          <Card className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                <span className="text-amber-500 dark:text-amber-400">⚡</span>
                AI Wiring Expert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WiringChat
                data={diagramData}
                selectedComponentId={selectedComponent}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
