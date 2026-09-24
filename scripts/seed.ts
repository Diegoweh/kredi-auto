/**
 * Imports the cars from public/krediauto-carros-datos.csv and their photos from
 * public/images/<id>/ into Appwrite. Photos are resized to WebP (max 1600px).
 * Safe to run more than once: existing rows and files are skipped.
 *
 *   npm run seed
 *   npm run seed -- --dry-run   (prints the normalized data, uploads nothing)
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { parse } from "csv-parse/sync";
import sharp from "sharp";
import { AppwriteException, Client, Permission, Role, Storage, TablesDB } from "node-appwrite";
import { CARS_TABLE_ID, CAR_PHOTOS_BUCKET_ID, DATABASE_ID } from "../lib/appwrite/config";
import { slugify, type BodyType, type FuelType, type Transmission } from "../lib/car-types";

// Created lazily so `--dry-run` works without credentials.
let tables: TablesDB;
let storage: Storage;
function connect() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);
  tables = new TablesDB(client);
  storage = new Storage(client);
}

const ROOT = path.join(process.cwd(), "public");
const FEATURED_COUNT = 6;

type CsvRow = Record<string, string>;

// Rows where the source site left brand/model/version blank ("—" / "Not set").
type Fix = { brand?: string; model?: string; version?: string | null; city?: string; bodyType?: BodyType };
const FIXES: Record<string, Fix> = {
  "40869": { model: "Q5", version: "Sportback Elite HEV" },
  "46288": { brand: "BYD", model: "King", version: null },
  "46106": { brand: "BYD", model: "Shark", version: "GL 4x4" },
  "46311": { brand: "BYD", model: "Song Plus", version: null },
  "43106": { model: "Montana", version: "RS" },
  "46025": { version: null },
  "45849": { brand: "Kia", model: "Seltos", version: "SX", city: "Mazatlán" },
  "45859": { version: null },
  "45835": { brand: "MG", model: "RX5", version: "Lux Elegance", city: "Mazatlán" },
  "41287": { model: "Rifter", version: "Allure Pack" },
  "41370": { model: "Wrangler", version: "Sahara" },
  "42340": { bodyType: "minivan" },
  "44412": { bodyType: "minivan" },
};

const BRANDS: Record<string, string> = {
  "MERCEDES BENZ": "Mercedes-Benz",
  KIA: "Kia",
  GMC: "GMC",
  RAM: "RAM",
  BYD: "BYD",
  MG: "MG",
};

const MODELS: Record<string, string> = {
  RIO: "Rio",
  "RAV 4": "RAV4",
  "CX 30": "CX-30",
  CRV: "CR-V",
};

const EQUIPMENT: Record<string, string> = {
  "Ventanas electricas": "Ventanas eléctricas",
  "Control de AC": "Aire acondicionado",
  "Boton de encedido": "Botón de encendido",
  "Quema cocos": "Quemacocos",
  "Control Crusero": "Control crucero",
  "Bolsas de Aire": "Bolsas de aire",
  "Seguros Eléctricos": "Seguros eléctricos",
  "Volante multifunción": "Volante multifunción",
  "Dirección Asistida": "Dirección asistida",
};

const COLORS: Record<string, string> = {
  ROJA: "Rojo", ROJO: "Rojo", BLANCA: "Blanco", BLANCO: "Blanco", NEGRA: "Negro", NEGRO: "Negro",
  GRIS: "Gris", AZUL: "Azul", PLATA: "Plata", ARENA: "Arena", VERDE: "Verde",
};

const blank = (v: string | undefined) => !v || v === "—" || v === "Not set";

/** "TACOMA" → "Tacoma", keeps short codes and anything with digits: "CX-5", "LT", "HB20". */
function titleCase(value: string) {
  return value
    .split(/\s+/)
    .map((w) => (w.length <= 3 || /\d/.test(w) ? w : w[0].toUpperCase() + w.slice(1).toLowerCase()))
    .join(" ");
}

function normalize(row: CsvRow) {
  const id = row["ID"];
  const fix = FIXES[id] ?? {};
  const name = row["Vehículo"].toUpperCase();

  const rawBrand = row["Marca"];
  const brand = fix.brand ?? (BRANDS[rawBrand] ?? titleCase(rawBrand));
  const model = fix.model ?? MODELS[row["Modelo"]] ?? titleCase(row["Modelo"]);
  let version =
    fix.version !== undefined ? fix.version : blank(row["Versión"]) ? null : titleCase(row["Versión"]);
  // The source sometimes repeats the model or brand as the version ("CX-5 CX-5").
  if (version && [model, brand].some((v) => v.toLowerCase() === version!.toLowerCase())) version = null;

  const transmission: Transmission | null = /estandar|manual/i.test(row["Transmisión"])
    ? "manual"
    : row["Transmisión"]
      ? "automatica"
      : null;

  // The source lists everything as "Gasolina"; hybrids are identifiable by name.
  const fuelType: FuelType = /\bDIESEL\b/.test(name)
    ? "diesel"
    : /\bHEV\b/.test(name) || brand === "BYD"
      ? "hibrido"
      : "gasolina";

  const bodyType = fix.bodyType ?? (
    { SUV: "suv", Sedan: "sedan", Hatchback: "hatchback", Pickup: "pickup", Coupe: "coupe", Minivan: "minivan" } as const
  )[row["Tipo de vehículo"]] as BodyType | undefined;

  const colorWord = name.split(/\s+/).find((w) => COLORS[w]);
  const equipment = row["Equipamiento"]
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => EQUIPMENT[s] ?? s);

  const year = Number(row["Año"]);
  return {
    legacyId: Number(id),
    slug: slugify(`${brand} ${model} ${version ?? ""} ${year} ${id}`),
    brand,
    model,
    version,
    year,
    price: Math.round(Number(row["Precio MXN"])),
    mileage: Number(row["Kilómetros"]),
    transmission,
    fuelType,
    bodyType: bodyType ?? null,
    color: colorWord ? COLORS[colorWord] : null,
    cylinders: row["Cilindros"] ? Number(row["Cilindros"]) : null,
    description: null,
    equipment,
    city: fix.city ?? (blank(row["Ciudad"]) ? null : row["Ciudad"]),
    status: "disponible" as const,
  };
}

/** Returns false when the photo is unreadable and was skipped. */
async function uploadPhoto(fileId: string, filePath: string) {
  try {
    await storage.getFile({ bucketId: CAR_PHOTOS_BUCKET_ID, fileId });
    return true;
  } catch (err) {
    if (!(err instanceof AppwriteException && err.code === 404)) throw err;
  }
  let buffer: Buffer;
  try {
    // failOn "none" salvages truncated JPEGs from the source site.
    buffer = await sharp(filePath, { failOn: "none" })
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  } catch (err) {
    console.warn(`  ! foto omitida ${filePath}: ${(err as Error).message}`);
    return false;
  }
  await storage.createFile({
    bucketId: CAR_PHOTOS_BUCKET_ID,
    fileId,
    file: new File([new Uint8Array(buffer)], `${fileId}.webp`, { type: "image/webp" }),
    permissions: [Permission.read(Role.any())],
  });
  return true;
}

async function inBatches<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>) {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    results.push(...(await Promise.all(items.slice(i, i + size).map(fn))));
  }
  return results;
}

async function main() {
  const csv = await readFile(path.join(ROOT, "krediauto-carros-datos.csv"), "utf8");
  const rows: CsvRow[] = parse(csv, { columns: true, bom: true, skip_empty_lines: true });

  // Oldest listing first, so "newest" ordering by $createdAt matches the source site.
  rows.sort((a, b) => Number(a["ID"]) - Number(b["ID"]));
  const featuredIds = new Set(rows.slice(-FEATURED_COUNT).map((r) => r["ID"]));
  const report: string[] = [];

  if (process.argv.includes("--dry-run")) {
    for (const row of rows) console.log(JSON.stringify(normalize(row)));
    return;
  }

  connect();
  for (const row of rows) {
    const car = normalize(row);
    const id = row["ID"];
    const rowId = `car-${id}`;

    const exists = await tables
      .getRow({ databaseId: DATABASE_ID, tableId: CARS_TABLE_ID, rowId })
      .then(() => true)
      .catch(() => false);
    if (exists) {
      console.log(`= ${id} ${car.brand} ${car.model} (exists)`);
      continue;
    }

    const dir = path.join(ROOT, "images", id);
    // Files are named <id>_01.jpg, <id>_02.jpeg… in gallery order; 01 is the cover.
    const files = (await readdir(dir)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
    const candidates = files.map((f) => f.replace(/\.[^.]+$/, ""));
    const ok = await inBatches(
      files.map((f, i) => ({ fileId: candidates[i], filePath: path.join(dir, f) })),
      4,
      ({ fileId, filePath }) => uploadPhoto(fileId, filePath),
    );
    const photoIds = candidates.filter((_, i) => ok[i]);

    await tables.createRow({
      databaseId: DATABASE_ID,
      tableId: CARS_TABLE_ID,
      rowId,
      data: { ...car, photoIds, featured: featuredIds.has(id) },
    });
    console.log(`+ ${id} ${car.brand} ${car.model} ${car.year} (${photoIds.length} fotos)`);

    const missing = [
      !car.transmission && "transmisión",
      !car.bodyType && "tipo",
      !car.cylinders && "cilindros",
      !car.equipment.length && "equipamiento",
      !car.color && "color",
      "descripción",
    ].filter(Boolean);
    report.push(`${id}\t${car.brand} ${car.model} ${car.year}\tfalta: ${missing.join(", ")}`);
  }

  console.log("\nDatos para completar desde el panel:\n" + report.join("\n"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
