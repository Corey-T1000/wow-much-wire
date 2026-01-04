import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  integer,
  real,
  jsonb,
} from "drizzle-orm/pg-core";

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("user_email_idx").on(table.email)]
);

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("session_user_id_idx").on(table.userId),
    index("session_token_idx").on(table.token),
  ]
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("account_user_id_idx").on(table.userId),
    index("account_provider_account_idx").on(table.providerId, table.accountId),
  ]
);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// =============================================================================
// WIRING PROJECT SCHEMA
// =============================================================================

/**
 * Projects represent a vehicle build (e.g., "1993 NA Miata")
 * Each project contains its own components, connections, and circuits
 */
export const project = pgTable(
  "project",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    // Vehicle info
    year: integer("year"),
    make: text("make"),
    model: text("model"),
    // Project status
    status: text("status").default("active").notNull(), // active, completed, archived
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("project_user_id_idx").on(table.userId)]
);

/**
 * Circuits are logical groupings of connections (e.g., "Low Beam Circuit")
 * Used for organization and color-coding in diagrams
 */
export const circuit = pgTable(
  "circuit",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    color: text("color").default("#6b7280"), // Diagram color for this circuit
    category: text("category"), // lighting, engine, cooling, fuel, accessories
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("circuit_project_id_idx").on(table.projectId)]
);

/**
 * Components are physical devices (PDM, ECU, lights, fans, relays, etc.)
 */
export const component = pgTable(
  "component",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type").notNull(), // pdu, ecu, light, motor, relay, fuse, sensor, switch, ground, power
    // Product info
    manufacturer: text("manufacturer"),
    partNumber: text("part_number"),
    // Diagram positioning
    positionX: real("position_x").default(0),
    positionY: real("position_y").default(0),
    // Styling
    color: text("color"), // Override color for this component
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("component_project_id_idx").on(table.projectId)]
);

/**
 * Connectors are the physical plugs/sockets on a component
 * e.g., The Bussmann PDM has BLACK, GREY, BLUE, GREEN connectors
 */
export const connector = pgTable(
  "connector",
  {
    id: text("id").primaryKey(),
    componentId: text("component_id")
      .notNull()
      .references(() => component.id, { onDelete: "cascade" }),
    name: text("name").notNull(), // e.g., "BLACK", "AMPSEAL 35"
    type: text("type"), // male, female, header, terminal
    pinCount: integer("pin_count").notNull(),
    // Layout info for multi-row connectors
    pinLayout: jsonb("pin_layout"), // e.g., { rows: [["D","C","B","A"], ["E","F","G","H"]] }
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("connector_component_id_idx").on(table.componentId)]
);

/**
 * Pins are individual connection points on a connector
 */
export const pin = pgTable(
  "pin",
  {
    id: text("id").primaryKey(),
    connectorId: text("connector_id")
      .notNull()
      .references(() => connector.id, { onDelete: "cascade" }),
    position: text("position").notNull(), // "1", "2", "A", "B", etc.
    label: text("label"), // e.g., "R1-86", "12V+ switched in"
    function: text("function"), // What this pin does
    // Electrical specs
    wireGauge: text("wire_gauge"), // e.g., "14 AWG", "18-16 AWG"
    fuseRating: text("fuse_rating"), // e.g., "10A", "25-30A"
    maxCurrent: real("max_current"), // Amps
    // Status
    isUsed: boolean("is_used").default(false),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("pin_connector_id_idx").on(table.connectorId),
    index("pin_position_idx").on(table.connectorId, table.position),
  ]
);

/**
 * Wires connect two pins together
 * The source/target distinction is for diagram flow (power source → load)
 */
export const wire = pgTable(
  "wire",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    circuitId: text("circuit_id").references(() => circuit.id, {
      onDelete: "set null",
    }),
    // Connection endpoints
    sourcePinId: text("source_pin_id")
      .notNull()
      .references(() => pin.id, { onDelete: "cascade" }),
    targetPinId: text("target_pin_id")
      .notNull()
      .references(() => pin.id, { onDelete: "cascade" }),
    // Wire specs
    color: text("color"), // e.g., "RD", "BK/WH" (black with white stripe)
    gauge: text("gauge"), // e.g., "14 AWG"
    length: real("length"), // in meters or feet
    lengthUnit: text("length_unit").default("ft"),
    // Status
    isInstalled: boolean("is_installed").default(false),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("wire_project_id_idx").on(table.projectId),
    index("wire_circuit_id_idx").on(table.circuitId),
    index("wire_source_pin_idx").on(table.sourcePinId),
    index("wire_target_pin_idx").on(table.targetPinId),
  ]
);

/**
 * Inventory tracks what parts the user has on hand vs. what they need
 */
export const inventoryItem = pgTable(
  "inventory_item",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    // What is it
    category: text("category").notNull(), // wire, connector, terminal, fuse, relay, component
    name: text("name").notNull(),
    description: text("description"),
    // Product info
    manufacturer: text("manufacturer"),
    partNumber: text("part_number"),
    supplier: text("supplier"),
    supplierUrl: text("supplier_url"),
    // Quantity tracking
    quantityNeeded: real("quantity_needed").default(0),
    quantityOnHand: real("quantity_on_hand").default(0),
    unit: text("unit").default("ea"), // ea, ft, m, pack
    // Status
    isAcquired: boolean("is_acquired").default(false),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("inventory_item_project_id_idx").on(table.projectId)]
);

/**
 * Checklist items for commissioning/testing
 */
export const checklistItem = pgTable(
  "checklist_item",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    circuitId: text("circuit_id").references(() => circuit.id, {
      onDelete: "set null",
    }),
    // Checklist info
    category: text("category").notNull(), // pre-power, power-up, integration, final
    sortOrder: integer("sort_order").default(0),
    title: text("title").notNull(),
    description: text("description"),
    // Status
    isCompleted: boolean("is_completed").default(false),
    completedAt: timestamp("completed_at"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("checklist_item_project_id_idx").on(table.projectId),
    index("checklist_item_circuit_id_idx").on(table.circuitId),
  ]
);

// =============================================================================
// RELATIONS
// =============================================================================

export const projectRelations = relations(project, ({ one, many }) => ({
  user: one(user, { fields: [project.userId], references: [user.id] }),
  circuits: many(circuit),
  components: many(component),
  wires: many(wire),
  inventoryItems: many(inventoryItem),
  checklistItems: many(checklistItem),
}));

export const circuitRelations = relations(circuit, ({ one, many }) => ({
  project: one(project, { fields: [circuit.projectId], references: [project.id] }),
  wires: many(wire),
  checklistItems: many(checklistItem),
}));

export const componentRelations = relations(component, ({ one, many }) => ({
  project: one(project, { fields: [component.projectId], references: [project.id] }),
  connectors: many(connector),
}));

export const connectorRelations = relations(connector, ({ one, many }) => ({
  component: one(component, { fields: [connector.componentId], references: [component.id] }),
  pins: many(pin),
}));

export const pinRelations = relations(pin, ({ one, many }) => ({
  connector: one(connector, { fields: [pin.connectorId], references: [connector.id] }),
  outgoingWires: many(wire, { relationName: "sourcePin" }),
  incomingWires: many(wire, { relationName: "targetPin" }),
}));

export const wireRelations = relations(wire, ({ one }) => ({
  project: one(project, { fields: [wire.projectId], references: [project.id] }),
  circuit: one(circuit, { fields: [wire.circuitId], references: [circuit.id] }),
  sourcePin: one(pin, { fields: [wire.sourcePinId], references: [pin.id], relationName: "sourcePin" }),
  targetPin: one(pin, { fields: [wire.targetPinId], references: [pin.id], relationName: "targetPin" }),
}));

export const inventoryItemRelations = relations(inventoryItem, ({ one }) => ({
  project: one(project, { fields: [inventoryItem.projectId], references: [project.id] }),
}));

export const checklistItemRelations = relations(checklistItem, ({ one }) => ({
  project: one(project, { fields: [checklistItem.projectId], references: [project.id] }),
  circuit: one(circuit, { fields: [checklistItem.circuitId], references: [circuit.id] }),
}));

// =============================================================================
// DIAGRAM SNAPSHOTS (Version History)
// =============================================================================

/**
 * Stores versioned snapshots of the diagram data.
 * Each save creates a new snapshot with the full DiagramData JSON.
 * This enables git-like history: view changes, rollback, compare versions.
 */
export const diagramSnapshot = pgTable(
  "diagram_snapshot",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    // Snapshot metadata
    version: integer("version").notNull(), // Auto-incrementing per project
    message: text("message").notNull(), // What changed (commit message)
    // The actual diagram data as JSON
    data: jsonb("data").notNull(), // Full DiagramData snapshot
    // Change summary (for quick display in history)
    componentsAdded: integer("components_added").default(0),
    componentsRemoved: integer("components_removed").default(0),
    wiresAdded: integer("wires_added").default(0),
    wiresRemoved: integer("wires_removed").default(0),
    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    // Local client ID for local-only mode (no auth required)
    clientId: text("client_id"),
  },
  (table) => [
    index("diagram_snapshot_project_id_idx").on(table.projectId),
    index("diagram_snapshot_version_idx").on(table.projectId, table.version),
  ]
);

export const diagramSnapshotRelations = relations(diagramSnapshot, ({ one }) => ({
  project: one(project, { fields: [diagramSnapshot.projectId], references: [project.id] }),
}))
