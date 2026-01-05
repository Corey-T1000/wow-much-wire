"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Loader2, Eye, Calendar, ArrowLeft, Filter } from "lucide-react";
import { WiringDiagram, CircuitFilter } from "@/components/diagram";
import type { DiagramData } from "@/components/diagram/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SharedDiagramResponse {
  success: boolean;
  data?: DiagramData;
  title?: string;
  description?: string;
  viewCount?: number;
  createdAt?: string;
  error?: string;
}

export default function SharedDiagramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [diagramData, setDiagramData] = useState<DiagramData | null>(null);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string | null>(null);
  const [viewCount, setViewCount] = useState<number>(0);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [highlightedCircuits, setHighlightedCircuits] = useState<string[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);

  // Load shared diagram
  useEffect(() => {
    async function loadSharedDiagram() {
      try {
        const response = await fetch(`/api/diagram/share?id=${id}`);
        const result: SharedDiagramResponse = await response.json();

        if (result.success && result.data) {
          setDiagramData(result.data);
          setTitle(result.title || "Shared Diagram");
          setDescription(result.description || null);
          setViewCount(result.viewCount || 0);
          setCreatedAt(result.createdAt || null);
        } else {
          setError(result.error || "Failed to load shared diagram");
        }
      } catch (err) {
        console.error("Failed to load shared diagram:", err);
        setError("Failed to load shared diagram");
      } finally {
        setIsLoading(false);
      }
    }

    loadSharedDiagram();
  }, [id]);

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-neutral-950 z-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-neutral-600 dark:text-neutral-400">Loading shared diagram...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !diagramData) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-neutral-950 z-50">
        <div className="flex flex-col items-center gap-4 text-center p-8">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <span className="text-3xl">🔌</span>
          </div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
            Diagram Not Found
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-md">
            {error || "This shared diagram link may have expired or been removed."}
          </p>
          <Link href="/diagram">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to Diagram Editor
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="fixed inset-0 flex bg-white dark:bg-neutral-950 z-50">
      {/* Main diagram area */}
      <div className="flex-1 relative">
        <WiringDiagram
          data={diagramData}
          highlightedCircuits={highlightedCircuits}
          readOnly={true}
        />

        {/* Header overlay */}
        <div className="absolute top-4 left-4 pointer-events-none">
          <div className="pointer-events-auto">
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-neutral-500 dark:text-white/60">
                {description}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400 dark:text-white/40">
              {formattedDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Shared {formattedDate}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {viewCount} view{viewCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Toggle sidebar button (mobile-friendly) */}
        <div className="absolute bottom-4 left-4 md:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSidebar(!showSidebar)}
            className="bg-white dark:bg-neutral-800"
          >
            <Filter className="h-4 w-4 mr-2" />
            Circuits
          </Button>
        </div>
      </div>

      {/* Sidebar - always visible on desktop, toggleable on mobile */}
      <div
        className={`
          ${showSidebar ? "translate-x-0" : "translate-x-full md:translate-x-0"}
          w-80 bg-neutral-100 dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800
          overflow-y-auto transition-transform duration-200
          fixed right-0 top-0 bottom-0 md:relative z-50
        `}
      >
        <div className="p-4 space-y-4">
          {/* Close button on mobile */}
          <div className="md:hidden flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(false)}
            >
              Close
            </Button>
          </div>

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

          {/* Project Stats */}
          <Card className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-neutral-900 dark:text-white">
                Diagram Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="grid grid-cols-2 gap-2 text-neutral-500 dark:text-white/70">
                <div>Components:</div>
                <div className="text-neutral-900 dark:text-white">
                  {diagramData.components.length}
                </div>
                <div>Circuits:</div>
                <div className="text-neutral-900 dark:text-white">
                  {diagramData.circuits.length}
                </div>
                <div>Connections:</div>
                <div className="text-neutral-900 dark:text-white">
                  {diagramData.wires.length}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Circuits Legend */}
          <Card className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-neutral-900 dark:text-white">
                Circuits
              </CardTitle>
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
                    <span className="text-neutral-700 dark:text-white/80 flex-1">
                      {circuit.name}
                    </span>
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

          {/* Back to editor link */}
          <div className="pt-2">
            <Link href="/diagram" className="block">
              <Button variant="outline" className="w-full" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Open in Editor
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Backdrop for mobile sidebar */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  );
}
