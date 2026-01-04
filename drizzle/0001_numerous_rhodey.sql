CREATE TABLE "checklist_item" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"circuit_id" text,
	"category" text NOT NULL,
	"sort_order" integer DEFAULT 0,
	"title" text NOT NULL,
	"description" text,
	"is_completed" boolean DEFAULT false,
	"completed_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "circuit" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"color" text DEFAULT '#6b7280',
	"category" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "component" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"manufacturer" text,
	"part_number" text,
	"position_x" real DEFAULT 0,
	"position_y" real DEFAULT 0,
	"color" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "connector" (
	"id" text PRIMARY KEY NOT NULL,
	"component_id" text NOT NULL,
	"name" text NOT NULL,
	"type" text,
	"pin_count" integer NOT NULL,
	"pin_layout" jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_item" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"category" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"manufacturer" text,
	"part_number" text,
	"supplier" text,
	"supplier_url" text,
	"quantity_needed" real DEFAULT 0,
	"quantity_on_hand" real DEFAULT 0,
	"unit" text DEFAULT 'ea',
	"is_acquired" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pin" (
	"id" text PRIMARY KEY NOT NULL,
	"connector_id" text NOT NULL,
	"position" text NOT NULL,
	"label" text,
	"function" text,
	"wire_gauge" text,
	"fuse_rating" text,
	"max_current" real,
	"is_used" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"year" integer,
	"make" text,
	"model" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wire" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"circuit_id" text,
	"source_pin_id" text NOT NULL,
	"target_pin_id" text NOT NULL,
	"color" text,
	"gauge" text,
	"length" real,
	"length_unit" text DEFAULT 'ft',
	"is_installed" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "checklist_item" ADD CONSTRAINT "checklist_item_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_item" ADD CONSTRAINT "checklist_item_circuit_id_circuit_id_fk" FOREIGN KEY ("circuit_id") REFERENCES "public"."circuit"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circuit" ADD CONSTRAINT "circuit_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "component" ADD CONSTRAINT "component_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connector" ADD CONSTRAINT "connector_component_id_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."component"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_item" ADD CONSTRAINT "inventory_item_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pin" ADD CONSTRAINT "pin_connector_id_connector_id_fk" FOREIGN KEY ("connector_id") REFERENCES "public"."connector"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wire" ADD CONSTRAINT "wire_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wire" ADD CONSTRAINT "wire_circuit_id_circuit_id_fk" FOREIGN KEY ("circuit_id") REFERENCES "public"."circuit"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wire" ADD CONSTRAINT "wire_source_pin_id_pin_id_fk" FOREIGN KEY ("source_pin_id") REFERENCES "public"."pin"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wire" ADD CONSTRAINT "wire_target_pin_id_pin_id_fk" FOREIGN KEY ("target_pin_id") REFERENCES "public"."pin"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "checklist_item_project_id_idx" ON "checklist_item" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "checklist_item_circuit_id_idx" ON "checklist_item" USING btree ("circuit_id");--> statement-breakpoint
CREATE INDEX "circuit_project_id_idx" ON "circuit" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "component_project_id_idx" ON "component" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "connector_component_id_idx" ON "connector" USING btree ("component_id");--> statement-breakpoint
CREATE INDEX "inventory_item_project_id_idx" ON "inventory_item" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "pin_connector_id_idx" ON "pin" USING btree ("connector_id");--> statement-breakpoint
CREATE INDEX "pin_position_idx" ON "pin" USING btree ("connector_id","position");--> statement-breakpoint
CREATE INDEX "project_user_id_idx" ON "project" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "wire_project_id_idx" ON "wire" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "wire_circuit_id_idx" ON "wire" USING btree ("circuit_id");--> statement-breakpoint
CREATE INDEX "wire_source_pin_idx" ON "wire" USING btree ("source_pin_id");--> statement-breakpoint
CREATE INDEX "wire_target_pin_idx" ON "wire" USING btree ("target_pin_id");--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "account_provider_account_idx" ON "account" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_token_idx" ON "session" USING btree ("token");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "user" USING btree ("email");