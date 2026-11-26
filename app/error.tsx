"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="text-2xl font-bold">Terjadi kendala</h1>
      <p className="mt-2 text-slate-600">Data belum dapat dimuat saat ini. Silakan coba beberapa saat lagi.</p>
      <button onClick={reset} className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
        Coba lagi
      </button>
    </div>
  );
}
