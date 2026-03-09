import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <AdminShell>{children}</AdminShell>;
}
