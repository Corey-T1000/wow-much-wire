"use client";

import { useState } from "react";
import { Filter, Eye, EyeOff, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { DiagramCircuit } from "./types";

interface CircuitFilterProps {
  circuits: DiagramCircuit[];
  selectedCircuits: string[];
  onSelectionChange: (circuitIds: string[]) => void;
}

// Group circuits by category for better organization
function groupByCategory(circuits: DiagramCircuit[]) {
  const groups: Record<string, DiagramCircuit[]> = {};
  for (const circuit of circuits) {
    const category = circuit.category || "other";
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(circuit);
  }
  return groups;
}

const categoryLabels: Record<string, string> = {
  lighting: "Lighting",
  engine: "Engine",
  fuel: "Fuel",
  cooling: "Cooling",
  accessories: "Accessories",
  ground: "Grounds",
  reference: "Reference",
  other: "Other",
};

export function CircuitFilter({
  circuits,
  selectedCircuits,
  onSelectionChange,
}: CircuitFilterProps) {
  const [isOpen, setIsOpen] = useState(true);
  const groupedCircuits = groupByCategory(circuits);
  const categories = Object.keys(groupedCircuits).sort();

  const isFiltering = selectedCircuits.length > 0;
  const selectedCount = selectedCircuits.length;

  const toggleCircuit = (circuitId: string) => {
    if (selectedCircuits.includes(circuitId)) {
      onSelectionChange(selectedCircuits.filter((id) => id !== circuitId));
    } else {
      onSelectionChange([...selectedCircuits, circuitId]);
    }
  };

  const selectCategory = (category: string) => {
    const categoryCircuits = groupedCircuits[category];
    if (!categoryCircuits) return;

    const categoryCircuitIds = categoryCircuits.map((c) => c.id);
    const allSelected = categoryCircuitIds.every((id) =>
      selectedCircuits.includes(id)
    );

    if (allSelected) {
      // Deselect all in category
      onSelectionChange(
        selectedCircuits.filter((id) => !categoryCircuitIds.includes(id))
      );
    } else {
      // Select all in category
      const newSelection = new Set([...selectedCircuits, ...categoryCircuitIds]);
      onSelectionChange(Array.from(newSelection));
    }
  };

  const clearFilter = () => {
    onSelectionChange([]);
  };

  const selectOnly = (circuitId: string) => {
    onSelectionChange([circuitId]);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between px-2 py-1.5 h-auto"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <Filter className="h-4 w-4" />
            Circuit Focus
            {isFiltering && (
              <Badge
                variant="secondary"
                className="bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs"
              >
                {selectedCount} active
              </Badge>
            )}
          </span>
          <span className="text-xs text-muted-foreground">
            {isOpen ? "▼" : "▶"}
          </span>
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="pt-2 space-y-2">
          {/* Filter status and clear button */}
          {isFiltering && (
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-muted-foreground">
                Highlighting {selectedCount} circuit{selectedCount !== 1 ? "s" : ""}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilter}
                className="h-6 px-2 text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          )}

          {!isFiltering && (
            <p className="text-xs text-muted-foreground px-1">
              Click circuits to highlight. Others will dim.
            </p>
          )}

          <div className="space-y-3">
            {categories.map((category) => {
              const categoryCircuits = groupedCircuits[category] ?? [];
              const categoryCircuitIds = categoryCircuits.map((c) => c.id);
              const selectedInCategory = categoryCircuitIds.filter((id) =>
                selectedCircuits.includes(id)
              ).length;

              return (
                <div key={category} className="space-y-1">
                  {/* Category header */}
                  <button
                    onClick={() => selectCategory(category)}
                    className="flex items-center justify-between w-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-1 py-0.5"
                  >
                    <span>{categoryLabels[category] || category}</span>
                    {selectedInCategory > 0 && (
                      <span className="text-amber-500">
                        {selectedInCategory}/{categoryCircuits.length}
                      </span>
                    )}
                  </button>

                  {/* Circuit buttons */}
                  <div className="space-y-0.5">
                    {categoryCircuits.map((circuit) => {
                      const isSelected = selectedCircuits.includes(circuit.id);
                      return (
                        <div
                          key={circuit.id}
                          className="flex items-center gap-1 group"
                        >
                          <button
                            onClick={() => toggleCircuit(circuit.id)}
                            className={`
                              flex items-center gap-2 flex-1 px-2 py-1 rounded text-xs transition-all
                              ${
                                isSelected
                                  ? "bg-amber-500/20 text-foreground"
                                  : isFiltering
                                  ? "text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/50"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                              }
                            `}
                          >
                            <div
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{
                                backgroundColor: circuit.color,
                                opacity: isFiltering && !isSelected ? 0.3 : 1,
                              }}
                            />
                            <span className="truncate">{circuit.name}</span>
                            {isSelected ? (
                              <Eye className="h-3 w-3 ml-auto shrink-0 text-amber-500" />
                            ) : (
                              <EyeOff className="h-3 w-3 ml-auto shrink-0 opacity-0 group-hover:opacity-50" />
                            )}
                          </button>

                          {/* "Only" button for quick single-select */}
                          <button
                            onClick={() => selectOnly(circuit.id)}
                            className="opacity-0 group-hover:opacity-100 text-[10px] text-muted-foreground hover:text-amber-500 transition-opacity px-1"
                            title="Show only this circuit"
                          >
                            only
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
