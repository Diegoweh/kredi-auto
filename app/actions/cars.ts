"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { ID, Permission, Role } from "node-appwrite";
import { createAdminClient, requireAdmin } from "@/lib/appwrite/server";
import { CARS_TABLE_ID, CAR_PHOTOS_BUCKET_ID, DATABASE_ID } from "@/lib/appwrite/config";
import { CARS_TAG, getCarByIdAdmin } from "@/lib/cars";
import { CAR_STATUSES, slugify, type CarStatus } from "@/lib/car-types";
import { carSchema, fieldErrors, MAX_PHOTO_BYTES, type FieldErrors } from "@/lib/validation";

export type CarFormState = { errors?: FieldErrors; message?: string };

async function deletePhotos(ids: string[]) {
  const { storage } = createAdminClient();
  await Promise.all(
    ids.map((fileId) => storage.deleteFile({ bucketId: CAR_PHOTOS_BUCKET_ID, fileId }).catch(() => {})),
  );
}

/** Creates a car when `id` is null, otherwise updates it. */
export async function saveCar(id: string | null, _prev: CarFormState, formData: FormData): Promise<CarFormState> {
  await requireAdmin();

  const parsed = carSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const data = parsed.data;
  if (!data.photoIds.length) return { errors: { photoIds: "Agrega al menos una foto" } };

  const { tables } = createAdminClient();
  try {
    if (id) {
      const existing = await getCarByIdAdmin(id);
      if (!existing) return { message: "Este auto ya no existe." };
      // Keep the slug stable so links already shared on WhatsApp keep working.
      await tables.updateRow({ databaseId: DATABASE_ID, tableId: CARS_TABLE_ID, rowId: id, data });
      await deletePhotos(existing.photoIds.filter((p) => !data.photoIds.includes(p)));
    } else {
      const rowId = ID.unique();
      const slug = slugify(`${data.brand} ${data.model} ${data.version ?? ""} ${data.year} ${rowId.slice(-6)}`);
      await tables.createRow({ databaseId: DATABASE_ID, tableId: CARS_TABLE_ID, rowId, data: { ...data, slug } });
    }
  } catch (err) {
    console.error("[cars] save failed", err);
    return { message: "No se pudo guardar. Intenta de nuevo." };
  }

  updateTag(CARS_TAG);
  redirect("/admin/autos");
}

export async function deleteCar(id: string) {
  await requireAdmin();
  const car = await getCarByIdAdmin(id);
  if (car) {
    const { tables } = createAdminClient();
    await tables.deleteRow({ databaseId: DATABASE_ID, tableId: CARS_TABLE_ID, rowId: id });
    await deletePhotos(car.photoIds);
  }
  updateTag(CARS_TAG);
}

/** Uploads one photo (already resized in the browser) and returns its file ID. */
export async function uploadCarPhoto(formData: FormData): Promise<{ id?: string; error?: string }> {
  await requireAdmin();
  const file = formData.get("photo");
  if (!(file instanceof File) || !file.type.startsWith("image/") || file.size > MAX_PHOTO_BYTES) {
    return { error: "Foto no válida" };
  }
  try {
    const { storage } = createAdminClient();
    const uploaded = await storage.createFile({
      bucketId: CAR_PHOTOS_BUCKET_ID,
      fileId: ID.unique(),
      file,
      permissions: [Permission.read(Role.any())],
    });
    return { id: uploaded.$id };
  } catch (err) {
    console.error("[cars] photo upload failed", err);
    return { error: "No se pudo subir la foto" };
  }
}


/** Quick status change from the admin list (e.g. mark as sold). */
export async function setCarStatus(id: string, status: CarStatus) {
  await requireAdmin();
  if (!CAR_STATUSES.includes(status)) return;
  const { tables } = createAdminClient();
  await tables.updateRow({ databaseId: DATABASE_ID, tableId: CARS_TABLE_ID, rowId: id, data: { status } });
  updateTag(CARS_TAG);
}
