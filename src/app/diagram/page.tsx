"use client";

import { useState, useCallback, useEffect } from "react";
import { Loader2, PanelRightOpen, X, Filter, Save } from "lucide-react";
import { toast } from "sonner";
import { WiringDiagram, HistoryPanel, SaveDialog, CircuitFilter, SearchCommand, PinDiagram, NotesPanel, WiringTips } from "@/components/diagram";
import type { DiagramData, DiagramWire, DiagramPosition, DiagramAttachment } from "@/components/diagram/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const [isSharing, setIsSharing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    setIsLoading(true);
    toast.loading("Syncing with source data...", { id: "sync" });

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
          toast.success("Synced with source data", {
            id: "sync",
            description: `+${result.newComponents} components, +${result.newWires} wires`,
          });
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Failed to sync diagram:", error);
      toast.error("Failed to sync diagram", { id: "sync" });
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

  // Create a shareable link
  const handleShare = useCallback(async () => {
    setIsSharing(true);
    try {
      const response = await fetch("/api/diagram/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: diagramData,
          title: "1993 NA Miata - Wiring Diagram",
          description: "Full rewire with Bussmann PDM & MS3Pro Mini",
          projectId: "miata-rewire-1993",
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Copy to clipboard
        await navigator.clipboard.writeText(result.shareUrl);
        toast.success("Share link copied!", {
          description: result.shareUrl,
          action: {
            label: "Open",
            onClick: () => window.open(result.shareUrl, "_blank"),
          },
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Failed to create share link:", error);
      toast.error("Failed to create share link");
    } finally {
      setIsSharing(false);
    }
  }, [diagramData]);

  // Handle adding an attachment (note or photo)
  const handleAddAttachment = useCallback(
    (attachment: Omit<DiagramAttachment, "id" | "createdAt">) => {
      const newAttachment: DiagramAttachment = {
        ...attachment,
        id: `attach-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      setDiagramData((prev) => ({
        ...prev,
        attachments: [...(prev.attachments || []), newAttachment],
      }));

      toast.success(`${attachment.type === "note" ? "Note" : "Photo"} added`);
    },
    []
  );

  // Handle deleting an attachment
  const handleDeleteAttachment = useCallback((attachmentId: string) => {
    setDiagramData((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).filter((a) => a.id !== attachmentId),
    }));

    toast.success("Attachment deleted");
  }, []);

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
    <div className="fixed inset-0 flex flex-col md:flex-row bg-white dark:bg-neutral-950 z-50">
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
          onShare={handleShare}
          isSharing={isSharing}
        />

        {/* Header removed - circuit tabs provide navigation context */}

        {/* Mobile bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 md:hidden bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border-t border-neutral-200 dark:border-neutral-800 p-2 safe-area-pb">
          <div className="flex items-center justify-around gap-2">
            {/* Circuit filter indicator */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(true)}
              className="flex-col h-auto py-2 gap-1"
            >
              <Filter className="h-5 w-5" />
              <span className="text-[10px]">
                {highlightedCircuits.length > 0 ? `${highlightedCircuits.length} Active` : "Circuits"}
              </span>
            </Button>

            {/* Save button */}
            <SaveDialog
              onSave={handleSave}
              disabled={!hasUnsavedChanges}
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-col h-auto py-2 gap-1 relative"
                >
                  <Save className="h-5 w-5" />
                  <span className="text-[10px]">Save</span>
                  {hasUnsavedChanges && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
                  )}
                </Button>
              }
            />

            {/* Open panel button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(true)}
              className="flex-col h-auto py-2 gap-1"
            >
              <PanelRightOpen className="h-5 w-5" />
              <span className="text-[10px]">Panel</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar - slide-in on mobile, always visible on desktop */}
      <div
        className={`
          fixed md:relative inset-y-0 right-0 z-50
          w-[85vw] max-w-[360px] md:w-80
          bg-neutral-100 dark:bg-neutral-900
          border-l border-neutral-200 dark:border-neutral-800
          overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
        `}
      >
        {/* Mobile close button */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-3 bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 md:hidden">
          <span className="font-semibold text-neutral-900 dark:text-white">Diagram Panel</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 space-y-4 pb-20 md:pb-4">
          {/* Search */}
          <SearchCommand
            data={diagramData}
            onSelectComponent={handleComponentSelect}
            onHighlightCircuits={setHighlightedCircuits}
          />

          {/* Save & Version Controls - hidden on mobile (in bottom bar) */}
          <div className="hidden md:flex gap-2">
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

          {/* Notes & Photos */}
          <NotesPanel
            data={diagramData}
            onAddAttachment={handleAddAttachment}
            onDeleteAttachment={handleDeleteAttachment}
          />

          {/* Wiring Reference Guide */}
          <WiringTips />

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
                  <div className="space-y-3">
                    {selectedComponentData.connectors.map((conn) => (
                      <div key={conn.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-neutral-900 dark:text-white text-sm font-medium">{conn.name}</span>
                          <span className="text-neutral-400 dark:text-white/50 text-xs">{conn.pinCount} pins</span>
                        </div>
                        <PinDiagram
                          connector={conn}
                          data={diagramData}
                          cellSize={28}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>

      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
