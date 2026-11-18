"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import AuthShell from "@/components/AuthShell";
import { useLanguage } from "@/components/LanguageProvider";
import { ApiError, api } from "@/lib/api";
import { roleHome, setAuth } from "@/lib/auth";
import type { AuthResponse } from "@/types";

const words = {
  en: {
    title: "Welcome back",
    subtitle: "Sign in to your AgriMatch account to continue where you left off.",
    cnic: "CNIC number",
    cnicPlaceholder: "12345-1234567-1",
    cnicHint: "Use the 13 digits on your Pakistani identity card.",
    emailPlaceholder: "you@example.com",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    show: "Show password",
    hide: "Hide password",
    submit: "Sign in",
    submitting: "Signing in...",
    noAccount: "New to AgriMatch?",
    register: "Create an account",
    note: "One place for your crop listings, conversations, and orders.",
    invalid: "Invalid CNIC or password. Please use your registered CNIC and password.",
    generic: "Unable to sign in. Please try again.",
  },
  ur: {
    title: "دوبارہ خوش آمدید",
    subtitle: "جہاں سے آپ نے چھوڑا تھا، وہیں سے جاری رکھنے کے لیے اپنے ایگری میچ اکاؤنٹ میں لاگ اِن کریں۔",
    cnic: "شناختی کارڈ نمبر (CNIC)",
    cnicPlaceholder: "12345-1234567-1",
    cnicHint: "اپنے پاکستانی شناختی کارڈ کے ۱۳ ہندسے درج کریں۔",
    emailPlaceholder: "you@example.com",
    password: "پاس ورڈ",
    passwordPlaceholder: "اپنا پاس ورڈ درج کریں",
    show: "پاس ورڈ دکھائیں",
    hide: "پاس ورڈ چھپائیں",
    submit: "لاگ اِن کریں",
    submitting: "لاگ اِن ہو رہا ہے...",
    noAccount: "ایگری میچ پر نئے ہیں؟",
    register: "اکاؤنٹ بنائیں",
    note: "فصلوں کی فہرستیں، گفتگو اور آرڈرز ایک ہی جگہ سنبھالیں۔",
    invalid: "شناختی کارڈ نمبر یا پاس ورڈ درست نہیں۔ وہی تفصیلات استعمال کریں جو رجسٹریشن میں دی تھیں۔",
    generic: "لاگ اِن نہیں ہو سکا۔ دوبارہ کوشش کریں۔",
  },
} as const;

const fieldClass = "block h-[52px] w-full rounded-[13px] border border-[#ccd7cc] bg-white/80 px-4 text-[15px] text-[#183b2a] shadow-sm outline-none transition-colors placeholder:text-[#90a196] hover:border-[#9daf9d] focus:border-[#2b7247] focus:ring-2 focus:ring-[#2b7247]/15";
const labelClass = "mb-2 block text-[13px] font-bold text-[#244632]";

export default function LoginPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const c = words[language];
  const [cnic, setCnic] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const data = await api.post<AuthResponse>("/api/auth/login", {
        cnic: cnic.replace(/\D/g, ""),
        password,
      });
      setAuth(data.access_token, data.user);
      router.replace(roleHome[data.user.role]);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? c.invalid
          : err instanceof ApiError
            ? err.message
            : c.generic,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell mode="login" language={language} title={c.title} subtitle={c.subtitle}>
      <form onSubmit={onSubmit} className="space-y-5">
        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] leading-6 text-red-800">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="login-cnic" className={labelClass}>{c.cnic}</label>
          <input
            id="login-cnic"
            name="cnic"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            dir="ltr"
            pattern="[0-9]{5}-?[0-9]{7}-?[0-9]"
            maxLength={15}
            required
            placeholder={c.cnicPlaceholder}
            value={cnic}
            onChange={(event) => {
              const digits = event.target.value.replace(/\D/g, "").slice(0, 13);
              setCnic(digits.length > 12 ? digits.slice(0,5) + "-" + digits.slice(5,12) + "-" + digits.slice(12) : digits.length > 5 ? digits.slice(0,5) + "-" + digits.slice(5) : digits);
            }}
            className={fieldClass}
          />
          <p className="mt-1 text-[11px] text-[#6d826f]">{c.cnicHint}</p>
        </div>

        <div>
          <label htmlFor="login-password" className={labelClass}>{c.password}</label>
          <div className="relative">
            <input
              id="login-password"
              name="password"
              type={passwordVisible ? "text" : "password"}
              autoComplete="current-password"
              dir="ltr"
              required
              placeholder={c.passwordPlaceholder}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={fieldClass + " pe-14"}
            />
            <button
              type="button"
              onClick={() => setPasswordVisible((visible) => !visible)}
              aria-label={passwordVisible ? c.hide : c.show}
              aria-pressed={passwordVisible}
              className="absolute end-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-[#536d5b] hover:bg-[#eef3e8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2b7247]"
            >
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {passwordVisible ? (
                  <><path d="M3 3 21 21M10.6 10.7a2 2 0 0 0 2.7 2.7"/><path d="M9.9 5.3A10.9 10.9 0 0 1 12 5c5.2 0 9 4.3 10 7a13 13 0 0 1-3.3 4.7M6 6.2A13 13 0 0 0 2 12c1 2.7 4.8 7 10 7a10.8 10.8 0 0 0 4.2-.8"/></>
                ) : (
                  <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>
                )}
              </svg>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex h-[54px] w-full items-center justify-center gap-3 rounded-[14px] bg-[#135333] px-5 text-[15px] font-bold text-white shadow-[0_10px_22px_rgba(22,85,50,.14)] transition-all hover:bg-[#1e6943] hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#175939] disabled:cursor-wait disabled:opacity-65"
        >
          {loading ? c.submitting : c.submit}
          {!loading && <span aria-hidden="true" className="text-xl leading-none">→</span>}
        </button>
      </form>

      <p className="mt-7 text-center text-[13px] text-[#5e7463]">
        {c.noAccount}{" "}
        <Link href="/register" className="font-bold text-[#17623c] underline decoration-[#98bba1] underline-offset-4 hover:text-[#0c3e27] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17623c]">
          {c.register}
        </Link>
      </p>
      <div className="mt-7 rounded-xl bg-[#e9f1e3] px-4 py-3 text-center text-xs leading-6 text-[#45634e]">{c.note}</div>
    </AuthShell>
  );
}
