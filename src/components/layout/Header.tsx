import { Download } from "lucide-react";
import { siteMeta } from "@/lib/site";
import { getSiteConfig } from "@/lib/data";
import { HeaderNav } from "@/components/layout/HeaderNav";

// Maps a nav label to the sections.* flag that controls whether it shows.
// "Home" has no flag — always shown.
function isNavItemVisible(label: string, sections: Awaited<ReturnType<typeof getSiteConfig>>["sections"]): boolean {
  switch (label) {
    case "About":
      return sections.about;
    case "Projects":
      return sections.projects;
    case "Experience":
      return sections.experience;
    case "Education":
      return sections.education;
    case "Blog":
      return sections.blog;
    case "Contact":
      return sections.contact;
    default:
      return true;
  }
}

export async function Header({ isAdminSession = false }: { isAdminSession?: boolean }) {
  const siteConfig = await getSiteConfig();
  // Admin sees every nav item regardless of section toggles — same "preview
  // while it's off" bypass proxy.ts already applies to the routes themselves.
  const nav = isAdminSession
    ? siteMeta.nav
    : siteMeta.nav.filter((item) => isNavItemVisible(item.label, siteConfig.sections));

  return (
    <header className="fixed inset-x-0 top-4 z-40 flex items-center justify-center gap-3 px-4 sm:top-6 sm:px-6">
      <div className="glass glass-sheen relative flex h-16 items-center gap-1 rounded-full px-2.5 shadow-xl shadow-black/5 sm:h-14 sm:px-2">
        <HeaderNav nav={nav} />
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
