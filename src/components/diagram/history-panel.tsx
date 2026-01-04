"use client";

import { useState, useEffect, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { History, RotateCcw, GitCommit, Plus, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { DiagramData } from "./types";

interface Snapshot {
  id: string;
  version: number;
  message: string;
  componentsAdded: number;
  componentsRemoved: number;
  wiresAdded: number;
  wiresRemoved: number;
  createdAt: string;
  clientId: string | null;
}

interface HistoryPanelProps {
  currentVersion: number | undefined;
  onRestore: (data: DiagramData, version: number) => void;
  className?: string;
}

export function HistoryPanel({ currentVersion, onRestore, className }: HistoryPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/diagram/history");
      const result = await response.json();
      if (result.success) {
        setSnapshots(result.snapshots);
      }
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load history when panel is opened
  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, loadHistory]);

  const handleRestore = async (snapshotId: string, version: number) => {
    setIsRestoring(snapshotId);
    try {
      const response = await fetch("/api/diagram/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshotId }),
      });

      const result = await response.json();
      if (result.success) {
        onRestore(result.data, result.version);
        toast.success(`Restored to version ${version}`, {
          description: `Now at version ${result.version}`,
        });
        // Reload history to show the restore entry
        await loadHistory();
      } else {
        toast.error("Failed to restore", {
          description: result.error || "Unknown error",
        });
      }
    } catch (error) {
      console.error("Failed to restore:", error);
      toast.error("Failed to restore", {
        description: "Network error",
      });
    } finally {
      setIsRestoring(null);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
        >
          <div className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span>Version History</span>
            {currentVersion !== undefined && (
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                v{currentVersion}
              </span>
            )}
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2">
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <ScrollArea className="h-[300px]">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
                Loading history...
              </div>
            ) : snapshots.length === 0 ? (
              <div className="p-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
                No history yet. Save your diagram to create the first version.
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
                {snapshots.map((snapshot, index) => {
                  const isCurrent = snapshot.version === currentVersion;
                  const isLatest = index === 0;

                  return (
                    <div
                      key={snapshot.id}
                      className={cn(
                        "p-3 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors",
                        isCurrent && "bg-amber-50 dark:bg-amber-900/20"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <GitCommit className="h-3 w-3 text-neutral-400 dark:text-neutral-500 shrink-0" />
                            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                              v{snapshot.version}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-medium">
                                CURRENT
                              </span>
                            )}
                            {isLatest && !isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-600 dark:text-blue-400 font-medium">
                                LATEST
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-neutral-900 dark:text-white mt-1 line-clamp-2">
                            {snapshot.message}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                            <span>
                              {formatDistanceToNow(new Date(snapshot.createdAt), { addSuffix: true })}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {snapshot.componentsAdded > 0 && (
                                <span className="flex items-center gap-0.5 text-green-600 dark:text-green-400">
                                  <Plus className="h-3 w-3" />
                                  {snapshot.componentsAdded}
                                </span>
                              )}
                              {snapshot.componentsRemoved > 0 && (
                                <span className="flex items-center gap-0.5 text-red-600 dark:text-red-400">
                                  <Minus className="h-3 w-3" />
                                  {snapshot.componentsRemoved}
                                </span>
                              )}
                              {snapshot.wiresAdded > 0 && (
                                <span className="flex items-center gap-0.5 text-green-600 dark:text-green-400">
                                  <Plus className="h-3 w-3" />
                                  {snapshot.wiresAdded}w
                                </span>
                              )}
                              {snapshot.wiresRemoved > 0 && (
                                <span className="flex items-center gap-0.5 text-red-600 dark:text-red-400">
                                  <Minus className="h-3 w-3" />
                                  {snapshot.wiresRemoved}w
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {!isCurrent && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="shrink-0"
                            onClick={() => handleRestore(snapshot.id, snapshot.version)}
                            disabled={isRestoring !== null}
                          >
                            <RotateCcw
                              className={cn(
                                "h-4 w-4",
                                isRestoring === snapshot.id && "animate-spin"
                              )}
                            />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
