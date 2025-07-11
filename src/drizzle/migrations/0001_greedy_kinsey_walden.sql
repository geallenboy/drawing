CREATE TABLE "folder" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"desc" text DEFAULT '' NOT NULL,
	"userId" text NOT NULL,
	"parentFolderId" text,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"deletedAt" timestamp,
	"filepath" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "drawing" ADD COLUMN "filepath" text;