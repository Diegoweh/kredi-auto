/**
 * Creates the database, tables, columns, indexes, buckets and the first admin user.
 * Safe to run more than once: anything that already exists is skipped.
 *
 *   npm run appwrite:setup
 */
import {
  AppwriteException,
  Client,
  ID,
  Permission,
  Role,
  Storage,
  TablesDB,
  TablesDBIndexType,
  Users,
  Query,
} from "node-appwrite";
import {
  ADMIN_LABEL,
  CARS_TABLE_ID,
  CAR_PHOTOS_BUCKET_ID,
  DATABASE_ID,
  SELL_REQUESTS_TABLE_ID,
} from "../lib/appwrite/config";
import {
  BODY_TYPES,
  CAR_STATUSES,
  FUEL_TYPES,
  SELL_REQUEST_STATUSES,
  TRANSMISSIONS,
} from "../lib/car-types";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);
const tables = new TablesDB(client);
const storage = new Storage(client);
const users = new Users(client);

async function ignoreExisting(label: string, fn: () => Promise<unknown>) {
  try {
    await fn();
    console.log(`  + ${label}`);
  } catch (err) {
    if (err instanceof AppwriteException && err.code === 409) {
      console.log(`  = ${label} (already exists)`);
      return;
    }
    throw err;
  }
}

type Column =
  | { key: string; type: "varchar"; size: number; required?: boolean; array?: boolean }
  | { key: string; type: "text"; required?: boolean }
  | { key: string; type: "integer"; required?: boolean; min?: number; max?: number }
  | { key: string; type: "boolean"; required?: boolean; default?: boolean }
  | { key: string; type: "enum"; elements: readonly string[]; required?: boolean; default?: string };

async function createColumn(tableId: string, c: Column) {
  const base = { databaseId: DATABASE_ID, tableId, key: c.key, required: c.required ?? false };
  switch (c.type) {
    case "varchar":
      return tables.createVarcharColumn({ ...base, size: c.size, array: c.array });
    case "text":
      return tables.createTextColumn(base);
    case "integer":
      return tables.createIntegerColumn({ ...base, min: c.min, max: c.max });
    case "boolean":
      return tables.createBooleanColumn({ ...base, xdefault: c.default });
    case "enum":
      return tables.createEnumColumn({ ...base, elements: [...c.elements], xdefault: c.default });
  }
}

async function waitForColumns(tableId: string) {
  for (let i = 0; i < 60; i++) {
    const { columns } = await tables.listColumns({ databaseId: DATABASE_ID, tableId });
    const pending = columns.filter((c) => (c as { status: string }).status !== "available");
    if (!pending.length) return;
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Columns of ${tableId} did not become available`);
}

async function createTable(
  tableId: string,
  name: string,
  permissions: string[],
  columns: Column[],
  indexes: { key: string; type: TablesDBIndexType; columns: string[] }[],
) {
  console.log(`Table ${tableId}`);
  await ignoreExisting("table", () =>
    tables.createTable({ databaseId: DATABASE_ID, tableId, name, permissions, rowSecurity: false }),
  );
  for (const column of columns) {
    await ignoreExisting(`column ${column.key}`, () => createColumn(tableId, column));
  }
  await waitForColumns(tableId);
  for (const index of indexes) {
    await ignoreExisting(`index ${index.key}`, () =>
      tables.createIndex({ databaseId: DATABASE_ID, tableId, ...index }),
    );
  }
}

async function main() {
  console.log("Database");
  // Check first: on plan limits Appwrite answers 403 instead of 409 for existing resources.
  const dbExists = await tables.get({ databaseId: DATABASE_ID }).then(() => true, () => false);
  if (dbExists) console.log("  = database main (already exists)");
  else await ignoreExisting("database main", () => tables.create({ databaseId: DATABASE_ID, name: "Kredi Auto" }));

  // Anyone can read cars; all writes go through the server API key.
  await createTable(
    CARS_TABLE_ID,
    "Autos",
    [Permission.read(Role.any())],
    [
      { key: "slug", type: "varchar", size: 160, required: true },
      { key: "legacyId", type: "integer" },
      { key: "brand", type: "varchar", size: 40, required: true },
      { key: "model", type: "varchar", size: 60, required: true },
      { key: "version", type: "varchar", size: 60 },
      { key: "year", type: "integer", required: true, min: 1950, max: 2100 },
      { key: "price", type: "integer", required: true, min: 0 },
      { key: "mileage", type: "integer", required: true, min: 0 },
      { key: "transmission", type: "enum", elements: TRANSMISSIONS },
      { key: "fuelType", type: "enum", elements: FUEL_TYPES },
      { key: "bodyType", type: "enum", elements: BODY_TYPES },
      { key: "color", type: "varchar", size: 30 },
      { key: "cylinders", type: "integer", min: 1, max: 16 },
      { key: "description", type: "text" },
      { key: "equipment", type: "varchar", size: 80, array: true },
      { key: "photoIds", type: "varchar", size: 36, array: true },
      { key: "featured", type: "boolean", default: false },
      { key: "status", type: "enum", elements: CAR_STATUSES, default: "disponible" },
      { key: "city", type: "varchar", size: 60 },
    ],
    [
      { key: "slug_unique", type: TablesDBIndexType.Unique, columns: ["slug"] },
      { key: "status_idx", type: TablesDBIndexType.Key, columns: ["status"] },
      { key: "brand_idx", type: TablesDBIndexType.Key, columns: ["brand"] },
      { key: "legacy_idx", type: TablesDBIndexType.Key, columns: ["legacyId"] },
    ],
  );

  // No public permissions: rows are created by a server action and read in the admin panel.
  await createTable(
    SELL_REQUESTS_TABLE_ID,
    "Solicitudes de venta",
    [],
    [
      { key: "name", type: "varchar", size: 80, required: true },
      { key: "phone", type: "varchar", size: 20, required: true },
      { key: "brand", type: "varchar", size: 40, required: true },
      { key: "model", type: "varchar", size: 60, required: true },
      { key: "year", type: "integer", required: true },
      { key: "mileage", type: "integer", required: true },
      { key: "askingPrice", type: "integer", required: true },
      { key: "photoIds", type: "varchar", size: 36, array: true },
      { key: "status", type: "enum", elements: SELL_REQUEST_STATUSES, default: "nuevo" },
      { key: "adminNotes", type: "text" },
    ],
    [{ key: "status_idx", type: TablesDBIndexType.Key, columns: ["status"] }],
  );

  // One bucket for all photos; each car photo is uploaded with read("any"),
  // sell-request photos with no permissions (only the API key can read them).
  console.log("Bucket");
  const bucket = {
    bucketId: CAR_PHOTOS_BUCKET_ID,
    name: "Fotos",
    permissions: [],
    fileSecurity: true,
    maximumFileSize: 10 * 1024 * 1024,
    allowedFileExtensions: ["jpg", "jpeg", "png", "webp"],
  };
  const bucketExists = await storage.getBucket({ bucketId: bucket.bucketId }).then(() => true, () => false);
  if (!bucketExists) await storage.createBucket(bucket);
  await storage.updateBucket(bucket);
  console.log("  ~ bucket car-photos permissions set (per-file)");

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    console.log("Admin user");
    const existing = await users.list({ queries: [Query.equal("email", email)] });
    const user =
      existing.users[0] ??
      (await users.create({ userId: ID.unique(), email, password, name: "Administrador" }));
    if (!user.labels.includes(ADMIN_LABEL)) {
      await users.updateLabels({ userId: user.$id, labels: [...user.labels, ADMIN_LABEL] });
    }
    console.log(`  admin: ${email}`);
  } else {
    console.log("Skipping admin user (set ADMIN_EMAIL and ADMIN_PASSWORD to create one).");
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
