"use client";

import {
  Menu,
  LayoutGrid,
  FileDown,
  PlusCircle,
  Sun,
  Moon,
  Monitor,
  CheckCircle2,
  RotateCcw,
  Undo2,
  Redo2,
  Share2,
  Printer,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DiagramMenuProps {
  onAutoLayout: () => void;
  onExport?: () => void;
  onAddComponent?: () => void;
  onResetToSource?: () => void;
  onShare?: () => void;
  onPrint?: () => void;
  /** Undo/Redo handlers */
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  /** Whether saved positions exist in the diagram data */
  hasSavedPositions: boolean;
  isLayouting: boolean;
  isSharing?: boolean;
}

export function DiagramMenu({
  onAutoLayout,
  onExport,
  onAddComponent,
  onResetToSource,
  onShare,
  onPrint,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  hasSavedPositions,
  isLayouting,
  isSharing = false,
}: DiagramMenuProps) {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {/* Undo/Redo */}
        <DropdownMenuItem onClick={onUndo} disabled={!canUndo}>
          <Undo2 className="mr-2 h-4 w-4" />
          Undo
          <span className="ml-auto text-xs text-muted-foreground">⌘Z</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onRedo} disabled={!canRedo}>
          <Redo2 className="mr-2 h-4 w-4" />
          Redo
          <span className="ml-auto text-xs text-muted-foreground">⌘⇧Z</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Layout Actions */}
        <DropdownMenuItem onClick={onAutoLayout} disabled={isLayouting}>
          <LayoutGrid className="mr-2 h-4 w-4" />
          Re-arrange Layout
        </DropdownMenuItem>

        {/* Layout status indicator */}
        {hasSavedPositions && (
          <div className="px-2 py-1.5 text-xs text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            Custom layout loaded
          </div>
        )}

        <DropdownMenuSeparator />

        {/* Component Actions */}
        <DropdownMenuItem onClick={onAddComponent}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Component
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExport}>
          <FileDown className="mr-2 h-4 w-4" />
          Export
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onPrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print...
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onShare} disabled={isSharing}>
          <Share2 className="mr-2 h-4 w-4" />
          {isSharing ? "Creating link..." : "Share Link"}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Sync with source data (preserves positions) */}
        <DropdownMenuItem onClick={onResetToSource}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Sync with Source Data
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Theme Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {theme === "dark" ? (
              <Moon className="mr-2 h-4 w-4" />
            ) : theme === "light" ? (
              <Sun className="mr-2 h-4 w-4" />
            ) : (
              <Monitor className="mr-2 h-4 w-4" />
            )}
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Monitor className="mr-2 h-4 w-4" />
              System
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
