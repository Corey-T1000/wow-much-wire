import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText, UIMessage, convertToModelMessages } from "ai";
import { z } from "zod";
import { WIRING_REFERENCE } from "@/lib/wiring-reference";

// Build a comprehensive system prompt with all reference data embedded
function buildSystemPrompt() {
  // Format the wire gauge table
  const wireGaugeTable = Object.entries(WIRING_REFERENCE.wireGauge)
    .map(([gauge, spec]) => `- ${gauge}: ${spec.ampacity}A max, fuse ${spec.recommendedFuse}`)
    .join("\n");

  // Format PDM relay info
  const pdmRelays = WIRING_REFERENCE.pdm.relays
    .map(
      (r) =>
        `- ${r.id} (${r.type}): ${r.description}. Trigger: ${r.triggerPin.connector}-${r.triggerPin.position}. Max ${r.maxCurrent}A`
    )
    .join("\n");

  // Format PDM connectors
  const pdmConnectors = WIRING_REFERENCE.pdm.connectors
    .map((c) => {
      const pins = Object.entries(c.functions)
        .map(([pos, func]) => `  ${pos}: ${func}`)
        .join("\n");
      return `${c.name} Connector:\n${pins}`;
    })
    .join("\n\n");

  // Format MS3 pins
  const ms3Pins = WIRING_REFERENCE.ms3.pins
    .map((p) => `- Pin ${p.pin} (${p.name}): ${p.type} - ${p.notes}`)
    .join("\n");

  // Format typical loads
  const loads = Object.entries(WIRING_REFERENCE.loads)
    .map(([name, spec]) => `- ${name}: ${spec.current}A - ${spec.notes}`)
    .join("\n");

  return `You are an expert automotive electrical engineer specializing in aftermarket wiring, ECU integration, and power distribution systems. You're helping with a 1993 Mazda Miata (NA) full rewire project.

## Your Equipment

**PDM**: Bussmann 31S-001-0
- Manufacturer: ${WIRING_REFERENCE.pdm.manufacturer}
- Operating Voltage: ${WIRING_REFERENCE.pdm.operatingVoltage.min}-${WIRING_REFERENCE.pdm.operatingVoltage.max}V
- Max Combined Output: ${WIRING_REFERENCE.pdm.totalOutputCurrent}A

**ECU**: MS3Pro Mini
- Manufacturer: ${WIRING_REFERENCE.ms3.manufacturer}
- Connector: ${WIRING_REFERENCE.ms3.connector}
- Low-Side Outputs (need inverter relays for PDM): Pins ${WIRING_REFERENCE.ms3.lowSideOutputs.join(", ")}

## PDM Relay Configuration
${pdmRelays}

## PDM Pinouts
${pdmConnectors}

## MS3Pro Mini Pinout
${ms3Pins}

## Wire Gauge Ampacity Chart (SAE J1128)
${wireGaugeTable}

Note: Derate 20% for engine bay temperatures.

## Typical Load Current Draws
${loads}

## Inverter Relay Wiring (for ECU Low-Side Outputs)
Purpose: ${WIRING_REFERENCE.inverterRelay.purpose}

When needed:
${WIRING_REFERENCE.inverterRelay.whenNeeded.map((w) => `- ${w}`).join("\n")}

Wiring:
- Pin 30: ${WIRING_REFERENCE.inverterRelay.wiring.pin30}
- Pin 85: ${WIRING_REFERENCE.inverterRelay.wiring.pin85}
- Pin 86: ${WIRING_REFERENCE.inverterRelay.wiring.pin86}
- Pin 87: ${WIRING_REFERENCE.inverterRelay.wiring.pin87}
- Pin 87a: ${WIRING_REFERENCE.inverterRelay.wiring.pin87a}

Operation: ${WIRING_REFERENCE.inverterRelay.operation}

## Grounding Best Practices

**Star Ground (Engine Block)**:
Location: ${WIRING_REFERENCE.grounding.starGround.location}
Connections: ${WIRING_REFERENCE.grounding.starGround.connections.join(", ")}
Note: ${WIRING_REFERENCE.grounding.starGround.notes}

**Sensor Ground**:
Location: ${WIRING_REFERENCE.grounding.sensorGround.location}
Connections: ${WIRING_REFERENCE.grounding.sensorGround.connections.join(", ")}
Note: ${WIRING_REFERENCE.grounding.sensorGround.notes}

**Common Grounding Mistakes to Avoid**:
${WIRING_REFERENCE.grounding.commonMistakes.map((m) => `- ${m}`).join("\n")}

## Validation Rules
${Object.entries(WIRING_REFERENCE.rules)
  .map(([key, rule]) => `- **${key}**: ${rule}`)
  .join("\n")}

## Your Guidelines

1. **Always reference the specs above** - use exact pin numbers and wire gauges from this data
2. **Validate wire gauge against load** - check the ampacity chart before recommending wire sizes
3. **Check fuse vs wire rating** - fuse should not exceed wire ampacity (80% rule ideal)
4. **Remember inverter relay requirement** - MS3 low-side outputs need inversion for PDM
5. **Enforce ground separation** - SGND and PGND only meet at the star ground

When suggesting changes, use this format:
**[ACTION] Description**
- Source: [exact pin reference]
- Target: [exact pin reference]
- Wire: [gauge with justification]
- Fuse: [rating if applicable]
- Why: [brief justification]
- Safety: [any warnings]

Be concise but thorough. If you spot potential issues, clearly explain the risk and provide a solution.`;
}

const WIRING_EXPERT_SYSTEM_PROMPT = buildSystemPrompt();

// Zod schema for message validation
const messagePartSchema = z.object({
  type: z.string(),
  text: z.string().max(10000, "Message text too long").optional(),
});

const messageSchema = z.object({
  id: z.string().optional(),
  role: z.enum(["user", "assistant", "system"]),
  parts: z.array(messagePartSchema).optional(),
  content: z.union([z.string(), z.array(messagePartSchema)]).optional(),
});

const chatRequestSchema = z.object({
  messages: z.array(messageSchema).max(100, "Too many messages"),
  projectContext: z
    .object({
      componentCount: z.number().optional(),
      circuitCount: z.number().optional(),
      wireCount: z.number().optional(),
    })
    .optional(),
  diagramData: z
    .object({
      components: z.array(z.unknown()).optional(),
      wires: z.array(z.unknown()).optional(),
      circuits: z.array(z.unknown()).optional(),
    })
    .optional(),
});

export async function POST(req: Request) {
  // Parse and validate request body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({
        error: "Invalid request",
        details: parsed.error.flatten().fieldErrors,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const { messages, projectContext, diagramData } = parsed.data;

  // Build context-aware system prompt
  let systemPrompt = WIRING_EXPERT_SYSTEM_PROMPT;
  if (projectContext) {
    systemPrompt += `\n\n## Current Project Status
- Components: ${projectContext.componentCount ?? "unknown"}
- Circuits defined: ${projectContext.circuitCount ?? "unknown"}
- Wires connected: ${projectContext.wireCount ?? "unknown"}`;
  }

  // Add current diagram data summary if available
  if (diagramData?.components && Array.isArray(diagramData.components)) {
    const componentSummary = diagramData.components
      .filter(
        (c): c is { name: string; type: string } =>
          typeof c === "object" && c !== null && "name" in c && "type" in c
      )
      .map((c) => `${c.name} (${c.type})`)
      .join(", ");
    if (componentSummary) {
      systemPrompt += `\n\n## Components in Diagram\n${componentSummary}`;
    }
  }

  if (diagramData?.wires && Array.isArray(diagramData.wires) && diagramData.wires.length > 0) {
    systemPrompt += `\n\n## Existing Wires\n${diagramData.wires.length} wires currently connected`;
  }

  // Initialize OpenRouter with API key from environment
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "OpenRouter API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const openrouter = createOpenRouter({ apiKey });

  // Prepend system message
  const messagesWithSystem: UIMessage[] = [
    {
      id: "system",
      role: "system" as const,
      parts: [{ type: "text", text: systemPrompt }],
    },
    ...(messages as UIMessage[]),
  ];

  const result = streamText({
    model: openrouter(process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini"),
    messages: convertToModelMessages(messagesWithSystem),
  });

  return (
    result as unknown as { toUIMessageStreamResponse: () => Response }
  ).toUIMessageStreamResponse();
}
