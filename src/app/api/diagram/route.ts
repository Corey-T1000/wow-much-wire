import { NextResponse } from "next/server";
import { eq, desc, sql } from "drizzle-orm";
import type { DiagramData } from "@/components/diagram/types";
import { db } from "@/lib/db";
import { sampleDiagramData } from "@/lib/sample-data";
import { project, diagramSnapshot, user } from "@/lib/schema";

// Default project ID for local-only mode
const DEFAULT_PROJECT_ID = "miata-rewire-1993";
const DEFAULT_PROJECT_NAME = "1993 NA Miata Full Rewire";
const LOCAL_USER_ID = "local-user";

/**
 * Ensures the local user exists for local-only mode
 */
async function ensureLocalUser() {
  const existingUser = await db
    .select()
    .from(user)
    .where(eq(user.id, LOCAL_USER_ID))
    .limit(1);

  if (existingUser.length === 0) {
    await db.insert(user).values({
      id: LOCAL_USER_ID,
      name: "Local User",
      email: "local@wireviz.local",
      emailVerified: true,
    });
  }
}

/**
 * GET /api/diagram
 * Load the latest diagram snapshot, or initialize with sample data if none exists
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");

  try {
    // Check if default project exists
    const existingProject = await db
      .select()
      .from(project)
      .where(eq(project.id, DEFAULT_PROJECT_ID))
      .limit(1);

    if (existingProject.length === 0) {
      // Ensure local user exists for foreign key constraint
      await ensureLocalUser();

      // Create the default project with a placeholder user
      await db.insert(project).values({
        id: DEFAULT_PROJECT_ID,
        userId: LOCAL_USER_ID,
        name: DEFAULT_PROJECT_NAME,
        description: "Full rewire with Bussmann PDM & MS3Pro Mini ECU",
        year: 1993,
        make: "Mazda",
        model: "Miata",
        status: "active",
      });

      // Create initial snapshot with sample data
      await db.insert(diagramSnapshot).values({
        id: `snapshot-${Date.now()}`,
        projectId: DEFAULT_PROJECT_ID,
        version: 1,
        message: "Initial diagram from sample data",
        data: sampleDiagramData,
        componentsAdded: sampleDiagramData.components.length,
        wiresAdded: sampleDiagramData.wires.length,
        clientId,
      });
    }

    // Get the latest snapshot
    const latestSnapshot = await db
      .select()
      .from(diagramSnapshot)
      .where(eq(diagramSnapshot.projectId, DEFAULT_PROJECT_ID))
      .orderBy(desc(diagramSnapshot.version))
      .limit(1);

    const snapshot = latestSnapshot[0];
    if (!snapshot) {
      // No snapshots exist (shouldn't happen, but handle it)
      return NextResponse.json({
        success: true,
        data: sampleDiagramData,
        version: 0,
        projectId: DEFAULT_PROJECT_ID,
      });
    }

    return NextResponse.json({
      success: true,
      data: snapshot.data as DiagramData,
      version: snapshot.version,
      snapshotId: snapshot.id,
      message: snapshot.message,
      createdAt: snapshot.createdAt,
      projectId: DEFAULT_PROJECT_ID,
    });
  } catch (error) {
    console.error("Error loading diagram:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load diagram" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/diagram
 * Save a new snapshot of the diagram
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, message, clientId } = body as {
      data: DiagramData;
      message: string;
      clientId?: string;
    };

    if (!data || !message) {
      return NextResponse.json(
        { success: false, error: "Missing data or message" },
        { status: 400 }
      );
    }

    // Get the current max version
    const maxVersionResult = await db
      .select({ maxVersion: sql<number>`COALESCE(MAX(${diagramSnapshot.version}), 0)` })
      .from(diagramSnapshot)
      .where(eq(diagramSnapshot.projectId, DEFAULT_PROJECT_ID));

    const maxVersionRow = maxVersionResult[0];
    const currentMaxVersion = maxVersionRow?.maxVersion ?? 0;
    const newVersion = currentMaxVersion + 1;

    // Get previous snapshot to calculate changes
    const previousSnapshot = await db
      .select()
      .from(diagramSnapshot)
      .where(eq(diagramSnapshot.projectId, DEFAULT_PROJECT_ID))
      .orderBy(desc(diagramSnapshot.version))
      .limit(1);

    let componentsAdded = data.components.length;
    let componentsRemoved = 0;
    let wiresAdded = data.wires.length;
    let wiresRemoved = 0;

    const previousSnapshotRow = previousSnapshot[0];
    if (previousSnapshotRow) {
      const prevData = previousSnapshotRow.data as DiagramData;
      const prevComponentIds = new Set(prevData.components.map((c) => c.id));
      const newComponentIds = new Set(data.components.map((c) => c.id));
      const prevWireIds = new Set(prevData.wires.map((w) => w.id));
      const newWireIds = new Set(data.wires.map((w) => w.id));

      componentsAdded = data.components.filter((c) => !prevComponentIds.has(c.id)).length;
      componentsRemoved = prevData.components.filter((c) => !newComponentIds.has(c.id)).length;
      wiresAdded = data.wires.filter((w) => !prevWireIds.has(w.id)).length;
      wiresRemoved = prevData.wires.filter((w) => !newWireIds.has(w.id)).length;
    }

    // Create the new snapshot
    const snapshotId = `snapshot-${Date.now()}`;
    await db.insert(diagramSnapshot).values({
      id: snapshotId,
      projectId: DEFAULT_PROJECT_ID,
      version: newVersion,
      message,
      data,
      componentsAdded,
      componentsRemoved,
      wiresAdded,
      wiresRemoved,
      clientId,
    });

    return NextResponse.json({
      success: true,
      version: newVersion,
      snapshotId,
      changes: {
        componentsAdded,
        componentsRemoved,
        wiresAdded,
        wiresRemoved,
      },
    });
  } catch (error) {
    console.error("Error saving diagram:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save diagram" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/diagram
 * Sync the diagram with sample-data.ts while PRESERVING user's layout positions
 * - Keeps positions for existing components
 * - Adds new components (they'll get auto-positioned on next layout)
 * - Updates component data (new pins, connectors)
 * - Adds new wires and circuits
 */
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");

  try {
    // Get the latest snapshot to preserve positions
    const latestSnapshot = await db
      .select()
      .from(diagramSnapshot)
      .where(eq(diagramSnapshot.projectId, DEFAULT_PROJECT_ID))
      .orderBy(desc(diagramSnapshot.version))
      .limit(1);

    // Preserve positions from current saved data
    const currentData = latestSnapshot[0]?.data as DiagramData | undefined;
    const savedPositions = currentData?.positions || {};

    // Merge: use sample-data.ts as the source of truth for components/wires,
    // but preserve user's positions for components that exist in both
    const mergedData: DiagramData = {
      ...sampleDiagramData,
      positions: {
        ...savedPositions, // User's saved positions take precedence
      },
    };

    // Count what's new
    const existingComponentIds = new Set(currentData?.components.map(c => c.id) || []);
    const existingWireIds = new Set(currentData?.wires.map(w => w.id) || []);
    const newComponents = sampleDiagramData.components.filter(c => !existingComponentIds.has(c.id));
    const newWires = sampleDiagramData.wires.filter(w => !existingWireIds.has(w.id));

    // Get current max version
    const maxVersionResult = await db
      .select({ maxVersion: sql<number>`COALESCE(MAX(${diagramSnapshot.version}), 0)` })
      .from(diagramSnapshot)
      .where(eq(diagramSnapshot.projectId, DEFAULT_PROJECT_ID));
    const currentMaxVersion = maxVersionResult[0]?.maxVersion ?? 0;

    // Create a new snapshot with merged data (preserves history)
    const snapshotId = `snapshot-${Date.now()}`;
    await db.insert(diagramSnapshot).values({
      id: snapshotId,
      projectId: DEFAULT_PROJECT_ID,
      version: currentMaxVersion + 1,
      message: `Synced with source data (+${newComponents.length} components, +${newWires.length} wires)`,
      data: mergedData,
      componentsAdded: newComponents.length,
      wiresAdded: newWires.length,
      clientId,
    });

    return NextResponse.json({
      success: true,
      version: currentMaxVersion + 1,
      snapshotId,
      message: "Diagram synced with source data (positions preserved)",
      components: sampleDiagramData.components.length,
      wires: sampleDiagramData.wires.length,
      circuits: sampleDiagramData.circuits.length,
      newComponents: newComponents.length,
      newWires: newWires.length,
      positionsPreserved: Object.keys(savedPositions).length,
    });
  } catch (error) {
    console.error("Error syncing diagram:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sync diagram" },
      { status: 500 }
    );
  }
}
