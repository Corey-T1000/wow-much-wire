import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { diagramSnapshot } from "@/lib/schema";

// Default project ID for local-only mode
const DEFAULT_PROJECT_ID = "miata-rewire-1993";

/**
 * GET /api/diagram/history
 * Get all snapshots for the project, ordered by version descending (most recent first)
 */
export async function GET() {
  try {
    const snapshots = await db
      .select({
        id: diagramSnapshot.id,
        version: diagramSnapshot.version,
        message: diagramSnapshot.message,
        componentsAdded: diagramSnapshot.componentsAdded,
        componentsRemoved: diagramSnapshot.componentsRemoved,
        wiresAdded: diagramSnapshot.wiresAdded,
        wiresRemoved: diagramSnapshot.wiresRemoved,
        createdAt: diagramSnapshot.createdAt,
        clientId: diagramSnapshot.clientId,
      })
      .from(diagramSnapshot)
      .where(eq(diagramSnapshot.projectId, DEFAULT_PROJECT_ID))
      .orderBy(desc(diagramSnapshot.version));

    return NextResponse.json({
      success: true,
      snapshots,
      count: snapshots.length,
    });
  } catch (error) {
    console.error("Error loading history:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load history" },
      { status: 500 }
    );
  }
}
