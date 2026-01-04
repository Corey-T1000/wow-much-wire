import { NextResponse } from "next/server";
import { eq, desc, sql } from "drizzle-orm";
import type { DiagramData } from "@/components/diagram/types";
import { db } from "@/lib/db";
import { diagramSnapshot } from "@/lib/schema";

// Default project ID for local-only mode
const DEFAULT_PROJECT_ID = "miata-rewire-1993";

/**
 * POST /api/diagram/restore
 * Restore the diagram to a previous snapshot version
 * Creates a new snapshot that reverts to the old data
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { snapshotId, clientId } = body as {
      snapshotId: string;
      clientId?: string;
    };

    if (!snapshotId) {
      return NextResponse.json(
        { success: false, error: "Missing snapshotId" },
        { status: 400 }
      );
    }

    // Get the snapshot to restore
    const targetSnapshot = await db
      .select()
      .from(diagramSnapshot)
      .where(eq(diagramSnapshot.id, snapshotId))
      .limit(1);

    const targetSnapshotRow = targetSnapshot[0];
    if (!targetSnapshotRow) {
      return NextResponse.json(
        { success: false, error: "Snapshot not found" },
        { status: 404 }
      );
    }

    const restoreData = targetSnapshotRow.data as DiagramData;
    const restoreVersion = targetSnapshotRow.version;

    // Get the current max version
    const maxVersionResult = await db
      .select({ maxVersion: sql<number>`COALESCE(MAX(${diagramSnapshot.version}), 0)` })
      .from(diagramSnapshot)
      .where(eq(diagramSnapshot.projectId, DEFAULT_PROJECT_ID));

    const maxVersionRow = maxVersionResult[0];
    const currentMaxVersion = maxVersionRow?.maxVersion ?? 0;
    const newVersion = currentMaxVersion + 1;

    // Get the current (latest) snapshot for change calculation
    const currentSnapshot = await db
      .select()
      .from(diagramSnapshot)
      .where(eq(diagramSnapshot.projectId, DEFAULT_PROJECT_ID))
      .orderBy(desc(diagramSnapshot.version))
      .limit(1);

    let componentsAdded = 0;
    let componentsRemoved = 0;
    let wiresAdded = 0;
    let wiresRemoved = 0;

    const currentSnapshotRow = currentSnapshot[0];
    if (currentSnapshotRow) {
      const currentData = currentSnapshotRow.data as DiagramData;
      const currentComponentIds = new Set(currentData.components.map((c) => c.id));
      const restoreComponentIds = new Set(restoreData.components.map((c) => c.id));
      const currentWireIds = new Set(currentData.wires.map((w) => w.id));
      const restoreWireIds = new Set(restoreData.wires.map((w) => w.id));

      componentsAdded = restoreData.components.filter((c) => !currentComponentIds.has(c.id)).length;
      componentsRemoved = currentData.components.filter((c) => !restoreComponentIds.has(c.id)).length;
      wiresAdded = restoreData.wires.filter((w) => !currentWireIds.has(w.id)).length;
      wiresRemoved = currentData.wires.filter((w) => !restoreWireIds.has(w.id)).length;
    }

    // Create a new snapshot with the restored data
    const newSnapshotId = `snapshot-${Date.now()}`;
    await db.insert(diagramSnapshot).values({
      id: newSnapshotId,
      projectId: DEFAULT_PROJECT_ID,
      version: newVersion,
      message: `Restored to version ${restoreVersion}`,
      data: restoreData,
      componentsAdded,
      componentsRemoved,
      wiresAdded,
      wiresRemoved,
      clientId,
    });

    return NextResponse.json({
      success: true,
      version: newVersion,
      snapshotId: newSnapshotId,
      restoredFromVersion: restoreVersion,
      data: restoreData,
    });
  } catch (error) {
    console.error("Error restoring diagram:", error);
    return NextResponse.json(
      { success: false, error: "Failed to restore diagram" },
      { status: 500 }
    );
  }
}
