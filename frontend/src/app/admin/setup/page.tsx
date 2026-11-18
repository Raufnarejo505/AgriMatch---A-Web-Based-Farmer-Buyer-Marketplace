"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import { useLanguage } from "@/components/LanguageProvider";
import { api, ApiError } from "@/lib/api";
import { roleHome, setAuth } from "@/lib/auth";
import type { AuthResponse } from "@/types";

export default function AdminSetupPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const ur = language === "ur";
  const [name, setName] = useState("Abdul Rauf");
  const [cnic, setCnic] = useState("");
  const [password, setPassword] = useState("");
  const [setupKey, setSetupKey] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    const digits = cnic.replace(/\D/g, "");
    if (digits.length !== 13) {
      setError(ur ? "شناختی کارڈ کے ۱۳ ہندسے درج کریں۔" : "Enter your 13-digit CNIC.");
      return;
    }
    setBusy(true);
    try {
      const result = await api.post<AuthResponse>("/api/auth/setup-admin", {
        name: name.trim(), cnic: digits, password, setup_key: setupKey.trim(),
      });
      setAuth(result.access_token, result.user);
      router.replace(roleHome[result.user.role]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : (ur ? "دوبارہ کوشش کریں۔" : "Setup failed. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  const field = "w-full rounded-xl border border-[#cbdacc] bg-white p-3 text-[#153d28] outline-none focus:border-[#17643e] focus:ring-2 focus:ring-[#17643e]/20";
  return (
    <AuthShell
      mode="register"
      language={language}
      title={ur ? "منتظم کا محفوظ اندراج" : "Set up the administrator"}
      subtitle={ur ? "یہ فارم صرف پہلی بار منتظم بنانے کے لیے ہے۔" : "This one-time setup is only for the project owner. Once an administrator exists, no more accounts can be created here."}
    >
      <form onSubmit={submit} className="space-y-4">
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <label className="block text-sm font-semibold text-[#244632]">
          {ur ? "پورا نام" : "Full name"}
          <input className={field+" mt-1"} required minLength={2} maxLength={120} autoComplete="name" value={name} onChange={e=>setName(e.target.value)}/>
        </label>
        <label className="block text-sm font-semibold text-[#244632]">
          {ur ? "شناختی کارڈ نمبر" : "CNIC number"}
          <input className={field+" mt-1"} required inputMode="numeric" maxLength={15} autoComplete="off" placeholder="12345-1234567-1" value={cnic} onChange={e=>setCnic(e.target.value)}/>
        </label>
        <label className="block text-sm font-semibold text-[#244632]">
          {ur ? "پاس ورڈ" : "Password"}
          <input className={field+" mt-1"} required type="password" minLength={8} maxLength={72} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)}/>
        </label>
        <label className="block text-sm font-semibold text-[#244632]">
          {ur ? "ایک بار استعمال ہونے والی منتظم کلید" : "One-time administrator setup key"}
          <input className={field+" mt-1"} required type="password" minLength={32} maxLength={128} autoComplete="off" value={setupKey} onChange={e=>setSetupKey(e.target.value)}/>
        </label>
        <p className="text-xs leading-5 text-[#607568]">{ur ? "اس صفحے کو صرف آپ کے پروجیکٹ کے مالک کو استعمال کرنا چاہیے۔ کلید کو کسی کے ساتھ شیئر نہ کریں۔" : "Keep your setup key private. Public registration cannot grant administrator access. If your CNIC is already registered, enter the existing account password."}</p>
        <button type="submit" disabled={busy} className="w-full rounded-xl bg-[#135333] px-5 py-3 font-semibold text-white hover:bg-[#1d6b46] disabled:opacity-60">
          {busy ? (ur ? "اندراج ہو رہا ہے..." : "Creating administrator...") : (ur ? "منتظم بنائیں" : "Create administrator")}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-[#607568]"><Link className="underline" href="/login">{ur ? "لاگ اِن پر واپس" : "Back to login"}</Link></p>
    </AuthShell>
  );
}
