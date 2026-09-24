import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { Query, type Models } from "node-appwrite";
import { createAdminClient } from "./appwrite/server";
import {
  CARS_TABLE_ID,
  DATABASE_ID,
  SELL_REQUESTS_TABLE_ID,
  isAppwriteConfigured,
} from "./appwrite/config";
import {
  TRANSMISSIONS,
  BODY_TYPES,
  SORTS,
  type BodyType,
  type Car,
  type SellRequest,
  type Sort,
  type Transmission,
} from "./car-types";

export const CARS_TAG = "cars";

type Row = Models.DefaultRow;

function toCar(row: Row): Car {
  return {
    id: row.$id,
    slug: row.slug,
    brand: row.brand,
    model: row.model,
    version: row.version ?? null,
    year: row.year,
    price: row.price,
    mileage: row.mileage,
    transmission: row.transmission ?? null,
    fuelType: row.fuelType ?? null,
    bodyType: row.bodyType ?? null,
    color: row.color ?? null,
    cylinders: row.cylinders ?? null,
    description: row.description ?? null,
    equipment: row.equipment ?? [],
    photoIds: row.photoIds ?? [],
    featured: Boolean(row.featured),
    status: row.status,
    city: row.city ?? null,
    createdAt: row.$createdAt,
  };
}

function toSellRequest(row: Row): SellRequest {
  return {
    id: row.$id,
    name: row.name,
    phone: row.phone,
    brand: row.brand,
    model: row.model,
    year: row.year,
    mileage: row.mileage,
    askingPrice: row.askingPrice,
    photoIds: row.photoIds ?? [],
    status: row.status,
    adminNotes: row.adminNotes ?? null,
    createdAt: row.$createdAt,
  };
}

/** Reads every row matching `queries`, following cursors past the page limit. */
async function listAll(tableId: string, queries: string[]) {
  const { tables } = createAdminClient();
  const rows: Row[] = [];
  let cursor: string | undefined;
  while (true) {
    const page = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId,
      queries: [...queries, Query.limit(100), ...(cursor ? [Query.cursorAfter(cursor)] : [])],
    });
    rows.push(...page.rows);
    if (page.rows.length < 100) return rows;
    cursor = page.rows[page.rows.length - 1].$id;
  }
}

// ---------- Public (cached) ----------

/** All cars that are not sold, newest first. Invalidated with updateTag(CARS_TAG). */
export async function getPublicCars(): Promise<Car[]> {
  "use cache";
  cacheTag(CARS_TAG);
  cacheLife("days");
  if (!isAppwriteConfigured) {
    console.warn("[cars] Appwrite is not configured; returning no cars.");
    return [];
  }
  const rows = await listAll(CARS_TABLE_ID, [
    Query.notEqual("status", "vendido"),
    Query.orderDesc("$createdAt"),
  ]);
  return rows.map(toCar);
}

export async function getCarBySlug(slug: string) {
  const cars = await getPublicCars();
  return cars.find((car) => car.slug === slug) ?? null;
}

export async function getFeaturedCars(limit = 6) {
  const cars = await getPublicCars();
  const featured = cars.filter((car) => car.featured && car.status === "disponible");
  return (featured.length ? featured : cars).slice(0, limit);
}

// ---------- Filtering ----------

export interface CarFilters {
  marca?: string;
  tipo?: BodyType;
  transmision?: Transmission;
  precioMin?: number;
  precioMax?: number;
  anioMin?: number;
  anioMax?: number;
  orden: Sort;
}

type SearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
const int = (v: string | string[] | undefined) => {
  const n = Number.parseInt(first(v) ?? "", 10);
  return Number.isFinite(n) ? n : undefined;
};
const oneOf = <T extends string>(list: readonly T[], v: string | undefined) =>
  list.includes(v as T) ? (v as T) : undefined;

export function parseFilters(sp: SearchParams): CarFilters {
  const orden = first(sp.orden);
  return {
    marca: first(sp.marca),
    tipo: oneOf(BODY_TYPES, first(sp.tipo)),
    transmision: oneOf(TRANSMISSIONS, first(sp.transmision)),
    precioMin: int(sp.precioMin),
    precioMax: int(sp.precioMax),
    anioMin: int(sp.anioMin),
    anioMax: int(sp.anioMax),
    orden: orden && orden in SORTS ? (orden as Sort) : "recientes",
  };
}

export function filterCars(cars: Car[], f: CarFilters) {
  const result = cars.filter(
    (car) =>
      (!f.marca || car.brand === f.marca) &&
      (!f.tipo || car.bodyType === f.tipo) &&
      (!f.transmision || car.transmission === f.transmision) &&
      (f.precioMin === undefined || car.price >= f.precioMin) &&
      (f.precioMax === undefined || car.price <= f.precioMax) &&
      (f.anioMin === undefined || car.year >= f.anioMin) &&
      (f.anioMax === undefined || car.year <= f.anioMax),
  );
  const sorters: Record<Sort, ((a: Car, b: Car) => number) | null> = {
    recientes: null,
    "precio-asc": (a, b) => a.price - b.price,
    "precio-desc": (a, b) => b.price - a.price,
    "km-asc": (a, b) => a.mileage - b.mileage,
  };
  const sorter = sorters[f.orden];
  return sorter ? result.sort(sorter) : result;
}

/** Values available in the filter dropdowns, derived from current inventory. */
export function getFilterOptions(cars: Car[]) {
  const brands = [...new Set(cars.map((c) => c.brand))].sort((a, b) => a.localeCompare(b, "es"));
  const years = [...new Set(cars.map((c) => c.year))].sort((a, b) => b - a);
  const bodyTypes = BODY_TYPES.filter((t) => cars.some((c) => c.bodyType === t));
  return { brands, years, bodyTypes };
}

// ---------- Admin (uncached) ----------

export async function getAllCarsAdmin() {
  const rows = await listAll(CARS_TABLE_ID, [Query.orderDesc("$createdAt")]);
  return rows.map(toCar);
}

export async function getCarByIdAdmin(id: string) {
  const { tables } = createAdminClient();
  try {
    return toCar(await tables.getRow({ databaseId: DATABASE_ID, tableId: CARS_TABLE_ID, rowId: id }));
  } catch {
    return null;
  }
}

export async function getSellRequests() {
  const rows = await listAll(SELL_REQUESTS_TABLE_ID, [Query.orderDesc("$createdAt")]);
  return rows.map(toSellRequest);
}
