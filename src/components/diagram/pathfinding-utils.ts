import PF from "pathfinding";

interface NodeBounds {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PathPoint {
  x: number;
  y: number;
}

// Grid cell size in pixels - smaller = more precise but slower
const GRID_CELL_SIZE = 20;

// Padding around nodes to keep wires from touching them
const NODE_PADDING = 30;

// Padding around the entire canvas
const CANVAS_PADDING = 100;

/**
 * Calculate the path between two points avoiding node obstacles.
 * Returns an SVG path string with 90° orthogonal turns.
 */
export function calculatePathfindingRoute(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  nodes: NodeBounds[],
  sourceNodeId: string,
  targetNodeId: string
): { path: string; labelPosition: PathPoint } {
  // Calculate canvas bounds from all nodes
  const bounds = calculateCanvasBounds(nodes);

  // Create grid
  const gridWidth = Math.ceil(
    (bounds.maxX - bounds.minX + CANVAS_PADDING * 2) / GRID_CELL_SIZE
  );
  const gridHeight = Math.ceil(
    (bounds.maxY - bounds.minY + CANVAS_PADDING * 2) / GRID_CELL_SIZE
  );

  // Clamp grid size to reasonable limits
  const clampedWidth = Math.min(gridWidth, 200);
  const clampedHeight = Math.min(gridHeight, 200);

  const grid = new PF.Grid(clampedWidth, clampedHeight);

  // Mark nodes as obstacles (except source and target nodes)
  for (const node of nodes) {
    if (node.id === sourceNodeId || node.id === targetNodeId) {
      continue; // Don't block source/target nodes
    }

    const startCol = Math.max(
      0,
      Math.floor((node.x - NODE_PADDING - bounds.minX + CANVAS_PADDING) / GRID_CELL_SIZE)
    );
    const endCol = Math.min(
      clampedWidth - 1,
      Math.ceil((node.x + node.width + NODE_PADDING - bounds.minX + CANVAS_PADDING) / GRID_CELL_SIZE)
    );
    const startRow = Math.max(
      0,
      Math.floor((node.y - NODE_PADDING - bounds.minY + CANVAS_PADDING) / GRID_CELL_SIZE)
    );
    const endRow = Math.min(
      clampedHeight - 1,
      Math.ceil((node.y + node.height + NODE_PADDING - bounds.minY + CANVAS_PADDING) / GRID_CELL_SIZE)
    );

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        if (row >= 0 && row < clampedHeight && col >= 0 && col < clampedWidth) {
          grid.setWalkableAt(col, row, false);
        }
      }
    }
  }

  // Convert source/target to grid coordinates
  const sourceCol = Math.max(
    0,
    Math.min(
      clampedWidth - 1,
      Math.floor((sourceX - bounds.minX + CANVAS_PADDING) / GRID_CELL_SIZE)
    )
  );
  const sourceRow = Math.max(
    0,
    Math.min(
      clampedHeight - 1,
      Math.floor((sourceY - bounds.minY + CANVAS_PADDING) / GRID_CELL_SIZE)
    )
  );
  const targetCol = Math.max(
    0,
    Math.min(
      clampedWidth - 1,
      Math.floor((targetX - bounds.minX + CANVAS_PADDING) / GRID_CELL_SIZE)
    )
  );
  const targetRow = Math.max(
    0,
    Math.min(
      clampedHeight - 1,
      Math.floor((targetY - bounds.minY + CANVAS_PADDING) / GRID_CELL_SIZE)
    )
  );

  // Ensure source and target cells are walkable
  grid.setWalkableAt(sourceCol, sourceRow, true);
  grid.setWalkableAt(targetCol, targetRow, true);

  // Find path using A* with orthogonal movement only
  const finder = new PF.AStarFinder({
    diagonalMovement: PF.DiagonalMovement.Never,
  });

  const gridPath = finder.findPath(
    sourceCol,
    sourceRow,
    targetCol,
    targetRow,
    grid.clone()
  );

  // If no path found, return direct line
  if (gridPath.length === 0) {
    return {
      path: `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`,
      labelPosition: { x: (sourceX + targetX) / 2, y: (sourceY + targetY) / 2 },
    };
  }

  // Simplify path to remove unnecessary waypoints (keep only turns)
  const simplifiedPath = simplifyPath(gridPath);

  // Convert grid coordinates back to canvas coordinates
  const canvasPath: PathPoint[] = simplifiedPath.map((point) => ({
    x: (point[0] ?? 0) * GRID_CELL_SIZE + bounds.minX - CANVAS_PADDING + GRID_CELL_SIZE / 2,
    y: (point[1] ?? 0) * GRID_CELL_SIZE + bounds.minY - CANVAS_PADDING + GRID_CELL_SIZE / 2,
  }));

  // Replace first and last points with exact source/target
  if (canvasPath.length > 0) {
    canvasPath[0] = { x: sourceX, y: sourceY };
    canvasPath[canvasPath.length - 1] = { x: targetX, y: targetY };
  }

  // Generate SVG path with rounded corners
  const svgPath = generateRoundedPath(canvasPath, 16);

  // Calculate label position (middle of the path)
  const midIndex = Math.floor(canvasPath.length / 2);
  const labelPosition = canvasPath[midIndex] ?? {
    x: (sourceX + targetX) / 2,
    y: (sourceY + targetY) / 2,
  };

  return { path: svgPath, labelPosition };
}

/**
 * Calculate the bounding box of all nodes
 */
function calculateCanvasBounds(nodes: NodeBounds[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 1000, maxY: 1000 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const node of nodes) {
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x + node.width);
    maxY = Math.max(maxY, node.y + node.height);
  }

  return { minX, minY, maxX, maxY };
}

/**
 * Simplify path by removing points that don't represent turns
 */
function simplifyPath(path: number[][]): number[][] {
  if (path.length <= 2) return path;

  const first = path[0];
  const last = path[path.length - 1];
  if (!first || !last) return path;

  const simplified: number[][] = [first];

  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i - 1];
    const curr = path[i];
    const next = path[i + 1];

    if (!prev || !curr || !next) continue;

    // Check if this point represents a turn
    const prevDx = (curr[0] ?? 0) - (prev[0] ?? 0);
    const prevDy = (curr[1] ?? 0) - (prev[1] ?? 0);
    const nextDx = (next[0] ?? 0) - (curr[0] ?? 0);
    const nextDy = (next[1] ?? 0) - (curr[1] ?? 0);

    // If direction changed, keep this point
    if (prevDx !== nextDx || prevDy !== nextDy) {
      simplified.push(curr);
    }
  }

  simplified.push(last);
  return simplified;
}

/**
 * Generate an SVG path with rounded corners at turns
 */
function generateRoundedPath(points: PathPoint[], radius: number): string {
  if (points.length < 2) {
    return "";
  }

  const first = points[0];
  const second = points[1];
  if (!first || !second) return "";

  if (points.length === 2) {
    return `M ${first.x} ${first.y} L ${second.x} ${second.y}`;
  }

  let path = `M ${first.x} ${first.y}`;

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    if (!prev || !curr || !next) continue;

    // Calculate distances
    const distPrev = Math.sqrt(
      Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
    );
    const distNext = Math.sqrt(
      Math.pow(next.x - curr.x, 2) + Math.pow(next.y - curr.y, 2)
    );

    // Limit radius to half the shorter segment
    const maxRadius = Math.min(distPrev, distNext) / 2;
    const actualRadius = Math.min(radius, maxRadius);

    if (actualRadius < 2) {
      // Too small for rounding, just use line
      path += ` L ${curr.x} ${curr.y}`;
    } else {
      // Calculate points for the rounded corner
      const prevDir = {
        x: (curr.x - prev.x) / distPrev,
        y: (curr.y - prev.y) / distPrev,
      };
      const nextDir = {
        x: (next.x - curr.x) / distNext,
        y: (next.y - curr.y) / distNext,
      };

      // Start and end of the arc
      const arcStart = {
        x: curr.x - prevDir.x * actualRadius,
        y: curr.y - prevDir.y * actualRadius,
      };
      const arcEnd = {
        x: curr.x + nextDir.x * actualRadius,
        y: curr.y + nextDir.y * actualRadius,
      };

      // Draw line to arc start, then arc to arc end
      path += ` L ${arcStart.x} ${arcStart.y}`;
      path += ` Q ${curr.x} ${curr.y} ${arcEnd.x} ${arcEnd.y}`;
    }
  }

  // Final line to the end point
  const lastPoint = points[points.length - 1];
  if (lastPoint) {
    path += ` L ${lastPoint.x} ${lastPoint.y}`;
  }

  return path;
}

export type { NodeBounds, PathPoint };
