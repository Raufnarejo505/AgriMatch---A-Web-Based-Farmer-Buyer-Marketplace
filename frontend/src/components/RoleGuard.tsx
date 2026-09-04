"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getUser, roleHome } from "@/lib/auth";
import type { Role } from "@/types";
import { Loading } from "./States";

export default function RoleGuard({ role, children }: { role?: Role; children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    if (role && user.role !== role) {
      router.replace(roleHome[user.role]);
      return;
    }
    setReady(true);
  }, [role, router]);

  if (!ready) return <Loading label="Checking access..." />;
  return <>{children}</>;
}
