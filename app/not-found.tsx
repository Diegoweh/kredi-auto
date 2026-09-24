import Link from "next/link";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-24 sm:px-6">
      <p className="text-sm font-semibold text-brand-600">404</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight">No encontramos esta página</h1>
      <p className="mt-3 text-muted">Puede que el auto ya se haya vendido.</p>
      <Link
        href="/autos"
        className="mt-8 inline-flex rounded-full bg-brand-600 px-6 py-3.5 font-semibold text-white hover:bg-brand-700"
      >
        Ver autos disponibles
      </Link>
      </main>
      <Footer />
    </>
  );
}
