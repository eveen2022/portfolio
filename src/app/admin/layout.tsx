import type { Metadata } from "next";
import { ToastProvider } from "@/components/admin/toast/ToastProvider";
import { ConfirmProvider } from "@/components/admin/confirm/ConfirmProvider";

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
    <ToastProvider>
      <ConfirmProvider>
        <div className="relative min-h-full">
          <div className="tech-bg" aria-hidden="true">
            <div className="tech-bg-mid" />
          </div>
          {children}
        </div>
      </ConfirmProvider>
    </ToastProvider>
  );
}
