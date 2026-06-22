"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type GameCarouselItem = {
  label: string;
  href: string;
  backgroundImage: string;
};

type GameCarouselProps = {
  items: GameCarouselItem[];
};

export function GameCarousel({ items }: GameCarouselProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const scrollByAmount = (direction: "left" | "right") => {
    if (!listRef.current) return;

    const { clientWidth } = listRef.current;
    const delta = direction === "left" ? -clientWidth * 0.8 : clientWidth * 0.8;

    listRef.current.scrollBy({ left: delta, behavior: "smooth" });
  };

  useEffect(() => {
    if (isPaused || items.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = window.setInterval(() => {
      const list = listRef.current;
      if (!list) return;

      const nearEnd = list.scrollLeft + list.clientWidth >= list.scrollWidth - 16;
      if (nearEnd) {
        list.scrollTo({ left: 0, behavior: "smooth" });
        return;
      }

      list.scrollBy({
        left: Math.min(list.clientWidth * 0.72, 320),
        behavior: "smooth",
      });
    }, 5000);

    return () => window.clearInterval(interval);
  }, [isPaused, items.length]);

  return (
    <div
      className="relative min-w-0 max-w-full"
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        ref={listRef}
        className="flex min-w-0 max-w-full snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-3 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <Link
            key={item.href}
            aria-label={`Ver torneos de ${item.label}`}
            className="ui-game-card group relative h-48 min-w-[230px] max-w-[calc(100vw-2rem)] snap-start overflow-hidden rounded-lg border border-zinc-200 sm:min-w-[270px]"
            href={item.href}
            style={{
              backgroundImage: item.backgroundImage,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            title={item.label}
          >
            <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-4 pb-4 pt-16 text-sm font-semibold text-white">
              <span className="text-clamp-2">{item.label}</span>
              <span className="ui-badge-accent shrink-0 rounded-full px-2 py-0.5 text-[11px]">Torneos</span>
            </span>
          </Link>
        ))}
      </div>

      <button
        type="button"
        aria-label="Anterior"
        className="absolute left-0 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-zinc-700 shadow-sm transition hover:bg-white sm:flex"
        onClick={() => scrollByAmount("left")}
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Siguiente"
        className="absolute right-0 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-zinc-700 shadow-sm transition hover:bg-white sm:flex"
        onClick={() => scrollByAmount("right")}
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
