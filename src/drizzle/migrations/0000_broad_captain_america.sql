CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"full_name" text,
	"avatar_url" text,
	"bio" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "drawing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"desc" text DEFAULT '' NOT NULL,
	"data" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"userId" text NOT NULL,
	"isFavorite" boolean DEFAULT false NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"deletedAt" timestamp,
	"parentFolderId" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
