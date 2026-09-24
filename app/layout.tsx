import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Kredi Auto · Autos seminuevos en Mazatlán",
    template: "%s · Kredi Auto",
  },
  description:
    "Autos seminuevos en Mazatlán. Revisa el inventario, agenda una visita por WhatsApp o vende tu auto con nosotros.",
  openGraph: { locale: "es_MX", siteName: site.name, type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-MX" className={`${manrope.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
