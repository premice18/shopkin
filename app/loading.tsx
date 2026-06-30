export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface" aria-busy="true">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-white p-8 shadow-sm">
        <div className="mx-auto h-4 w-2/3 animate-pulse rounded bg-zinc-200" />
        <div className="h-3 w-full animate-pulse rounded bg-zinc-200" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-zinc-200" />
        <div className="mt-2 h-10 w-full animate-pulse rounded-xl bg-zinc-200" />
      </div>
      <span className="sr-only">Chargement en cours...</span>
    </div>
  );
}
