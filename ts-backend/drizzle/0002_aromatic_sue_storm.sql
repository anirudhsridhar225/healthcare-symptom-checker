ALTER TABLE "chats" RENAME COLUMN "query_id" TO "user_id";--> statement-breakpoint
ALTER TABLE "queries" RENAME COLUMN "user_id" TO "chat_id";--> statement-breakpoint
ALTER TABLE "chats" DROP CONSTRAINT "chats_query_id_queries_id_fk";
--> statement-breakpoint
ALTER TABLE "queries" DROP CONSTRAINT "queries_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "chats" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "symptoms" text NOT NULL;--> statement-breakpoint
ALTER TABLE "queries" ADD COLUMN "role" "role" NOT NULL;--> statement-breakpoint
ALTER TABLE "queries" ADD COLUMN "content" text NOT NULL;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "queries" ADD CONSTRAINT "queries_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN "role";--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN "content";--> statement-breakpoint
ALTER TABLE "queries" DROP COLUMN "symptoms";