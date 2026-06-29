"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { RegionCode, LanguageCode } from '@/lib/i18n/regions';
import { detectSuggestedLocale } from '@/lib/i18n/regions';

interface LocaleContextType {
  region: RegionCode;
  language: LanguageCode;
  remember: boolean;
  selectorOpen: boolean;
  hasPreference: boolean;
  setLocale: (pref: { region: RegionCode; language: LanguageCode; remember: boolean }) => void;
  openSelector: () => void;
  closeSelector: () => void;
  formatPrice: (amount: number, currencyCode: string) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface ProviderProps {
  children: ReactNode;
  initialLanguage?: string;
}

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(name + '=')) {
      return cookie.substring(name.length + 1);
    }
  }
  return undefined;
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};path=/;expires=${date.toUTCString()};SameSite=Lax`;
}

export function LocaleProvider({ children }: ProviderProps) {
  const [region, setRegion] = useState<RegionCode>('US');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [remember, setRemember] = useState<boolean>(true);
  const [selectorOpen, setSelectorOpen] = useState<boolean>(false);
  const [hasPreference, setHasPreference] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);

    const cookieRegion = getCookie('tonet_locale_region') as RegionCode | undefined;
    const cookieLang = getCookie('tonet_locale_lang') as LanguageCode | undefined;

    const localRegion = typeof window !== 'undefined' ? localStorage.getItem('tonet_locale_region') as RegionCode | null : null;
    const localLang = typeof window !== 'undefined' ? localStorage.getItem('tonet_locale_lang') as LanguageCode | null : null;

    const savedRegion = cookieRegion || localRegion;
    const savedLang = cookieLang || localLang;

    if (savedRegion && savedLang) {
      setRegion(savedRegion);
      setLanguage(savedLang);
      setHasPreference(true);

      // Ensure Google Translate cookie is synced
      if (typeof document !== 'undefined') {
        const currentGoogTrans = getCookie('googtrans');
        const expectedGoogTrans = savedLang === 'en' ? '' : `/en/${savedLang}`;
        const normalizedCurrent = currentGoogTrans || '';
        
        if (normalizedCurrent !== expectedGoogTrans) {
          if (expectedGoogTrans === '') {
            document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            document.cookie = 'googtrans=; path=/; domain=' + window.location.hostname + '; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            const hostParts = window.location.hostname.split('.');
            if (hostParts.length > 1) {
              const domain = '.' + hostParts.slice(-2).join('.');
              document.cookie = `googtrans=; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
            }
          } else {
            document.cookie = `googtrans=${expectedGoogTrans}; path=/`;
            const hostParts = window.location.hostname.split('.');
            if (hostParts.length > 1) {
              const domain = '.' + hostParts.slice(-2).join('.');
              document.cookie = `googtrans=${expectedGoogTrans}; path=/; domain=${domain}`;
            }
          }
          
          // Verify if the cookie was successfully written/cleared before reloading
          const verifiedGoogTrans = getCookie('googtrans') || '';
          if (verifiedGoogTrans === expectedGoogTrans) {
            window.location.reload();
          } else {
            console.warn('Google Translate cookie sync failed or was blocked. Skipping reload to avoid infinite loop.');
          }
        }
      }
    } else {
      const suggested = detectSuggestedLocale();
      setRegion(suggested.region);
      setLanguage(suggested.language);
      setHasPreference(false);
      setSelectorOpen(true);
    }
  }, []);

  const openSelector = useCallback(() => {
    setSelectorOpen(true);
  }, []);

  const closeSelector = useCallback(() => {
    if (hasPreference) {
      setSelectorOpen(false);
    }
  }, [hasPreference]);

  const setLocale = useCallback((pref: { region: RegionCode; language: LanguageCode; remember: boolean }) => {
    setRegion(pref.region);
    setLanguage(pref.language);
    setRemember(pref.remember);
    setHasPreference(true);
    setSelectorOpen(false);

    if (pref.remember) {
      setCookie('tonet_locale_region', pref.region);
      setCookie('tonet_locale_lang', pref.language);
      if (typeof window !== 'undefined') {
        localStorage.setItem('tonet_locale_region', pref.region);
        localStorage.setItem('tonet_locale_lang', pref.language);
      }
    } else {
      setCookie('tonet_locale_region', '', -1);
      setCookie('tonet_locale_lang', '', -1);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('tonet_locale_region');
        localStorage.removeItem('tonet_locale_lang');
      }
    }

    // Set Google Translate cookie
    if (typeof document !== 'undefined') {
      if (pref.language === 'en') {
        document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = 'googtrans=; path=/; domain=' + window.location.hostname + '; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      } else {
        document.cookie = `googtrans=/en/${pref.language}; path=/`;
        const hostParts = window.location.hostname.split('.');
        if (hostParts.length > 1) {
          const domain = '.' + hostParts.slice(-2).join('.');
          document.cookie = `googtrans=/en/${pref.language}; path=/; domain=${domain}`;
        }
      }
    }

    // Reload page to apply translation and regional settings immediately
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }, []);

  const formatPrice = useCallback((amount: number, currencyCode: string): string => {
    const code = currencyCode || 'EUR';
    try {
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
      return `${formatted} ${code}`;
    } catch {
      return `${amount.toFixed(2)} ${code}`;
    }
  }, []);

  return (
    <LocaleContext.Provider value={{
      region,
      language,
      remember,
      selectorOpen: isMounted ? selectorOpen : false,
      hasPreference,
      setLocale,
      openSelector,
      closeSelector,
      formatPrice,
    }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used within a LocaleProvider');
  return context;
}
