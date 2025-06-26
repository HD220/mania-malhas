CREATE TYPE "public"."notification_type_enum" AS ENUM('info', 'warning', 'error', 'new_transaction', 'payment_due', 'generic');--> statement-breakpoint
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"type" "notification_type_enum" DEFAULT 'generic' NOT NULL,
	"message" text NOT NULL,
	"isRead" boolean DEFAULT false NOT NULL,
	"relatedEntityId" uuid,
	"relatedEntityType" varchar(50),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
