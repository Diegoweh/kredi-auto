import Link from "next/link";
import { requireAdmin } from "@/lib/appwrite/server";
import { getAllCarsAdmin } from "@/lib/cars";
import { CAR_STATUSES, carFullName, carName, statusLabel, type CarStatus } from "@/lib/car-types";
import { formatKm, formatPrice } from "@/lib/format";
import { deleteCar } from "@/app/actions/cars";
import { CarPhoto } from "@/components/site/car-photo";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { StatusSelect } from "@/components/admin/status-select";

export const metadata = { title: "Autos" };

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

export default async function AdminCarsPage({ searchParams }: PageProps<"/admin/autos">) {
  await requireAdmin();
  const [sp, cars] = await Promise.all([searchParams, getAllCarsAdmin()]);
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const estado = CAR_STATUSES.includes(sp.estado as CarStatus) ? (sp.estado as CarStatus) : undefined;

  const counts = Object.fromEntries(CAR_STATUSES.map((s) => [s, cars.filter((c) => c.status === s).length]));
  const terms = normalize(q).split(/\s+/).filter(Boolean);
  const shown = cars.filter(
    (car) =>
      (!estado || car.status === estado) &&
      terms.every((t) => normalize(`${carFullName(car)} ${car.year}`).includes(t)),
  );

  const tabHref = (s?: CarStatus) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (s) params.set("estado", s);
    const qs = params.toString();
    return qs ? `/admin/autos?${qs}` : "/admin/autos";
  };

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

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav aria-label="Filtrar por estado" className="scrollbar-none flex gap-1 overflow-x-auto">
          {[undefined, ...CAR_STATUSES].map((s) => (
            <Link
              key={s ?? "todos"}
              href={tabHref(s)}
              aria-current={estado === s ? "page" : undefined}
              className="shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold text-muted hover:text-ink aria-[current=page]:bg-ink aria-[current=page]:text-white"
            >
              {s ? statusLabel[s] : "Todos"}{" "}
              <span className="font-normal opacity-70">{s ? counts[s] : cars.length}</span>
            </Link>
          ))}
        </nav>
        <form action="/admin/autos" className="flex gap-2 sm:w-72">
          {estado && <input type="hidden" name="estado" value={estado} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Buscar marca, modelo, año…"
            aria-label="Buscar autos"
            className="field py-2"
          />
        </form>
      </div>

      <ul className="mt-4 divide-y divide-line rounded-xl border border-line bg-white">
        {shown.map((car) => (
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
                {car.year} · {formatKm(car.mileage)} ·{" "}
                <span className="font-semibold text-ink">{formatPrice(car.price)}</span>
              </p>
              <div className="mt-1.5">
                <StatusSelect id={car.id} status={car.status} />
              </div>
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
                confirmText={`¿Eliminar ${carName(car)} ${car.year}? También se borrarán sus fotos. Esta acción no se puede deshacer.`}
                className="text-red-600 hover:underline"
              >
                Eliminar
              </ConfirmButton>
            </div>
          </li>
        ))}
        {shown.length === 0 && (
          <li className="p-8 text-center text-muted">
            {cars.length === 0 ? "Todavía no hay autos." : "Ningún auto coincide con la búsqueda."}
          </li>
        )}
      </ul>
    </>
  );
}
