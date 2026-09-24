import { requireAdmin } from "@/lib/appwrite/server";
import { getSellRequests } from "@/lib/cars";
import { SELL_REQUEST_STATUSES, sellRequestStatusLabel } from "@/lib/car-types";
import { formatDate, formatKm, formatPrice } from "@/lib/format";
import { whatsappLink } from "@/lib/whatsapp";
import { deleteSellRequest, updateSellRequest } from "@/app/actions/sell-requests";
import { ConfirmButton } from "@/components/admin/confirm-button";

export const metadata = { title: "Solicitudes de venta" };

/** "669 123 4567" → "526691234567" for wa.me links (assumes Mexican numbers). */
function waNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `52${digits}` : digits;
}

export default async function SellRequestsPage() {
  await requireAdmin();
  const requests = await getSellRequests();
  const pending = requests.filter((r) => r.status === "nuevo").length;

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Solicitudes de venta</h1>
      <p className="text-sm text-muted">
        {requests.length} en total · {pending} {pending === 1 ? "nueva" : "nuevas"}
      </p>

      <ul className="mt-6 space-y-4">
        {requests.map((r) => (
          <li key={r.id} id={r.id} className="scroll-mt-6 rounded-xl border border-line bg-white p-4 target:border-brand sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold">
                  {r.brand} {r.model} {r.year}
                </p>
                <p className="text-sm text-muted">
                  {formatKm(r.mileage)} · Pide <span className="font-semibold text-ink">{formatPrice(r.askingPrice)}</span>
                </p>
              </div>
              <p className="text-xs text-muted">{formatDate(r.createdAt)}</p>
            </div>

            <p className="mt-3 text-sm">
              <span className="font-semibold">{r.name}</span> ·{" "}
              <a href={`tel:${r.phone}`} className="text-brand-600 hover:underline">
                {r.phone}
              </a>{" "}
              ·{" "}
              <a
                href={whatsappLink(
                  `Hola ${r.name}, te escribimos de Kredi Auto por tu ${r.brand} ${r.model} ${r.year}.`,
                  waNumber(r.phone),
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="text-whatsapp hover:underline"
              >
                WhatsApp
              </a>
            </p>

            {r.photoIds.length > 0 && (
              <ul className="mt-4 flex gap-2 overflow-x-auto">
                {r.photoIds.map((id) => (
                  <li key={id} className="shrink-0">
                    <a href={`/admin/foto/${id}`} target="_blank">
                      {/* eslint-disable-next-line @next/next/no-img-element -- private, auth-gated route */}
                      <img src={`/admin/foto/${id}`} alt="" className="h-24 w-32 rounded-md object-cover" loading="lazy" />
                    </a>
                  </li>
                ))}
              </ul>
            )}

            <form action={updateSellRequest.bind(null, r.id)} className="mt-4 grid gap-3 sm:grid-cols-[12rem_1fr_auto] sm:items-start">
              <select name="status" defaultValue={r.status} aria-label="Estado" className="field py-2">
                {SELL_REQUEST_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {sellRequestStatusLabel[s]}
                  </option>
                ))}
              </select>
              <textarea
                name="adminNotes"
                defaultValue={r.adminNotes ?? ""}
                placeholder="Notas internas"
                rows={1}
                aria-label="Notas internas"
                className="field py-2"
              />
              <div className="flex items-center gap-4">
                <button type="submit" className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">
                  Guardar
                </button>
                <ConfirmButton
                  action={deleteSellRequest.bind(null, r.id)}
                  confirmText="¿Eliminar esta solicitud y sus fotos?"
                  className="text-sm font-semibold text-red-600 hover:underline"
                >
                  Eliminar
                </ConfirmButton>
              </div>
            </form>
          </li>
        ))}
        {requests.length === 0 && (
          <li className="rounded-xl border border-line bg-white p-8 text-center text-muted">Todavía no hay solicitudes.</li>
        )}
      </ul>
    </>
  );
}
