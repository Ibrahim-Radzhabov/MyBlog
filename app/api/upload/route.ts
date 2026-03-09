import { NextResponse } from "next/server";

import { siteConfig } from "@/lib/constants";
import { logAdminEvent } from "@/lib/db/audit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function requireAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  if ((user.email ?? "").toLowerCase() !== siteConfig.adminEmail.toLowerCase()) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    return null;
  }

  return { user, supabase };
}

export async function POST(request: Request) {
  const admin = await requireAdminUser();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

  if (!allowedTypes.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `covers/${admin.user.id}/${Date.now()}-${safeName}`;

  const adminClient = createAdminClient();
  const { error: uploadError } = await adminClient.storage.from("prompt-covers").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: publicData } = adminClient.storage.from("prompt-covers").getPublicUrl(path);
  await logAdminEvent({
    supabase: admin.supabase,
    adminId: admin.user.id,
    action: "storage.upload",
    entityType: "storage_object",
    entityRef: path,
    metadata: {
      size: file.size,
      contentType: file.type,
      bucket: "prompt-covers",
    },
  });

  return NextResponse.json({
    path,
    url: publicData.publicUrl,
  });
}

export async function DELETE(request: Request) {
  const admin = await requireAdminUser();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as { path?: string };
  const path = payload.path?.trim();

  if (!path) {
    return NextResponse.json({ error: "Path is required" }, { status: 400 });
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.storage.from("prompt-covers").remove([path]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  await logAdminEvent({
    supabase: admin.supabase,
    adminId: admin.user.id,
    action: "storage.delete",
    entityType: "storage_object",
    entityRef: path,
    metadata: {
      bucket: "prompt-covers",
    },
  });

  return NextResponse.json({ deleted: true });
}
