"use client";

import { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import type { DiagramBounds } from "./print-utils";

const PADDING = 50; // Extra padding around diagram bounds (in diagram coordinates)

/**
 * Hook to capture React Flow diagram bounds and generate printable SVG.
 * Must be used within a ReactFlowProvider context.
 */
export function usePrintCapture() {
  const { getNodes, getViewport } = useReactFlow();

  /**
   * Calculate the bounding box of all nodes in the diagram.
   * Returns the bounds in diagram coordinates (not screen coordinates).
   */
  const getDiagramBounds = useCallback((): DiagramBounds | null => {
    const nodes = getNodes();

    if (nodes.length === 0) {
      return null;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const node of nodes) {
      const { x, y } = node.position;
      // Use measured dimensions if available, otherwise estimate
      const width = node.measured?.width || 300;
      const height = node.measured?.height || 400;

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    }

    return {
      x: minX - PADDING,
      y: minY - PADDING,
      width: maxX - minX + PADDING * 2,
      height: maxY - minY + PADDING * 2,
    };
  }, [getNodes]);

  /**
   * Get the current viewport state.
   */
  const getCurrentViewport = useCallback(() => {
    return getViewport();
  }, [getViewport]);

  /**
   * Capture the React Flow container's SVG content.
   * Extracts edges (SVG) and creates simplified representations of nodes.
   * Returns the SVG content as a string, or null if capture fails.
   */
  const captureSvgContent = useCallback((): string | null => {
    try {
      // Find the React Flow SVG container
      const rfContainer = document.querySelector(".react-flow");
      if (!rfContainer) {
        console.warn("React Flow container not found");
        return null;
      }

      const bounds = getDiagramBounds();
      if (!bounds) {
        console.warn("Could not calculate diagram bounds");
        return null;
      }

      // Capture edges - these are pure SVG and clone cleanly
      const edgesGroup = rfContainer.querySelector(".react-flow__edges");
      let edgesSvg = "";
      if (edgesGroup) {
        // Clone the edges SVG content
        const edgesClone = edgesGroup.cloneNode(true) as SVGGElement;
        edgesSvg = edgesClone.innerHTML;
      }

      // Capture nodes - convert to simple SVG rectangles with text
      // (foreignObject doesn't print reliably across browsers)
      const nodes = getNodes();
      const nodesSvg = nodes.map((node) => {
        const x = node.position.x;
        const y = node.position.y;
        const width = node.measured?.width || 300;
        const height = node.measured?.height || 400;
        const label = (node.data as { label?: string })?.label || node.id;

        return `
          <g class="print-node" transform="translate(${x}, ${y})">
            <rect
              width="${width}"
              height="${height}"
              fill="white"
              stroke="#374151"
              stroke-width="2"
              rx="8"
            />
            <text
              x="${width / 2}"
              y="24"
              text-anchor="middle"
              font-family="system-ui, sans-serif"
              font-size="14"
              font-weight="600"
              fill="#111827"
            >${escapeXml(String(label))}</text>
          </g>
        `;
      }).join("\n");

      // Combine into final SVG content with proper transform
      const svgContent = `
        <g transform="translate(${-bounds.x}, ${-bounds.y})">
          <g class="edges">${edgesSvg}</g>
          <g class="nodes">${nodesSvg}</g>
        </g>
      `;

      return svgContent;
    } catch (error) {
      console.error("Error capturing SVG content:", error);
      return null;
    }
  }, [getDiagramBounds, getNodes]);

  /**
   * Get node information for pinout printing.
   */
  const getNodeInfo = useCallback(() => {
    return getNodes().map((node) => ({
      id: node.id,
      position: node.position,
      measured: node.measured,
      data: node.data,
    }));
  }, [getNodes]);

  return {
    getDiagramBounds,
    getCurrentViewport,
    captureSvgContent,
    getNodeInfo,
  };
}

/**
 * Escape XML special characters for safe SVG text content.
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
