"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getUser, roleHome } from "@/lib/auth";
import { useLanguage } from "@/components/LanguageProvider";

const photos = {
  hero: "https://images.unsplash.com/photo-1789302346125-dee93aa2cbdc?auto=format&fit=crop&w=2400&q=85",
  wheat: "https://images.unsplash.com/photo-1771318204802-424c195fa453?auto=format&fit=crop&w=1000&q=80",
  farmer: "https://images.unsplash.com/photo-1779043151820-b57b099dbeea?auto=format&fit=crop&w=1100&q=82",
  harvest: "https://images.unsplash.com/photo-1760549255949-767d18981890?auto=format&fit=crop&w=1000&q=80",
  sindh: "https://images.unsplash.com/photo-1656501943390-f8efa03f6a5a?auto=format&fit=crop&w=1200&q=80",
};

const words = {
  en: {
    navHow: "How it works",
    navExplore: "Explore",
    navBenefits: "Why AgriMatch",
    navFaq: "FAQs",
    login: "Log in",
    join: "Get started",
    menu: "Menu",
    close: "Close",
    dashboard: "My dashboard",
    eyebrow: "THE FUTURE OF FARM-TO-MARKET CONNECTIONS",
    heroOne: "A better market",
    heroTwo: "begins in the field.",
    heroDesc: "Grow more opportunities, not more obstacles. AgriMatch brings farmers and buyers together to discover crops, discuss offers, and manage every order with confidence.",
    sell: "I'm a farmer",
    buy: "I'm a buyer",
    heroNote: "Made for the people who grow and buy.",
    heroCardTop: "GROWN WITH PURPOSE",
    heroCardMain: "Your harvest deserves a wider horizon.",
    heroCardFoot: "Connect. Negotiate. Grow.",
    stripOne: "Built for farmers",
    stripTwo: "Made for buyers",
    stripThree: "One connected marketplace",
    aboutEyebrow: "SIMPLE BY DESIGN",
    aboutTitle: "From first listing to lasting connections.",
    aboutIntro: "Getting started should feel as natural as a conversation. Here's how AgriMatch brings both sides of the market together.",
    stepOneNum: "01 / LIST",
    stepOneTitle: "Show what you've grown",
    stepOneDesc: "Farmers can post available crops with the details buyers need to make a decision.",
    stepTwoNum: "02 / CONNECT",
    stepTwoTitle: "Start a conversation",
    stepTwoDesc: "Buyers can find crops, talk directly with farmers, and exchange offers.",
    stepThreeNum: "03 / MANAGE",
    stepThreeTitle: "Keep things moving",
    stepThreeDesc: "Track accepted offers and order progress from a single place.",
    exploreEyebrow: "ROOTED IN AGRICULTURE",
    exploreTitle: "Every crop has a story. Every grower deserves to be heard.",
    exploreDesc: "A place to connect across growing seasons, crops, and communities.",
    exploreOne: "From local fields",
    exploreOneSub: "A space for growers to present their produce.",
    exploreTwo: "To new opportunities",
    exploreTwoSub: "A simpler way for buyers to find what they need.",
    exploreThree: "And better conversations",
    exploreThreeSub: "Discuss requirements, quantities, and offers directly.",
    exploreCta: "Join the marketplace",
    audienceEyebrow: "TWO SIDES, ONE PURPOSE",
    audienceTitle: "Built for the people behind every harvest.",
    farmerLabel: "FOR FARMERS",
    farmerTitle: "Your hard work. Your next opportunity.",
    farmerDesc: "List available crops, hear from interested buyers, and manage offers without jumping between platforms.",
    farmerLink: "Start selling",
    buyerLabel: "FOR BUYERS",
    buyerTitle: "Discover the source. Connect directly.",
    buyerDesc: "Explore farmers' listings, post what you're looking for, and work through offers and orders in one place.",
    buyerLink: "Find crops",
    differenceEyebrow: "WHY AGRIMATCH",
    differenceTitle: "Less friction. More meaningful trade.",
    differenceDesc: "Designed around the practical steps of agricultural buying and selling, without making the process complicated.",
    benefitOne: "Direct conversations",
    benefitOneDesc: "A place to discuss details with the other party before making a deal.",
    benefitTwo: "Clear crop details",
    benefitTwoDesc: "Share quantities, quality, prices, and locations in one organized listing.",
    benefitThree: "Offers & order tracking",
    benefitThreeDesc: "Keep negotiations and order updates together instead of losing the thread.",
    benefitFour: "Your language, your way",
    benefitFourDesc: "Use the marketplace in English or Urdu, on your phone or computer.",
    faqEyebrow: "GOOD TO KNOW",
    faqTitle: "A few simple answers.",
    faqOneQ: "Is AgriMatch for farmers or buyers?",
    faqOneA: "Both. Farmers can list crops and buyers can search for produce or post their requirements.",
    faqTwoQ: "Can I contact the other party directly?",
    faqTwoA: "Yes. Registered users can start conversations, send offers, and respond to offers through AgriMatch.",
    faqThreeQ: "Can I use AgriMatch in Urdu?",
    faqThreeA: "Yes. Choose اردو in the language switcher to read the interface in Urdu. User-written messages remain in the language they were entered.",
    faqFourQ: "Do I need an account?",
    faqFourA: "You can learn about AgriMatch on this page without an account. Registration is required to use the marketplace features.",
    ctaSmall: "LET'S GROW SOMETHING GOOD",
    ctaTitle: "The next opportunity is closer than you think.",
    ctaDesc: "Whether you're bringing a crop to market or searching for your next supplier, your connection starts here.",
    ctaButton: "Create your account",
    footerDesc: "Connecting the people who grow with the people who buy.",
    footerNavigate: "Explore",
    footerAccount: "Account",
    footerPhotography: "Photography via Unsplash",
    footerRights: "All rights reserved.",
  },
  ur: {
    navHow: "یہ کیسے کام کرتا ہے",
    navExplore: "دریافت کریں",
    navBenefits: "ایگری میچ کیوں؟",
    navFaq: "سوالات",
    login: "لاگ اِن",
    join: "شروع کریں",
    menu: "مینو",
    close: "بند کریں",
    dashboard: "میرا ڈیش بورڈ",
    eyebrow: "کھیت سے منڈی تک بہتر رابطے",
    heroOne: "بہتر منڈی کا آغاز",
    heroTwo: "کھیت سے ہوتا ہے۔",
    heroDesc: "کسانوں اور خریداروں کے درمیان آسان رابطہ۔ ایگری میچ پر فصلیں درج کریں، خریدار تلاش کریں، پیشکشوں پر بات کریں اور آرڈرز سنبھالیں۔",
    sell: "میں کسان ہوں",
    buy: "میں خریدار ہوں",
    heroNote: "فصل اگانے والوں اور خریدنے والوں کے لیے۔",
    heroCardTop: "ترقی کا نیا راستہ",
    heroCardMain: "آپ کی محنت کو بہتر مواقع ملنے چاہییں۔",
    heroCardFoot: "رابطہ کریں۔ بات کریں۔ آگے بڑھیں۔",
    stripOne: "کسانوں کے لیے",
    stripTwo: "خریداروں کے لیے",
    stripThree: "ایک مشترکہ منڈی",
    aboutEyebrow: "آسان طریقہ",
    aboutTitle: "فصل درج کرنے سے لے کر رابطہ بڑھانے تک۔",
    aboutIntro: "ایگری میچ استعمال کرنا آسان ہے۔ یہاں کسان اور خریدار تین سادہ مراحل میں ایک دوسرے سے جڑتے ہیں۔",
    stepOneNum: "۰۱ / درج کریں",
    stepOneTitle: "اپنی فصل پیش کریں",
    stepOneDesc: "کسان فصل، مقدار، قیمت اور دیگر ضروری معلومات کے ساتھ اپنی فصل درج کر سکتے ہیں۔",
    stepTwoNum: "۰۲ / رابطہ کریں",
    stepTwoTitle: "بات چیت شروع کریں",
    stepTwoDesc: "خریدار فصلیں تلاش کر سکتے ہیں، کسانوں سے بات کر سکتے ہیں اور پیشکشیں بھیج سکتے ہیں۔",
    stepThreeNum: "۰۳ / سنبھالیں",
    stepThreeTitle: "آرڈر کی پیش رفت دیکھیں",
    stepThreeDesc: "قبول شدہ پیشکشوں اور آرڈرز کی صورتِ حال ایک جگہ دیکھیں۔",
    exploreEyebrow: "زراعت سے جڑا ہوا",
    exploreTitle: "ہر فصل کے پیچھے محنت ہے، اور ہر کسان کا ایک خواب۔",
    exploreDesc: "مختلف فصلوں، موسموں اور علاقوں کے لوگوں کے درمیان رابطے کا پلیٹ فارم۔",
    exploreOne: "مقامی کھیتوں سے",
    exploreOneSub: "کسان اپنی فصل خریداروں کے سامنے پیش کر سکتے ہیں۔",
    exploreTwo: "نئے مواقع تک",
    exploreTwoSub: "خریدار اپنی ضرورت کی فصل آسانی سے تلاش کر سکتے ہیں۔",
    exploreThree: "بہتر گفتگو تک",
    exploreThreeSub: "مقدار، قیمت اور ضروریات پر براہِ راست بات کریں۔",
    exploreCta: "مارکیٹ پلیس میں شامل ہوں",
    audienceEyebrow: "ایک مقصد، دو فریق",
    audienceTitle: "ہر فصل کے پیچھے محنت کرنے والوں کے لیے۔",
    farmerLabel: "کسانوں کے لیے",
    farmerTitle: "آپ کی محنت، آپ کے لیے نئے مواقع۔",
    farmerDesc: "اپنی فصلیں درج کریں، دلچسپی رکھنے والے خریداروں سے رابطہ کریں اور پیشکشیں ایک جگہ سنبھالیں۔",
    farmerLink: "فصل فروخت کرنا شروع کریں",
    buyerLabel: "خریداروں کے لیے",
    buyerTitle: "فصل تلاش کریں، کسان سے براہِ راست ملیں۔",
    buyerDesc: "فصلیں دیکھیں، اپنی ضرورت درج کریں اور پیشکشوں اور آرڈرز پر ایک ہی جگہ کام کریں۔",
    buyerLink: "فصلیں تلاش کریں",
    differenceEyebrow: "ایگری میچ کیوں؟",
    differenceTitle: "کم مشکلات، بہتر رابطے۔",
    differenceDesc: "زرعی خرید و فروخت کے عملی مراحل کو آسان بنانے کے لیے بنایا گیا پلیٹ فارم۔",
    benefitOne: "براہِ راست گفتگو",
    benefitOneDesc: "معاملہ طے کرنے سے پہلے دوسرے فریق سے ضروری تفصیل پر بات کریں۔",
    benefitTwo: "فصل کی واضح معلومات",
    benefitTwoDesc: "مقدار، معیار، قیمت اور مقام ایک منظم فہرست میں درج کریں۔",
    benefitThree: "پیشکش اور آرڈر",
    benefitThreeDesc: "بات چیت، پیشکشیں اور آرڈر کی تازہ صورتِ حال ایک جگہ دیکھیں۔",
    benefitFour: "اپنی زبان میں استعمال کریں",
    benefitFourDesc: "موبائل یا کمپیوٹر پر اردو یا انگریزی زبان میں ایگری میچ استعمال کریں۔",
    faqEyebrow: "اہم معلومات",
    faqTitle: "چند آسان سوالوں کے جواب۔",
    faqOneQ: "کیا ایگری میچ کسانوں کے لیے ہے یا خریداروں کے لیے؟",
    faqOneA: "دونوں کے لیے۔ کسان فصلیں درج کر سکتے ہیں، جبکہ خریدار فصلیں تلاش یا اپنی ضرورت درج کر سکتے ہیں۔",
    faqTwoQ: "کیا میں دوسرے فریق سے براہِ راست بات کر سکتا ہوں؟",
    faqTwoA: "جی ہاں۔ رجسٹرڈ صارفین بات چیت شروع کر سکتے ہیں اور پیشکشیں بھیج یا قبول کر سکتے ہیں۔",
    faqThreeQ: "کیا ایگری میچ اردو میں استعمال ہو سکتا ہے؟",
    faqThreeA: "جی ہاں۔ اردو انٹرفیس کے لیے زبان کے بٹن سے اردو منتخب کریں۔ صارفین کے لکھے ہوئے پیغامات خودکار طور پر ترجمہ نہیں ہوتے۔",
    faqFourQ: "کیا اکاؤنٹ بنانا ضروری ہے؟",
    faqFourA: "اس صفحے پر معلومات بغیر اکاؤنٹ دیکھی جا سکتی ہیں۔ منڈی کی سہولتیں استعمال کرنے کے لیے رجسٹریشن ضروری ہے۔",
    ctaSmall: "آئیں مل کر ترقی کریں",
    ctaTitle: "آپ کا اگلا موقع زیادہ دور نہیں۔",
    ctaDesc: "چاہے آپ فصل فروخت کرنا چاہتے ہوں یا نئی فصل خریدنا چاہتے ہوں، رابطے کا آغاز یہاں سے کریں۔",
    ctaButton: "اکاؤنٹ بنائیں",
    footerDesc: "فصل اگانے والوں کو فصل خریدنے والوں سے جوڑنا۔",
    footerNavigate: "مزید دیکھیں",
    footerAccount: "اکاؤنٹ",
    footerPhotography: "تصاویر: انسپلیش",
    footerRights: "جملہ حقوق محفوظ ہیں۔",
  },
};

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {diagonal ? <path d="M5 19 19 5M9 5h10v10" /> : <path d="M4 12h16m-7-7 7 7-7 7" />}
    </svg>
  );
}
function Sprout({ size = 25 }: { size?: number }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 27V14M16 20C10 20 5 16 5 9c6-1 11 1 11 8M16 16c0-7 5-11 12-11 1 7-3 12-12 12" />
    <path d="M8 28h16" />
  </svg>;
}
function ChatIcon() {
  return <svg aria-hidden="true" width="27" height="27" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 5h18v15H12l-7 5V5Z" /><path d="M9 11h10M9 15h7" /></svg>;
}
function CheckIcon() {
  return <svg aria-hidden="true" width="25" height="25" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14 11 21 24 7" /></svg>;
}
function CropIcon() {
  return <svg aria-hidden="true" width="27" height="27" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 25V6M14 10l-6-5M14 13l7-6M14 17l-8-5M14 20l8-6M7 25h14" /><path d="m8 5-2 5 6-1M21 7l1 5-6-1M6 12l-1 6 6-2M22 14l1 6-6-2" /></svg>;
}

export default function HomePage() {
  const { language, setLanguage } = useLanguage();
  const c = words[language];
  const [menuOpen, setMenuOpen] = useState(false);
  const [dashboardPath, setDashboardPath] = useState<string | null>(null);

  useEffect(() => {
    const user = getUser();
    setDashboardPath(user ? roleHome[user.role] : null);
  }, []);

  const steps = [
    { num: c.stepOneNum, title: c.stepOneTitle, desc: c.stepOneDesc, icon: <CropIcon /> },
    { num: c.stepTwoNum, title: c.stepTwoTitle, desc: c.stepTwoDesc, icon: <ChatIcon /> },
    { num: c.stepThreeNum, title: c.stepThreeTitle, desc: c.stepThreeDesc, icon: <CheckIcon /> },
  ];
  const stories = [
    { title: c.exploreOne, desc: c.exploreOneSub, image: photos.wheat },
    { title: c.exploreTwo, desc: c.exploreTwoSub, image: photos.farmer },
    { title: c.exploreThree, desc: c.exploreThreeSub, image: photos.harvest },
  ];
  const benefits = [
    { title: c.benefitOne, desc: c.benefitOneDesc, icon: <ChatIcon /> },
    { title: c.benefitTwo, desc: c.benefitTwoDesc, icon: <CropIcon /> },
    { title: c.benefitThree, desc: c.benefitThreeDesc, icon: <CheckIcon /> },
    { title: c.benefitFour, desc: c.benefitFourDesc, icon: <Sprout size={27} /> },
  ];
  const faqs = [
    [c.faqOneQ, c.faqOneA], [c.faqTwoQ, c.faqTwoA], [c.faqThreeQ, c.faqThreeA], [c.faqFourQ, c.faqFourA],
  ];
  const headerLinks = [
    { label: c.navHow, href: "#how-it-works" },
    { label: c.navExplore, href: "#explore" },
    { label: c.navBenefits, href: "#benefits" },
    { label: c.navFaq, href: "#faq" },
  ];

  return (
    <div className="am-landing min-h-screen bg-[#F7F7EF] text-[#193D2D]">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[80] focus:bg-white focus:p-4">{language === "ur" ? "مرکزی مواد پر جائیں" : "Skip to content"}</a>
      <header className="relative z-30 bg-[#F7F7EF]">
        <div className="mx-auto flex h-[78px] max-w-[1360px] items-center justify-between gap-3 px-5 sm:px-8 lg:h-[92px] lg:px-12">
          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="AgriMatch home">
            <span className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#184D35] text-[#E5C98B]"><Sprout size={26}/></span>
            <span className="text-[22px] font-extrabold tracking-[-.045em] text-[#183F2D]">agri<span className="text-[#4F9160]">match</span><span className="text-[#D9AD62]">.</span></span>
          </Link>

          <nav aria-label="Primary navigation" className="hidden items-center gap-8 lg:flex">
            {headerLinks.map((link) => <a key={link.href} href={link.href} className="text-[13px] font-semibold text-[#526958] transition-colors hover:text-[#184D35]">{link.label}</a>)}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <button type="button" onClick={() => setLanguage(language === "en" ? "ur" : "en")} className="rounded-full border border-[#D9E2D8] px-4 py-2 text-xs font-bold text-[#244E37] transition-colors hover:bg-[#EBF1E7]" aria-label={language === "en" ? "Switch to Urdu" : "انگریزی منتخب کریں"}>{language === "en" ? "اردو / EN" : "EN / اردو"}</button>
            {dashboardPath ? <Link href={dashboardPath} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#184D35] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#276A47]">{c.dashboard} <Arrow diagonal/></Link> :
            <>
              <Link href="/login" className="px-3 py-2 text-sm font-semibold text-[#244E37] hover:text-[#4F9160]">{c.login}</Link>
              <Link href="/register" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#184D35] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#276A47]">{c.join} <Arrow diagonal/></Link>
            </>}
          </div>
          <button type="button" aria-expanded={menuOpen} aria-controls="landing-mobile-menu" aria-label={menuOpen ? c.close : c.menu} onClick={() => setMenuOpen(!menuOpen)} className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#C8D7C8] bg-white text-[#19472F] lg:hidden">
            <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">{menuOpen ? <path d="M5 5l14 14M19 5 5 19"/> : <path d="M4 7h16M4 12h16M4 17h16"/>}</svg>
          </button>
        </div>
        {menuOpen && <nav id="landing-mobile-menu" aria-label="Mobile navigation" className="absolute inset-x-0 top-full border-t border-[#E5EADF] bg-[#F7F7EF] px-5 py-4 shadow-xl lg:hidden">
          <div className="mx-auto flex max-w-[900px] flex-col gap-1">
            {headerLinks.map((link) => <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-semibold hover:bg-[#EBF2E9]">{link.label}</a>)}
            <div className="mt-2 flex items-center gap-2 border-t border-[#E0E8DC] pt-3">
              <button type="button" onClick={() => setLanguage(language === "en" ? "ur" : "en")} className="min-h-11 rounded-lg border border-[#CFDECD] px-4 text-sm font-semibold">{language === "en" ? "اردو" : "English"}</button>
              <Link href={dashboardPath || "/login"} className="flex min-h-11 flex-1 items-center justify-center rounded-lg border border-[#CFDECD] px-3 text-sm font-semibold">{dashboardPath ? c.dashboard : c.login}</Link>
              {!dashboardPath && <Link href="/register" className="flex min-h-11 flex-1 items-center justify-center rounded-lg bg-[#184D35] px-3 text-sm font-semibold text-white">{c.join}</Link>}
            </div>
          </div>
        </nav>}
      </header>

      <main id="main-content">
        <section className="relative mx-auto max-w-[1360px] px-3 sm:px-5 lg:px-7">
          <div className="am-hero relative isolate flex min-h-[660px] overflow-hidden rounded-[23px] bg-[#143929] sm:min-h-[670px] sm:rounded-[28px] lg:min-h-[676px] lg:rounded-[35px]">
            <div className="am-hero-photo absolute inset-0 -z-20 bg-cover bg-center" style={{backgroundImage: "url('" + photos.hero + "')"}} aria-hidden="true"/>
            <div className="am-hero-shade absolute inset-0 -z-10" aria-hidden="true"/>
            <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[#102F25]/70 to-transparent" aria-hidden="true"/>
            <div className="relative z-10 flex w-full flex-col justify-between gap-8 px-6 pb-8 pt-16 sm:px-10 sm:pb-10 lg:flex-row lg:items-end lg:px-[74px] lg:pb-[68px] lg:pt-[100px]">
              <div className="max-w-[780px] self-start lg:self-auto">
                <div className="am-enter inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[.17em] text-[#E4F1DD] backdrop-blur-sm sm:text-[11px]"><span className="h-2 w-2 rounded-full bg-[#D3B675]" />{c.eyebrow}</div>
                <h1 className={"am-enter am-enter-delay mt-7 max-w-[790px] text-[44px] font-semibold leading-[1.1] text-white sm:text-[58px] lg:text-[76px] " + (language === "en" ? "font-serif tracking-[-.047em]" : "tracking-normal")}>
                  <span className="block">{c.heroOne}</span><span className="block text-[#E7C78A]">{c.heroTwo}</span>
                </h1>
                <p className="am-enter am-enter-delay2 mt-6 max-w-[550px] text-[15px] leading-[1.9] text-[#E0E9DB] sm:text-[17px]">{c.heroDesc}</p>
                <div className="am-enter am-enter-delay2 mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link href="/register?role=farmer" className="inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full bg-[#E7C78A] px-7 text-sm font-bold text-[#173B2A] shadow-[0_8px_28px_rgba(0,0,0,.13)] transition-transform hover:-translate-y-1 hover:bg-[#F0D9A5]">{c.sell} <Arrow diagonal/></Link>
                  <Link href="/register?role=buyer" className="inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full border border-white/50 bg-white/10 px-7 text-sm font-bold text-white backdrop-blur-sm transition-all hover:-translate-y-1 hover:bg-white/20">{c.buy} <Arrow diagonal/></Link>
                </div>
                <div className="mt-9 flex items-center gap-2.5 text-xs text-[#E4ECDD]"><span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/25 text-[#E7C78A]"><Sprout size={17}/></span>{c.heroNote}</div>
              </div>
              <div className="am-hero-aside hidden w-[255px] shrink-0 rounded-2xl border border-white/20 bg-[#133829]/80 p-6 text-white shadow-2xl backdrop-blur-xl lg:block">
                <span className="text-[10px] font-semibold tracking-[.18em] text-[#E7C78A]">{c.heroCardTop}</span>
                <div className="my-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-[#E7C78A]"><Sprout size={26}/></div>
                <p className="text-[22px] font-semibold leading-[1.4]">{c.heroCardMain}</p>
                <div className="mt-6 border-t border-white/20 pt-4 text-[11px] text-white/65">{c.heroCardFoot}</div>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-[1160px] grid-cols-1 gap-3 px-6 py-9 sm:grid-cols-3 sm:gap-0 sm:py-11">
          {[c.stripOne,c.stripTwo,c.stripThree].map((label,i) => (
            <div key={i} className={"flex items-center gap-3 text-[13px] font-semibold text-[#365541] " + (i===0?"":"sm:justify-center sm:border-s sm:border-[#D7E1D5]")}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E2EDDE] text-[#296445]"><CheckIcon/></span><span>{label}</span>
            </div>
          ))}
        </div>

        <section id="how-it-works" className="scroll-mt-24 px-5 pb-24 pt-12 sm:px-8 lg:pb-32 lg:pt-20">
          <div className="mx-auto max-w-[1160px]">
            <div className="max-w-[690px]">
              <p className="am-kicker">{c.aboutEyebrow}</p>
              <h2 className="am-heading mt-4">{c.aboutTitle}</h2>
              <p className="mt-5 max-w-[620px] text-base leading-8 text-[#65766A]">{c.aboutIntro}</p>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-3 lg:mt-16">
              {steps.map((step,i) => <div key={i} className="group relative rounded-[23px] border border-[#DEE5D9] bg-[#FFFEF9] p-7 shadow-[0_12px_32px_rgba(27,65,44,.025)] transition-transform hover:-translate-y-1 sm:p-9">
                <div className="flex items-center justify-between gap-4">
                  <span className="flex h-[62px] w-[62px] items-center justify-center rounded-2xl bg-[#EAF1E6] text-[#286947] transition-colors group-hover:bg-[#DCEAD5]">{step.icon}</span>
                  <span className="text-[11px] font-bold tracking-[.14em] text-[#85A18A]">{step.num}</span>
                </div>
                <h3 className="mt-9 text-[22px] font-semibold leading-[1.35] text-[#183C2C]">{step.title}</h3>
                <p className="mt-3 text-[14px] leading-7 text-[#6B7A70]">{step.desc}</p>
              </div>)}
            </div>
          </div>
        </section>

        <section id="explore" className="scroll-mt-24 bg-[#ECEFE4] py-20 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-[1210px] px-5 sm:px-8">
            <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
              <div className="max-w-[780px]">
                <p className="am-kicker">{c.exploreEyebrow}</p>
                <h2 className="am-heading mt-4">{c.exploreTitle}</h2>
                <p className="mt-4 text-base leading-8 text-[#65766A]">{c.exploreDesc}</p>
              </div>
              <Link href="/register" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 self-start rounded-full border border-[#BBCDB8] px-6 text-sm font-bold text-[#1E5336] hover:bg-white">{c.exploreCta}<Arrow diagonal/></Link>
            </div>
            <div className="mt-11 grid gap-4 md:grid-cols-3">
              {stories.map((story,i) => <div key={i} className="group relative isolate flex min-h-[330px] flex-col justify-end overflow-hidden rounded-[23px] bg-[#244B35] p-6 text-white sm:p-7 lg:min-h-[400px]">
                <div aria-hidden="true" className="absolute inset-0 -z-20 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{backgroundImage:"url('" + story.image + "')"}}/>
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0C291D]/95 via-[#123626]/15 to-transparent" aria-hidden="true"/>
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/45 bg-white/10"><Arrow diagonal/></div>
                <h3 className="text-[23px] font-semibold leading-snug">{story.title}</h3>
                <p className="mt-2 max-w-[270px] text-[13px] leading-6 text-[#E6EDE4]">{story.desc}</p>
              </div>)}
            </div>
          </div>
        </section>

        <section id="benefits" className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-24 lg:py-32">
          <div className="mx-auto max-w-[1210px]">
            <div className="mx-auto max-w-[750px] text-center">
              <p className="am-kicker">{c.audienceEyebrow}</p>
              <h2 className="am-heading mt-4">{c.audienceTitle}</h2>
            </div>
            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <div className="relative isolate flex min-h-[480px] flex-col justify-end overflow-hidden rounded-[26px] bg-[#163A27] p-7 text-white sm:p-11">
                <div aria-hidden="true" className="absolute inset-0 -z-20 bg-cover bg-center" style={{backgroundImage:"url('" + photos.sindh + "')"}}/>
                <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0E2F22] via-[#143A2B]/75 to-[#143A2B]/10"/>
                <p className="text-[11px] font-bold tracking-[.17em] text-[#E8CC8F]">{c.farmerLabel}</p>
                <h3 className="mt-4 max-w-[460px] text-[30px] font-semibold leading-[1.2] sm:text-[38px]">{c.farmerTitle}</h3>
                <p className="mt-4 max-w-[460px] text-[14px] leading-7 text-white/85">{c.farmerDesc}</p>
                <Link href="/register?role=farmer" className="mt-7 inline-flex min-h-12 items-center justify-center gap-3 self-start rounded-full bg-[#E7C78A] px-6 text-sm font-bold text-[#173B2A] hover:bg-[#F4DDAE]">{c.farmerLink}<Arrow diagonal/></Link>
              </div>
              <div className="relative isolate flex min-h-[480px] flex-col justify-between overflow-hidden rounded-[26px] bg-[#164B35] p-7 text-white sm:p-11">
                <div aria-hidden="true" className="absolute -end-24 -top-24 h-[360px] w-[360px] rounded-full border border-white/10"/>
                <div aria-hidden="true" className="absolute end-0 top-0 h-[250px] w-[250px] rounded-full bg-[#6DA172]/20 blur-3xl"/>
                <div aria-hidden="true" className="absolute end-9 top-12 flex h-[125px] w-[125px] items-center justify-center rounded-full border border-white/20 bg-white/5 text-[#E9C989] sm:h-[160px] sm:w-[160px]"><Sprout size={78}/></div>
                <p className="text-[11px] font-bold tracking-[.17em] text-[#E8CC8F]">{c.buyerLabel}</p>
                <div className="relative mt-36 sm:mt-32">
                  <h3 className="max-w-[440px] text-[30px] font-semibold leading-[1.2] sm:text-[38px]">{c.buyerTitle}</h3>
                  <p className="mt-4 max-w-[460px] text-[14px] leading-7 text-white/80">{c.buyerDesc}</p>
                  <Link href="/register?role=buyer" className="mt-7 inline-flex min-h-12 items-center justify-center gap-3 self-start rounded-full bg-white px-6 text-sm font-bold text-[#184D35] hover:bg-[#F6F0E3]">{c.buyerLink}<Arrow diagonal/></Link>
                </div>
              </div>
            </div>

            <div className="mt-24 grid gap-12 lg:mt-32 lg:grid-cols-[.9fr_1.1fr] lg:gap-20">
              <div>
                <p className="am-kicker">{c.differenceEyebrow}</p>
                <h2 className="am-heading mt-4">{c.differenceTitle}</h2>
                <p className="mt-5 max-w-[450px] text-base leading-8 text-[#65766A]">{c.differenceDesc}</p>
              </div>
              <div className="grid gap-8 sm:grid-cols-2">
                {benefits.map((benefit,i) => <div key={i}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6EFE1] text-[#276143]">{benefit.icon}</div>
                  <h3 className="mt-5 text-[18px] font-semibold text-[#204B34]">{benefit.title}</h3>
                  <p className="mt-2 text-[14px] leading-7 text-[#65766A]">{benefit.desc}</p>
                </div>)}
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-24 bg-[#EDF1E8] px-5 py-20 sm:px-8 lg:py-24">
          <div className="mx-auto grid max-w-[1160px] gap-10 lg:grid-cols-[.7fr_1.3fr] lg:gap-20">
            <div><p className="am-kicker">{c.faqEyebrow}</p><h2 className="am-heading mt-4">{c.faqTitle}</h2></div>
            <div className="divide-y divide-[#C9D7C7] border-y border-[#C9D7C7]">
              {faqs.map(([q,a],i) => <details key={i} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-semibold text-[#244B36] [&::-webkit-details-marker]:hidden">
                  <span>{q}</span><span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#B6C9B6] text-[22px] font-light leading-none group-open:rotate-45">+</span>
                </summary>
                <p className="max-w-[720px] pb-1 pe-10 pt-3 text-[14px] leading-7 text-[#66776A]">{a}</p>
              </details>)}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1360px] px-3 py-5 sm:px-5 lg:px-7 lg:py-8">
          <div className="relative isolate overflow-hidden rounded-[24px] bg-[#133E2B] px-6 py-20 text-center text-white sm:rounded-[34px] sm:px-12 sm:py-24">
            <div aria-hidden="true" className="absolute inset-0 -z-20 bg-cover bg-center" style={{backgroundImage:"url('" + photos.wheat + "')"}}/>
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[#103A2A]/90"/>
            <p className="text-[11px] font-bold tracking-[.18em] text-[#E8CB8E]">{c.ctaSmall}</p>
            <h2 className="mx-auto mt-5 max-w-[820px] text-[35px] font-semibold leading-[1.2] sm:text-[52px]">{c.ctaTitle}</h2>
            <p className="mx-auto mt-5 max-w-[600px] text-[15px] leading-8 text-[#E2EBDD]">{c.ctaDesc}</p>
            <Link href="/register" className="mx-auto mt-9 inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full bg-[#E7C78A] px-8 text-sm font-bold text-[#153D2A] transition-transform hover:-translate-y-1 hover:bg-[#F2DBA9]">{c.ctaButton}<Arrow diagonal/></Link>
          </div>
        </section>
      </main>

      <footer className="px-5 pb-20 pt-16 sm:px-8 sm:pb-20">
        <div className="mx-auto grid max-w-[1200px] gap-10 border-b border-[#DEE5D9] pb-12 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-[23px] font-extrabold tracking-[-.04em] text-[#174830]"><Sprout size={27}/> agri<span className="text-[#548962]">match.</span></Link>
            <p className="mt-4 max-w-[310px] text-[14px] leading-7 text-[#718074]">{c.footerDesc}</p>
          </div>
          <div className="flex flex-col items-start gap-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-[.15em] text-[#1A4831]">{c.footerNavigate}</p>
            {headerLinks.map(link=><a key={link.href} href={link.href} className="text-[14px] text-[#718074] hover:text-[#1A4831]">{link.label}</a>)}
          </div>
          <div className="flex flex-col items-start gap-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-[.15em] text-[#1A4831]">{c.footerAccount}</p>
            <Link href="/login" className="text-[14px] text-[#718074] hover:text-[#1A4831]">{c.login}</Link>
            <Link href="/register" className="text-[14px] text-[#718074] hover:text-[#1A4831]">{c.join}</Link>
            {dashboardPath && <Link href={dashboardPath} className="text-[14px] text-[#718074] hover:text-[#1A4831]">{c.dashboard}</Link>}
          </div>
        </div>
        <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-3 pt-6 text-xs text-[#819086]">
          <span>© {new Date().getFullYear()} AgriMatch. {c.footerRights}</span>
          <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#1A4831]">{c.footerPhotography}</a>
        </div>
      </footer>
    </div>
  );
}
