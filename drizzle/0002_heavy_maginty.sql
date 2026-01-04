CREATE TABLE "diagram_snapshot" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"version" integer NOT NULL,
	"message" text NOT NULL,
	"data" jsonb NOT NULL,
	"components_added" integer DEFAULT 0,
	"components_removed" integer DEFAULT 0,
	"wires_added" integer DEFAULT 0,
	"wires_removed" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"client_id" text
);
--> statement-breakpoint
ALTER TABLE "diagram_snapshot" ADD CONSTRAINT "diagram_snapshot_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "diagram_snapshot_project_id_idx" ON "diagram_snapshot" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "diagram_snapshot_version_idx" ON "diagram_snapshot" USING btree ("project_id","version");