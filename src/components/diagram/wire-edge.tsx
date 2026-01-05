"use client";

import { memo } from "react";
import { BaseEdge, useNodes, type EdgeProps, type Node } from "@xyflow/react";

const CORNER_RADIUS = 8;
const SPLICE_OFFSET = 50;
const COMPONENT_PADDING = 20; // "Force field" padding around components
const WIRE_SPREAD = 10; // Spacing between parallel wires from same component
const JOG_OFFSET = 25; // How far to jog vertically to avoid horizontal collisions

// Edge data passed from auto-layout
interface WireEdgeData {
  spliceIndex?: number;
  spliceTotal?: number;
  sourceComponentIndex?: number;
  sourceComponentTotal?: number;
  targetPinIndex?: number;
  targetPinTotal?: number;
}

interface BoundingBox {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/**
 * Get bounding boxes for all nodes with padding
 */
function getNodeBoundingBoxes(nodes: Node[], excludeIds: string[]): BoundingBox[] {
  return nodes
    .filter(node => !excludeIds.includes(node.id))
    .map(node => {
      const width = 300;
      const height = node.measured?.height || 200;
      return {
        left: node.position.x - COMPONENT_PADDING,
        right: node.position.x + width + COMPONENT_PADDING,
        top: node.position.y - COMPONENT_PADDING,
        bottom: node.position.y + height + COMPONENT_PADDING,
      };
    });
}

/**
 * Check if a vertical line segment intersects any bounding box
 */
function verticalLineIntersectsBox(
  x: number,
  yStart: number,
  yEnd: number,
  box: BoundingBox
): boolean {
  const minY = Math.min(yStart, yEnd);
  const maxY = Math.max(yStart, yEnd);
  if (x < box.left || x > box.right) return false;
  if (maxY < box.top || minY > box.bottom) return false;
  return true;
}

/**
 * Check if a horizontal line segment intersects a bounding box
 */
function horizontalLineIntersectsBox(
  y: number,
  xStart: number,
  xEnd: number,
  box: BoundingBox
): boolean {
  const minX = Math.min(xStart, xEnd);
  const maxX = Math.max(xStart, xEnd);
  if (y < box.top || y > box.bottom) return false;
  if (maxX < box.left || minX > box.right) return false;
  return true;
}

/**
 * Find a bounding box that a horizontal segment intersects
 */
function findHorizontalCollision(
  y: number,
  xStart: number,
  xEnd: number,
  boxes: BoundingBox[]
): BoundingBox | null {
  for (const box of boxes) {
    if (horizontalLineIntersectsBox(y, xStart, xEnd, box)) {
      return box;
    }
  }
  return null;
}

/**
 * Find a clear vertical X that doesn't intersect any bounding box
 */
function findClearVerticalX(
  startX: number,
  sourceY: number,
  targetY: number,
  boxes: BoundingBox[]
): number {
  let verticalX = startX;
  let attempts = 0;
  const maxAttempts = 20;

  while (attempts < maxAttempts) {
    let hasCollision = false;
    for (const box of boxes) {
      if (verticalLineIntersectsBox(verticalX, sourceY, targetY, box)) {
        verticalX = box.left - WIRE_SPREAD;
        hasCollision = true;
        break;
      }
    }
    if (!hasCollision) break;
    attempts++;
  }
  return verticalX;
}

/**
 * Build an orthogonal path with collision avoidance.
 * Simple, clean approach: wires run parallel when possible, only spreading when needed.
 * Key improvement: wires going to the same target component get different corridors
 * to prevent overlap of vertical segments.
 */
function buildOrthogonalPath(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  edgeData: WireEdgeData | undefined,
  nodeBoundingBoxes: BoundingBox[]
): string {
  const r = CORNER_RADIUS;

  // If source and target are on same Y, just draw a straight line
  if (Math.abs(targetY - sourceY) < 1) {
    return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
  }

  const isSplice = (edgeData?.spliceTotal || 1) > 1;
  const sourceComponentIndex = edgeData?.sourceComponentIndex || 0;
  const targetPinIndex = edgeData?.targetPinIndex || 0;
  const goingDown = targetY > sourceY;

  // Calculate the vertical corridor X position
  // Wires from the same component spread slightly, splices share a corridor
  // IMPORTANT: Also spread based on target pin index to prevent wires to same component from overlapping
  let corridorX = isSplice
    ? sourceX - SPLICE_OFFSET
    : sourceX - SPLICE_OFFSET - (sourceComponentIndex * WIRE_SPREAD);

  // Additional spread based on target pin index - each wire to a different pin
  // on the same target component gets its own corridor
  // This is the key fix for the overlapping wire problem
  corridorX -= (targetPinIndex * WIRE_SPREAD);

  // Push corridor left if it would collide with any component
  corridorX = findClearVerticalX(corridorX, sourceY, targetY, nodeBoundingBoxes);

  // Build the path points
  const pathPoints: { x: number; y: number }[] = [];

  // Start at source
  pathPoints.push({ x: sourceX, y: sourceY });

  // Go horizontal to corridor
  pathPoints.push({ x: corridorX, y: sourceY });

  // Check if horizontal segment at target Y would collide
  const targetHorizontalCollision = findHorizontalCollision(
    targetY, corridorX, targetX, nodeBoundingBoxes
  );

  if (targetHorizontalCollision) {
    // Need to jog around the obstacle
    const jogY = goingDown
      ? targetHorizontalCollision.bottom + JOG_OFFSET
      : targetHorizontalCollision.top - JOG_OFFSET;

    // Go down to jog level
    pathPoints.push({ x: corridorX, y: jogY });
    // Go horizontal past the obstacle
    pathPoints.push({ x: targetX - SPLICE_OFFSET, y: jogY });
    // Go vertical to target level
    pathPoints.push({ x: targetX - SPLICE_OFFSET, y: targetY });
  } else {
    // No collision - go directly to target Y level
    pathPoints.push({ x: corridorX, y: targetY });
  }

  // Final horizontal segment to target
  pathPoints.push({ x: targetX, y: targetY });

  // Convert points to SVG path with rounded corners
  return buildPathFromPoints(pathPoints, r);
}

/**
 * Build an SVG path from a series of points with rounded corners
 */
function buildPathFromPoints(points: { x: number; y: number }[], radius: number): string {
  if (points.length < 2) return "";

  const first = points[0];
  if (!first) return "";

  let path = `M ${first.x} ${first.y}`;

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    // Skip if any point is undefined
    if (!prev || !curr || !next) continue;

    // Calculate direction vectors
    const dx1 = curr.x - prev.x;
    const dy1 = curr.y - prev.y;
    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;

    // Normalize and get corner offset
    const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

    if (len1 === 0 || len2 === 0) {
      path += ` L ${curr.x} ${curr.y}`;
      continue;
    }

    // Limit radius to half the segment length
    const maxRadius = Math.min(len1, len2) / 2;
    const r = Math.min(radius, maxRadius);

    // Calculate corner start and end points
    const startX = curr.x - (dx1 / len1) * r;
    const startY = curr.y - (dy1 / len1) * r;
    const endX = curr.x + (dx2 / len2) * r;
    const endY = curr.y + (dy2 / len2) * r;

    // Line to corner start, then quadratic curve through corner point to corner end
    path += ` L ${startX} ${startY}`;
    path += ` Q ${curr.x} ${curr.y} ${endX} ${endY}`;
  }

  // Line to final point
  const last = points[points.length - 1];
  if (last) {
    path += ` L ${last.x} ${last.y}`;
  }

  return path;
}

/**
 * Custom wire edge with collision avoidance.
 */
function WireEdgeComponent({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  markerEnd,
  label,
  labelStyle,
  labelBgStyle,
  labelBgPadding,
  data,
}: EdgeProps) {
  const nodes = useNodes();
  const edgeData = data as WireEdgeData | undefined;
  const nodeBoundingBoxes = getNodeBoundingBoxes(nodes, [source, target]);

  const edgePath = buildOrthogonalPath(
    sourceX,
    sourceY,
    targetX,
    targetY,
    edgeData,
    nodeBoundingBoxes
  );

  // Calculate label position (midpoint of path)
  const labelX = (sourceX + targetX) / 2 - SPLICE_OFFSET;
  const labelY = (sourceY + targetY) / 2;

  // Splice dot handling
  const isSplice = (edgeData?.spliceTotal || 1) > 1;
  const shouldShowSpliceDot = isSplice && edgeData?.spliceIndex === 0;
  const spliceDotX = sourceX - SPLICE_OFFSET;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        labelX={labelX}
        labelY={labelY}
        {...(style && { style })}
        {...(markerEnd && { markerEnd })}
        {...(label && { label })}
        {...(labelStyle && { labelStyle })}
        {...(labelBgStyle && { labelBgStyle })}
        {...(labelBgPadding && { labelBgPadding })}
      />
      {shouldShowSpliceDot && (
        <circle
          cx={spliceDotX}
          cy={sourceY}
          r={5}
          fill={style?.stroke as string || "#6b7280"}
          stroke="#171717"
          strokeWidth={2}
          className="pointer-events-none"
        />
      )}
    </>
  );
}

export const WireEdge = memo(WireEdgeComponent);
