import Link from "next/link";
import { CatalogClient } from "~/app/_components/CatalogClient";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-black tracking-tight text-zinc-900">
            Virtual<span className="text-rose-600">Fit</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-600 sm:flex">
            <Link href="/" className="hover:text-zinc-900">Catálogo</Link>
          </nav>
          <Link
            href="/try-on"
            className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
          >
            Probador virtual
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-zinc-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 text-center">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
            ✦ Probador con IA — Google Gemini
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
            Probate la ropa
            <br />
            antes de comprar
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base text-zinc-500">
            Elegí cualquier prenda, subí tu foto y mirá cómo te queda — todo
            generado por inteligencia artificial en segundos.
          </p>
          <Link
            href="/try-on"
            className="mt-6 inline-block rounded-full bg-zinc-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-zinc-700"
          >
            Ir al probador →
          </Link>
        </div>
      </section>

      {/* Catalog */}
      <CatalogClient />

      <footer className="border-t border-zinc-100 py-8 text-center text-sm text-zinc-400">
        VirtualFit — Probador virtual de ropa con IA
      </footer>
    </main>
  );
}
