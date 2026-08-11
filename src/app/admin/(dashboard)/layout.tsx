import { AdminShell } from "@/components/admin/AdminShell";
import { ToastProvider } from "@/components/admin/toast/ToastProvider";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <AdminShell>{children}</AdminShell>
    </ToastProvider>
  );
}
