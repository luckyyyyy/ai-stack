import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { loadLangMode, saveLangMode } from "../lib/storage";
import type { Lang, LangMode } from "../lib/types";

const normalizeLang = (value?: string): Lang =>
  value?.toLowerCase().startsWith("zh") ? "zh" : "en";

export function useLang() {
  const { i18n } = useTranslation();
  const [langMode, setLangMode] = useState<LangMode>(() => loadLangMode());

  const detectAutoLang = useCallback((): Lang => {
    if (typeof navigator !== "undefined") {
      const browserLang = navigator.languages?.[0] ?? navigator.language;
      return normalizeLang(browserLang);
    }
    if (typeof document !== "undefined") {
      return normalizeLang(document.documentElement.lang);
    }
    return "en";
  }, []);

  const _detectedLang: Lang = useMemo(
    () => normalizeLang(i18n.language),
    [i18n.language],
  );

  const lang: Lang = langMode === "auto" ? detectAutoLang() : langMode;

  useEffect(() => {
    saveLangMode(langMode);
    const nextLang = langMode === "auto" ? detectAutoLang() : langMode;
    if (i18n.language !== nextLang) {
      i18n.changeLanguage(nextLang);
    }
  }, [langMode, i18n, detectAutoLang]);

  return { lang, langMode, setLangMode };
}
