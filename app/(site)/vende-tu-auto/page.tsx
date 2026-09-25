import type { Metadata } from "next";
import { PageBanner } from "@/components/site/page-banner";
import { SellForm } from "@/components/site/sell-form";
import { ArrowRightIcon, CalendarCheckIcon, CashIcon, OfferIcon, QuoteIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Vende tu auto",
  description: "Vende tu auto en Mazatlán en 4 pasos: cotiza, elige una oferta, agenda tu inspección y obtén tu pago.",
};

const steps = [
  {
    Icon: QuoteIcon,
    title: "Cotiza tu auto",
    text: "Cuéntanos de tu auto y súbele unas fotos. Te toma un par de minutos.",
  },
  {
    Icon: OfferIcon,
    title: "Elige una oferta",
    text: "Te hacemos una propuesta clara. Tú decides, sin presión y sin compromiso.",
  },
  {
    Icon: CalendarCheckIcon,
    title: "Agenda tu inspección",
    text: "Escoge el día y la hora que te acomode. Nosotros revisamos tu auto.",
  },
  { Icon: CashIcon, title: "Obtén tu pago", text: "Firmamos, recibes tu dinero y listo. Así de fácil." },
];

export default function SellPage() {
  return (
    <>
      <PageBanner src="/banner-2.webp" position="60% center">
        <p className="flex items-center gap-3 text-sm font-semibold text-accent">
          <span className="h-0.5 w-8 rounded-full brand-rule" aria-hidden />
          Vende tu auto
        </p>
        <h1 className="mt-5 text-[2.6rem] leading-[1.05] font-extrabold tracking-tight text-balance sm:text-6xl">
          Vender tu auto nunca fue tan fácil.
        </h1>
        <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/85">
          Olvídate de anuncios, llamadas de desconocidos y citas que no llegan. Cuatro pasos y tu auto se convierte en
          dinero.
        </p>
        <a
          href="#cotiza"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Cotiza tu auto
          <ArrowRightIcon width={18} height={18} />
        </a>
      </PageBanner>

      <section className="mx-auto max-w-6xl px-4 sm:px-6" aria-label="Cómo funciona">
        <ol className="relative mt-12 grid gap-4 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-6">
          {/* Connector behind the step badges on wide screens */}
          <span
            className="absolute top-7 right-[12.5%] left-[12.5%] hidden h-0.5 rounded-full brand-rule lg:block"
            aria-hidden
          />
          {steps.map(({ Icon, title, text }, i) => (
            <li
              key={title}
              className="relative animate-rise rounded-2xl bg-paper p-6 lg:bg-transparent lg:p-0 lg:text-center"
              style={{ animationDelay: `${120 + i * 110}ms` }}
            >
              <div className="relative flex items-center gap-4 lg:flex-col lg:gap-5">
                <span className="relative grid size-14 shrink-0 place-items-center rounded-full bg-brand-600 text-white lg:mx-auto lg:shadow-[0_0_0_8px_#fff]">
                  <Icon width={26} height={26} />
                  <span className="absolute -top-1 -right-1 grid size-6 place-items-center rounded-full bg-accent text-xs font-bold text-ink tabular-nums">
                    {i + 1}
                  </span>
                </span>
                <h2 className="text-lg font-bold tracking-tight">{title}</h2>
              </div>
              <p className="mt-3 leading-relaxed text-muted lg:mx-auto lg:max-w-[15rem]">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        id="cotiza"
        className="mx-auto mt-16 grid max-w-6xl scroll-mt-24 gap-12 border-t border-line px-4 pt-12 sm:px-6 lg:mt-24 lg:grid-cols-[1fr_1.3fr] lg:gap-20 lg:pt-16"
        aria-labelledby="cotiza-titulo"
      >
        <div>
          <h2 id="cotiza-titulo" className="text-3xl font-bold tracking-tight sm:text-4xl">
            Cotiza tu auto
          </h2>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">
            Compramos autos seminuevos. Déjanos los datos del tuyo y te contactamos.
          </p>
        </div>
        <SellForm />
      </section>
    </>
  );
}
