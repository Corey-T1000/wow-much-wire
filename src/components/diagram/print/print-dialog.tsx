"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { Printer, FileText, Download, Image as ImageIcon } from "lucide-react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DiagramData } from "../types";
import type { PaperSize, DiagramBounds } from "./print-utils";
import { PinoutPrintView } from "./pinout-print-view";
import "./print-styles.css";

interface PrintDialogProps {
  data: DiagramData;
  getDiagramBounds: () => DiagramBounds | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type PrintMode = "pinouts" | "export";

export function PrintDialog({
  data,
  getDiagramBounds,
  open = false,
  onOpenChange,
}: PrintDialogProps) {
  const [mode, setMode] = useState<PrintMode>("pinouts");
  const [paperSize, setPaperSize] = useState<PaperSize>("letter");
  const [showWireDetails, setShowWireDetails] = useState(true);
  const [exportScale, setExportScale] = useState<"1x" | "2x" | "4x">("2x");
  const [isExporting, setIsExporting] = useState(false);
  const [selectedComponentIds, setSelectedComponentIds] = useState<Set<string>>(
    () => new Set(data.components.map((c) => c.id))
  );

  const pinoutRef = useRef<HTMLDivElement>(null);

  const selectedComponents = useMemo(() => {
    return data.components.filter((c) => selectedComponentIds.has(c.id));
  }, [data.components, selectedComponentIds]);

  const toggleComponent = useCallback((id: string) => {
    setSelectedComponentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAllComponents = useCallback(() => {
    setSelectedComponentIds(new Set(data.components.map((c) => c.id)));
  }, [data.components]);

  const selectNoComponents = useCallback(() => {
    setSelectedComponentIds(new Set());
  }, []);

  // Print pinouts
  const handlePrintPinouts = useCallback(() => {
    const printContent = pinoutRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print");
      return;
    }

    printWindow.document.title = "Wiring Diagram - Pinouts";
    const doc = printWindow.document;

    const style = doc.createElement("style");
    style.textContent = `
      @page { size: ${paperSize === "a4" ? "A4" : paperSize === "tabloid" ? "tabloid" : "letter"}; margin: 10mm; }
      * { box-sizing: border-box; }
      body { font-family: system-ui, sans-serif; font-size: 7pt; line-height: 1.2; margin: 0; padding: 0; background: white; color: black; }
    `;
    doc.head.appendChild(style);
    doc.body.appendChild(printContent.cloneNode(true));

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 200);
  }, [paperSize]);

  // Export diagram as PNG image using html-to-image
  const handleExportImage = useCallback(async () => {
    setIsExporting(true);

    try {
      // Find the React Flow viewport element
      const rfViewport = document.querySelector(".react-flow__viewport") as HTMLElement;
      if (!rfViewport) {
        alert("Could not find diagram viewport");
        setIsExporting(false);
        return;
      }

      // Get the React Flow container for bounds
      const rfContainer = document.querySelector(".react-flow") as HTMLElement;
      if (!rfContainer) {
        alert("Could not find diagram container");
        setIsExporting(false);
        return;
      }

      // Get diagram bounds to calculate proper dimensions
      const bounds = getDiagramBounds();
      if (!bounds) {
        alert("No components found in diagram");
        setIsExporting(false);
        return;
      }

      // Force light mode for export by temporarily adding a class
      const html = document.documentElement;
      const originalClass = html.className;
      const originalStyle = html.style.colorScheme;
      html.classList.remove("dark");
      html.classList.add("light");
      html.style.colorScheme = "light";

      // Scale multiplier for resolution
      const scaleMultiplier = exportScale === "1x" ? 1 : exportScale === "2x" ? 2 : 4;
      const padding = 50;

      try {
        // Use html-to-image to capture the viewport
        const dataUrl = await toPng(rfViewport, {
          backgroundColor: "#ffffff",
          width: (bounds.width + padding * 2) * scaleMultiplier,
          height: (bounds.height + padding * 2) * scaleMultiplier,
          style: {
            transform: `translate(${(-bounds.x + padding) * scaleMultiplier}px, ${(-bounds.y + padding) * scaleMultiplier}px) scale(${scaleMultiplier})`,
            transformOrigin: "top left",
          },
          filter: (node) => {
            // Filter out UI controls that shouldn't be in the export
            const className = node.className?.toString?.() || "";
            if (
              className.includes("react-flow__controls") ||
              className.includes("react-flow__minimap") ||
              className.includes("react-flow__panel")
            ) {
              return false;
            }
            return true;
          },
        });

        // Restore original theme
        html.className = originalClass;
        html.style.colorScheme = originalStyle;

        // Download the image
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `wiring-diagram-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (captureError) {
        // Restore theme even if capture fails
        html.className = originalClass;
        html.style.colorScheme = originalStyle;
        throw captureError;
      }

      setIsExporting(false);
    } catch (error) {
      console.error("Export error:", error);
      alert("Export failed. Try using your browser's screenshot feature instead.");
      setIsExporting(false);
    }
  }, [getDiagramBounds, exportScale]);

  const handleAction = useCallback(() => {
    if (mode === "pinouts") {
      handlePrintPinouts();
    } else {
      handleExportImage();
    }
  }, [mode, handlePrintPinouts, handleExportImage]);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    onOpenChange?.(newOpen);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Print & Export
          </DialogTitle>
          <DialogDescription>
            Print pinout reference sheets or export the full diagram as an image.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={mode}
          onValueChange={(v: string) => setMode(v as PrintMode)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pinouts" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Pinout Sheets
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Export Image
            </TabsTrigger>
          </TabsList>

          {/* Pinouts Tab */}
          <TabsContent value="pinouts" className="flex-1 flex flex-col overflow-hidden mt-4">
            <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Components</Label>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={selectAllComponents}>
                      Select All
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={selectNoComponents}>
                      Select None
                    </Button>
                  </div>
                </div>

                <ScrollArea className="h-32 border rounded-md p-2">
                  <div className="space-y-1">
                    {data.components.map((component) => (
                      <label key={component.id} className="flex items-center gap-2 py-1 px-1 rounded hover:bg-muted/50 cursor-pointer">
                        <Checkbox
                          checked={selectedComponentIds.has(component.id)}
                          onCheckedChange={() => toggleComponent(component.id)}
                        />
                        <span className="text-sm">{component.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({component.connectors.length} connector{component.connectors.length !== 1 ? "s" : ""})
                        </span>
                      </label>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Paper</Label>
                  <Select value={paperSize} onValueChange={(v: string) => setPaperSize(v as PaperSize)}>
                    <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="letter">Letter</SelectItem>
                      <SelectItem value="a4">A4</SelectItem>
                      <SelectItem value="tabloid">Tabloid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <label className="flex items-center gap-2">
                  <Checkbox checked={showWireDetails} onCheckedChange={(v) => setShowWireDetails(v === true)} />
                  <span className="text-sm">Include wire details</span>
                </label>
              </div>

              <div className="flex-1 overflow-hidden border rounded-lg bg-white">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <PinoutPrintView
                      ref={pinoutRef}
                      components={selectedComponents}
                      data={data}
                      showWireDetails={showWireDetails}
                    />
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          {/* Export Image Tab */}
          <TabsContent value="export" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Label className="text-sm">Resolution</Label>
                <Select value={exportScale} onValueChange={(v: string) => setExportScale(v as "1x" | "2x" | "4x")}>
                  <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1x">1x (Screen)</SelectItem>
                    <SelectItem value="2x">2x (Print)</SelectItem>
                    <SelectItem value="4x">4x (Large Print)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-lg p-6 bg-muted/30">
                <div className="flex items-start gap-4">
                  <ImageIcon className="h-10 w-10 text-muted-foreground mt-1" />
                  <div>
                    <h3 className="font-medium mb-1">Export as PNG Image</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Download your diagram as a high-resolution image. You can then:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Print it as a poster using your printer&apos;s tile/poster mode</li>
                      <li>Use macOS Preview → Print → Scale to fit multiple pages</li>
                      <li>Use a tool like PosteRazor for precise tiling</li>
                      <li>Send to a print shop for large format printing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAction}
            disabled={(mode === "pinouts" && selectedComponents.length === 0) || isExporting}
          >
            {mode === "pinouts" ? (
              <>
                <Printer className="h-4 w-4 mr-2" />
                Print Preview
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? "Exporting..." : "Download PNG"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PrintDialog;
