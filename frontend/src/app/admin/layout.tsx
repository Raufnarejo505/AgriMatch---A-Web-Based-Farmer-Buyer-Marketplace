"use client";

import { usePathname } from "next/navigation";
import RoleGuard from "@/components/RoleGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // First-time setup must be accessible before an admin account exists.
  // The backend requires the private ADMIN_SETUP_TOKEN and rejects setup
  // once an administrator is configured.
  if (pathname === "/admin/setup" || pathname === "/admin/setup/") {
    return <>{children}</>;
  }

  return <RoleGuard role="admin">{children}</RoleGuard>;
}
