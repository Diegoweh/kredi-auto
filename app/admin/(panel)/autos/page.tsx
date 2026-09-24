import Link from "next/link";
import { requireAdmin } from "@/lib/appwrite/server";
import { getAllCarsAdmin } from "@/lib/cars";
import { carName, statusLabel } from "@/lib/car-types";
import { formatKm, formatPrice } from "@/lib/format";
import { deleteCar } from "@/app/actions/cars";
import { CarPhoto } from "@/components/site/car-photo";
import { ConfirmButton } from "@/components/admin/confirm-button";

export const metadata = { title: "Autos" };

const statusStyle = {
  disponible: "bg-accent/15 text-accent-600",
  apartado: "bg-amber-100 text-amber-800",
  vendido: "bg-line text-muted",
} as const;

export default async function AdminCarsPage() {
  await requireAdmin();
  const cars = await getAllCarsAdmin();

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Autos</h1>
          <p className="text-sm text-muted">{cars.length} en total</p>
        </div>
        <Link
          href="/admin/autos/nuevo"
          className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          + Agregar auto
        </Link>
      </div>

      <ul className="mt-6 divide-y divide-line rounded-xl border border-line bg-white">
        {cars.map((car) => (
          <li key={car.id} className="flex items-center gap-4 p-3 sm:p-4">
            <div className="relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-md bg-paper sm:w-28">
              <CarPhoto fileId={car.photoIds[0]} alt="" sizes="112px" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">
                {car.featured && (
                  <span className="mr-1 text-brand" title="Destacado">
                    ★
                  </span>
                )}
                {carName(car)} {car.version && <span className="font-normal text-muted">{car.version}</span>}
              </p>
              <p className="text-sm text-muted">
                {car.year} · {formatKm(car.mileage)} · <span className="font-semibold text-ink">{formatPrice(car.price)}</span>
              </p>
              <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyle[car.status]}`}>
                {statusLabel[car.status]}
              </span>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1 text-sm font-semibold sm:flex-row sm:gap-5">
              <Link href={`/admin/autos/${car.id}`} className="text-brand-600 hover:underline">
                Editar
              </Link>
              {car.status !== "vendido" && (
                <Link href={`/autos/${car.slug}`} target="_blank" className="hidden text-muted hover:text-ink sm:inline">
                  Ver
                </Link>
              )}
              <ConfirmButton
                action={deleteCar.bind(null, car.id)}
                confirmText={`¿Eliminar ${carName(car)} ${car.year}? También se borrarán sus fotos.`}
                className="text-red-600 hover:underline"
              >
                Eliminar
              </ConfirmButton>
            </div>
          </li>
        ))}
        {cars.length === 0 && <li className="p-8 text-center text-muted">Todavía no hay autos.</li>}
      </ul>
    </>
  );
}
