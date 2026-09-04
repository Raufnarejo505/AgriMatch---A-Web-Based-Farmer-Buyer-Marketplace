"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { clearAuth, getUser, roleHome } from "@/lib/auth";
import type { Role } from "@/types";
import Button from "./Button";

const labels: Record<Role, string> = {
  farmer: "Farmer",
  buyer: "Buyer",
  admin: "Admin",
};

const navItems: Record<Role, { href: string; label: string }[]> = {
  farmer: [
    { href: "/farmer", label: "Dashboard" },
    { href: "/farmer/listings", label: "My listings" },
    { href: "/farmer/requirements", label: "Browse requirements" },
    { href: "/conversations", label: "Chats" },
    { href: "/offers", label: "Offers" },
    { href: "/orders", label: "Orders" },
  ],
  buyer: [
    { href: "/buyer", label: "Dashboard" },
    { href: "/buyer/requirements", label: "My requirements" },
    { href: "/buyer/listings", label: "Browse crops" },
    { href: "/conversations", label: "Chats" },
    { href: "/offers", label: "Offers" },
    { href: "/orders", label: "Orders" },
  ],
  admin: [{ href: "/admin", label: "Dashboard" }],
};

type Props = {
  role: Role;
  title: string;
  children: React.ReactNode;
};

export default function DashboardShell({ role, title, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const user = getUser();
  const home = roleHome[role];

  function logout() {
    clearAuth();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-green-100 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-3">
              <Link href={home} className="text-lg font-bold text-green-700">
                AgriMatch
              </Link>
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                {labels[role]}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Link href="/profile" className="font-medium text-gray-700 hover:text-green-700">
                {user?.name ?? "Profile"}
              </Link>
              <Button type="button" variant="ghost" onClick={logout}>
                Log out
              </Button>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto pb-2">
            {navItems[role].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition ${
                  pathname === item.href
                    ? "bg-green-100 font-medium text-green-800"
                    : "text-gray-600 hover:bg-green-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="mb-5 text-xl font-semibold text-gray-900">{title}</h1>
        {children}
      </main>
    </div>
  );
}
