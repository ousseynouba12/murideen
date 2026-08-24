import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = {
  title: "Murideen — Espace de gestion",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
