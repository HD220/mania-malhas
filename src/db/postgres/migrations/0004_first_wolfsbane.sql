ALTER TABLE "product" ALTER COLUMN "price" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "productImage" ADD COLUMN "active" boolean DEFAULT true NOT NULL;