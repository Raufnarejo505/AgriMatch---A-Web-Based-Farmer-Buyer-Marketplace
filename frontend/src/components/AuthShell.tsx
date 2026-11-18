"use client";

import type { ReactNode } from "react";
import Link from "next/link";

type AuthShellProps = {
  mode: "login" | "register";
  language: "en" | "ur";
  title: string;
  subtitle: string;
  children: ReactNode;
};

const backgrounds = {
  login: "https://images.unsplash.com/photo-1789302346125-dee93aa2cbdc?auto=format&fit=crop&w=2400&q=85",
  register: "https://images.unsplash.com/photo-1779043151820-b57b099dbeea?auto=format&fit=crop&w=2000&q=85",
};

const hero = {
  en: {
    home: "Back to home",
    eyebrow: "GROWN TOGETHER",
    lineOne: "Connecting farmers",
    lineTwo: "with better markets.",
    description: "A place for growers and buyers to find each other, discuss fair offers, and move every harvest forward.",
    benefitOne: "Direct connections",
    benefitTwo: "Clear crop listings",
    benefitThree: "More opportunities",
    footer: "From the field to the market, together.",
    account: "YOUR AGRIMATCH ACCOUNT",
  },
  ur: {
    home: "ہوم پیج پر واپس",
    eyebrow: "مل کر ترقی کریں",
    lineOne: "کسانوں اور خریداروں کو",
    lineTwo: "بہتر منڈی سے جوڑنا۔",
    description: "ایک ایسی جگہ جہاں کسان اور خریدار آپس میں رابطہ کریں، پیشکشوں پر بات کریں اور اپنی فصل کے لیے نئے مواقع تلاش کریں۔",
    benefitOne: "براہِ راست رابطہ",
    benefitTwo: "فصلوں کی واضح تفصیل",
    benefitThree: "مزید مواقع",
    footer: "کھیت سے منڈی تک، ایک ساتھ۔",
    account: "آپ کا ایگری میچ اکاؤنٹ",
  },
} as const;

function SproutMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 26V14M16 19C10 19 6 14 6 8c7-1 10 2 10 8M16 16C16 9 21 6 27 5c1 7-3 12-11 12M8 27h16" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z" />
    </svg>
  );
}

export default function AuthShell({ mode, language, title, subtitle, children }: AuthShellProps) {
  const c = hero[language];

  return (
    <main className={"am-auth am-auth-" + mode + " relative isolate min-h-screen overflow-hidden bg-[#123420] text-[#173a28]"} data-no-translate>
      <div
        className="am-auth-photo absolute inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: "url('" + backgrounds[mode] + "')" }}
        aria-hidden="true"
      />
      <div className="am-auth-shade absolute inset-0 -z-10" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-56 bg-gradient-to-t from-[#0c2519]/70 to-transparent" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1510px] flex-col px-4 pb-8 pt-6 sm:px-8 lg:px-12 lg:pb-10 lg:pt-8">
        <div className="flex min-h-11 items-center justify-start">
          <Link href="/" className="inline-flex min-h-11 items-center gap-2.5 rounded-full border border-white/30 bg-[#123b26]/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f3d18f]">
            <HomeIcon />
            <span>{c.home}</span>
          </Link>
        </div>

        <div className="grid flex-1 items-center gap-8 pb-8 pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.93fr)] lg:gap-12 lg:pb-0 lg:pt-3 xl:gap-20">
          <section className="am-auth-story max-w-[680px] text-white lg:pb-12" aria-label={c.eyebrow}>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/25 bg-[#133b27]/35 px-4 py-2 text-[10px] font-bold uppercase tracking-[.17em] text-[#f7e2b6] backdrop-blur-sm sm:text-xs">
              <span className="h-2 w-2 rounded-full bg-[#e8c477]" />
              {c.eyebrow}
            </div>
            <h1 className="mt-6 max-w-[680px] text-[clamp(2.55rem,4.35vw,4.8rem)] font-semibold leading-[1.11] tracking-[-.045em] text-white sm:mt-8">
              <span className="block">{c.lineOne}</span>
              <span className={"mt-1 block text-[#f0cf86] " + (language === "en" ? "font-serif italic" : "tracking-normal")}>{c.lineTwo}</span>
            </h1>
            <div className="mt-7 h-1 w-20 rounded-full bg-[#e9c474]" />
            <p className="mt-6 max-w-[540px] text-[15px] leading-8 text-white/90 sm:text-[17px]">{c.description}</p>
            <div className="mt-12 hidden grid-cols-3 gap-4 border-t border-white/25 pt-8 sm:grid lg:mt-16">
              {[c.benefitOne, c.benefitTwo, c.benefitThree].map((benefit, index) => (
                <div key={benefit} className="min-w-0">
                  <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e9c474]/70 bg-[#133d29]/35 text-[#f3d68f]">
                    {index === 0 ? (
                      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true"><path d="m2 12 5-5 4 3 3-3 8 6-5 5-5-3-4 3-6-6Z" /><path d="m9 11 4 4m-7-1 4 4" /></svg>
                    ) : index === 1 ? (
                      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>
                    ) : (
                      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V12m6 8V8m6 12V4m5 16H2" /></svg>
                    )}
                  </span>
                  <p className="text-sm font-semibold leading-6 text-white">{benefit}</p>
                </div>
              ))}
            </div>
            <p className="mt-7 hidden text-xs font-medium text-white/65 lg:block">{c.footer}</p>
          </section>

          <section className="am-auth-panel relative mx-auto w-full max-w-[610px] overflow-hidden rounded-[28px] border border-white/80 bg-[#fffdf5]/[.97] px-5 pb-7 pt-7 shadow-[0_26px_90px_rgba(2,24,13,.35)] backdrop-blur-xl sm:rounded-[34px] sm:px-9 sm:pb-9 sm:pt-8 xl:px-11" aria-label={title}>
            <div className="pointer-events-none absolute -right-16 -top-28 h-72 w-72 rounded-full bg-[#dfedce]/55 blur-3xl" aria-hidden="true" />
            <div className="relative flex justify-center">
              <Link href="/" className="inline-flex items-center gap-2.5 rounded-xl p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#195b37]" aria-label="AgriMatch home">
                <span className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-[#194e34] text-[#f4d58e]"><SproutMark /></span>
                <span className="text-[27px] font-extrabold tracking-[-.055em] text-[#183d29]">agri<span className="text-[#4a9060]">match</span><span className="text-[#d2a955]">.</span></span>
              </Link>
            </div>
            <div className="relative mt-7 text-center sm:mt-8">
              <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#698773]">{c.account}</p>
              <h2 className="mt-3 text-[26px] font-bold leading-tight tracking-[-.035em] text-[#163b28] sm:text-[30px]">{title}</h2>
              <p className="mx-auto mt-2 max-w-[450px] text-[13px] leading-6 text-[#607568] sm:text-sm">{subtitle}</p>
            </div>
            <div className="relative mt-7">{children}</div>
          </section>
        </div>
      </div>
    </main>
  );
}
