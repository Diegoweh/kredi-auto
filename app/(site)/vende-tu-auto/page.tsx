import type { Metadata } from "next";
import { SellForm } from "@/components/site/sell-form";

export const metadata: Metadata = {
  title: "Vende tu auto",
  description: "Vende tu auto en Mazatlán. Mándanos sus datos y fotos y te hacemos una oferta.",
};

const steps = [
  ["Mándanos los datos", "Llena el formulario con la información y fotos de tu auto."],
  ["Te contactamos", "Revisamos tu solicitud y te llamamos o escribimos por WhatsApp."],
  ["Revisión y oferta", "Agendamos una cita para revisar el auto y hacerte una oferta."],
];

export default function SellPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 pt-10 sm:px-6 lg:grid-cols-[1fr_1.3fr] lg:gap-20 lg:pt-14">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Vende tu auto</h1>
        <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">
          Compramos autos seminuevos. Déjanos los datos del tuyo y te contactamos.
        </p>
        <ol className="mt-10 hidden lg:block">
          {steps.map(([title, text], i) => (
            <li key={title} className="flex gap-5 border-t border-line py-5">
              <span className="text-sm font-bold text-brand tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <SellForm />
    </div>
  );
}
