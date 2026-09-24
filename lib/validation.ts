import { z } from "zod";
import { BODY_TYPES, CAR_STATUSES, FUEL_TYPES, TRANSMISSIONS } from "./car-types";

const currentYear = new Date().getFullYear();

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => v || null);

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z
    .union([z.enum(values), z.literal("")])
    .transform((v) => (v === "" ? null : v));

const intFrom = (label: string, min: number, max: number) =>
  z.coerce
    .number({ error: `${label} no es válido` })
    .int(`${label} no es válido`)
    .min(min, `${label} no es válido`)
    .max(max, `${label} no es válido`);

export const carSchema = z.object({
  brand: z.string().trim().min(1, "Escribe la marca").max(40),
  model: z.string().trim().min(1, "Escribe el modelo").max(60),
  version: optionalText(60),
  year: intFrom("El año", 1950, currentYear + 1),
  price: intFrom("El precio", 1, 50_000_000),
  mileage: intFrom("El kilometraje", 0, 2_000_000),
  transmission: optionalEnum(TRANSMISSIONS),
  fuelType: optionalEnum(FUEL_TYPES),
  bodyType: optionalEnum(BODY_TYPES),
  color: optionalText(30),
  cylinders: z
    .union([z.literal(""), z.coerce.number().int().min(1).max(16)])
    .transform((v) => (v === "" ? null : v)),
  description: optionalText(5000),
  equipment: z
    .string()
    .transform((v) => v.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 60)),
  photoIds: z
    .string()
    .transform((v, ctx) => {
      try {
        const ids = JSON.parse(v);
        if (Array.isArray(ids) && ids.every((id) => typeof id === "string")) return ids as string[];
      } catch {}
      ctx.addIssue({ code: "custom", message: "Fotos inválidas" });
      return z.NEVER;
    }),
  featured: z.literal("on").optional().transform(Boolean),
  status: z.enum(CAR_STATUSES),
  city: optionalText(60),
});

export type CarInput = z.infer<typeof carSchema>;

export const sellSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[\d\s()+-]{10,20}$/, "Escribe un teléfono de 10 dígitos"),
  brand: z.string().trim().min(1, "Escribe la marca").max(40),
  model: z.string().trim().min(1, "Escribe el modelo").max(60),
  year: intFrom("El año", 1950, currentYear + 1),
  mileage: intFrom("El kilometraje", 0, 2_000_000),
  askingPrice: intFrom("El precio", 1, 50_000_000),
});

export const MAX_SELL_PHOTOS = 8;
export const MAX_PHOTO_BYTES = 1.5 * 1024 * 1024;

export type FieldErrors = Partial<Record<string, string>>;

export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
