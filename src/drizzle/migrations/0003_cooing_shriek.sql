ALTER TABLE "drawing" ADD COLUMN "data_path" text NOT NULL;--> statement-breakpoint
ALTER TABLE "drawing" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "drawing" ADD COLUMN "element_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "drawing" ADD COLUMN "file_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "drawing" ADD COLUMN "last_modified" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "drawing" DROP COLUMN "data";--> statement-breakpoint
ALTER TABLE "drawing" DROP COLUMN "files";