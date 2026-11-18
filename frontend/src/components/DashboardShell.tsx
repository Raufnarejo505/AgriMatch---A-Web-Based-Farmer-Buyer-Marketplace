"use client";

import { useEffect, useState } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const user = getUser();
  const home = roleHome[role];

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  function logout() {
    setMenuOpen(false);
    clearAuth();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen min-w-0">
      <header className="border-b border-green-100 bg-white">
        <div className="mx-auto max-w-6xl px-3 sm:px-4">
          <div className="flex min-h-16 items-center justify-between gap-2 py-2">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <Link href={home} className="shrink-0 text-lg font-bold text-green-700">
                AgriMatch
              </Link>
              <span className="truncate rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                {labels[role]}
              </span>
            </div>
            <div className="hidden min-w-0 items-center gap-3 text-sm sm:flex">
              <Link href="/profile" className="max-w-40 truncate font-medium text-gray-700 hover:text-green-700">
                {user?.name ?? "Profile"}
              </Link>
              <Button type="button" variant="ghost" onClick={logout}>
                Log out
              </Button>
            </div>
            <button
              type="button"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-green-200 text-2xl text-green-800 hover:bg-green-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 sm:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-controls="mobile-main-nav"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span aria-hidden="true">{menuOpen ? "×" : "☰"}</span>
            </button>
          </div>
          <nav aria-label="Main navigation" className="hidden gap-1 overflow-x-auto pb-2 sm:flex">
            {navItems[role].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                className={`whitespace-nowrap rounded-md px-3 py-2 text-sm transition ${
                  pathname === item.href
                    ? "bg-green-100 font-medium text-green-800"
                    : "text-gray-600 hover:bg-green-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {menuOpen && (
            <nav id="mobile-main-nav" aria-label="Mobile navigation" className="border-t border-green-100 py-3 sm:hidden">
              <div className="grid grid-cols-2 gap-2">
                {navItems[role].map((item) => (
                  <Link key={item.href} href={item.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className={pathname === item.href
                      ? "flex min-h-11 items-center rounded-lg bg-green-100 px-3 py-2 text-sm font-semibold text-green-800"
                      : "flex min-h-11 items-center rounded-lg bg-green-50/50 px-3 py-2 text-sm text-gray-700"}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-green-100 pt-3">
                <Link href="/profile" onClick={() => setMenuOpen(false)}
                  className="flex min-h-11 min-w-0 max-w-[65%] items-center truncate rounded-md px-2 text-sm font-medium text-green-800">
                  {user?.name ?? "Profile"}
                </Link>
                <Button type="button" variant="secondary" onClick={logout}>Log out</Button>
              </div>
            </nav>
          )}
        </div>
      </header>
      <main className="mx-auto min-w-0 max-w-6xl px-3 py-4 sm:px-4 sm:py-6">
        <h1 className="mb-4 break-words text-lg font-semibold text-gray-900 sm:mb-5 sm:text-xl">{title}</h1>
        {children}
      </main>
    </div>
  );
}
