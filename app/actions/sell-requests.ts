"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, requireAdmin } from "@/lib/appwrite/server";
import { DATABASE_ID, SELL_PHOTOS_BUCKET_ID, SELL_REQUESTS_TABLE_ID } from "@/lib/appwrite/config";
import { SELL_REQUEST_STATUSES, type SellRequestStatus } from "@/lib/car-types";

export async function updateSellRequest(id: string, formData: FormData) {
  await requireAdmin();
  const status = String(formData.get("status"));
  const adminNotes = String(formData.get("adminNotes") ?? "").trim().slice(0, 5000) || null;
  if (!SELL_REQUEST_STATUSES.includes(status as SellRequestStatus)) return;

  const { tables } = createAdminClient();
  await tables.updateRow({
    databaseId: DATABASE_ID,
    tableId: SELL_REQUESTS_TABLE_ID,
    rowId: id,
    data: { status, adminNotes },
  });
  revalidatePath("/admin/solicitudes");
}

export async function deleteSellRequest(id: string) {
  await requireAdmin();
  const { tables, storage } = createAdminClient();
  const row = await tables.getRow({ databaseId: DATABASE_ID, tableId: SELL_REQUESTS_TABLE_ID, rowId: id });
  await tables.deleteRow({ databaseId: DATABASE_ID, tableId: SELL_REQUESTS_TABLE_ID, rowId: id });
  await Promise.all(
    ((row.photoIds as string[]) ?? []).map((fileId) =>
      storage.deleteFile({ bucketId: SELL_PHOTOS_BUCKET_ID, fileId }).catch(() => {}),
    ),
  );
  revalidatePath("/admin/solicitudes");
}
