import "server-only";
import { db, schema } from "@/db";

type Entity = "product" | "brand" | "category" | "spec_definition" | "media" | "post" | "post_category" | "tag" | "author" | "enquiry" | "faq" | "testimonial" | "client";

/** Records who did what for the dashboard's recent activity. Never throws, so logging cannot break a save. */
export async function logActivity(userId: string, action: string, entity: Entity, entityId: string | null) {
  try {
    await db.insert(schema.activityLog).values({ userId, action, entity, entityId });
  } catch (error) {
    console.error("activity log failed", error);
  }
}
