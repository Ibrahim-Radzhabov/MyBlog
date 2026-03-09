import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/types/database";

type AuditPayload = {
  supabase: SupabaseClient<Database>;
  adminId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  entityRef?: string | null;
  metadata?: Json;
};

export async function logAdminEvent({
  supabase,
  adminId,
  action,
  entityType,
  entityId,
  entityRef,
  metadata,
}: AuditPayload) {
  const { error } = await supabase.from("admin_events").insert({
    admin_id: adminId,
    action,
    entity_type: entityType,
    entity_id: entityId ?? null,
    entity_ref: entityRef ?? null,
    metadata: metadata ?? {},
  });

  if (error) {
    console.error("Failed to log admin event", {
      action,
      entityType,
      entityId,
      entityRef,
      error: error.message,
    });
  }
}
