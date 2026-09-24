import Link from "next/link";
import { cacheLife } from "next/cache";
import { nav, site } from "@/lib/site";
import { whatsappLink } from "@/lib/whatsapp";
import { SocialLinks } from "./social-links";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo className="h-7 w-auto" />
          <p className="max-w-xs text-sm leading-relaxed text-muted">
            Autos seminuevos en {site.city}. Atención directa por WhatsApp.
          </p>
          <SocialLinks className="-ml-2" />
        </div>

        <nav aria-label="Pie de página">
          <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-muted uppercase">Sitio</p>
          <ul className="space-y-2 text-[15px]">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-brand-600">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-muted uppercase">Contacto</p>
          <ul className="space-y-2 text-[15px]">
            <li>
              <a href={site.phoneHref} className="hover:text-brand-600">
                {site.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={whatsappLink("Hola, quiero información sobre sus autos.")}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-600"
              >
                WhatsApp
              </a>
            </li>
            <li>
              <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600">
                Cómo llegar
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted sm:px-6">
          © <CurrentYear /> Kredi Auto · {site.city}
        </p>
      </div>
    </footer>
  );
}

async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}
