// Shared car types and labels. Safe to import from client components.

export const TRANSMISSIONS = ["automatica", "manual"] as const;
export const FUEL_TYPES = ["gasolina", "diesel", "hibrido", "electrico"] as const;
export const BODY_TYPES = ["suv", "sedan", "hatchback", "pickup", "coupe", "minivan"] as const;
export const CAR_STATUSES = ["disponible", "apartado", "vendido"] as const;
export const SELL_REQUEST_STATUSES = ["nuevo", "contactado", "descartado"] as const;

export type Transmission = (typeof TRANSMISSIONS)[number];
export type FuelType = (typeof FUEL_TYPES)[number];
export type BodyType = (typeof BODY_TYPES)[number];
export type CarStatus = (typeof CAR_STATUSES)[number];
export type SellRequestStatus = (typeof SELL_REQUEST_STATUSES)[number];

export const transmissionLabel: Record<Transmission, string> = {
  automatica: "Automática",
  manual: "Manual",
};

export const fuelLabel: Record<FuelType, string> = {
  gasolina: "Gasolina",
  diesel: "Diésel",
  hibrido: "Híbrido",
  electrico: "Eléctrico",
};

export const bodyTypeLabel: Record<BodyType, string> = {
  suv: "SUV",
  sedan: "Sedán",
  hatchback: "Hatchback",
  pickup: "Pickup",
  coupe: "Coupé",
  minivan: "Minivan",
};

export const statusLabel: Record<CarStatus, string> = {
  disponible: "Disponible",
  apartado: "Apartado",
  vendido: "Vendido",
};

export const sellRequestStatusLabel: Record<SellRequestStatus, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  descartado: "Descartado",
};

export const SORTS = {
  recientes: "Más recientes",
  "precio-asc": "Precio: menor a mayor",
  "precio-desc": "Precio: mayor a menor",
  "km-asc": "Menor kilometraje",
} as const;
export type Sort = keyof typeof SORTS;

export interface Car {
  id: string;
  slug: string;
  brand: string;
  model: string;
  version: string | null;
  year: number;
  price: number;
  mileage: number;
  transmission: Transmission | null;
  fuelType: FuelType | null;
  bodyType: BodyType | null;
  color: string | null;
  cylinders: number | null;
  description: string | null;
  equipment: string[];
  photoIds: string[];
  featured: boolean;
  status: CarStatus;
  city: string | null;
  createdAt: string;
}

export interface SellRequest {
  id: string;
  name: string;
  phone: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  askingPrice: number;
  photoIds: string[];
  status: SellRequestStatus;
  adminNotes: string | null;
  createdAt: string;
}

export const carName = (car: Pick<Car, "brand" | "model">) => `${car.brand} ${car.model}`;

export const carFullName = (car: Pick<Car, "brand" | "model" | "version">) =>
  [car.brand, car.model, car.version].filter(Boolean).join(" ");

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
