// Brands shown in the home "Marcas" section, in display order.
// `name` must match `Car.brand` exactly so the link filters /autos correctly.

export const BRAND_LOGOS = [
  { name: "Nissan", logo: "nissan.svg" },
  { name: "Chevrolet", logo: "chevrolet.png" },
  { name: "Toyota", logo: "toyota.svg" },
  { name: "Volkswagen", logo: "volkswagen.png" },
  { name: "Honda", logo: "honda.svg" },
  { name: "Mazda", logo: "mazda.svg" },
  { name: "Kia", logo: "kia.svg" },
  { name: "Hyundai", logo: "hyundai.svg" },
  { name: "Ford", logo: "ford.png" },
  { name: "Jeep", logo: "jeep.svg" },
  { name: "Dodge", logo: "dodge.png" },
  { name: "RAM", logo: "ram.png" },
  { name: "Chrysler", logo: "chrysler.png" },
  { name: "GMC", logo: "gmc.svg" },
  { name: "Mitsubishi", logo: "mitsubishi.svg" },
  { name: "Renault", logo: "renault.svg" },
  { name: "Peugeot", logo: "peugeot.svg" },
  { name: "Fiat", logo: "fiat.png" },
  { name: "MG", logo: "mg.png" },
  { name: "Audi", logo: "audi.png" },
  { name: "Mercedes-Benz", logo: "mercedes-benz.png" },
] as const;

export const brandLogoSrc = (file: string) => `/logos-kredi-auto/${file}`;

export const brandHref = (name: string) => `/autos?marca=${encodeURIComponent(name)}`;
