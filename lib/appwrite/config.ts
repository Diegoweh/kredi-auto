export const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "";
export const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "";

export const DATABASE_ID = "main";
export const CARS_TABLE_ID = "cars";
export const SELL_REQUESTS_TABLE_ID = "sell_requests";
// Appwrite's free plan allows one bucket, so both kinds of photo share it and access
// is set per file: car photos are readable by anyone, sell-request photos are private.
export const CAR_PHOTOS_BUCKET_ID = "car-photos";
export const SELL_PHOTOS_BUCKET_ID = CAR_PHOTOS_BUCKET_ID;

export const ADMIN_LABEL = "admin";
export const SESSION_COOKIE = "kredi_session";

export const isAppwriteConfigured = Boolean(
  APPWRITE_ENDPOINT && APPWRITE_PROJECT_ID && process.env.APPWRITE_API_KEY,
);

/** Public URL of a car photo (the car-photos bucket is readable by anyone). */
export function carPhotoUrl(fileId: string) {
  return `${APPWRITE_ENDPOINT}/storage/buckets/${CAR_PHOTOS_BUCKET_ID}/files/${fileId}/view?project=${APPWRITE_PROJECT_ID}`;
}
