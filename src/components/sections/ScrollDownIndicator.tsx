"use client";

import { useRef } from "react";

const HEADER_OFFSET = 112;

export function ScrollDownIndicator() {
  const ref = useRef<HTMLButtonElement>(null);

  function handleClick() {
    const section = ref.current?.closest("section");
    const next = section?.nextElementSibling;
    if (!next) return;
    const top = next.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top, behavior: "smooth" });
  }

  return (
    <div className="scroll-pill-in absolute inset-x-0 bottom-8 flex justify-center sm:bottom-10">
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        aria-label="Scroll to next section"
        className="group glass relative flex h-11 w-7 items-start justify-center rounded-full p-2 shadow-none transition-all duration-300 hover:scale-105 hover:shadow-[0_0_24px_-6px_var(--accent-soft)]"
      >
        <span className="scroll-wheel-dot size-1.5 rounded-full bg-gradient-to-b from-accent to-accent-2" />
      </button>
    </div>
  );
}
