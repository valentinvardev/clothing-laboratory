"use client";

import { useCallback, useRef } from "react";
import Image from "next/image";

interface ImageUploadProps {
  label: string;
  hint?: string;
  value: string | null;
  onImageChange: (base64: string | null) => void;
}

async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const MAX = 900;
      const scale = Math.min(MAX / img.width, MAX / img.height, 1);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not available"));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.88));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export function ImageUpload({
  label,
  hint,
  value,
  onImageChange,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;
      try {
        const compressed = await compressImage(file);
        onImageChange(compressed);
      } catch {
        alert("Could not process image. Please try another file.");
      }
    },
    [onImageChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) void handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) =>
    e.preventDefault();

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-zinc-700">{label}</span>
      {hint && <span className="text-xs text-zinc-400">{hint}</span>}

      {value ? (
        <div className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
          <Image
            src={value}
            alt={label}
            fill
            className="object-cover"
            unoptimized
          />
          <button
            type="button"
            onClick={() => onImageChange(null)}
            className="absolute right-2 top-2 rounded-md bg-zinc-900/70 px-2 py-1 text-xs font-medium text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 hover:bg-zinc-900"
          >
            Remove
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => inputRef.current?.click()}
          className="flex aspect-[3/4] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 transition-colors hover:border-rose-400 hover:bg-rose-50"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-2xl">
            📷
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-600">
              Drop image here or{" "}
              <span className="text-rose-600">browse</span>
            </p>
            <p className="mt-0.5 text-xs text-zinc-400">
              JPG, PNG, WEBP — max ~5 MB
            </p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
