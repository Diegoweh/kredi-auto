"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { saveCar, uploadCarPhoto, type CarFormState } from "@/app/actions/cars";
import { carPhotoUrl } from "@/lib/appwrite/config";
import {
  BODY_TYPES,
  CAR_STATUSES,
  FUEL_TYPES,
  TRANSMISSIONS,
  bodyTypeLabel,
  fuelLabel,
  statusLabel,
  transmissionLabel,
  type Car,
} from "@/lib/car-types";
import { resizeImage } from "@/lib/resize-image";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "@/components/icons";
import { FormField } from "@/components/site/form-field";

export function CarForm({ car }: { car: Car | null }) {
  const [state, action, pending] = useActionState(saveCar.bind(null, car?.id ?? null), {} as CarFormState);
  const [photoIds, setPhotoIds] = useState<string[]>(car?.photoIds ?? []);
  const [uploading, setUploading] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const e = state.errors ?? {};

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    setUploadError(null);
    setUploading((n) => n + files.length);
    // Sequential so gallery order matches selection order.
    for (const file of [...files]) {
      try {
        const data = new FormData();
        data.append("photo", await resizeImage(file));
        const result = await uploadCarPhoto(data);
        if (result.id) setPhotoIds((ids) => [...ids, result.id!]);
        else setUploadError(result.error ?? "No se pudo subir una foto");
      } catch {
        setUploadError("No se pudo procesar una foto");
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }

  function move(i: number, delta: number) {
    setPhotoIds((ids) => {
      const next = [...ids];
      const [item] = next.splice(i, 1);
      next.splice(i + delta, 0, item);
      return next;
    });
  }

  return (
    <form action={action} noValidate className="mt-6 space-y-8">
      <Section title="Fotos" hint="La primera foto es la portada. Usa las flechas para cambiar el orden.">
        <input type="hidden" name="photoIds" value={JSON.stringify(photoIds)} />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {photoIds.map((id, i) => (
            <li key={id} className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-paper">
              <Image src={carPhotoUrl(id)} alt={`Foto ${i + 1}`} fill sizes="200px" className="object-cover" />
              {i === 0 && (
                <span className="absolute top-1.5 left-1.5 rounded-full bg-white px-2 py-0.5 text-[11px] font-bold">
                  Portada
                </span>
              )}
              <button
                type="button"
                onClick={() => setPhotoIds((ids) => ids.filter((x) => x !== id))}
                aria-label={`Quitar foto ${i + 1}`}
                className="absolute top-1.5 right-1.5 grid size-7 place-items-center rounded-full bg-black/60 text-white"
              >
                <CloseIcon width={16} height={16} />
              </button>
              <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                  aria-label="Mover antes"
                  className="grid size-7 place-items-center rounded-full bg-white/90 disabled:invisible"
                >
                  <ChevronLeftIcon width={16} height={16} />
                </button>
                <button
                  type="button"
                  disabled={i === photoIds.length - 1}
                  onClick={() => move(i, 1)}
                  aria-label="Mover después"
                  className="grid size-7 place-items-center rounded-full bg-white/90 disabled:invisible"
                >
                  <ChevronRightIcon width={16} height={16} />
                </button>
              </div>
            </li>
          ))}
          <li>
            <label className="grid aspect-[4/3] cursor-pointer place-items-center rounded-lg border border-dashed border-line bg-white text-sm font-medium text-muted hover:border-brand hover:text-brand-600 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand">
              {uploading > 0 ? `Subiendo ${uploading}…` : "+ Agregar fotos"}
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(ev) => {
                  addPhotos(ev.target.files);
                  ev.target.value = "";
                }}
              />
            </label>
          </li>
        </ul>
        {(uploadError || e.photoIds) && <p className="mt-2 text-sm text-red-600">{uploadError ?? e.photoIds}</p>}
      </Section>

      <Section title="Datos principales">
        <div className="grid gap-5 sm:grid-cols-3">
          <FormField label="Marca" name="brand" defaultValue={car?.brand} required error={e.brand} />
          <FormField label="Modelo" name="model" defaultValue={car?.model} required error={e.model} />
          <FormField label="Versión" name="version" defaultValue={car?.version ?? ""} error={e.version} />
          <FormField label="Año" name="year" type="number" inputMode="numeric" defaultValue={car?.year} required error={e.year} />
          <FormField label="Precio (MXN)" name="price" type="number" inputMode="numeric" defaultValue={car?.price} required error={e.price} />
          <FormField label="Kilometraje" name="mileage" type="number" inputMode="numeric" defaultValue={car?.mileage} required error={e.mileage} />
        </div>
      </Section>

      <Section title="Características">
        <div className="grid gap-5 sm:grid-cols-3">
          <Select label="Transmisión" name="transmission" defaultValue={car?.transmission ?? ""} options={TRANSMISSIONS} labels={transmissionLabel} empty="Sin especificar" />
          <Select label="Combustible" name="fuelType" defaultValue={car?.fuelType ?? ""} options={FUEL_TYPES} labels={fuelLabel} empty="Sin especificar" />
          <Select label="Tipo" name="bodyType" defaultValue={car?.bodyType ?? ""} options={BODY_TYPES} labels={bodyTypeLabel} empty="Sin especificar" />
          <FormField label="Color" name="color" defaultValue={car?.color ?? ""} error={e.color} />
          <FormField label="Cilindros" name="cylinders" type="number" inputMode="numeric" defaultValue={car?.cylinders ?? ""} error={e.cylinders} />
          <FormField label="Ciudad" name="city" defaultValue={car?.city ?? "Mazatlán"} error={e.city} />
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-semibold">
              Descripción
            </label>
            <textarea id="description" name="description" rows={6} defaultValue={car?.description ?? ""} className="field" />
          </div>
          <div>
            <label htmlFor="equipment" className="mb-2 block text-sm font-semibold">
              Equipamiento <span className="font-normal text-muted">(uno por línea)</span>
            </label>
            <textarea
              id="equipment"
              name="equipment"
              rows={6}
              defaultValue={car?.equipment.join("\n") ?? ""}
              placeholder={"Aire acondicionado\nQuemacocos"}
              className="field"
            />
          </div>
        </div>
      </Section>

      <Section title="Publicación">
        <div className="grid items-end gap-5 sm:grid-cols-3">
          <Select label="Estado" name="status" defaultValue={car?.status ?? "disponible"} options={CAR_STATUSES} labels={statusLabel} />
          <label className="flex items-center gap-3 py-3 text-sm font-semibold">
            <input type="checkbox" name="featured" defaultChecked={car?.featured} className="size-5 accent-brand-600" />
            Destacado en la página de inicio
          </label>
        </div>
        <p className="mt-2 text-sm text-muted">Los autos vendidos no se muestran en el sitio.</p>
      </Section>

      {state.message && (
        <p className="text-sm text-red-600" role="alert">
          {state.message}
        </p>
      )}
      {Object.keys(e).length > 0 && (
        <p className="text-sm text-red-600" role="alert">
          Revisa los campos marcados.
        </p>
      )}

      <div className="flex items-center gap-6">
        <button
          type="submit"
          disabled={pending || uploading > 0}
          className="rounded-full bg-brand-600 px-8 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "Guardando…" : car ? "Guardar cambios" : "Publicar auto"}
        </button>
        <Link href="/admin/autos" className="font-semibold text-muted hover:text-ink">
          Cancelar
        </Link>
      </div>
    </form>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-white p-4 sm:p-6">
      <h2 className="font-semibold">{title}</h2>
      {hint && <p className="mt-0.5 text-sm text-muted">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Select<T extends string>({
  label,
  name,
  defaultValue,
  options,
  labels,
  empty,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: readonly T[];
  labels: Record<T, string>;
  empty?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-semibold">
        {label}
      </label>
      <select id={name} name={name} defaultValue={defaultValue} className="field">
        {empty && <option value="">{empty}</option>}
        {options.map((o) => (
          <option key={o} value={o}>
            {labels[o]}
          </option>
        ))}
      </select>
    </div>
  );
}
