"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import AuthShell from "@/components/AuthShell";
import { useLanguage } from "@/components/LanguageProvider";
import { ApiError, api } from "@/lib/api";
import { roleHome, setAuth } from "@/lib/auth";
import type { AuthResponse, SignupRole } from "@/types";

const words = {
  en: {
    title: "Create your account",
    subtitle: "Join our community of farmers and buyers. Getting started takes only a minute.",
    role: "I want to join as",
    farmer: "Farmer",
    farmerHint: "List and sell my crops",
    buyer: "Buyer",
    buyerHint: "Find and purchase crops",
    fullName: "Full name",
    namePlaceholder: "Enter your full name",
    cnic: "CNIC number (required)",
    cnicHint: "Enter your 13-digit Pakistani national identity card number.",
    email: "Email address (optional)",
    emailPlaceholder: "you@example.com",
    password: "Create a password",
    passwordPlaceholder: "At least 8 characters",
    show: "Show password",
    hide: "Hide password",
    passwordHint: "Use at least 8 characters.",
    phone: "Phone number (optional)",
    phonePlaceholder: "03XX XXXXXXX",
    location: "City or district (optional)",
    locationPlaceholder: "e.g. Sukkur, Sindh",
    consent: "I agree to create an account and use AgriMatch respectfully.",
    submit: "Create account",
    submitting: "Creating your account...",
    already: "Already have an account?",
    login: "Sign in",
    invalidCnic: "Please enter a valid 13-digit CNIC number.",
    invalidPassword: "Your password must be at least 8 characters.",
    invalidConsent: "Please confirm you agree to create an account.",
    generic: "Unable to create your account. Please try again.",
    note: "You can add and update your marketplace details after signing up.",
  },
  ur: {
    title: "اپنا اکاؤنٹ بنائیں",
    subtitle: "کسانوں اور خریداروں کی کمیونٹی کا حصہ بنیں۔ شروعات میں صرف ایک منٹ لگتا ہے۔",
    role: "میں بطور شامل ہونا چاہتا ہوں",
    farmer: "کسان",
    farmerHint: "اپنی فصلیں فروخت کریں",
    buyer: "خریدار",
    buyerHint: "فصلیں تلاش اور خریدیں",
    fullName: "پورا نام",
    namePlaceholder: "اپنا پورا نام درج کریں",
    cnic: "شناختی کارڈ نمبر (لازمی)",
    cnicHint: "اپنے پاکستانی شناختی کارڈ کے ۱۳ ہندسے درج کریں۔",
    email: "ای میل ایڈریس (اختیاری)",
    emailPlaceholder: "you@example.com",
    password: "پاس ورڈ بنائیں",
    passwordPlaceholder: "کم از کم ۸ حروف",
    show: "پاس ورڈ دکھائیں",
    hide: "پاس ورڈ چھپائیں",
    passwordHint: "کم از کم ۸ حروف استعمال کریں۔",
    phone: "فون نمبر (اختیاری)",
    phonePlaceholder: "03XX XXXXXXX",
    location: "شہر یا ضلع (اختیاری)",
    locationPlaceholder: "مثلاً سکھر، سندھ",
    consent: "میں اکاؤنٹ بنانے اور ایگری میچ ذمہ داری سے استعمال کرنے پر رضامند ہوں۔",
    submit: "اکاؤنٹ بنائیں",
    submitting: "اکاؤنٹ بن رہا ہے...",
    already: "پہلے سے اکاؤنٹ موجود ہے؟",
    login: "لاگ اِن کریں",
    invalidCnic: "براہِ کرم شناختی کارڈ کے درست ۱۳ ہندسے درج کریں۔",
    invalidPassword: "پاس ورڈ کم از کم ۸ حروف پر مشتمل ہونا چاہیے۔",
    invalidConsent: "براہِ کرم اکاؤنٹ بنانے کی رضامندی دیں۔",
    generic: "اکاؤنٹ نہیں بن سکا۔ دوبارہ کوشش کریں۔",
    note: "اکاؤنٹ بنانے کے بعد اپنی منڈی کی مزید تفصیلات شامل اور تبدیل کر سکتے ہیں۔",
  },
} as const;

const fieldClass = "block h-[50px] w-full rounded-[12px] border border-[#ccd7cc] bg-white/85 px-4 text-[15px] text-[#183b2a] shadow-sm outline-none transition-colors placeholder:text-[#90a196] hover:border-[#9daf9d] focus:border-[#2b7247] focus:ring-2 focus:ring-[#2b7247]/15";
const labelClass = "mb-1.5 block text-[13px] font-bold text-[#244632]";

export default function RegisterPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const c = words[language];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cnic, setCnic] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [role, setRole] = useState<SignupRole>("farmer");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const requestedRole = new URLSearchParams(window.location.search).get("role");
    if (requestedRole === "farmer" || requestedRole === "buyer") setRole(requestedRole);
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError("");
    if (!/^[0-9]{13}$/.test(cnic.replace(/\D/g, ""))) {
      setError(c.invalidCnic);
      return;
    }
    if (password.length < 8) {
      setError(c.invalidPassword);
      return;
    }
    if (!consent) {
      setError(c.invalidConsent);
      return;
    }
    setLoading(true);
    try {
      const data = await api.post<AuthResponse>("/api/auth/register", {
        name: name.trim(),
        cnic: cnic.replace(/\D/g, ""),
        email: email.trim() || null,
        password,
        role,
        phone: phone.trim() || null,
        location: location.trim() || null,
      });
      setAuth(data.access_token, data.user);
      router.replace(roleHome[data.user.role]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : c.generic);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell mode="register" language={language} title={c.title} subtitle={c.subtitle}>
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] leading-6 text-red-800">
            {error}
          </div>
        )}

        <fieldset>
          <legend className={labelClass}>{c.role}</legend>
          <div className="grid grid-cols-2 gap-3">
            {(["farmer", "buyer"] as const).map((value) => (
              <label key={value} className={"flex min-w-0 cursor-pointer items-start gap-2.5 rounded-[13px] border px-3 py-3 transition-all " + (role === value ? "border-[#28764a] bg-[#ebf3e7] shadow-[inset_0_0_0_1px_#28764a]" : "border-[#d4dfd1] bg-white/70 hover:border-[#91b49b]")}>
                <input
                  type="radio"
                  name="role"
                  value={value}
                  checked={role === value}
                  onChange={() => setRole(value)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[#17643e]"
                />
                <span className="min-w-0">
                  <span className="block text-[13px] font-bold text-[#1e4830]">{value === "farmer" ? c.farmer : c.buyer}</span>
                  <span className="mt-1 block text-[11px] leading-4 text-[#6a7f6b]">{value === "farmer" ? c.farmerHint : c.buyerHint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="register-name" className={labelClass}>{c.fullName}</label>
            <input id="register-name" name="name" type="text" autoComplete="name" minLength={2} maxLength={120} required placeholder={c.namePlaceholder} value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="register-email" className={labelClass}>{c.email}</label>
            <input id="register-email" name="email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} dir="ltr" placeholder={c.emailPlaceholder} value={email} onChange={(event) => setEmail(event.target.value)} className={fieldClass} />
          </div>
        </div>

          <div>
            <label htmlFor="register-cnic" className={labelClass}>{c.cnic}</label>
            <input
              id="register-cnic"
              name="cnic"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              dir="ltr"
              pattern="[0-9]{5}-?[0-9]{7}-?[0-9]"
              maxLength={15}
              required
              placeholder="12345-1234567-1"
              value={cnic}
              onChange={(event) => {
                const digits = event.target.value.replace(/\D/g, "").slice(0, 13);
                setCnic(digits.length > 12 ? digits.slice(0, 5) + "-" + digits.slice(5, 12) + "-" + digits.slice(12) : digits.length > 5 ? digits.slice(0, 5) + "-" + digits.slice(5) : digits);
              }}
              className={fieldClass}
            />
            <p className="mt-1 text-[11px] text-[#6d826f]">{c.cnicHint}</p>
          </div>

        <div>
          <label htmlFor="register-password" className={labelClass}>{c.password}</label>
          <div className="relative">
            <input id="register-password" name="password" type={passwordVisible ? "text" : "password"} autoComplete="new-password" minLength={8} required dir="ltr" placeholder={c.passwordPlaceholder} value={password} onChange={(event) => setPassword(event.target.value)} className={fieldClass + " pe-14"} />
            <button type="button" onClick={() => setPasswordVisible((visible) => !visible)} aria-label={passwordVisible ? c.hide : c.show} aria-pressed={passwordVisible} className="absolute end-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-[#536d5b] hover:bg-[#eef3e8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2b7247]">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {passwordVisible ? <><path d="M3 3 21 21M10.6 10.7a2 2 0 0 0 2.7 2.7"/><path d="M9.9 5.3A10.9 10.9 0 0 1 12 5c5.2 0 9 4.3 10 7a13 13 0 0 1-3.3 4.7M6 6.2A13 13 0 0 0 2 12c1 2.7 4.8 7 10 7a10.8 10.8 0 0 0 4.2-.8"/></> : <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>}
              </svg>
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-[#6d826f]">{c.passwordHint}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="register-phone" className={labelClass}>{c.phone}</label>
            <input id="register-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" dir="ltr" maxLength={24} placeholder={c.phonePlaceholder} value={phone} onChange={(event) => setPhone(event.target.value)} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="register-location" className={labelClass}>{c.location}</label>
            <input id="register-location" name="location" type="text" autoComplete="address-level2" maxLength={120} placeholder={c.locationPlaceholder} value={location} onChange={(event) => setLocation(event.target.value)} className={fieldClass} />
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 pt-0.5 text-[12px] leading-6 text-[#5f7563]">
          <input name="consent" type="checkbox" required checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[#17643e]" />
          <span>{c.consent}</span>
        </label>

        <button type="submit" disabled={loading} className="flex h-[54px] w-full items-center justify-center gap-3 rounded-[14px] bg-[#135333] px-5 text-[15px] font-bold text-white shadow-[0_10px_22px_rgba(22,85,50,.14)] transition-all hover:bg-[#1e6943] hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#175939] disabled:cursor-wait disabled:opacity-65">
          {loading ? c.submitting : c.submit}
          {!loading && <span aria-hidden="true" className="text-xl leading-none">→</span>}
        </button>
      </form>

      <p className="mt-5 text-center text-[13px] text-[#5e7463]">
        {c.already}{" "}
        <Link href="/login" className="font-bold text-[#17623c] underline decoration-[#98bba1] underline-offset-4 hover:text-[#0c3e27] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17623c]">{c.login}</Link>
      </p>
      <p className="mt-4 text-center text-[11px] leading-5 text-[#758877]">{c.note}</p>
    </AuthShell>
  );
}
