"use client";

import { useActionState, useState, startTransition } from "react";
import { submitSellRequest, type SellState } from "@/app/actions/sell";
import { MAX_SELL_PHOTOS } from "@/lib/validation";
import { FormField } from "./form-field";
import { PhotoPicker } from "./photo-picker";

const initial: SellState = { ok: false };

export function SellForm() {
  const [state, dispatch, pending] = useActionState(submitSellRequest, initial);
  const [photos, setPhotos] = useState<File[]>([]);
  const e = state.errors ?? {};

  if (state.ok) {
    return (
      <div className="border-t-2 border-accent py-10" role="status">
        <p className="text-2xl font-bold tracking-tight">¡Gracias! Recibimos tu solicitud.</p>
        <p className="mt-2 text-muted">Revisaremos los datos de tu auto y te contactaremos pronto por teléfono o WhatsApp.</p>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(ev) => {
        ev.preventDefault();
        const data = new FormData(ev.currentTarget);
        photos.forEach((file) => data.append("photos", file));
        startTransition(() => dispatch(data));
      }}
      className="space-y-10"
    >
      <fieldset className="space-y-5">
        <legend className="mb-5 text-xs font-semibold tracking-[0.14em] text-muted uppercase">Tus datos</legend>
        <FormField label="Nombre" name="name" autoComplete="name" required error={e.name} />
        <FormField
          label="Teléfono / WhatsApp"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="669 123 4567"
          required
          error={e.phone}
        />
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="mb-5 text-xs font-semibold tracking-[0.14em] text-muted uppercase">Tu auto</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Marca" name="brand" placeholder="Ej. Toyota" required error={e.brand} />
          <FormField label="Modelo" name="model" placeholder="Ej. Corolla" required error={e.model} />
          <FormField label="Año" name="year" type="number" inputMode="numeric" min={1950} placeholder="Ej. 2020" required error={e.year} />
          <FormField label="Kilometraje" name="mileage" type="number" inputMode="numeric" min={0} placeholder="Ej. 45000" required error={e.mileage} />
        </div>
        <FormField
          label="Precio que pides (MXN)"
          name="askingPrice"
          type="number"
          inputMode="numeric"
          min={1}
          placeholder="Ej. 250000"
          required
          error={e.askingPrice}
        />
        <PhotoPicker onChange={setPhotos} max={MAX_SELL_PHOTOS} error={e.photos} />
      </fieldset>

      {/* Honeypot */}
      <div aria-hidden className="absolute -left-[9999px]">
        <label>
          Sitio web <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

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

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-brand-600 px-8 py-4 font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Enviando…" : "Enviar solicitud"}
      </button>
    </form>
  );
}
