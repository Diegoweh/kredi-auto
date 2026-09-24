import Link from "next/link";
import { Suspense } from "react";
import { logout } from "@/app/actions/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { Logo } from "@/components/site/logo";

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-2 px-4 py-3 sm:px-6">
          <Logo className="h-6 w-auto" />
          <Suspense fallback={<div className="order-last h-9 w-full sm:order-none sm:w-64" />}>
            <AdminNav />
          </Suspense>
          <div className="ml-auto flex items-center gap-4 text-sm">
            <Link href="/" target="_blank" className="text-muted hover:text-ink">
              Ver sitio
            </Link>
            <form action={logout}>
              <button type="submit" className="font-semibold text-muted hover:text-ink">
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <Suspense fallback={<p className="text-muted">Cargando…</p>}>{children}</Suspense>
      </main>
    </>
  );
}
