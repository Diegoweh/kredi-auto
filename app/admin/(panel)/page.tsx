import Link from "next/link";
import { requireAdmin } from "@/lib/appwrite/server";
import { getAllCarsAdmin, getSellRequests } from "@/lib/cars";
import { formatDate, formatPrice } from "@/lib/format";

export const metadata = { title: "Resumen" };

export default async function AdminDashboard() {
  const user = await requireAdmin();
  const [cars, requests] = await Promise.all([getAllCarsAdmin(), getSellRequests()]);

  const count = (status: string) => cars.filter((c) => c.status === status).length;
  const newRequests = requests.filter((r) => r.status === "nuevo");
  const inventoryValue = cars.filter((c) => c.status !== "vendido").reduce((sum, c) => sum + c.price, 0);

  const stats = [
    { label: "Disponibles", value: count("disponible"), href: "/admin/autos?estado=disponible" },
    { label: "Apartados", value: count("apartado"), href: "/admin/autos?estado=apartado" },
    { label: "Vendidos", value: count("vendido"), href: "/admin/autos?estado=vendido" },
    { label: "Solicitudes nuevas", value: newRequests.length, href: "/admin/solicitudes", highlight: newRequests.length > 0 },
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hola{user.name ? `, ${user.name}` : ""}</h1>
          <p className="text-sm text-muted">Valor del inventario en venta: {formatPrice(inventoryValue)} MXN</p>
        </div>
        <Link
          href="/admin/autos/nuevo"
          className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          + Agregar auto
        </Link>
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <li key={s.label}>
            <Link
              href={s.href}
              className={`block rounded-xl border bg-white p-4 transition-colors hover:border-brand sm:p-5 ${
                s.highlight ? "border-brand" : "border-line"
              }`}
            >
              <p className="text-sm text-muted">{s.label}</p>
              <p className="mt-1 text-3xl font-bold tabular-nums">{s.value}</p>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Últimas solicitudes de venta</h2>
          <Link href="/admin/solicitudes" className="text-sm font-semibold text-brand-600 hover:underline">
            Ver todas
          </Link>
        </div>
        <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-white">
          {requests.slice(0, 5).map((r) => (
            <li key={r.id}>
              <Link
                href={`/admin/solicitudes#${r.id}`}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 p-4 hover:bg-paper"
              >
                <span className="font-semibold">
                  {r.brand} {r.model} {r.year}
                  {r.status === "nuevo" && (
                    <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700">Nueva</span>
                  )}
                </span>
                <span className="text-sm text-muted">
                  {r.name} · {formatPrice(r.askingPrice)} · {formatDate(r.createdAt)}
                </span>
              </Link>
            </li>
          ))}
          {requests.length === 0 && <li className="p-6 text-center text-sm text-muted">Todavía no hay solicitudes.</li>}
        </ul>
      </section>
    </>
  );
}
