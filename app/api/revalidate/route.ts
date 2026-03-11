import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const secret = request.headers.get("x-revalidate-secret");
  const payload = (await request.json().catch(() => ({}))) as {
    path?: string;
    tag?: string;
    secret?: string;
  };

  const expectedSecret = process.env.REVALIDATE_SECRET;

  if (!expectedSecret || (secret !== expectedSecret && payload.secret !== expectedSecret)) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 401 });
  }

  if (payload.tag) {
    revalidateTag(payload.tag, "max");
  }

  if (payload.path) {
    revalidatePath(payload.path);
  }

  revalidatePath("/");
  revalidatePath("/prompts");

  return NextResponse.json({ revalidated: true, path: payload.path ?? null, tag: payload.tag ?? null });
}
