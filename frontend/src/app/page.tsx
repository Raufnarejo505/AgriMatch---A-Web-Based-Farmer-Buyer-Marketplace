"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Loading } from "@/components/States";
import { getUser, roleHome } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    router.replace(user ? roleHome[user.role] : "/login");
  }, [router]);

  return <Loading label="Redirecting..." />;
}
