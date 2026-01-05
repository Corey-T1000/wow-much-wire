/**
 * Print utilities for wiring diagram poster and pinout printing.
 * Handles paper sizes, tiling calculations, and crop mark generation.
 */

// Paper sizes in millimeters (width x height in portrait orientation)
export const PAPER_SIZES = {
  letter: { width: 215.9, height: 279.4, name: "US Letter" },
  a4: { width: 210, height: 297, name: "A4" },
  tabloid: { width: 279.4, height: 431.8, name: "Tabloid" },
} as const;

export type PaperSize = keyof typeof PAPER_SIZES;
export type Orientation = "portrait" | "landscape";

// Unit conversions (at 96 DPI, standard for web)
export const MM_TO_PX = 3.7795275591;
export const PX_TO_MM = 1 / MM_TO_PX;
export const MM_TO_IN = 0.0393701;

// Default print settings
export const DEFAULT_MARGINS_MM = 12.7; // 0.5 inch margins
export const DEFAULT_OVERLAP_MM = 10; // Overlap for alignment
export const CROP_MARK_LENGTH_MM = 8;
export const CROP_MARK_OFFSET_MM = 3;

export interface DiagramBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TileInfo {
  row: number;
  col: number;
  pageNumber: number;
  viewBox: DiagramBounds;
}

export interface TileGrid {
  rows: number;
  cols: number;
  tiles: TileInfo[];
  totalPages: number;
  scale: number;
  // Final poster dimensions in mm
  posterWidth: number;
  posterHeight: number;
}

export interface PrintConfig {
  paperSize: PaperSize;
  orientation: Orientation;
  margins: number; // mm
  overlap: number; // mm for alignment marks
}

/**
 * Get paper dimensions in mm based on orientation.
 */
export function getPaperDimensions(
  paperSize: PaperSize,
  orientation: Orientation
): { width: number; height: number } {
  const paper = PAPER_SIZES[paperSize];
  return orientation === "landscape"
    ? { width: paper.height, height: paper.width }
    : { width: paper.width, height: paper.height };
}

/**
 * Get printable area (paper minus margins) in mm.
 */
export function getPrintableArea(
  paperSize: PaperSize,
  orientation: Orientation,
  margins: number
): { width: number; height: number } {
  const paper = getPaperDimensions(paperSize, orientation);
  return {
    width: paper.width - margins * 2,
    height: paper.height - margins * 2,
  };
}

/**
 * Calculate scale factor to fit diagram to specified number of pages wide.
 */
export function calculateScaleForPagesWide(
  diagramWidthPx: number,
  pagesWide: number,
  paperSize: PaperSize,
  orientation: Orientation,
  margins: number
): number {
  const printable = getPrintableArea(paperSize, orientation, margins);
  const targetWidthMm = printable.width * pagesWide;
  const targetWidthPx = targetWidthMm * MM_TO_PX;
  return targetWidthPx / diagramWidthPx;
}

/**
 * Calculate the tile grid for poster printing.
 * Returns information about how to split the diagram across pages.
 */
export function calculateTileGrid(
  diagramBounds: DiagramBounds,
  config: PrintConfig,
  pagesWide: number
): TileGrid {
  const printable = getPrintableArea(
    config.paperSize,
    config.orientation,
    config.margins
  );
  const printableWidthPx = printable.width * MM_TO_PX;
  const printableHeightPx = printable.height * MM_TO_PX;

  // Calculate scale to fit desired pages wide
  const scale = calculateScaleForPagesWide(
    diagramBounds.width,
    pagesWide,
    config.paperSize,
    config.orientation,
    config.margins
  );

  // Scaled diagram dimensions
  const scaledWidth = diagramBounds.width * scale;
  const scaledHeight = diagramBounds.height * scale;

  // Number of tiles needed (accounting for overlap on interior edges)
  const effectiveWidth = printableWidthPx - config.overlap * MM_TO_PX;
  const effectiveHeight = printableHeightPx - config.overlap * MM_TO_PX;

  const cols = Math.max(1, Math.ceil(scaledWidth / effectiveWidth));
  const rows = Math.max(1, Math.ceil(scaledHeight / effectiveHeight));

  // Generate tile info
  const tiles: TileInfo[] = [];
  let pageNumber = 1;

  // Calculate the portion of the original diagram each tile shows
  const tileWidthInDiagram = printableWidthPx / scale;
  const tileHeightInDiagram = printableHeightPx / scale;
  const overlapInDiagram = (config.overlap * MM_TO_PX) / scale;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x =
        diagramBounds.x + col * (tileWidthInDiagram - overlapInDiagram);
      const y =
        diagramBounds.y + row * (tileHeightInDiagram - overlapInDiagram);

      tiles.push({
        row,
        col,
        pageNumber: pageNumber++,
        viewBox: {
          x,
          y,
          width: tileWidthInDiagram,
          height: tileHeightInDiagram,
        },
      });
    }
  }

  return {
    rows,
    cols,
    tiles,
    totalPages: tiles.length,
    scale,
    posterWidth: (scaledWidth * PX_TO_MM),
    posterHeight: (scaledHeight * PX_TO_MM),
  };
}

/**
 * Generate SVG content for crop marks on a single tile.
 * These marks help with alignment when taping pages together.
 */
export function generateCropMarks(
  tile: TileInfo,
  grid: TileGrid,
  config: PrintConfig
): string {
  const printable = getPrintableArea(
    config.paperSize,
    config.orientation,
    config.margins
  );
  const width = printable.width;
  const height = printable.height;
  const markLen = CROP_MARK_LENGTH_MM;
  const offset = CROP_MARK_OFFSET_MM;

  const marks: string[] = [];

  // Corner crop marks (L-shaped)
  // Only show marks on edges that aren't at the poster boundary
  const showTop = tile.row > 0;
  const showBottom = tile.row < grid.rows - 1;
  const showLeft = tile.col > 0;
  const showRight = tile.col < grid.cols - 1;

  // Top-left corner
  if (showTop || showLeft) {
    marks.push(`<path d="M ${offset} 0 L ${offset} ${markLen}" class="crop-mark"/>`);
    marks.push(`<path d="M 0 ${offset} L ${markLen} ${offset}" class="crop-mark"/>`);
  }

  // Top-right corner
  if (showTop || showRight) {
    marks.push(`<path d="M ${width - offset} 0 L ${width - offset} ${markLen}" class="crop-mark"/>`);
    marks.push(`<path d="M ${width} ${offset} L ${width - markLen} ${offset}" class="crop-mark"/>`);
  }

  // Bottom-left corner
  if (showBottom || showLeft) {
    marks.push(`<path d="M ${offset} ${height} L ${offset} ${height - markLen}" class="crop-mark"/>`);
    marks.push(`<path d="M 0 ${height - offset} L ${markLen} ${height - offset}" class="crop-mark"/>`);
  }

  // Bottom-right corner
  if (showBottom || showRight) {
    marks.push(`<path d="M ${width - offset} ${height} L ${width - offset} ${height - markLen}" class="crop-mark"/>`);
    marks.push(`<path d="M ${width} ${height - offset} L ${width - markLen} ${height - offset}" class="crop-mark"/>`);
  }

  // Registration crosshairs at midpoints (for aligning with adjacent pages)
  const crossSize = 4;

  // Top edge registration mark
  if (showTop) {
    marks.push(`<circle cx="${width / 2}" cy="${offset}" r="1.5" class="registration-mark"/>`);
    marks.push(`<path d="M ${width / 2 - crossSize} ${offset} L ${width / 2 + crossSize} ${offset}" class="registration-mark"/>`);
    marks.push(`<path d="M ${width / 2} ${offset - crossSize} L ${width / 2} ${offset + crossSize}" class="registration-mark"/>`);
  }

  // Bottom edge registration mark
  if (showBottom) {
    marks.push(`<circle cx="${width / 2}" cy="${height - offset}" r="1.5" class="registration-mark"/>`);
    marks.push(`<path d="M ${width / 2 - crossSize} ${height - offset} L ${width / 2 + crossSize} ${height - offset}" class="registration-mark"/>`);
    marks.push(`<path d="M ${width / 2} ${height - offset - crossSize} L ${width / 2} ${height - offset + crossSize}" class="registration-mark"/>`);
  }

  // Left edge registration mark
  if (showLeft) {
    marks.push(`<circle cx="${offset}" cy="${height / 2}" r="1.5" class="registration-mark"/>`);
    marks.push(`<path d="M ${offset - crossSize} ${height / 2} L ${offset + crossSize} ${height / 2}" class="registration-mark"/>`);
    marks.push(`<path d="M ${offset} ${height / 2 - crossSize} L ${offset} ${height / 2 + crossSize}" class="registration-mark"/>`);
  }

  // Right edge registration mark
  if (showRight) {
    marks.push(`<circle cx="${width - offset}" cy="${height / 2}" r="1.5" class="registration-mark"/>`);
    marks.push(`<path d="M ${width - offset - crossSize} ${height / 2} L ${width - offset + crossSize} ${height / 2}" class="registration-mark"/>`);
    marks.push(`<path d="M ${width - offset} ${height / 2 - crossSize} L ${width - offset} ${height / 2 + crossSize}" class="registration-mark"/>`);
  }

  return `
    <svg
      viewBox="0 0 ${width} ${height}"
      class="crop-marks-overlay"
      style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none;"
    >
      <style>
        .crop-mark { stroke: #000; stroke-width: 0.3mm; fill: none; }
        .registration-mark { stroke: #000; stroke-width: 0.2mm; fill: none; }
        .registration-mark[r] { fill: none; }
      </style>
      ${marks.join("\n      ")}
    </svg>
  `;
}

/**
 * Generate a page label for a tile.
 */
export function generatePageLabel(tile: TileInfo, grid: TileGrid): string {
  return `Page ${tile.pageNumber} of ${grid.totalPages} — Row ${tile.row + 1}, Col ${tile.col + 1}`;
}

/**
 * Format poster dimensions for display.
 */
export function formatPosterSize(grid: TileGrid): string {
  const widthIn = Math.round(grid.posterWidth * MM_TO_IN);
  const heightIn = Math.round(grid.posterHeight * MM_TO_IN);
  return `~${widthIn}" × ${heightIn}"`;
}
