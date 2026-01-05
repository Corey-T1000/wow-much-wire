"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import {
  StickyNote,
  Image,
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
  X,
  Camera,
  FileText,
  Cpu,
  Cable,
  CircuitBoard,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  DiagramData,
  DiagramAttachment,
  AttachmentEntityType,
} from "./types";

interface NotesPanelProps {
  data: DiagramData;
  onAddAttachment?: (
    attachment: Omit<DiagramAttachment, "id" | "createdAt">
  ) => void;
  onDeleteAttachment?: (attachmentId: string) => void;
  selectedEntityId?: string | undefined;
  selectedEntityType?: AttachmentEntityType | undefined;
}

interface EntityOption {
  id: string;
  name: string;
  type: AttachmentEntityType;
}

export function NotesPanel({
  data,
  onAddAttachment,
  onDeleteAttachment,
  selectedEntityId,
  selectedEntityType,
}: NotesPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [attachmentType, setAttachmentType] = useState<"note" | "photo">("note");
  const [selectedEntity, setSelectedEntity] = useState<string>("");
  const [noteContent, setNoteContent] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Build list of all entities that can have attachments
  const entityOptions = useMemo((): EntityOption[] => {
    const options: EntityOption[] = [];

    // Components
    for (const component of data.components) {
      options.push({
        id: component.id,
        name: component.name,
        type: "component",
      });

      // Connectors within components
      for (const connector of component.connectors) {
        options.push({
          id: connector.id,
          name: `${component.name} → ${connector.name}`,
          type: "connector",
        });
      }
    }

    // Wires
    for (const wire of data.wires) {
      const sourceComponent = findComponentForPin(data.components, wire.sourcePinId);
      const targetComponent = findComponentForPin(data.components, wire.targetPinId);
      options.push({
        id: wire.id,
        name: `Wire: ${sourceComponent?.name || "?"} → ${targetComponent?.name || "?"}`,
        type: "wire",
      });
    }

    return options;
  }, [data]);

  // Get attachments, optionally filtered
  const attachments = useMemo(() => {
    const all = data.attachments || [];
    if (selectedEntityId && selectedEntityType) {
      return all.filter(
        (a) => a.entityId === selectedEntityId && a.entityType === selectedEntityType
      );
    }
    return all.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [data.attachments, selectedEntityId, selectedEntityType]);

  // Get entity name for display
  const getEntityName = useCallback(
    (entityId: string, entityType: AttachmentEntityType): string => {
      const option = entityOptions.find(
        (o) => o.id === entityId && o.type === entityType
      );
      return option?.name || "Unknown";
    },
    [entityOptions]
  );

  // Handle file upload
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPhotoDataUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle add attachment
  const handleAdd = useCallback(() => {
    if (!selectedEntity) return;

    const entityOption = entityOptions.find((o) => o.id === selectedEntity);
    if (!entityOption) return;

    if (attachmentType === "note" && !noteContent.trim()) return;
    if (attachmentType === "photo" && !photoDataUrl) return;

    onAddAttachment?.({
      entityType: entityOption.type,
      entityId: selectedEntity,
      type: attachmentType,
      content: attachmentType === "note" ? noteContent : photoDataUrl,
      caption: attachmentType === "photo" ? photoCaption || undefined : undefined,
    });

    // Reset form
    setNoteContent("");
    setPhotoDataUrl("");
    setPhotoCaption("");
    setSelectedEntity("");
    setIsDialogOpen(false);
  }, [
    selectedEntity,
    entityOptions,
    attachmentType,
    noteContent,
    photoDataUrl,
    photoCaption,
    onAddAttachment,
  ]);

  const getEntityIcon = (type: AttachmentEntityType) => {
    switch (type) {
      case "component":
        return <Cpu className="h-3 w-3" />;
      case "connector":
        return <CircuitBoard className="h-3 w-3" />;
      case "wire":
        return <Cable className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const noteCount = attachments.filter((a) => a.type === "note").length;
  const photoCount = attachments.filter((a) => a.type === "photo").length;

  return (
    <Card className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-2 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700/50 rounded-t-lg transition-colors">
            <CardTitle className="text-sm text-neutral-900 dark:text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-purple-500" />
                Notes & Photos
              </span>
              <div className="flex items-center gap-2">
                {noteCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {noteCount} note{noteCount !== 1 ? "s" : ""}
                  </Badge>
                )}
                {photoCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {photoCount} photo{photoCount !== 1 ? "s" : ""}
                  </Badge>
                )}
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="text-sm space-y-3">
            {/* Add button */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note or Photo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Attachment</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Attachment type selector */}
                  <div className="flex gap-2">
                    <Button
                      variant={attachmentType === "note" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAttachmentType("note")}
                      className="flex-1"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Note
                    </Button>
                    <Button
                      variant={attachmentType === "photo" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAttachmentType("photo")}
                      className="flex-1"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Photo
                    </Button>
                  </div>

                  {/* Entity selector */}
                  <div className="space-y-2">
                    <Label>Attach to</Label>
                    <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select component or wire..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="" disabled>
                          Select...
                        </SelectItem>
                        {entityOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            <span className="flex items-center gap-2">
                              {getEntityIcon(option.type)}
                              {option.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Content input */}
                  {attachmentType === "note" ? (
                    <div className="space-y-2">
                      <Label>Note</Label>
                      <Textarea
                        placeholder="Add your notes here..."
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        rows={4}
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Photo</Label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        {photoDataUrl ? (
                          <div className="relative">
                            <img
                              src={photoDataUrl}
                              alt="Preview"
                              className="w-full h-32 object-cover rounded-lg border"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-6 w-6"
                              onClick={() => setPhotoDataUrl("")}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            className="w-full h-32 border-dashed"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <Image className="h-8 w-8 text-neutral-400" />
                              <span className="text-xs text-neutral-500">
                                Click to upload image
                              </span>
                            </div>
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Caption (optional)</Label>
                        <Input
                          placeholder="Add a caption..."
                          value={photoCaption}
                          onChange={(e) => setPhotoCaption(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button
                    onClick={handleAdd}
                    disabled={
                      !selectedEntity ||
                      (attachmentType === "note" && !noteContent.trim()) ||
                      (attachmentType === "photo" && !photoDataUrl)
                    }
                  >
                    Add {attachmentType === "note" ? "Note" : "Photo"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Attachments list */}
            {attachments.length === 0 ? (
              <div className="text-center py-4 text-neutral-400 dark:text-neutral-500">
                <StickyNote className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No notes or photos yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="p-2 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                        {getEntityIcon(attachment.entityType)}
                        <span className="truncate max-w-[140px]">
                          {getEntityName(attachment.entityId, attachment.entityType)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            attachment.type === "note"
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          }`}
                        >
                          {attachment.type}
                        </Badge>
                        {onDeleteAttachment && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-neutral-400 hover:text-red-500"
                            onClick={() => onDeleteAttachment(attachment.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    {attachment.type === "note" ? (
                      <p className="text-xs text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                        {attachment.content}
                      </p>
                    ) : (
                      <div>
                        <button
                          className="w-full"
                          onClick={() => setPreviewImage(attachment.content)}
                        >
                          <img
                            src={attachment.content}
                            alt={attachment.caption || "Photo"}
                            className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-90"
                          />
                        </button>
                        {attachment.caption && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 italic">
                            {attachment.caption}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">
                      {new Date(attachment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      {/* Image preview modal */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Photo Preview</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Helper to find which component contains a pin
function findComponentForPin(
  components: { id: string; name: string; connectors: { pins: { id: string }[] }[] }[],
  pinId: string
) {
  for (const component of components) {
    for (const connector of component.connectors) {
      if (connector.pins.some((p) => p.id === pinId)) {
        return component;
      }
    }
  }
  return undefined;
}
