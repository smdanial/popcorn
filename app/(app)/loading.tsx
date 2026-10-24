export default function Loading() {
  return (
    <div className="container-page animate-pulse py-10">
      <div className="h-3 w-32 rounded-full bg-white/[0.06]" />
      <div className="mt-4 h-12 w-2/3 max-w-xl rounded-2xl bg-white/[0.05]" />
      <div className="mt-3 h-4 w-1/2 max-w-md rounded-full bg-white/[0.04]" />
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 rounded-2xl border border-line bg-panel/60" />
        ))}
      </div>
      <div className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="aspect-[2/3] rounded-xl border border-line bg-panel/60"
          />
        ))}
      </div>
    </div>
  );
}
