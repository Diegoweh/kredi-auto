import { createAdminClient, getAdmin } from "@/lib/appwrite/server";
import { SELL_PHOTOS_BUCKET_ID } from "@/lib/appwrite/config";

/** Serves a private sell-request photo to logged-in admins. */
export async function GET(_req: Request, { params }: RouteContext<"/admin/foto/[id]">) {
  if (!(await getAdmin())) return new Response("No autorizado", { status: 401 });
  const { id } = await params;
  try {
    const { storage } = createAdminClient();
    const bytes = await storage.getFileView({ bucketId: SELL_PHOTOS_BUCKET_ID, fileId: id });
    return new Response(bytes, {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=86400" },
    });
  } catch {
    return new Response("No encontrada", { status: 404 });
  }
}
