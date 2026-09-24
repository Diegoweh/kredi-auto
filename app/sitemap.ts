import type { MetadataRoute } from "next";
import { getPublicCars } from "@/lib/cars";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cars = await getPublicCars();
  return [
    ...["", "/autos", "/vende-tu-auto", "/contacto"].map((path) => ({ url: `${site.url}${path}` })),
    ...cars.map((car) => ({ url: `${site.url}/autos/${car.slug}`, lastModified: car.createdAt })),
  ];
}
