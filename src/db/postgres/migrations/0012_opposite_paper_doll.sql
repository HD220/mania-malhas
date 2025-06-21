ALTER TABLE "payment" ALTER COLUMN "value" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "price" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "transaction" ALTER COLUMN "value" SET DATA TYPE numeric(10, 2);