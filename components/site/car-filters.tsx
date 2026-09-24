"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { bodyTypeLabel, SORTS, transmissionLabel, TRANSMISSIONS, type BodyType } from "@/lib/car-types";
import { formatPrice } from "@/lib/format";
import { CloseIcon, FilterIcon } from "@/components/icons";

const PRICE_STEPS = [150_000, 200_000, 250_000, 300_000, 350_000, 400_000, 500_000, 600_000, 800_000, 1_000_000];

interface Values {
  marca?: string;
  tipo?: string;
  transmision?: string;
  precioMin?: number;
  precioMax?: number;
  anioMin?: number;
  anioMax?: number;
  orden: string;
}

interface CarFiltersProps {
  values: Values;
  options: { brands: string[]; years: number[]; bodyTypes: BodyType[] };
  total: number;
}

export function CarFilters({ values, options, total }: CarFiltersProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const activeCount = (["marca", "tipo", "transmision", "precioMin", "precioMax", "anioMin", "anioMax"] as const).filter(
    (k) => values[k] !== undefined,
  ).length;

  function apply() {
    const data = new FormData(formRef.current!);
    const params = new URLSearchParams();
    for (const [key, value] of data) {
      if (typeof value === "string" && value && !(key === "orden" && value === "recientes")) params.set(key, value);
    }
    const qs = params.toString();
    startTransition(() => router.replace(qs ? `/autos?${qs}` : "/autos", { scroll: false }));
  }

  function clear() {
    formRef.current?.reset();
    setOpen(false);
    startTransition(() => router.replace("/autos", { scroll: false }));
  }

  // `key` remounts the form when the URL changes so defaultValues stay in sync.
  const formKey = JSON.stringify(values);

  return (
    <>
      <div className="flex items-center justify-between gap-4 border-b border-line pb-4 lg:hidden">
        <p className="text-sm text-muted" aria-live="polite">
          {pending ? "Actualizando…" : `${total} ${total === 1 ? "auto" : "autos"}`}
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold"
        >
          <FilterIcon width={18} height={18} />
          Filtros
          {activeCount > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-brand-600 text-[11px] text-white">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      <div
        className={
          open
            ? "fixed inset-0 z-50 flex flex-col bg-white lg:static lg:z-auto lg:block"
            : "hidden lg:block"
        }
        role={open ? "dialog" : undefined}
        aria-modal={open || undefined}
        aria-label="Filtros"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-4 lg:hidden">
          <p className="text-lg font-semibold">Filtros</p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar filtros"
            className="-mr-2 grid size-11 place-items-center"
          >
            <CloseIcon width={24} height={24} />
          </button>
        </div>

        <form
          key={formKey}
          ref={formRef}
          action="/autos"
          onChange={() => !open && apply()}
          onSubmit={(e) => {
            e.preventDefault();
            apply();
            setOpen(false);
          }}
          className="flex-1 space-y-6 overflow-y-auto px-4 py-6 lg:overflow-visible lg:p-0"
        >
          <Field label="Ordenar por" htmlFor="orden">
            <select id="orden" name="orden" defaultValue={values.orden} className="field">
              {Object.entries(SORTS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Marca" htmlFor="marca">
            <select id="marca" name="marca" defaultValue={values.marca ?? ""} className="field">
              <option value="">Todas</option>
              {options.brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Tipo" htmlFor="tipo">
            <select id="tipo" name="tipo" defaultValue={values.tipo ?? ""} className="field">
              <option value="">Todos</option>
              {options.bodyTypes.map((t) => (
                <option key={t} value={t}>
                  {bodyTypeLabel[t]}
                </option>
              ))}
            </select>
          </Field>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Transmisión</legend>
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-paper p-1">
              {[["", "Todas"] as const, ...TRANSMISSIONS.map((t) => [t, transmissionLabel[t]] as const)].map(
                ([value, label]) => (
                  <label key={value} className="relative">
                    <input
                      type="radio"
                      name="transmision"
                      value={value}
                      defaultChecked={(values.transmision ?? "") === value}
                      className="peer sr-only"
                    />
                    <span className="block cursor-pointer rounded-md py-2 text-center text-sm font-medium text-muted transition peer-checked:bg-white peer-checked:text-ink peer-checked:shadow-sm peer-focus-visible:outline-2 peer-focus-visible:outline-brand">
                      {label}
                    </span>
                  </label>
                ),
              )}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Precio</legend>
            <div className="grid grid-cols-2 gap-3">
              <select name="precioMin" aria-label="Precio mínimo" defaultValue={values.precioMin ?? ""} className="field">
                <option value="">Mínimo</option>
                {PRICE_STEPS.map((p) => (
                  <option key={p} value={p}>
                    {formatPrice(p)}
                  </option>
                ))}
              </select>
              <select name="precioMax" aria-label="Precio máximo" defaultValue={values.precioMax ?? ""} className="field">
                <option value="">Máximo</option>
                {PRICE_STEPS.map((p) => (
                  <option key={p} value={p}>
                    {formatPrice(p)}
                  </option>
                ))}
              </select>
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Año</legend>
            <div className="grid grid-cols-2 gap-3">
              <select name="anioMin" aria-label="Año desde" defaultValue={values.anioMin ?? ""} className="field">
                <option value="">Desde</option>
                {[...options.years].reverse().map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <select name="anioMax" aria-label="Año hasta" defaultValue={values.anioMax ?? ""} className="field">
                <option value="">Hasta</option>
                {options.years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </fieldset>

          {activeCount > 0 && (
            <button type="button" onClick={clear} className="hidden text-sm font-semibold text-brand-600 hover:underline lg:block">
              Limpiar filtros
            </button>
          )}

          <noscript>
            <button type="submit" className="w-full rounded-full bg-ink py-3 font-semibold text-white">
              Aplicar
            </button>
          </noscript>
        </form>

        <div className="grid grid-cols-2 gap-3 border-t border-line px-4 py-4 lg:hidden">
          <button type="button" onClick={clear} className="rounded-full border border-line py-3 font-semibold">
            Limpiar
          </button>
          <button
            type="button"
            onClick={() => formRef.current?.requestSubmit()}
            className="rounded-full bg-brand-600 py-3 font-semibold text-white"
          >
            Ver resultados
          </button>
        </div>
      </div>
    </>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold">
        {label}
      </label>
      {children}
    </div>
  );
}
