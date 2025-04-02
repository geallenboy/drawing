CREATE TABLE "aidt_file_comment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fileId" text NOT NULL,
	"userId" text NOT NULL,
	"content" text NOT NULL,
	"position" json,
	"resolved" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"parentId" text
);
--> statement-breakpoint
CREATE TABLE "aidt_file_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fileId" text NOT NULL,
	"version" integer NOT NULL,
	"data" json NOT NULL,
	"userId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"changeDescription" text DEFAULT '',
	"wordCount" integer DEFAULT 0 NOT NULL,
	"charCount" integer DEFAULT 0 NOT NULL,
	"isAutosave" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "aidt_file" ALTER COLUMN "collaborators" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "aidt_file" ALTER COLUMN "collaborators" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "aidt_file" ALTER COLUMN "revisionHistory" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "aidt_file" ALTER COLUMN "revisionHistory" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "aidt_file" ALTER COLUMN "metadata" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "aidt_file" ALTER COLUMN "metadata" SET DEFAULT '{"editor":{"theme":"default","fontSize":"medium","viewMode":"edit"},"template":null,"customFields":{},"recentViewers":[]}'::jsonb;--> statement-breakpoint
ALTER TABLE "aidt_file" ADD COLUMN "sharedLink" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "aidt_file" ADD COLUMN "shareExpiry" timestamp;--> statement-breakpoint
ALTER TABLE "aidt_file" ADD COLUMN "sharePermissions" text[] DEFAULT '{"read"}' NOT NULL;--> statement-breakpoint
ALTER TABLE "aidt_file" ADD COLUMN "snapshotFrequency" text DEFAULT 'hourly' NOT NULL;--> statement-breakpoint
ALTER TABLE "aidt_file" ADD COLUMN "maxHistoryItems" integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE "aidt_file" ADD COLUMN "pageCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "aidt_file" ADD COLUMN "readingTime" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "aidt_file" ADD COLUMN "deletedAt" timestamp;--> statement-breakpoint
ALTER TABLE "aidt_file" ADD COLUMN "parentFolderId" text;--> statement-breakpoint
ALTER TABLE "aidt_file" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;