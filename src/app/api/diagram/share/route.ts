import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { DiagramData } from "@/components/diagram/types";
import { db } from "@/lib/db";
import { sharedDiagram } from "@/lib/schema";

/**
 * POST /api/diagram/share
 * Create a new shared diagram link
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, title, description, projectId } = body as {
      data: DiagramData;
      title: string;
      description?: string;
      projectId: string;
    };

    if (!data || !title || !projectId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: data, title, projectId" },
        { status: 400 }
      );
    }

    // Generate a short, URL-safe ID
    const shareId = nanoid(10);

    // Create the shared diagram record
    await db.insert(sharedDiagram).values({
      id: shareId,
      projectId,
      data,
      title,
      description: description || null,
    });

    // Build the share URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const shareUrl = `${baseUrl}/diagram/share/${shareId}`;

    return NextResponse.json({
      success: true,
      shareId,
      shareUrl,
    });
  } catch (error) {
    console.error("Error creating share link:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create share link" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/diagram/share?id=xxx
 * Fetch a shared diagram by ID
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shareId = searchParams.get("id");

  if (!shareId) {
    return NextResponse.json(
      { success: false, error: "Missing share ID" },
      { status: 400 }
    );
  }

  try {
    // Fetch the shared diagram
    const result = await db
      .select()
      .from(sharedDiagram)
      .where(eq(sharedDiagram.id, shareId))
      .limit(1);

    const shared = result[0];

    if (!shared) {
      return NextResponse.json(
        { success: false, error: "Shared diagram not found" },
        { status: 404 }
      );
    }

    // Check if expired
    if (shared.expiresAt && new Date(shared.expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, error: "This share link has expired" },
        { status: 410 }
      );
    }

    // Increment view count
    await db
      .update(sharedDiagram)
      .set({ viewCount: sql`${sharedDiagram.viewCount} + 1` })
      .where(eq(sharedDiagram.id, shareId));

    return NextResponse.json({
      success: true,
      data: shared.data as DiagramData,
      title: shared.title,
      description: shared.description,
      viewCount: (shared.viewCount || 0) + 1,
      createdAt: shared.createdAt,
    });
  } catch (error) {
    console.error("Error fetching shared diagram:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load shared diagram" },
      { status: 500 }
    );
  }
}
