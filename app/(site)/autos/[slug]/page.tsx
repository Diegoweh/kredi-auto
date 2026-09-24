import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCarBySlug, getPublicCars } from "@/lib/cars";
import {
  bodyTypeLabel,
  carFullName,
  carName,
  fuelLabel,
  transmissionLabel,
  type Car,
} from "@/lib/car-types";
import { carPhotoUrl } from "@/lib/appwrite/config";
import { formatKm, formatNumber, formatPrice } from "@/lib/format";
import { site } from "@/lib/site";
import { carInterestMessage } from "@/lib/whatsapp";
import { ChevronLeftIcon } from "@/components/icons";
import { CarRow } from "@/components/site/car-row";
import { Gallery } from "@/components/site/gallery";
import { WhatsAppButton } from "@/components/site/whatsapp-button";

// Cache Components requires at least one param; an unknown slug just 404s.
export async function generateStaticParams() {
  const cars = await getPublicCars();
  return cars.length ? cars.map((car) => ({ slug: car.slug })) : [{ slug: "sin-autos" }];
}

export async function generateMetadata({ params }: PageProps<"/autos/[slug]">): Promise<Metadata> {
  const car = await getCarBySlug((await params).slug);
  if (!car) return {};
  const title = `${carFullName(car)} ${car.year}`;
  const description = `${title} · ${formatKm(car.mileage)} · ${formatPrice(car.price)} MXN. Disponible en ${site.city}.`;
  return {
    title,
    description,
    alternates: { canonical: `/autos/${car.slug}` },
    openGraph: {
      title,
      description,
      images: car.photoIds[0] ? [{ url: carPhotoUrl(car.photoIds[0]) }] : undefined,
    },
  };
}

export default async function CarPage({ params }: PageProps<"/autos/[slug]">) {
  const { slug } = await params;
  const [car, all] = await Promise.all([getCarBySlug(slug), getPublicCars()]);
  if (!car) notFound();

  const similar = all
    .filter((c) => c.id !== car.id && c.bodyType === car.bodyType)
    .sort((a, b) => Math.abs(a.price - car.price) - Math.abs(b.price - car.price))
    .slice(0, 3);

  const specs: [string, string | null][] = [
    ["Año", String(car.year)],
    ["Kilometraje", formatKm(car.mileage)],
    ["Transmisión", car.transmission && transmissionLabel[car.transmission]],
    ["Combustible", car.fuelType && fuelLabel[car.fuelType]],
    ["Tipo", car.bodyType && bodyTypeLabel[car.bodyType]],
    ["Color", car.color],
    ["Cilindros", car.cylinders ? String(car.cylinders) : null],
    ["Ubicación", car.city],
  ];

  const message = carInterestMessage(car);
  const name = `${carFullName(car)} ${car.year}`;

  return (
    <article className="mx-auto max-w-6xl px-4 pt-4 pb-28 sm:px-6 sm:pt-8 lg:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(car)).replace(/</g, "\\u003c") }}
      />

      <Link
        href="/autos"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-ink sm:mb-6"
      >
        <ChevronLeftIcon width={16} height={16} />
        Todos los autos
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.45fr_1fr] lg:gap-14">
        {/* min-w-0: the gallery's scroll track must not widen its grid column */}
        <div className="min-w-0">
          <Gallery photos={car.photoIds.map(carPhotoUrl)} alt={name} />
        </div>

        <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <p className="text-sm font-semibold tracking-[0.12em] text-muted uppercase">{car.brand}</p>
          <h1 className="mt-1 text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl">
            {car.model} {car.version && <span className="font-semibold text-muted">{car.version}</span>}
          </h1>
          <p className="mt-2 text-muted">
            {car.year} · {formatKm(car.mileage)}
            {car.transmission && ` · ${transmissionLabel[car.transmission]}`}
          </p>

          <div className="mt-6 flex items-center gap-3">
            <p className="text-4xl font-extrabold tracking-tight tabular-nums">
              {formatPrice(car.price)}
              <span className="ml-1.5 text-base font-semibold text-muted">MXN</span>
            </p>
            {car.status === "apartado" && (
              <span className="rounded-full bg-paper px-3 py-1 text-sm font-semibold">Apartado</span>
            )}
          </div>

          {/* Desktop only; mobile uses the sticky bar below */}
          <div className="mt-6 hidden lg:block">
            <WhatsAppButton message={message} className="w-full">
              Me interesa
            </WhatsAppButton>
            <p className="mt-3 text-center text-sm text-muted">Te respondemos por WhatsApp · {site.phoneDisplay}</p>
          </div>

          <dl className="mt-8 grid grid-cols-2 border-t border-line">
            {specs
              .filter((s): s is [string, string] => Boolean(s[1]))
              .map(([label, value]) => (
                <div key={label} className="border-b border-line py-3.5 odd:pr-4 even:border-l even:pl-4">
                  <dt className="text-xs font-medium text-muted">{label}</dt>
                  <dd className="mt-0.5 font-semibold">{value}</dd>
                </div>
              ))}
          </dl>
        </div>
      </div>

      {(car.description || car.equipment.length > 0) && (
        <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-[1.45fr_1fr] lg:gap-14">
          <div className="space-y-12">
            {car.description && (
              <section>
                <h2 className="text-xl font-bold tracking-tight">Descripción</h2>
                <p className="mt-3 leading-relaxed whitespace-pre-line text-muted">{car.description}</p>
              </section>
            )}
            {car.equipment.length > 0 && (
              <section>
                <h2 className="text-xl font-bold tracking-tight">Equipamiento</h2>
                <ul className="mt-4 grid gap-x-8 sm:grid-cols-2">
                  {car.equipment.map((item) => (
                    <li key={item} className="flex items-center gap-3 border-b border-line py-3">
                      <span className="size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      )}

      {similar.length > 0 && (
        <section className="mt-16 border-t border-line pt-10 lg:mt-24" aria-labelledby="similares">
          <h2 id="similares" className="text-2xl font-bold tracking-tight">
            También te puede interesar
          </h2>
          <ul className="mt-2 divide-y divide-line">
            {similar.map((c) => (
              <CarRow key={c.id} car={c} />
            ))}
          </ul>
        </section>
      )}

      {/* Mobile: sticky contact bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <div className="flex items-center gap-4">
          <div className="min-w-0">
            <p className="truncate text-xs text-muted">{carName(car)}</p>
            <p className="font-bold tabular-nums">{formatPrice(car.price)}</p>
          </div>
          <WhatsAppButton message={message} className="ml-auto flex-1 py-3">
            Me interesa
          </WhatsAppButton>
        </div>
      </div>
    </article>
  );
}

function jsonLd(car: Car) {
  return {
    "@context": "https://schema.org",
    "@type": "Car",
    name: `${carFullName(car)} ${car.year}`,
    brand: { "@type": "Brand", name: car.brand },
    model: car.model,
    vehicleModelDate: String(car.year),
    mileageFromOdometer: { "@type": "QuantitativeValue", value: car.mileage, unitCode: "KMT" },
    image: car.photoIds.slice(0, 5).map(carPhotoUrl),
    url: `${site.url}/autos/${car.slug}`,
    offers: {
      "@type": "Offer",
      price: car.price,
      priceCurrency: "MXN",
      availability: car.status === "disponible" ? "https://schema.org/InStock" : "https://schema.org/LimitedAvailability",
      itemCondition: "https://schema.org/UsedCondition",
    },
    ...(car.transmission && {
      vehicleTransmission: transmissionLabel[car.transmission],
    }),
    ...(car.color && { color: car.color }),
    description: car.description ?? `${formatNumber(car.mileage)} km. Disponible en ${site.city}.`,
  };
}
