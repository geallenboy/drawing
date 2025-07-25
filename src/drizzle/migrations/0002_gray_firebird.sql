ALTER TABLE "drawing" ALTER COLUMN "parentFolderId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "drawing" ADD COLUMN "files" jsonb DEFAULT '{}'::jsonb NOT NULL;