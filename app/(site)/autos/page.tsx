import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { filterCars, getFilterOptions, getPublicCars, parseFilters } from "@/lib/cars";
import { CarFilters } from "@/components/site/car-filters";
import { CarRow } from "@/components/site/car-row";
import { WhatsAppButton } from "@/components/site/whatsapp-button";

export const metadata: Metadata = {
  title: "Autos seminuevos en venta",
  description: "Inventario de autos seminuevos en Mazatlán. Filtra por marca, precio, año y transmisión.",
};

export default function CarsPage({ searchParams }: PageProps<"/autos">) {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 lg:pt-14">
      <header className="mb-8 lg:mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Autos en venta</h1>
        <p className="mt-3 text-muted">Seminuevos disponibles en Mazatlán.</p>
      </header>
      <Suspense fallback={<ResultsSkeleton />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Results({ searchParams }: { searchParams: PageProps<"/autos">["searchParams"] }) {
  const [sp, all] = await Promise.all([searchParams, getPublicCars()]);
  const filters = parseFilters(sp);
  const cars = filterCars(all, filters);

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_1fr] lg:gap-14">
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <CarFilters values={filters} options={getFilterOptions(all)} total={cars.length} />
      </aside>

      <section aria-label="Resultados">
        <p className="hidden border-b border-line pb-4 text-sm text-muted lg:block" aria-live="polite">
          {cars.length} {cars.length === 1 ? "auto" : "autos"}
        </p>
        {cars.length > 0 ? (
          <ul className="divide-y divide-line">
            {cars.map((car, i) => (
              <CarRow key={car.id} car={car} preload={i < 2} />
            ))}
          </ul>
        ) : (
          <div className="py-16">
            <p className="text-xl font-semibold">No encontramos autos con esos filtros.</p>
            <p className="mt-2 text-muted">Prueba con otros filtros o dinos qué buscas y te avisamos.</p>
            <div className="mt-6 flex flex-wrap items-center gap-6">
              <WhatsAppButton message="Hola, estoy buscando un auto y no lo encontré en su página. ¿Me pueden ayudar?">
                Pregúntanos
              </WhatsAppButton>
              <Link href="/autos" className="font-semibold text-brand-600 hover:underline">
                Limpiar filtros
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_1fr] lg:gap-14" aria-hidden>
      <div className="hidden space-y-4 lg:block">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-paper" />
        ))}
      </div>
      <ul className="divide-y divide-line">
        {Array.from({ length: 5 }, (_, i) => (
          <li key={i} className="grid grid-cols-[40%_1fr] gap-4 py-5 sm:grid-cols-[15rem_1fr] sm:gap-8">
            <div className="aspect-[4/3] animate-pulse rounded-lg bg-paper" />
            <div className="space-y-3 pt-2">
              <div className="h-3 w-16 animate-pulse rounded bg-paper" />
              <div className="h-5 w-40 animate-pulse rounded bg-paper" />
              <div className="h-4 w-28 animate-pulse rounded bg-paper" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
