DO $$ BEGIN
 ALTER TABLE "transaction" ADD CONSTRAINT "fk_transaction" FOREIGN KEY ("transactionId") REFERENCES "public"."transaction"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
