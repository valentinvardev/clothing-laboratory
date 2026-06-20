"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "~/lib/products";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "~/lib/products";

export function ProductClient({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-zinc-400">
        <Link href="/" className="hover:text-zinc-700">
          Inicio
        </Link>
        <span>/</span>
        <Link href="/" className="hover:text-zinc-700">
          {CATEGORY_LABELS[product.category]}
        </Link>
        <span>/</span>
        <span className="text-zinc-700">{product.name}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Left: image */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-100">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            unoptimized
            priority
          />
        </div>

        {/* Right: product info */}
        <div className="flex flex-col gap-5">
          <div>
            <span
              className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${CATEGORY_COLORS[product.category]}`}
            >
              {CATEGORY_LABELS[product.category]}
            </span>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900">
              {product.name}
            </h1>
            <p className="mt-3 text-2xl font-bold text-zinc-900">
              ${product.price.toFixed(2)}
            </p>
          </div>

          <hr className="border-zinc-100" />

          {/* Sizes */}
          <div>
            <p className="mb-2 text-sm font-semibold text-zinc-700">
              Talle
              {selectedSize && (
                <span className="ml-1 font-normal text-zinc-500">
                  — {selectedSize}
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                    selectedSize === size
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm leading-relaxed text-zinc-600">
            {product.description}
          </p>

          <hr className="border-zinc-100" />

          {/* CTAs */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed rounded-xl bg-zinc-900 py-3.5 text-sm font-bold text-white opacity-50"
            >
              Agregar al carrito
            </button>
            <Link
              href={`/try-on?productId=${product.id}${selectedSize ? `&size=${selectedSize}` : ""}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-rose-600 py-3.5 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-600 hover:text-white"
            >
              ✦ Probármelo con IA
            </Link>
          </div>

          <p className="text-center text-xs text-zinc-400">
            Generado por Google Gemini — sin cargo adicional
          </p>
        </div>
      </div>
    </div>
  );
}
