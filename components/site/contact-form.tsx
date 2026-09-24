"use client";

import { useState } from "react";
import { whatsappLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/icons";
import { FormField } from "./form-field";

/** Builds a WhatsApp message from the form and opens the chat. Nothing is stored. */
export function ContactForm() {
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const name = String(data.get("name") ?? "").trim();
        const message = String(data.get("message") ?? "").trim();
        if (!name || !message) {
          setError("Escribe tu nombre y tu mensaje.");
          return;
        }
        setError(null);
        window.open(whatsappLink(`Hola, soy ${name}.\n\n${message}`), "_blank", "noopener,noreferrer");
      }}
      className="space-y-5"
    >
      <FormField label="Nombre" name="name" autoComplete="name" required />
      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-semibold">
          Mensaje
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          placeholder="¿En qué te podemos ayudar?"
          className="field resize-y"
        />
      </div>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-whatsapp px-8 py-4 font-semibold text-white transition-colors hover:bg-whatsapp-700 sm:w-auto"
      >
        <WhatsAppIcon width={22} height={22} />
        Enviar por WhatsApp
      </button>
      <p className="text-sm text-muted">Se abrirá WhatsApp con tu mensaje listo para enviar.</p>
    </form>
  );
}
