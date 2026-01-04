"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Send, Loader2, Zap, AlertTriangle, CheckCircle, Search } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DiagramData } from "./types";

interface WiringChatProps {
  data: DiagramData;
  selectedComponentId?: string | null;
}

// Quick prompts for common verification tasks
const QUICK_PROMPTS = [
  {
    icon: AlertTriangle,
    label: "Check Grounds",
    prompt:
      "Review my ground connections. Are there any potential ground loops or missing grounds? Check against the grounding best practices.",
  },
  {
    icon: Zap,
    label: "Verify Fuses",
    prompt:
      "Check if my fuse ratings are appropriate for the connected loads and wire gauges. Use the wire gauge ampacity chart.",
  },
  {
    icon: CheckCircle,
    label: "Pre-install Checklist",
    prompt:
      "Give me a checklist of things to verify before I start connecting wires. Include the validation rules.",
  },
  {
    icon: Search,
    label: "Full Audit",
    prompt:
      "Do a complete audit of my wiring setup. Check each connection against the PDM and MS3 specs, verify wire gauges, and identify any issues or improvements needed.",
  },
];

export function WiringChat({ data, selectedComponentId }: WiringChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Create transport with custom API endpoint and full diagram data
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/wiring-chat",
        body: {
          projectContext: {
            componentCount: data.components.length,
            circuitCount: data.circuits.length,
            wireCount: data.wires.length,
          },
          // Send diagram data for context
          diagramData: {
            components: data.components.map((c) => ({
              id: c.id,
              name: c.name,
              type: c.type,
              connectors: c.connectors.map((conn) => ({
                id: conn.id,
                name: conn.name,
                pins: conn.pins.map((p) => ({
                  id: p.id,
                  position: p.position,
                  function: p.function,
                  isUsed: p.isUsed,
                })),
              })),
            })),
            wires: data.wires,
            circuits: data.circuits,
          },
        },
      }),
    [data]
  );

  const { messages, sendMessage, status, setMessages } = useChat({
    transport,
  });
  const [input, setInput] = useState("");

  const isStreaming = status === "streaming";

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Get selected component context for the prompt
  const selectedComponent = selectedComponentId
    ? data.components.find((c) => c.id === selectedComponentId)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    // Include selected component context if available
    let contextualPrompt = text;
    if (selectedComponent) {
      contextualPrompt = `[Context: Looking at ${selectedComponent.name} (${selectedComponent.type})]\n\n${text}`;
    }

    sendMessage({
      role: "user",
      parts: [{ type: "text", text: contextualPrompt }],
    });
    setInput("");
  };

  const handleQuickPrompt = (prompt: string) => {
    let contextualPrompt = prompt;
    if (selectedComponent) {
      contextualPrompt = `[Context: Looking at ${selectedComponent.name} (${selectedComponent.type})]\n\n${prompt}`;
    }

    sendMessage({
      role: "user",
      parts: [{ type: "text", text: contextualPrompt }],
    });
  };

  return (
    <div className="flex flex-col h-[500px]">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
        {messages.length === 0 ? (
          <div className="space-y-3">
            <p className="text-xs text-neutral-400 dark:text-white/50 text-center">
              AI expert with PDM/MS3 specs, wire gauge tables, and grounding best practices loaded.
            </p>
            <div className="space-y-2">
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp.label}
                  onClick={() => handleQuickPrompt(qp.prompt)}
                  disabled={isStreaming}
                  className={cn(
                    "w-full flex items-center gap-2 p-2 rounded-lg text-left text-xs",
                    "bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <qp.icon className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                  <span className="text-neutral-700 dark:text-white/80">{qp.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages
            .filter((m) => m.role !== "system")
            .map((message) => {
              // Extract text content from message parts
              const content =
                message.parts
                  ?.filter((p) => p.type === "text")
                  .map((p) => (p as { type: "text"; text: string }).text)
                  .join("\n") || "";

              return (
                <div
                  key={message.id}
                  className={cn(
                    "rounded-lg text-xs",
                    message.role === "user"
                      ? "bg-blue-100 dark:bg-blue-600/30 p-2 ml-4"
                      : "bg-neutral-100 dark:bg-white/10 p-2 mr-4"
                  )}
                >
                  <div className="font-medium text-neutral-500 dark:text-white/70 mb-1">
                    {message.role === "user" ? "You" : "AI Expert"}
                  </div>
                  <div className="prose prose-neutral dark:prose-invert prose-xs max-w-none">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0 text-neutral-700 dark:text-white/90">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                        ol: ({ children }) => (
                          <ol className="list-decimal ml-4 mb-2">{children}</ol>
                        ),
                        li: ({ children }) => <li className="mb-0.5 text-neutral-700 dark:text-white/90">{children}</li>,
                        strong: ({ children }) => (
                          <strong className="text-amber-600 dark:text-amber-400">{children}</strong>
                        ),
                        code: ({ children }) => (
                          <code className="bg-neutral-200 dark:bg-white/10 px-1 rounded">{children}</code>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-3 mb-1">{children}</h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-xs font-bold text-neutral-800 dark:text-white/90 mt-2 mb-1">{children}</h3>
                        ),
                      }}
                    >
                      {content}
                    </ReactMarkdown>
                  </div>
                </div>
              );
            })
        )}
        {isStreaming && messages[messages.length - 1]?.role === "user" && (
          <div className="flex items-center gap-2 p-2 bg-neutral-100 dark:bg-white/10 rounded-lg mr-4">
            <Loader2 className="h-3 w-3 animate-spin text-neutral-500 dark:text-white/50" />
            <span className="text-xs text-neutral-500 dark:text-white/50">Analyzing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Selected component indicator */}
      {selectedComponent && (
        <div className="text-xs text-amber-600 dark:text-amber-400/80 mb-2 flex items-center gap-1">
          <Zap className="h-3 w-3" />
          Context: {selectedComponent.name}
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about wiring, pins, specs..."
          disabled={isStreaming}
          className={cn(
            "flex-1 px-3 py-2 text-xs rounded-lg",
            "bg-neutral-100 dark:bg-white/10 border border-neutral-200 dark:border-white/20",
            "placeholder:text-neutral-400 dark:placeholder:text-white/30 text-neutral-900 dark:text-white",
            "focus:outline-none focus:ring-1 focus:ring-amber-500/50",
            "disabled:opacity-50"
          )}
        />
        <Button
          type="submit"
          size="sm"
          disabled={!input.trim() || isStreaming}
          className="bg-amber-600 hover:bg-amber-500 text-white"
        >
          {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>

      {/* Clear chat */}
      {messages.length > 0 && (
        <button
          onClick={() => setMessages([])}
          className="text-xs text-neutral-400 dark:text-white/30 hover:text-neutral-600 dark:hover:text-white/50 mt-2 text-center"
        >
          Clear conversation
        </button>
      )}
    </div>
  );
}
