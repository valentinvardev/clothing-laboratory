import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductById } from "~/lib/products";
import { ProductClient } from "./_components/ProductClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) notFound();

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-black tracking-tight text-zinc-900">
            Virtual<span className="text-rose-600">Fit</span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900"
          >
            ← Volver al catálogo
          </Link>
        </div>
      </header>

      <ProductClient product={product} />

      <footer className="border-t border-zinc-100 py-8 text-center text-sm text-zinc-400">
        VirtualFit — Probador virtual de ropa con IA
      </footer>
    </main>
  );
}
