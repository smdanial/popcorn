import Image from "next/image";
import { Logo } from "@/components/logo";

const posters = [
  { src: "/posters/blade-runner-2049.svg", className: "left-[2%] top-[6%] w-[42%] rotate-[-7deg]" },
  { src: "/posters/severance.svg", className: "right-[4%] top-[0%] w-[38%] rotate-[6deg]" },
  { src: "/posters/arrival.svg", className: "left-[22%] top-[27%] w-[44%] rotate-[2deg] z-10" },
  { src: "/posters/her.svg", className: "right-[0%] top-[38%] w-[34%] rotate-[-5deg]" },
  { src: "/posters/dark.svg", className: "left-[4%] top-[56%] w-[36%] rotate-[5deg]" },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.08fr_1fr]">
      <aside className="relative hidden overflow-hidden border-r border-line bg-coal p-10 lg:flex lg:flex-col">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(800px 500px at 30% 20%, rgba(247,201,72,0.12), transparent 60%), radial-gradient(600px 500px at 90% 80%, rgba(255,107,74,0.08), transparent 60%)",
          }}
        />
        <div className="relative z-20">
          <Logo href="/login" />
        </div>

        <div className="relative my-8 min-h-[380px] flex-1 overflow-hidden">
          {posters.map((poster) => (
            <div
              key={poster.src}
              className={`absolute overflow-hidden rounded-2xl border border-white/10 shadow-card ${poster.className}`}
            >
              <Image
                src={poster.src}
                alt=""
                width={600}
                height={900}
                className="h-auto w-full"
                priority
              />
            </div>
          ))}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-coal via-coal/75 to-transparent" />
        </div>

        <div className="relative z-20 max-w-lg">
          <p className="eyebrow text-corn">The watch diary, with receipts</p>
          <h1 className="mt-4 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight">
            You watched it. Now see what it cost you — in hours.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-mist">
            Track every film and episode, rate what moved you, and turn a
            lifetime of screens into beautiful, ridiculous statistics.
          </p>
          <div className="mt-8 flex items-center gap-6 text-xs text-mist">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-corn" />
              20 seeded titles
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-ember" />
              Lifetime analytics
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-mint" />
              Episode-level
            </span>
          </div>
        </div>
      </aside>

      <main className="flex min-h-dvh items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
