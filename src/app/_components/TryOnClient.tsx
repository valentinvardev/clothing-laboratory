"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

async function urlToBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} fetching ${url}`);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";
import {
  sampleGarments,
  getGarmentById,
} from "~/lib/garments";
import type { GarmentCategory } from "~/lib/garments";
import { products, getProductById } from "~/lib/products";
import { sampleModels } from "~/lib/models";
import { ImageUpload } from "~/app/_components/ImageUpload";

type Step = "setup" | "generating" | "result";

export function TryOnClient() {
  const searchParams = useSearchParams();
  const garmentIdParam = searchParams.get("garmentId");
  const productIdParam = searchParams.get("productId");

  // Resolve initial garment from URL param (product or legacy garment)
  const initialGarment = productIdParam
    ? getProductById(productIdParam)
    : garmentIdParam
      ? getGarmentById(garmentIdParam)
      : null;

  const [selectedGarmentId, setSelectedGarmentId] = useState<string | null>(
    initialGarment?.id ?? null,
  );
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    productIdParam ?? null,
  );
  const [customGarmentImage, setCustomGarmentImage] = useState<string | null>(
    null,
  );
  const [customCategory, setCustomCategory] =
    useState<GarmentCategory>("tops");
  const [personImage, setPersonImage] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("setup");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Body data for fit context
  const sizeParam = searchParams.get("size") ?? "";
  const [bodySize, setBodySize] = useState(sizeParam);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");

  // Active garment: product overrides legacy garment
  const activeProduct = selectedProductId
    ? getProductById(selectedProductId)
    : null;
  const activeGarment = selectedGarmentId
    ? getGarmentById(selectedGarmentId)
    : null;

  const activeGarmentImage =
    activeProduct?.imageUrl ?? activeGarment?.imageUrl ?? customGarmentImage ?? null;
  const activeGarmentName =
    activeProduct?.name ?? activeGarment?.name ?? "Prenda personalizada";
  const activeGarmentDescription =
    activeProduct?.description ?? activeGarment?.description ?? undefined;

  const canGenerate = !!personImage && !!activeGarmentImage;

  const generate = api.tryon.generate.useMutation({
    onSuccess: (data) => {
      setResultUrl(data.imageUrl);
      setStep("result");
    },
    onError: (err) => {
      setErrorMsg(err.message);
      setStep("setup");
    },
  });

  const bodyParams = {
    selectedSize: bodySize || undefined,
    height: height ? Number(height) : undefined,
    weight: weight ? Number(weight) : undefined,
    age: age ? Number(age) : undefined,
  };

  const handleGenerate = useCallback(() => {
    if (!personImage || !activeGarmentImage) return;
    setErrorMsg(null);
    setStep("generating");
    generate.mutate({
      modelImage: personImage,
      garmentImage: activeGarmentImage,
      garmentName: activeGarmentName,
      garmentDescription: activeGarmentDescription,
      ...bodyParams,
    });
  }, [personImage, activeGarmentImage, activeGarmentName, activeGarmentDescription, bodyParams, generate]);

  const handleReset = () => {
    setResultUrl(null);
    setStep("setup");
    setErrorMsg(null);
  };

  // Cambiar: replace all clothing — use original person photo as base
  const handleSwitchGarment = useCallback(
    (product: import("~/lib/products").Product) => {
      if (!personImage) return;
      setSelectedProductId(product.id);
      setSelectedGarmentId(null);
      setCustomGarmentImage(null);
      setStep("generating");
      generate.mutate({
        modelImage: personImage,
        garmentImage: product.imageUrl,
        garmentName: product.name,
        garmentDescription: product.description,
        isLayering: false,
        ...bodyParams,
      });
    },
    [personImage, bodyParams, generate],
  );

  // Combinar: add garment on top — use generated image as base so looks stack
  const handleCombineGarment = useCallback(
    (product: import("~/lib/products").Product) => {
      const baseImage = resultUrl ?? personImage;
      if (!baseImage) return;
      setSelectedProductId(product.id);
      setSelectedGarmentId(null);
      setCustomGarmentImage(null);
      setStep("generating");
      generate.mutate({
        modelImage: baseImage,
        garmentImage: product.imageUrl,
        garmentName: product.name,
        garmentDescription: product.description,
        isLayering: true,
        ...bodyParams,
      });
    },
    [personImage, resultUrl, bodyParams, generate],
  );

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-1 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
          >
            ← Volver
          </Link>
          <span className="text-xl font-black tracking-tight text-zinc-900">
            Virtual<span className="text-rose-600">Fit</span>
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900">
            {activeProduct
              ? `Probarse: ${activeProduct.name}`
              : activeGarment
                ? `Probarse: ${activeGarment.name}`
                : "Probador Virtual"}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Subí tu foto y generá una imagen realista del look. Powered by
            Google Gemini.
          </p>
        </div>

        {step === "result" && resultUrl ? (
          <ResultView
            resultUrl={resultUrl}
            personImage={personImage}
            garmentName={activeGarmentName}
            onReset={handleReset}
            onSwitchGarment={handleSwitchGarment}
            onCombineGarment={handleCombineGarment}
          />
        ) : step === "generating" ? (
          <GeneratingView />
        ) : (
          <SetupView
            selectedGarmentId={selectedGarmentId}
            setSelectedGarmentId={(id) => {
              setSelectedGarmentId(id);
              setSelectedProductId(null);
            }}
            selectedProductId={selectedProductId}
            setSelectedProductId={(id) => {
              setSelectedProductId(id);
              setSelectedGarmentId(null);
            }}
            customGarmentImage={customGarmentImage}
            setCustomGarmentImage={(img) => {
              setCustomGarmentImage(img);
              setSelectedGarmentId(null);
              setSelectedProductId(null);
            }}
            customCategory={customCategory}
            setCustomCategory={setCustomCategory}
            personImage={personImage}
            setPersonImage={setPersonImage}
            bodySize={bodySize}
            setBodySize={setBodySize}
            height={height}
            setHeight={setHeight}
            weight={weight}
            setWeight={setWeight}
            age={age}
            setAge={setAge}
            canGenerate={canGenerate}
            onGenerate={handleGenerate}
            errorMsg={errorMsg}
          />
        )}
      </div>
    </div>
  );
}

// ─── Setup View ──────────────────────────────────────────────────────────────

interface SetupViewProps {
  selectedGarmentId: string | null;
  setSelectedGarmentId: (id: string | null) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  customGarmentImage: string | null;
  setCustomGarmentImage: (v: string | null) => void;
  customCategory: GarmentCategory;
  setCustomCategory: (v: GarmentCategory) => void;
  personImage: string | null;
  setPersonImage: (v: string | null) => void;
  bodySize: string;
  setBodySize: (v: string) => void;
  height: string;
  setHeight: (v: string) => void;
  weight: string;
  setWeight: (v: string) => void;
  age: string;
  setAge: (v: string) => void;
  canGenerate: boolean;
  onGenerate: () => void;
  errorMsg: string | null;
}

function SetupView({
  selectedGarmentId,
  setSelectedGarmentId,
  selectedProductId,
  setSelectedProductId,
  customGarmentImage,
  setCustomGarmentImage,
  customCategory,
  setCustomCategory,
  personImage,
  setPersonImage,
  bodySize,
  setBodySize,
  height,
  setHeight,
  weight,
  setWeight,
  age,
  setAge,
  canGenerate,
  onGenerate,
  errorMsg,
}: SetupViewProps) {
  const activeProduct = selectedProductId ? getProductById(selectedProductId) : null;
  const activeGarment = selectedGarmentId ? getGarmentById(selectedGarmentId) : null;
  const hasSelection = !!(activeProduct ?? activeGarment ?? customGarmentImage);
  const [showPicker, setShowPicker] = useState(!hasSelection);

  const activeImage = activeProduct?.imageUrl ?? activeGarment?.imageUrl ?? customGarmentImage;
  const activeName = activeProduct?.name ?? activeGarment?.name;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left: Garment */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-zinc-800">Prenda</h2>
            {!showPicker && (
              <button
                type="button"
                onClick={() => setShowPicker(true)}
                className="text-xs font-medium text-rose-600 hover:text-rose-700"
              >
                Cambiar
              </button>
            )}
          </div>

          {!showPicker && activeImage ? (
            <div className="flex flex-col gap-3">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-zinc-100">
                <Image
                  src={activeImage}
                  alt={activeName ?? "Prenda"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              {activeName && (
                <p className="font-semibold text-zinc-900">{activeName}</p>
              )}
            </div>
          ) : (
            <GarmentPicker
              onSelectGarment={(id) => {
                setSelectedGarmentId(id);
                setShowPicker(false);
              }}
              onSelectProduct={(id) => {
                setSelectedProductId(id);
                setShowPicker(false);
              }}
              onUpload={(img, cat) => {
                setCustomGarmentImage(img);
                setCustomCategory(cat);
                setShowPicker(false);
              }}
              customCategory={customCategory}
              setCustomCategory={setCustomCategory}
            />
          )}
        </div>

        {/* Right: Person photo */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-zinc-800">Tu foto</h2>

          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Modelos de ejemplo
          </p>
          <div className="mb-4 grid grid-cols-6 gap-1.5">
            {sampleModels.map((model) => (
              <button
                key={model.id}
                type="button"
                onClick={async () => {
                  try {
                    setPersonImage(await urlToBase64(model.imageUrl));
                  } catch {
                    setPersonImage(model.imageUrl);
                  }
                }}
                className={`relative aspect-[2/3] overflow-hidden rounded-lg border-2 transition-all ${
                  personImage === model.imageUrl
                    ? "border-rose-500 shadow-sm"
                    : "border-transparent hover:border-zinc-300"
                }`}
              >
                <Image
                  src={model.imageUrl}
                  alt={model.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </button>
            ))}
          </div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            O subí la tuya
          </p>
          {personImage ? (
            <div className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
              <Image
                src={personImage}
                alt="Modelo seleccionado"
                fill
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={() => setPersonImage(null)}
                className="absolute right-2 top-2 rounded-md bg-zinc-900/70 px-2 py-1 text-xs font-medium text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
              >
                Quitar
              </button>
            </div>
          ) : (
            <ImageUpload
              label=""
              hint="Foto de cuerpo entero o media figura"
              value={personImage}
              onImageChange={setPersonImage}
            />
          )}
        </div>
      </div>

      {/* Body data for accurate fit */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="mb-1 font-semibold text-zinc-800">Datos para el talle</h2>
        <p className="mb-4 text-xs text-zinc-400">
          Completá para que la IA muestre cómo queda la prenda en tu talle exacto.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Talle</label>
            <input
              type="text"
              placeholder="M, L, 32…"
              value={bodySize}
              onChange={(e) => setBodySize(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Altura (cm)</label>
            <input
              type="number"
              placeholder="170"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Peso (kg)</label>
            <input
              type="number"
              placeholder="65"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Edad</label>
            <input
              type="number"
              placeholder="25"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
        </div>
        {bodySize && (
          <p className="mt-2 text-xs text-zinc-500">
            Las medidas estándar de talle <strong>{bodySize}</strong> se usarán como referencia para el ajuste.
          </p>
        )}
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <button
        type="button"
        onClick={onGenerate}
        disabled={!canGenerate}
        className="mx-auto flex w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-rose-600 py-3.5 text-base font-bold text-white shadow-sm transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        ✦ Generar look
      </button>

      {!canGenerate && (
        <p className="text-center text-xs text-zinc-400">
          {!personImage && !hasSelection
            ? "Subí tu foto y elegí una prenda para continuar"
            : !personImage
              ? "Subí tu foto para continuar"
              : "Elegí una prenda para continuar"}
        </p>
      )}
    </div>
  );
}

// ─── Garment Picker ───────────────────────────────────────────────────────────

function GarmentPicker({
  onSelectGarment,
  onSelectProduct,
  onUpload,
  customCategory,
  setCustomCategory,
}: {
  onSelectGarment: (id: string) => void;
  onSelectProduct: (id: string) => void;
  onUpload: (img: string, category: GarmentCategory) => void;
  customCategory: GarmentCategory;
  setCustomCategory: (v: GarmentCategory) => void;
}) {
  const [tab, setTab] = useState<"catalog" | "upload">("catalog");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("catalog")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${tab === "catalog" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}
        >
          Del catálogo
        </button>
        <button
          type="button"
          onClick={() => setTab("upload")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${tab === "upload" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}
        >
          Subir foto
        </button>
      </div>

      {tab === "catalog" ? (
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollSnapType: "x mandatory" }}>
          {products.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectProduct(p.id)}
              className="flex-none overflow-hidden rounded-xl border-2 border-zinc-200 text-left transition-all hover:border-rose-400 active:scale-95"
              style={{ width: "48%", scrollSnapAlign: "start" }}
            >
              <div className="relative bg-zinc-100" style={{ aspectRatio: "3/4", minHeight: "220px" }}>
                <Image
                  src={p.imageUrl}
                  alt={p.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="p-2">
                <p className="line-clamp-2 text-xs font-semibold leading-tight text-zinc-800">
                  {p.name}
                </p>
                <p className="mt-0.5 text-xs font-medium text-zinc-500">
                  ${p.price.toFixed(2)}
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <ImageUpload
            label=""
            hint="Foto de la prenda que querés probar"
            value={uploadedImage}
            onImageChange={setUploadedImage}
          />
          {uploadedImage && (
            <>
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value as GarmentCategory)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                <option value="tops">Top / Remera</option>
                <option value="bottoms">Pantalón</option>
                <option value="one-pieces">Vestido / Enterito</option>
              </select>
              <button
                type="button"
                onClick={() => onUpload(uploadedImage, customCategory)}
                className="rounded-lg bg-zinc-900 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
              >
                Usar esta prenda
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Generating View ──────────────────────────────────────────────────────────

function GeneratingView() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="relative h-20 w-20">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-zinc-200 border-t-rose-600" />
        <div className="absolute inset-3 rounded-full bg-rose-50" />
      </div>
      <div>
        <p className="text-lg font-bold text-zinc-900">Generando tu look…</p>
        <p className="mt-1 text-sm text-zinc-500">
          Google Gemini está procesando la imagen. Puede tardar 15–30 segundos.
        </p>
      </div>
    </div>
  );
}

// ─── Result View ──────────────────────────────────────────────────────────────

function ResultView({
  resultUrl,
  personImage,
  garmentName,
  onReset,
  onSwitchGarment,
  onCombineGarment,
}: {
  resultUrl: string;
  personImage: string | null;
  garmentName: string;
  onReset: () => void;
  onSwitchGarment: (p: import("~/lib/products").Product) => void;
  onCombineGarment: (p: import("~/lib/products").Product) => void;
}) {
  const [modalMode, setModalMode] = useState<"switch" | "combine" | null>(null);

  const handleDownload = () => {
    if (resultUrl.startsWith("data:")) {
      const a = document.createElement("a");
      a.href = resultUrl;
      a.download = `virtualfit-${Date.now()}.png`;
      a.click();
    } else {
      fetch(resultUrl)
        .then((r) => r.blob())
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `virtualfit-${Date.now()}.jpg`;
          a.click();
          URL.revokeObjectURL(url);
        })
        .catch(() => window.open(resultUrl, "_blank"));
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Side-by-side: original + result */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Original */}
          {personImage && (
            <div className="flex flex-col gap-2">
              <p className="text-center text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Foto original
              </p>
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-100">
                <Image
                  src={personImage}
                  alt="Foto original"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          )}

          {/* Generated result */}
          <div className="flex flex-col gap-2">
            <p className="text-center text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Resultado — {garmentName}
            </p>
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-100 shadow-lg">
              <Image
                src={resultUrl}
                alt="Resultado"
                fill
                className="object-cover"
                unoptimized
              />
              {/* Two action buttons at the bottom of the generated image */}
              <div className="absolute inset-x-3 bottom-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalMode("switch")}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-zinc-900/80 py-2.5 text-xs font-bold text-white backdrop-blur transition-colors hover:bg-zinc-900/95"
                >
                  ↕ Cambiar prenda
                </button>
                <button
                  type="button"
                  onClick={() => setModalMode("combine")}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-rose-600/90 py-2.5 text-xs font-bold text-white backdrop-blur transition-colors hover:bg-rose-600"
                >
                  + Combinar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 rounded-xl bg-rose-600 py-3 text-sm font-bold text-white transition-colors hover:bg-rose-700 sm:max-w-xs"
          >
            Descargar imagen
          </button>
          <button
            type="button"
            onClick={onReset}
            className="flex-1 rounded-xl border border-zinc-200 bg-white py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 sm:max-w-xs"
          >
            Cambiar foto
          </button>
          <Link
            href="/"
            className="flex-1 rounded-xl border border-zinc-200 bg-white py-3 text-center text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 sm:max-w-xs"
          >
            Catálogo
          </Link>
        </div>

        <p className="text-center text-xs text-zinc-400">
          Generado por Google Gemini
        </p>
      </div>

      {/* Garment picker modal — shared for switch & combine */}
      {modalMode !== null && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-900/60 backdrop-blur-sm sm:items-center"
          onClick={() => setModalMode(null)}
        >
          <div
            className="w-full max-w-lg rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-1 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-900">
                  {modalMode === "combine" ? "Combinar con otra prenda" : "Cambiar prenda"}
                </h3>
                <p className="text-xs text-zinc-400">
                  {modalMode === "combine"
                    ? "La IA agrega esta prenda sobre el look generado"
                    : "La IA reemplaza la prenda actual por esta"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              >
                ✕
              </button>
            </div>
            <div
              className="mt-4 grid grid-cols-3 gap-2 overflow-y-auto"
              style={{ maxHeight: "58vh" }}
            >
              {products.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setModalMode(null);
                    if (modalMode === "combine") onCombineGarment(p);
                    else onSwitchGarment(p);
                  }}
                  className="overflow-hidden rounded-xl border-2 border-zinc-100 text-left transition-all hover:border-rose-400 active:scale-95"
                >
                  <div className="relative aspect-[3/4] bg-zinc-50">
                    <Image
                      src={p.imageUrl}
                      alt={p.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="p-1.5">
                    <p className="line-clamp-2 text-xs font-semibold leading-tight text-zinc-800">
                      {p.name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
