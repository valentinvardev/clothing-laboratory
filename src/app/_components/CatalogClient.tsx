"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  products,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from "~/lib/products";
import type { ProductCategory } from "~/lib/products";

type Filter = "all" | ProductCategory;


const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "tops", label: "Tops" },
  { value: "bottoms", label: "Pantalones" },
  { value: "outerwear", label: "Abrigos" },
  { value: "swimwear", label: "Trajes de baño" },
];

export function CatalogClient() {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered =
    filter === "all" ? products : products.filter((p) => p.category === filter);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      {/* Filter tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f.value
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto self-center text-sm text-zinc-400">
          {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {filtered.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            {/* Image */}
            <div className="relative aspect-[4/5] overflow-hidden bg-zinc-50">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized
              />
              {/* Hover overlay */}
              <div className="absolute inset-x-2 bottom-2 translate-y-2 rounded-lg bg-zinc-900/90 py-2 text-center text-xs font-semibold text-white opacity-0 backdrop-blur transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                Ver producto →
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col p-3">
              <span
                className={`w-fit rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[product.category]}`}
              >
                {CATEGORY_LABELS[product.category]}
              </span>
              <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold leading-tight text-zinc-900">
                {product.name}
              </h3>
              <div className="mt-auto pt-2">
                <span className="text-base font-bold text-zinc-900">
                  ${product.price.toFixed(2)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
