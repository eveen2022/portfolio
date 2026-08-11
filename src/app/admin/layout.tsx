import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-full">
      <div className="tech-bg" aria-hidden="true">
        <div className="tech-bg-mid" />
      </div>
      {children}
    </div>
  );
}
