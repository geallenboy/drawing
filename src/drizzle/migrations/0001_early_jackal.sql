ALTER TABLE "aidt_file" ADD COLUMN "tags" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "aidt_file" ADD COLUMN "isFavorite" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "aidt_file" ADD COLUMN "sharingLevel" text DEFAULT 'private' NOT NULL;--> statement-breakpoint
ALTER TABLE "aidt_file" ADD COLUMN "collaborators" json DEFAULT '[]'::json NOT NULL;--> statement-breakpoint
ALTER TABLE "aidt_file" ADD COLUMN "lastModifiedBy" text;--> statement-breakpoint
ALTER TABLE "aidt_file" ADD COLUMN "revisionHistory" json DEFAULT '[]'::json NOT NULL;--> statement-breakpoint
ALTER TABLE "aidt_file" ADD COLUMN "wordCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "aidt_file" ADD COLUMN "charCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "aidt_file" ADD COLUMN "metadata" json DEFAULT '{}'::json NOT NULL;--> statement-breakpoint
ALTER TABLE "aidt_file" ADD COLUMN "isDeleted" boolean DEFAULT false NOT NULL;