import { Suspense } from "react";
import { TryOnClient } from "~/app/_components/TryOnClient";

export const metadata = {
  title: "Try On — VirtualFit",
};

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-rose-600" />
    </div>
  );
}

export default function TryOnPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TryOnClient />
    </Suspense>
  );
}
