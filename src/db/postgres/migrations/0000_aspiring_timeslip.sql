CREATE TABLE IF NOT EXISTS "product" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"price" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "productImage" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"s3name" varchar(65) NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(15) NOT NULL,
	"size" integer NOT NULL,
	"url" varchar(2000) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "productImage" ADD CONSTRAINT "fk_produto" FOREIGN KEY ("productId") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
