"use client";

import { forwardRef } from "react";
import type {
  DiagramComponent,
  DiagramConnector,
  DiagramData,
} from "../types";

interface PinoutPrintViewProps {
  components: DiagramComponent[];
  data: DiagramData;
  showWireDetails?: boolean;
  title?: string;
}

/**
 * Ultra-compact printer-optimized pinout view.
 * Designed to fit 25-35 rows per page on letter paper.
 * Uses inline styles for consistent sizing in both preview and print.
 */
export const PinoutPrintView = forwardRef<HTMLDivElement, PinoutPrintViewProps>(
  function PinoutPrintView(
    { components, data, showWireDetails = true, title },
    ref
  ) {
    return (
      <div
        ref={ref}
        className="print-pinout-view"
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: "7pt",
          lineHeight: 1.2,
          background: "white",
          color: "black",
          padding: "0",
        }}
      >
        {/* Print Header - compact */}
        <div
          style={{
            borderBottom: "1px solid black",
            paddingBottom: "4pt",
            marginBottom: "8pt",
          }}
        >
          <h1
            style={{
              fontSize: "11pt",
              fontWeight: "bold",
              margin: "0 0 2pt 0",
            }}
          >
            {title || "Wiring Diagram - Pinout Reference"}
          </h1>
          <p style={{ fontSize: "6pt", color: "#666", margin: 0 }}>
            Generated: {new Date().toLocaleDateString()} •{" "}
            {components.length} component{components.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Component Pinouts */}
        <div>
          {components.map((component, idx) => (
            <ComponentPinout
              key={component.id}
              component={component}
              data={data}
              showWireDetails={showWireDetails}
              isLast={idx === components.length - 1}
            />
          ))}
        </div>

        {/* Footer with circuit legend */}
        {showWireDetails && data.circuits.length > 0 && (
          <div
            style={{
              marginTop: "8pt",
              paddingTop: "4pt",
              borderTop: "0.5pt solid #ccc",
            }}
          >
            <h3
              style={{
                fontSize: "6pt",
                fontWeight: 600,
                margin: "0 0 3pt 0",
              }}
            >
              Circuit Legend
            </h3>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "2pt 8pt",
                fontSize: "5pt",
              }}
            >
              {data.circuits.map((circuit) => (
                <div
                  key={circuit.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "2pt",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: "5pt",
                      height: "5pt",
                      borderRadius: "50%",
                      border: "0.25pt solid #666",
                      backgroundColor: circuit.color,
                    }}
                  />
                  <span>{circuit.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

function ComponentPinout({
  component,
  data,
  showWireDetails,
  isLast,
}: {
  component: DiagramComponent;
  data: DiagramData;
  showWireDetails: boolean;
  isLast: boolean;
}) {
  return (
    <div
      style={{
        pageBreakInside: "avoid",
        marginBottom: isLast ? 0 : "10pt",
      }}
    >
      {/* Component Header */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "4pt",
          marginBottom: "3pt",
          paddingBottom: "2pt",
          borderBottom: "0.5pt solid #ccc",
        }}
      >
        <h2 style={{ fontSize: "8pt", fontWeight: "bold", margin: 0 }}>
          {component.name}
        </h2>
        {(component.manufacturer || component.partNumber) && (
          <span style={{ fontSize: "6pt", color: "#666" }}>
            {[component.manufacturer, component.partNumber]
              .filter(Boolean)
              .join(" ")}
          </span>
        )}
        <span
          style={{
            fontSize: "5pt",
            textTransform: "uppercase",
            background: "#eee",
            padding: "1pt 3pt",
            borderRadius: "2pt",
          }}
        >
          {component.type}
        </span>
      </div>

      {component.notes && (
        <p
          style={{
            fontSize: "5pt",
            color: "#666",
            fontStyle: "italic",
            margin: "0 0 3pt 0",
          }}
        >
          {component.notes}
        </p>
      )}

      {/* Connectors - 2 column grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: component.connectors.length > 1 ? "1fr 1fr" : "1fr",
          gap: "4pt",
        }}
      >
        {component.connectors.map((connector) => (
          <ConnectorPinout
            key={connector.id}
            connector={connector}
            data={data}
            showWireDetails={showWireDetails}
          />
        ))}
      </div>
    </div>
  );
}

function ConnectorPinout({
  connector,
  data,
  showWireDetails,
}: {
  connector: DiagramConnector;
  data: DiagramData;
  showWireDetails: boolean;
}) {
  // Build wire connection map for this connector's pins
  const pinConnections = new Map<
    string,
    {
      targetComponent: string | undefined;
      targetPin: string | undefined;
      gauge: string | undefined;
      circuit: { name: string; color: string } | undefined;
      isInstalled: boolean | undefined;
    }
  >();

  for (const pin of connector.pins) {
    const wire = data.wires.find(
      (w) => w.sourcePinId === pin.id || w.targetPinId === pin.id
    );

    if (wire) {
      const otherPinId =
        wire.sourcePinId === pin.id ? wire.targetPinId : wire.sourcePinId;
      const circuit = wire.circuitId
        ? data.circuits.find((c) => c.id === wire.circuitId)
        : null;

      // Find target component and pin
      for (const comp of data.components) {
        for (const conn of comp.connectors) {
          const targetPin = conn.pins.find((p) => p.id === otherPinId);
          if (targetPin) {
            pinConnections.set(pin.id, {
              targetComponent: comp.name,
              targetPin: targetPin.position,
              gauge: wire.gauge || undefined,
              circuit: circuit
                ? { name: circuit.name, color: circuit.color }
                : undefined,
              isInstalled: wire.isInstalled,
            });
            break;
          }
        }
      }
    }
  }

  const usedPinCount = connector.pins.filter((p) => p.isUsed).length;

  return (
    <div
      style={{
        border: "0.5pt solid #999",
        borderRadius: "2pt",
        overflow: "hidden",
        pageBreakInside: "avoid",
      }}
    >
      {/* Connector header */}
      <div
        style={{
          background: "#f5f5f5",
          padding: "2pt 4pt",
          borderBottom: "0.5pt solid #999",
        }}
      >
        <h3 style={{ fontSize: "6pt", fontWeight: 600, margin: 0 }}>
          {connector.name}
          <span
            style={{
              fontWeight: "normal",
              color: "#666",
              marginLeft: "4pt",
            }}
          >
            ({usedPinCount}/{connector.pinCount} used)
          </span>
        </h3>
      </div>

      {/* Pin table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "5pt",
        }}
      >
        <thead>
          <tr style={{ background: "#f9f9f9" }}>
            <th
              style={{
                padding: "1pt 2pt",
                textAlign: "left",
                fontWeight: 600,
                borderBottom: "0.5pt solid #ddd",
                width: "20pt",
              }}
            >
              Pin
            </th>
            <th
              style={{
                padding: "1pt 2pt",
                textAlign: "left",
                fontWeight: 600,
                borderBottom: "0.5pt solid #ddd",
              }}
            >
              Function
            </th>
            {showWireDetails && (
              <>
                <th
                  style={{
                    padding: "1pt 2pt",
                    textAlign: "left",
                    fontWeight: 600,
                    borderBottom: "0.5pt solid #ddd",
                    width: "20pt",
                  }}
                >
                  AWG
                </th>
                <th
                  style={{
                    padding: "1pt 2pt",
                    textAlign: "left",
                    fontWeight: 600,
                    borderBottom: "0.5pt solid #ddd",
                  }}
                >
                  Connects To
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {connector.pins.map((pin) => {
            const connection = pinConnections.get(pin.id);
            const isUnused = !pin.isUsed && !connection;

            return (
              <tr
                key={pin.id}
                style={{ color: isUnused ? "#aaa" : "inherit" }}
              >
                <td
                  style={{
                    padding: "1pt 2pt",
                    borderBottom: "0.25pt solid #eee",
                    fontFamily: "monospace",
                    fontWeight: 600,
                    fontSize: "5pt",
                  }}
                >
                  {pin.position}
                </td>
                <td
                  style={{
                    padding: "1pt 2pt",
                    borderBottom: "0.25pt solid #eee",
                  }}
                >
                  {pin.label || pin.function || (isUnused ? "—" : "Unknown")}
                  {pin.fuseRating && (
                    <span style={{ marginLeft: "2pt", color: "#d97706" }}>
                      ({pin.fuseRating})
                    </span>
                  )}
                </td>
                {showWireDetails && (
                  <>
                    <td
                      style={{
                        padding: "1pt 2pt",
                        borderBottom: "0.25pt solid #eee",
                        fontFamily: "monospace",
                        fontSize: "5pt",
                      }}
                    >
                      {connection?.gauge || pin.wireGauge || "—"}
                    </td>
                    <td
                      style={{
                        padding: "1pt 2pt",
                        borderBottom: "0.25pt solid #eee",
                      }}
                    >
                      {connection ? (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "2pt",
                          }}
                        >
                          {connection.circuit && (
                            <span
                              style={{
                                display: "inline-block",
                                width: "4pt",
                                height: "4pt",
                                borderRadius: "50%",
                                border: "0.25pt solid #666",
                                backgroundColor: connection.circuit.color,
                                flexShrink: 0,
                              }}
                            />
                          )}
                          <span>
                            {connection.targetComponent} ({connection.targetPin})
                          </span>
                          {connection.isInstalled === false && (
                            <span style={{ color: "#d97706" }}>
                              (pending)
                            </span>
                          )}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default PinoutPrintView;
