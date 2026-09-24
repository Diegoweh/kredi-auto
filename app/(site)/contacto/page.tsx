import type { Metadata } from "next";
import { site } from "@/lib/site";
import { PhoneIcon, PinIcon } from "@/components/icons";
import { ContactForm } from "@/components/site/contact-form";
import { SocialLinks } from "@/components/site/social-links";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contáctanos por WhatsApp o visítanos en Mazatlán, Sinaloa.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 lg:pt-14">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Contacto</h1>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">
            Escríbenos o visítanos. Con gusto te ayudamos a encontrar tu próximo auto.
          </p>

          <ul className="mt-10 border-t border-line">
            <li className="border-b border-line">
              <a href={site.phoneHref} className="flex items-center gap-4 py-5 hover:text-brand-600">
                <PhoneIcon className="text-brand" width={22} height={22} />
                <span>
                  <span className="block text-xs font-medium text-muted">Teléfono y WhatsApp</span>
                  <span className="text-lg font-semibold">{site.phoneDisplay}</span>
                </span>
              </a>
            </li>
            <li className="border-b border-line">
              <a
                href={site.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 py-5 hover:text-brand-600"
              >
                <PinIcon className="text-brand" width={22} height={22} />
                <span>
                  <span className="block text-xs font-medium text-muted">Dirección</span>
                  <span className="text-lg font-semibold">{site.city}</span>
                  <span className="block text-sm text-brand-600">Ver en Google Maps →</span>
                </span>
              </a>
            </li>
          </ul>

          <div className="mt-8">
            <p className="mb-2 text-sm text-muted">Síguenos</p>
            <SocialLinks className="-ml-2" />
          </div>
        </div>

        <div>
          <h2 className="mb-6 text-xs font-semibold tracking-[0.14em] text-muted uppercase">Envíanos un mensaje</h2>
          <ContactForm />
        </div>
      </div>

      <div className="mt-16 overflow-hidden rounded-2xl border border-line lg:mt-24">
        <iframe
          src={site.mapsEmbedUrl}
          title="Ubicación de Kredi Auto en Google Maps"
          className="h-80 w-full sm:h-[28rem]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
