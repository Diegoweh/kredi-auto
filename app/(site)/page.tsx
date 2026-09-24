import Link from "next/link";
import { getFeaturedCars, getPublicCars } from "@/lib/cars";
import { carName, type Car } from "@/lib/car-types";
import { formatKm, formatPrice } from "@/lib/format";
import { ArrowRightIcon } from "@/components/icons";
import { CarPhoto } from "@/components/site/car-photo";
import { WhatsAppButton } from "@/components/site/whatsapp-button";

const reasons = [
  {
    title: "Autos revisados",
    text: "Revisamos cada auto y su documentación antes de ponerlo a la venta.",
  },
  {
    title: "Opciones de crédito",
    text: "Te orientamos para encontrar el plan de financiamiento que mejor te acomode.",
  },
  {
    title: "Trato directo",
    text: "Hablas con nosotros por WhatsApp, sin intermediarios y con respuesta rápida.",
  },
  {
    title: "Recibimos tu auto",
    text: "¿Quieres vender o cambiar tu auto? Mándanos sus datos y te hacemos una oferta.",
  },
];

export default async function HomePage() {
  const [cars, featured] = await Promise.all([getPublicCars(), getFeaturedCars(6)]);
  const hero = featured[0];

  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-10 pb-16 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:pt-20 lg:pb-24">
        <div className="animate-rise">
          <p className="flex items-center gap-3 text-sm font-semibold text-brand-600">
            <span className="h-0.5 w-8 rounded-full brand-rule" aria-hidden />
            Seminuevos en Mazatlán
          </p>
          <h1 className="mt-5 text-[2.6rem] leading-[1.05] font-extrabold tracking-tight text-balance sm:text-6xl">
            Tu próximo auto, sin complicaciones.
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
            Elige entre {cars.length > 0 ? `${cars.length} autos` : "nuestros autos"} disponibles, pregunta
            por WhatsApp y agenda tu visita.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link
              href="/autos"
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Ver inventario
              <ArrowRightIcon width={18} height={18} />
            </Link>
            <Link href="/vende-tu-auto" className="font-semibold text-ink underline-offset-4 hover:underline">
              Vende tu auto
            </Link>
          </div>
        </div>

        {hero && (
          <Link
            href={`/autos/${hero.slug}`}
            className="group animate-rise [animation-delay:120ms]"
            aria-label={`${carName(hero)} ${hero.year}, ${formatPrice(hero.price)}`}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-paper">
              <CarPhoto
                fileId={hero.photoIds[0]}
                alt={`${carName(hero)} ${hero.year}`}
                sizes="(min-width: 1024px) 560px, 100vw"
                preload
                className="transition-transform duration-700 group-hover:scale-[1.02]"
              />
            </div>
            <div className="mt-4 flex items-baseline justify-between gap-4 border-b border-line pb-4">
              <p className="font-semibold">
                {carName(hero)} <span className="font-normal text-muted">{hero.year}</span>
              </p>
              <p className="font-bold tabular-nums">{formatPrice(hero.price)}</p>
            </div>
          </Link>
        )}
      </section>

      {/* Featured */}
      {featured.length > 1 && (
        <section className="border-t border-line py-16 sm:py-20" aria-labelledby="destacados">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex items-end justify-between gap-4">
              <h2 id="destacados" className="text-3xl font-bold tracking-tight sm:text-4xl">
                Recién llegados
              </h2>
              <Link href="/autos" className="shrink-0 font-semibold text-brand-600 hover:underline">
                Ver todos
              </Link>
            </div>
          </div>
          <ul className="scrollbar-none mx-auto mt-8 flex max-w-6xl snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto px-4 pb-2 sm:scroll-px-6 sm:px-6 lg:grid lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12 lg:overflow-visible">
            {featured.slice(1).map((car) => (
              <FeaturedItem key={car.id} car={car} />
            ))}
          </ul>
        </section>
      )}

      {/* Why us */}
      <section className="bg-paper py-16 sm:py-24" aria-labelledby="por-que">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <div>
            <h2 id="por-que" className="text-3xl font-bold tracking-tight sm:text-4xl">
              ¿Por qué comprar con nosotros?
            </h2>
            <p className="mt-4 max-w-sm leading-relaxed text-muted">
              Somos una agencia local en Mazatlán. Queremos que salgas contento con tu auto y que regreses por el
              siguiente.
            </p>
          </div>
          <ol className="grid gap-x-12 sm:grid-cols-2">
            {reasons.map((r, i) => (
              <li key={r.title} className="border-t border-line py-6">
                <span className="text-sm font-bold text-brand tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 text-lg font-semibold">{r.title}</h3>
                <p className="mt-1.5 leading-relaxed text-muted">{r.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <div className="flex flex-col items-start gap-6 border-b border-line pb-16 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">¿Buscas algo en particular?</h2>
            <p className="mt-3 max-w-md text-muted">
              Cuéntanos qué auto necesitas y tu presupuesto. Te avisamos cuando tengamos uno para ti.
            </p>
          </div>
          <WhatsAppButton message="Hola, estoy buscando un auto. ¿Me pueden ayudar?">Escríbenos</WhatsAppButton>
        </div>
      </section>
    </>
  );
}

function FeaturedItem({ car }: { car: Car }) {
  return (
    <li className="w-[78%] shrink-0 snap-start sm:w-[45%] lg:w-auto">
      <Link href={`/autos/${car.slug}`} className="group block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-paper">
          <CarPhoto
            fileId={car.photoIds[0]}
            alt={`${carName(car)} ${car.year}`}
            sizes="(min-width: 1024px) 360px, 78vw"
            className="transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <p className="mt-4 text-xs font-semibold tracking-[0.12em] text-muted uppercase">{car.brand}</p>
        <h3 className="mt-0.5 text-lg font-semibold tracking-tight group-hover:text-brand-600">
          {car.model} {car.version && <span className="font-normal text-muted">{car.version}</span>}
        </h3>
        <p className="mt-1 flex justify-between gap-3 text-sm text-muted">
          <span>
            {car.year} · {formatKm(car.mileage)}
          </span>
          <span className="font-bold text-ink tabular-nums">{formatPrice(car.price)}</span>
        </p>
      </Link>
    </li>
  );
}
