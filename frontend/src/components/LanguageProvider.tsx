"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { translateInterface } from "@/lib/i18n";

export type Language = "en" | "ur";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (text: string) => string;
};

const STORAGE_KEY = "agrimatch_language";
const LanguageContext = createContext<LanguageContextValue | null>(null);

// Store original strings to restore English exactly after switching languages.
const sourceText = new WeakMap<Text, string>();
const sourceAttributes = new WeakMap<Element, Map<string, string>>();
const translatedAttributes = ["placeholder", "title", "aria-label"] as const;

function ignored(node: Node): boolean {
  const element = node.nodeType === Node.ELEMENT_NODE
    ? (node as Element)
    : node.parentElement;
  return Boolean(element?.closest("script, style, noscript, code, pre, [data-no-translate], [contenteditable='true']"));
}

function translateText(node: Text, language: Language) {
  if (ignored(node)) return;
  const current = node.nodeValue ?? "";
  let english = sourceText.get(node);
  if (english === undefined ||
    (current !== english && current !== translateInterface(english, "ur"))) {
    english = current;
    sourceText.set(node, english);
  }
  const translated = translateInterface(english, language);
  if (current !== translated) node.nodeValue = translated;
}

function translateAttributes(element: Element, language: Language) {
  if (ignored(element)) return;
  let originals = sourceAttributes.get(element);
  if (!originals) {
    originals = new Map<string, string>();
    sourceAttributes.set(element, originals);
  }
  for (const attr of translatedAttributes) {
    const current = element.getAttribute(attr);
    if (current === null) {
      originals.delete(attr);
      continue;
    }
    let english = originals.get(attr);
    if (english === undefined ||
      (current !== english && current !== translateInterface(english, "ur"))) {
      english = current;
      originals.set(attr, english);
    }
    const translated = translateInterface(english, language);
    if (current !== translated) element.setAttribute(attr, translated);
  }
}

function translateTree(root: Node, language: Language) {
  if (root.nodeType === Node.TEXT_NODE) {
    translateText(root as Text, language);
    return;
  }
  if (root.nodeType !== Node.ELEMENT_NODE) return;
  if (ignored(root)) return;
  translateAttributes(root as Element, language);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.nodeType === Node.TEXT_NODE) {
      translateText(node as Text, language);
    } else {
      translateAttributes(node as Element, language);
    }
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "ur") setLanguage("ur");
    } catch {
      // Storage may be restricted in private browsing.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ur" ? "rtl" : "ltr";
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Persist when browser storage is available.
    }

    translateTree(document.body, language);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          translateTree(mutation.target, language);
        } else if (mutation.type === "attributes") {
          translateAttributes(mutation.target as Element, language);
        } else {
          mutation.addedNodes.forEach((node) => translateTree(node, language));
        }
      }
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...translatedAttributes],
    });
    return () => observer.disconnect();
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: (text) => translateInterface(text, language) }}>
      {children}
      <div className="agrimatch-language-switcher" role="group" aria-label={language === "ur" ? "زبان منتخب کریں" : "Select language"} data-no-translate>
        <button
          type="button"
          lang="en"
          aria-pressed={language === "en"}
          onClick={() => setLanguage("en")}
          className={language === "en" ? "agrimatch-language-active" : ""}
        >
          English
        </button>
        <button
          type="button"
          lang="ur"
          dir="rtl"
          aria-pressed={language === "ur"}
          onClick={() => setLanguage("ur")}
          className={language === "ur" ? "agrimatch-language-active" : ""}
        >
          اردو
        </button>
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
