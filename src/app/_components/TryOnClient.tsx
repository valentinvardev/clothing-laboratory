"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";
import {
  sampleGarments,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  getGarmentById,
} from "~/lib/garments";
import type { GarmentCategory } from "~/lib/garments";
import { ImageUpload } from "~/app/_components/ImageUpload";

type Step = "setup" | "generating" | "result";

export function TryOnClient() {
  const searchParams = useSearchParams();
  const garmentIdParam = searchParams.get("garmentId");

  const [selectedGarmentId, setSelectedGarmentId] = useState<string | null>(
    garmentIdParam,
  );
  const [customGarmentImage, setCustomGarmentImage] = useState<string | null>(
    null,
  );
  const [customCategory, setCustomCategory] =
    useState<GarmentCategory>("tops");
  const [personImage, setPersonImage] = useState<string | null>(null);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("setup");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedGarment = selectedGarmentId
    ? getGarmentById(selectedGarmentId)
    : null;

  const activeGarmentImage =
    selectedGarment?.imageUrl ?? customGarmentImage ?? null;
  const activeCategory: GarmentCategory =
    selectedGarment?.category ?? customCategory;

  const canGenerate =
    !!personImage && (!!selectedGarment || !!customGarmentImage);

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

  const handleGenerate = useCallback(async () => {
    if (!personImage || !activeGarmentImage) return;
    setErrorMsg(null);
    setStep("generating");
    generate.mutate({
      modelImage: personImage,
      garmentImage: activeGarmentImage,
      category: activeCategory,
    });
  }, [personImage, activeGarmentImage, activeCategory, generate]);

  const handleReset = () => {
    setResultUrl(null);
    setStep("setup");
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-1 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
          >
            ← Back
          </Link>
          <span className="text-xl font-black tracking-tight text-zinc-900">
            Virtual<span className="text-rose-600">Fit</span>
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900">
            {selectedGarment ? `Try On: ${selectedGarment.name}` : "Virtual Try-On"}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Upload your photo and generate a realistic try-on image powered by
            AI.
          </p>
        </div>

        {step === "result" && resultUrl ? (
          <ResultView
            resultUrl={resultUrl}
            garmentName={selectedGarment?.name ?? "Custom garment"}
            onReset={handleReset}
          />
        ) : step === "generating" ? (
          <GeneratingView />
        ) : (
          <SetupView
            selectedGarmentId={selectedGarmentId}
            setSelectedGarmentId={setSelectedGarmentId}
            selectedGarment={selectedGarment ?? null}
            customGarmentImage={customGarmentImage}
            setCustomGarmentImage={setCustomGarmentImage}
            customCategory={customCategory}
            setCustomCategory={setCustomCategory}
            personImage={personImage}
            setPersonImage={setPersonImage}
            height={height}
            setHeight={setHeight}
            weight={weight}
            setWeight={setWeight}
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
  selectedGarment: (typeof sampleGarments)[0] | null;
  customGarmentImage: string | null;
  setCustomGarmentImage: (v: string | null) => void;
  customCategory: GarmentCategory;
  setCustomCategory: (v: GarmentCategory) => void;
  personImage: string | null;
  setPersonImage: (v: string | null) => void;
  height: string;
  setHeight: (v: string) => void;
  weight: string;
  setWeight: (v: string) => void;
  canGenerate: boolean;
  onGenerate: () => void;
  errorMsg: string | null;
}

function SetupView({
  selectedGarmentId,
  setSelectedGarmentId,
  selectedGarment,
  customGarmentImage,
  setCustomGarmentImage,
  customCategory,
  setCustomCategory,
  personImage,
  setPersonImage,
  height,
  setHeight,
  weight,
  setWeight,
  canGenerate,
  onGenerate,
  errorMsg,
}: SetupViewProps) {
  const [showGarmentPicker, setShowGarmentPicker] = useState(
    !selectedGarmentId,
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left: Garment */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-zinc-800">Garment</h2>
            {selectedGarment && (
              <button
                type="button"
                onClick={() => setShowGarmentPicker(true)}
                className="text-xs font-medium text-rose-600 hover:text-rose-700"
              >
                Change
              </button>
            )}
          </div>

          {selectedGarment && !showGarmentPicker ? (
            <div className="flex flex-col gap-3">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-zinc-100">
                <Image
                  src={selectedGarment.imageUrl}
                  alt={selectedGarment.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[selectedGarment.category]}`}
                >
                  {CATEGORY_LABELS[selectedGarment.category]}
                </span>
                <p className="mt-1 font-semibold text-zinc-900">
                  {selectedGarment.name}
                </p>
              </div>
            </div>
          ) : showGarmentPicker ? (
            <GarmentPicker
              selectedId={selectedGarmentId}
              onSelect={(id) => {
                setSelectedGarmentId(id);
                setCustomGarmentImage(null);
                setShowGarmentPicker(false);
              }}
              onUpload={(img, cat) => {
                setCustomGarmentImage(img);
                setCustomCategory(cat);
                setSelectedGarmentId(null);
                setShowGarmentPicker(false);
              }}
            />
          ) : (
            <div className="flex flex-col gap-3">
              <ImageUpload
                label="Your Garment"
                hint="Upload any clothing item"
                value={customGarmentImage}
                onImageChange={setCustomGarmentImage}
              />
              <div>
                <label className="text-xs font-medium text-zinc-600">
                  Category
                </label>
                <select
                  value={customCategory}
                  onChange={(e) =>
                    setCustomCategory(e.target.value as GarmentCategory)
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  <option value="tops">Top</option>
                  <option value="bottoms">Bottom</option>
                  <option value="one-pieces">One Piece</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => setShowGarmentPicker(true)}
                className="text-xs font-medium text-rose-600 hover:text-rose-700"
              >
                Or pick from our collection →
              </button>
            </div>
          )}
        </div>

        {/* Right: Person photo + measurements */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-zinc-800">Your Photo</h2>

          <ImageUpload
            label="Person photo"
            hint="Full-body or half-body photo works best"
            value={personImage}
            onImageChange={setPersonImage}
          />

          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Measurements (optional)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-zinc-600">
                  Height (cm)
                </label>
                <input
                  type="number"
                  placeholder="170"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  placeholder="65"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>
          </div>
        </div>
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
        Generate Try-On
      </button>

      {!canGenerate && (
        <p className="text-center text-xs text-zinc-400">
          {!personImage && !selectedGarmentId && !customGarmentImage
            ? "Upload your photo and select a garment to continue"
            : !personImage
              ? "Upload your photo to continue"
              : "Select or upload a garment to continue"}
        </p>
      )}
    </div>
  );
}

// ─── Garment Picker ───────────────────────────────────────────────────────────

function GarmentPicker({
  selectedId,
  onSelect,
  onUpload,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUpload: (img: string, category: GarmentCategory) => void;
}) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadCategory, setUploadCategory] = useState<GarmentCategory>("tops");

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 overflow-y-auto" style={{ maxHeight: "420px" }}>
        {sampleGarments.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => onSelect(g.id)}
            className={`overflow-hidden rounded-xl border-2 text-left transition-all ${
              selectedId === g.id
                ? "border-rose-500 shadow-md"
                : "border-zinc-200 hover:border-zinc-300"
            }`}
          >
            <div className="relative aspect-[4/5] bg-zinc-100">
              <Image
                src={g.imageUrl}
                alt={g.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="p-2">
              <p className="truncate text-xs font-semibold text-zinc-800">
                {g.name}
              </p>
              <p className="text-xs text-zinc-400">
                {CATEGORY_LABELS[g.category]}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="border-t border-zinc-100 pt-4">
        <p className="mb-2 text-xs font-semibold text-zinc-500">
          Or upload your own
        </p>
        <ImageUpload
          label=""
          value={uploadedImage}
          onImageChange={setUploadedImage}
        />
        {uploadedImage && (
          <div className="mt-2 flex flex-col gap-2">
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value as GarmentCategory)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              <option value="tops">Top</option>
              <option value="bottoms">Bottom</option>
              <option value="one-pieces">One Piece</option>
            </select>
            <button
              type="button"
              onClick={() => onUpload(uploadedImage, uploadCategory)}
              className="rounded-lg bg-zinc-900 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
            >
              Use this garment
            </button>
          </div>
        )}
      </div>
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
        <p className="text-lg font-bold text-zinc-900">Generating your try-on…</p>
        <p className="mt-1 text-sm text-zinc-500">
          This usually takes 10–20 seconds. Hang tight!
        </p>
      </div>
    </div>
  );
}

// ─── Result View ──────────────────────────────────────────────────────────────

function ResultView({
  resultUrl,
  garmentName,
  onReset,
}: {
  resultUrl: string;
  garmentName: string;
  onReset: () => void;
}) {
  const handleDownload = async () => {
    try {
      const res = await fetch(resultUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `virtualfit-${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(resultUrl, "_blank");
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg">
        <div className="relative aspect-[3/4] bg-zinc-100">
          <Image
            src={resultUrl}
            alt="Try-on result"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="p-4 text-center">
          <p className="text-sm font-semibold text-zinc-800">{garmentName}</p>
          <p className="text-xs text-zinc-400">Generated by Fashn.ai</p>
        </div>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3">
        <button
          type="button"
          onClick={handleDownload}
          className="w-full rounded-xl bg-rose-600 py-3 text-sm font-bold text-white transition-colors hover:bg-rose-700"
        >
          Download Image
        </button>
        <button
          type="button"
          onClick={onReset}
          className="w-full rounded-xl border border-zinc-200 bg-white py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          Try Another Look
        </button>
        <Link
          href="/"
          className="block w-full rounded-xl border border-zinc-200 bg-white py-3 text-center text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          Back to Gallery
        </Link>
      </div>
    </div>
  );
}
