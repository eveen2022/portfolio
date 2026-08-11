import { Download } from "lucide-react";
import { siteMeta } from "@/lib/site";
import { HeaderNav } from "@/components/layout/HeaderNav";

export function Header() {
  return (
    <header className="fixed inset-x-0 top-4 z-40 flex items-center justify-center gap-3 px-4 sm:top-6 sm:px-6">
      <div className="glass glass-sheen relative flex h-16 items-center gap-1 rounded-full px-2.5 shadow-xl shadow-black/5 sm:h-14 sm:px-2">
        <HeaderNav nav={siteMeta.nav} />
      </div>

      {/* Deliberately its own floating pill, not merged into the nav bar.
          Hidden on mobile — the resume action lives in the floating menu there instead. */}
      <a
        href="/resume.pdf"
        download
        className="glass glow-ring relative hidden h-14 shrink-0 items-center gap-2 rounded-full px-5 text-sm font-semibold text-foreground shadow-xl shadow-black/5 transition-transform hover:scale-105 active:scale-95 sm:flex"
      >
        <Download className="size-4" /> Resume
      </a>
    </header>
  );
}
