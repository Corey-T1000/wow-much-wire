"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Cpu, Cable, CircuitBoard, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import type { DiagramData, DiagramComponent } from "./types";

interface SearchCommandProps {
  data: DiagramData;
  onSelectComponent?: (componentId: string) => void;
  onHighlightCircuits?: (circuitIds: string[]) => void;
}

interface SearchResult {
  type: "component" | "pin" | "wire" | "circuit";
  id: string;
  title: string;
  subtitle: string;
  metadata?: string | undefined;
  circuitId?: string | undefined;
  componentId?: string | undefined;
}

export function SearchCommand({
  data,
  onSelectComponent,
  onHighlightCircuits,
}: SearchCommandProps) {
  const [open, setOpen] = useState(false);

  // Open with Cmd+K or Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Build searchable index
  const searchIndex = useMemo(() => {
    const results: SearchResult[] = [];

    // Index components
    for (const component of data.components) {
      results.push({
        type: "component",
        id: component.id,
        title: component.name,
        subtitle: `${component.type}${component.manufacturer ? ` • ${component.manufacturer}` : ""}`,
        metadata: component.partNumber || undefined,
      });

      // Index pins within components
      for (const connector of component.connectors) {
        for (const pin of connector.pins) {
          results.push({
            type: "pin",
            id: pin.id,
            title: `${pin.label || pin.position}`,
            subtitle: `${component.name} → ${connector.name}`,
            metadata: pin.function || undefined,
            componentId: component.id,
          });
        }
      }
    }

    // Index wires
    for (const wire of data.wires) {
      const sourceComponent = findComponentForPin(data.components, wire.sourcePinId);
      const targetComponent = findComponentForPin(data.components, wire.targetPinId);
      const circuit = wire.circuitId
        ? data.circuits.find((c) => c.id === wire.circuitId)
        : null;

      results.push({
        type: "wire",
        id: wire.id,
        title: `${sourceComponent?.name || "?"} → ${targetComponent?.name || "?"}`,
        subtitle: circuit ? circuit.name : "Unassigned",
        metadata: wire.gauge || undefined,
        circuitId: wire.circuitId || undefined,
      });
    }

    // Index circuits
    for (const circuit of data.circuits) {
      const wireCount = data.wires.filter((w) => w.circuitId === circuit.id).length;
      results.push({
        type: "circuit",
        id: circuit.id,
        title: circuit.name,
        subtitle: `${circuit.category} • ${wireCount} wires`,
        circuitId: circuit.id,
      });
    }

    return results;
  }, [data]);

  const handleSelect = (result: SearchResult) => {
    switch (result.type) {
      case "component":
        onSelectComponent?.(result.id);
        break;
      case "pin":
        if (result.componentId) {
          onSelectComponent?.(result.componentId);
        }
        break;
      case "wire":
        if (result.circuitId) {
          onHighlightCircuits?.([result.circuitId]);
        }
        break;
      case "circuit":
        if (result.circuitId) {
          onHighlightCircuits?.([result.circuitId]);
        }
        break;
    }
    setOpen(false);
  };

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "component":
        return <Cpu className="h-4 w-4" />;
      case "pin":
        return <CircuitBoard className="h-4 w-4" />;
      case "wire":
        return <Cable className="h-4 w-4" />;
      case "circuit":
        return <Zap className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: SearchResult["type"]) => {
    const colors: Record<SearchResult["type"], string> = {
      component: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
      pin: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
      wire: "bg-green-500/20 text-green-600 dark:text-green-400",
      circuit: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
    };
    return (
      <Badge variant="outline" className={`text-[10px] ${colors[type]}`}>
        {type}
      </Badge>
    );
  };

  // Group results by type
  const groupedResults = useMemo(() => {
    return {
      components: searchIndex.filter((r) => r.type === "component"),
      pins: searchIndex.filter((r) => r.type === "pin"),
      wires: searchIndex.filter((r) => r.type === "wire"),
      circuits: searchIndex.filter((r) => r.type === "circuit"),
    };
  }, [searchIndex]);

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors w-full"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search diagram...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-700 rounded text-[10px] font-mono">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search components, pins, wires, circuits..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {/* Circuits */}
          <CommandGroup heading="Circuits">
            {groupedResults.circuits.slice(0, 5).map((result) => (
              <CommandItem
                key={result.id}
                value={`${result.title} ${result.subtitle}`}
                onSelect={() => handleSelect(result)}
                className="flex items-center gap-3"
              >
                {getIcon(result.type)}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{result.title}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {result.subtitle}
                  </div>
                </div>
                {getTypeBadge(result.type)}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Components */}
          <CommandGroup heading="Components">
            {groupedResults.components.slice(0, 8).map((result) => (
              <CommandItem
                key={result.id}
                value={`${result.title} ${result.subtitle} ${result.metadata || ""}`}
                onSelect={() => handleSelect(result)}
                className="flex items-center gap-3"
              >
                {getIcon(result.type)}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{result.title}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {result.subtitle}
                    {result.metadata && ` • ${result.metadata}`}
                  </div>
                </div>
                {getTypeBadge(result.type)}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Pins */}
          <CommandGroup heading="Pins">
            {groupedResults.pins.slice(0, 10).map((result) => (
              <CommandItem
                key={result.id}
                value={`${result.title} ${result.subtitle} ${result.metadata || ""}`}
                onSelect={() => handleSelect(result)}
                className="flex items-center gap-3"
              >
                {getIcon(result.type)}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{result.title}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {result.subtitle}
                    {result.metadata && ` • ${result.metadata}`}
                  </div>
                </div>
                {getTypeBadge(result.type)}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

// Helper to find which component contains a pin
function findComponentForPin(
  components: DiagramComponent[],
  pinId: string
): DiagramComponent | undefined {
  for (const component of components) {
    for (const connector of component.connectors) {
      if (connector.pins.some((p) => p.id === pinId)) {
        return component;
      }
    }
  }
  return undefined;
}
