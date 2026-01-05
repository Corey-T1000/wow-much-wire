"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SaveDialogProps {
  onSave: (message: string) => Promise<void>;
  disabled?: boolean;
  pendingChanges?: {
    componentsAdded?: number;
    componentsModified?: number;
    wiresAdded?: number;
    wiresModified?: number;
  };
  /** Custom trigger element (for mobile bottom bar) */
  trigger?: React.ReactNode;
}

export function SaveDialog({ onSave, disabled, pendingChanges, trigger }: SaveDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!message.trim()) return;

    setIsSaving(true);
    try {
      await onSave(message.trim());
      setMessage("");
      setIsOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && message.trim()) {
      e.preventDefault();
      handleSave();
    }
  };

  // Generate a suggested message based on pending changes
  const suggestedMessage = () => {
    if (!pendingChanges) return "";
    const parts: string[] = [];
    if (pendingChanges.componentsAdded) {
      parts.push(`Add ${pendingChanges.componentsAdded} component${pendingChanges.componentsAdded > 1 ? "s" : ""}`);
    }
    if (pendingChanges.wiresAdded) {
      parts.push(`Add ${pendingChanges.wiresAdded} wire${pendingChanges.wiresAdded > 1 ? "s" : ""}`);
    }
    return parts.join(", ");
  };

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled}
      className="bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
    >
      <Save className="h-4 w-4 mr-2" />
      Save Version
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild disabled={disabled}>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Diagram Version</DialogTitle>
          <DialogDescription>
            Describe what changed in this version. This helps you track your wiring progress.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="message">What did you change?</Label>
            <Input
              id="message"
              placeholder={suggestedMessage() || "e.g., Added MS3 fuel pump circuit"}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
          {pendingChanges && (
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              Changes detected: {suggestedMessage() || "Various updates"}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!message.trim() || isSaving}
          >
            {isSaving ? "Saving..." : "Save Version"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
