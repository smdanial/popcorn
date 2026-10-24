import Image from "next/image";
import { Film, Tv } from "lucide-react";
import { cn, initials } from "@/lib/utils";

export function Poster({
  src,
  alt,
  className,
  sizes = "(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw",
  priority = false,
  type,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  type?: string;
}) {
  const Icon = type === "TV" ? Tv : Film;

  return (
    <div
      className={cn(
        "poster-grain relative overflow-hidden rounded-xl bg-panel2",
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-br from-[#23252b] via-[#15161a] to-[#0d0e11] p-4">
          <Icon className="h-5 w-5 text-white/25" />
          <div>
            <span className="block text-3xl font-black tracking-tight text-white/25">
              {initials(alt)}
            </span>
            <span className="mt-1 block text-[10px] uppercase tracking-[0.16em] text-white/20">
              {alt}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
