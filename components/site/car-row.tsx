import Link from "next/link";
import { carName, transmissionLabel, type Car } from "@/lib/car-types";
import { formatKm, formatPrice } from "@/lib/format";
import { CarPhoto } from "./car-photo";

export function CarRow({ car, preload }: { car: Car; preload?: boolean }) {
  const meta = [car.year, formatKm(car.mileage), car.transmission && transmissionLabel[car.transmission]]
    .filter(Boolean)
    .join(" · ");

  return (
    <li>
      <Link
        href={`/autos/${car.slug}`}
        className="group grid grid-cols-[40%_1fr] items-center gap-4 py-5 sm:grid-cols-[15rem_1fr_auto] sm:gap-8 sm:py-6"
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-paper">
          <CarPhoto
            fileId={car.photoIds[0]}
            alt={`${carName(car)} ${car.year}`}
            sizes="(min-width: 640px) 240px, 40vw"
            preload={preload}
            className="transition-transform duration-500 group-hover:scale-[1.03]"
          />
          {car.status === "apartado" && (
            <span className="absolute top-2 left-2 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-ink">
              Apartado
            </span>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.12em] text-muted uppercase">{car.brand}</p>
          <h3 className="mt-0.5 truncate text-lg leading-snug font-semibold tracking-tight group-hover:text-brand-600 sm:text-xl">
            {car.model}
            {car.version && <span className="font-normal text-muted"> {car.version}</span>}
          </h3>
          <p className="mt-1 text-sm text-muted">{meta}</p>
          <p className="mt-2 text-lg font-bold tabular-nums sm:hidden">{formatPrice(car.price)}</p>
        </div>

        <div className="hidden text-right sm:block">
          <p className="text-2xl font-bold tracking-tight tabular-nums">{formatPrice(car.price)}</p>
          <p className="mt-1 text-sm font-medium text-brand-600 opacity-0 transition-opacity group-hover:opacity-100">
            Ver detalles →
          </p>
        </div>
      </Link>
    </li>
  );
}
