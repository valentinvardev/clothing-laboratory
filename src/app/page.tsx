import Link from "next/link";
import Image from "next/image";
import {
  sampleGarments,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from "~/lib/garments";
import type { GarmentCategory } from "~/lib/garments";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-zinc-900">
              Virtual<span className="text-rose-600">Fit</span>
            </span>
          </div>
          <Link
            href="/try-on"
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
          >
            Upload your own
          </Link>
        </div>
      </header>

      <section className="border-b border-zinc-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600">
            Powered by Fashn.ai
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
            Try before you buy
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-zinc-500">
            Pick a garment from our collection or upload your own, then see
            exactly how it looks on you — AI-generated in seconds.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-base font-semibold text-zinc-800">
            Sample Collection
            <span className="ml-2 text-sm font-normal text-zinc-400">
              {sampleGarments.length} pieces
            </span>
          </h3>
          <Link
            href="/try-on"
            className="text-sm font-medium text-rose-600 hover:text-rose-700"
          >
            Upload your own garment →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {sampleGarments.map((garment) => (
            <div
              key={garment.id}
              className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100">
                <Image
                  src={garment.imageUrl}
                  alt={garment.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  unoptimized
                />
              </div>
              <div className="p-3">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[garment.category as GarmentCategory]}`}
                >
                  {CATEGORY_LABELS[garment.category as GarmentCategory]}
                </span>
                <h4 className="mt-2 text-sm font-semibold text-zinc-900">
                  {garment.name}
                </h4>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {garment.description}
                </p>
                <Link
                  href={`/try-on?garmentId=${garment.id}`}
                  className="mt-3 block w-full rounded-lg bg-zinc-900 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
                >
                  Try On
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-zinc-100 py-8 text-center text-sm text-zinc-400">
        VirtualFit — AI virtual try-on powered by Fashn.ai
      </footer>
    </main>
  );
}
