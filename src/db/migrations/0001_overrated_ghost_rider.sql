ALTER TABLE "booking_intents" ADD COLUMN "ip_hash" text;--> statement-breakpoint
CREATE INDEX "booking_intents_ip_idx" ON "booking_intents" USING btree ("ip_hash","created_at");