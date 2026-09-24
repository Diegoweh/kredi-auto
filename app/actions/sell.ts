"use server";

import { ID } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite/server";
import { DATABASE_ID, SELL_PHOTOS_BUCKET_ID, SELL_REQUESTS_TABLE_ID } from "@/lib/appwrite/config";
import { fieldErrors, MAX_PHOTO_BYTES, MAX_SELL_PHOTOS, sellSchema, type FieldErrors } from "@/lib/validation";

export type SellState = { ok: boolean; errors?: FieldErrors; message?: string };

export async function submitSellRequest(_prev: SellState, formData: FormData): Promise<SellState> {
  // Honeypot: real users never see or fill this field.
  if (formData.get("website")) return { ok: true };

  const parsed = sellSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  const photos = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (photos.length > MAX_SELL_PHOTOS) {
    return { ok: false, errors: { photos: `Máximo ${MAX_SELL_PHOTOS} fotos` } };
  }
  if (photos.some((f) => !f.type.startsWith("image/") || f.size > MAX_PHOTO_BYTES)) {
    return { ok: false, errors: { photos: "Alguna foto no es válida o es muy pesada" } };
  }

  try {
    const { storage, tables } = createAdminClient();
    const uploaded = await Promise.all(
      // No permissions: private, visible only through the admin panel.
      photos.map((file) =>
        storage.createFile({ bucketId: SELL_PHOTOS_BUCKET_ID, fileId: ID.unique(), file, permissions: [] }),
      ),
    );
    await tables.createRow({
      databaseId: DATABASE_ID,
      tableId: SELL_REQUESTS_TABLE_ID,
      rowId: ID.unique(),
      data: { ...parsed.data, photoIds: uploaded.map((f) => f.$id), status: "nuevo" },
    });
    return { ok: true };
  } catch (err) {
    console.error("[sell] failed to save request", err);
    return { ok: false, message: "No pudimos enviar tu solicitud. Intenta de nuevo o escríbenos por WhatsApp." };
  }
}
