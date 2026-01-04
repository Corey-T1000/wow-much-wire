#!/usr/bin/env npx tsx
/**
 * CLI tool for viewing and managing diagram data in the database
 *
 * Usage:
 *   pnpm tsx scripts/diagram-db.ts export          # Export current diagram to .claude/diagram-snapshot.json
 *   pnpm tsx scripts/diagram-db.ts import          # Import from .claude/diagram-snapshot.json to database
 *   pnpm tsx scripts/diagram-db.ts info            # Show diagram stats
 *   pnpm tsx scripts/diagram-db.ts history         # Show version history
 */

import { eq, desc } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import { db } from "../src/lib/db";
import { diagramSnapshot, project } from "../src/lib/schema";
import type { DiagramData } from "../src/components/diagram/types";

const PROJECT_ID = "miata-rewire-1993";
const SNAPSHOT_PATH = path.join(process.cwd(), ".claude", "diagram-snapshot.json");

async function ensureClaudeDir() {
  const claudeDir = path.join(process.cwd(), ".claude");
  if (!fs.existsSync(claudeDir)) {
    fs.mkdirSync(claudeDir, { recursive: true });
  }
}

async function exportDiagram() {
  console.log("📤 Exporting diagram from database...\n");

  const latestSnapshot = await db
    .select()
    .from(diagramSnapshot)
    .where(eq(diagramSnapshot.projectId, PROJECT_ID))
    .orderBy(desc(diagramSnapshot.version))
    .limit(1);

  const snapshot = latestSnapshot[0];
  if (!snapshot) {
    console.log("❌ No diagram found in database");
    process.exit(1);
  }

  const data = snapshot.data as DiagramData;

  await ensureClaudeDir();

  const exportData = {
    exportedAt: new Date().toISOString(),
    version: snapshot.version,
    message: snapshot.message,
    snapshotId: snapshot.id,
    createdAt: snapshot.createdAt,
    data,
  };

  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(exportData, null, 2));

  console.log(`✅ Exported to: ${SNAPSHOT_PATH}`);
  console.log(`   Version: ${snapshot.version}`);
  console.log(`   Message: ${snapshot.message}`);
  console.log(`   Components: ${data.components.length}`);
  console.log(`   Wires: ${data.wires.length}`);
  console.log(`   Circuits: ${data.circuits.length}`);
  console.log(`   Positions saved: ${Object.keys(data.positions || {}).length}`);
}

async function importDiagram() {
  console.log("📥 Importing diagram to database...\n");

  if (!fs.existsSync(SNAPSHOT_PATH)) {
    console.log(`❌ No snapshot file found at: ${SNAPSHOT_PATH}`);
    console.log("   Run 'export' first, modify the file, then 'import'");
    process.exit(1);
  }

  const fileContent = fs.readFileSync(SNAPSHOT_PATH, "utf-8");
  const importData = JSON.parse(fileContent);
  const data = importData.data as DiagramData;

  // Get current max version
  const latestSnapshot = await db
    .select()
    .from(diagramSnapshot)
    .where(eq(diagramSnapshot.projectId, PROJECT_ID))
    .orderBy(desc(diagramSnapshot.version))
    .limit(1);

  const currentVersion = latestSnapshot[0]?.version ?? 0;
  const newVersion = currentVersion + 1;

  // Create new snapshot
  const snapshotId = `snapshot-${Date.now()}`;
  await db.insert(diagramSnapshot).values({
    id: snapshotId,
    projectId: PROJECT_ID,
    version: newVersion,
    message: "Imported from .claude/diagram-snapshot.json",
    data,
    componentsAdded: data.components.length,
    wiresAdded: data.wires.length,
    clientId: "cli-import",
  });

  console.log(`✅ Imported as version ${newVersion}`);
  console.log(`   Components: ${data.components.length}`);
  console.log(`   Wires: ${data.wires.length}`);
  console.log(`   Circuits: ${data.circuits.length}`);
  console.log(`   Positions: ${Object.keys(data.positions || {}).length}`);
  console.log("\n💡 Refresh the diagram page to see changes");
}

async function showInfo() {
  console.log("📊 Diagram Info\n");

  const projectData = await db
    .select()
    .from(project)
    .where(eq(project.id, PROJECT_ID))
    .limit(1);

  const proj = projectData[0];
  if (!proj) {
    console.log("❌ No project found");
    process.exit(1);
  }

  console.log(`Project: ${proj.name}`);
  console.log(`Vehicle: ${proj.year} ${proj.make} ${proj.model}`);
  console.log(`Status: ${proj.status}\n`);

  const latestSnapshot = await db
    .select()
    .from(diagramSnapshot)
    .where(eq(diagramSnapshot.projectId, PROJECT_ID))
    .orderBy(desc(diagramSnapshot.version))
    .limit(1);

  const snapshot = latestSnapshot[0];
  if (!snapshot) {
    console.log("No snapshots found");
    return;
  }

  const data = snapshot.data as DiagramData;

  console.log("Latest Snapshot:");
  console.log(`  Version: ${snapshot.version}`);
  console.log(`  Message: ${snapshot.message}`);
  console.log(`  Created: ${snapshot.createdAt}`);
  console.log(`  Components: ${data.components.length}`);
  console.log(`  Wires: ${data.wires.length}`);
  console.log(`  Circuits: ${data.circuits.length}`);
  console.log(`  Positions saved: ${Object.keys(data.positions || {}).length}`);

  // List components
  console.log("\nComponents:");
  for (const comp of data.components) {
    const pinCount = comp.connectors.reduce((sum, c) => sum + c.pins.length, 0);
    console.log(`  - ${comp.id}: ${comp.name} (${comp.type}, ${pinCount} pins)`);
  }
}

async function showHistory() {
  console.log("📜 Version History\n");

  const snapshots = await db
    .select()
    .from(diagramSnapshot)
    .where(eq(diagramSnapshot.projectId, PROJECT_ID))
    .orderBy(desc(diagramSnapshot.version))
    .limit(20);

  if (snapshots.length === 0) {
    console.log("No snapshots found");
    return;
  }

  for (const snapshot of snapshots) {
    const data = snapshot.data as DiagramData;
    const date = new Date(snapshot.createdAt!).toLocaleString();
    console.log(`v${snapshot.version} - ${date}`);
    console.log(`  ${snapshot.message}`);
    console.log(`  Components: ${data.components.length}, Wires: ${data.wires.length}`);
    if (snapshot.componentsAdded || snapshot.wiresAdded) {
      console.log(`  Changes: +${snapshot.componentsAdded} components, +${snapshot.wiresAdded} wires`);
    }
    console.log();
  }
}

// Main
const command = process.argv[2];

switch (command) {
  case "export":
    exportDiagram().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
    break;
  case "import":
    importDiagram().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
    break;
  case "info":
    showInfo().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
    break;
  case "history":
    showHistory().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
    break;
  default:
    console.log("Diagram Database CLI");
    console.log("====================\n");
    console.log("Usage:");
    console.log("  pnpm tsx scripts/diagram-db.ts export   # Export to .claude/diagram-snapshot.json");
    console.log("  pnpm tsx scripts/diagram-db.ts import   # Import from .claude/diagram-snapshot.json");
    console.log("  pnpm tsx scripts/diagram-db.ts info     # Show current diagram stats");
    console.log("  pnpm tsx scripts/diagram-db.ts history  # Show version history");
    process.exit(0);
}
