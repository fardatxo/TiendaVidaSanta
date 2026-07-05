export type RegionCode = string;
export type LanguageCode = string;

export interface RegionConfig {
  code: string;
  currency: string;
  languages: string[];
  defaultLanguage: string;
}

// 20 most spoken/prominent languages in global e-commerce
export const LANGUAGE_CODES: string[] = [
  'en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 
  'ru', 'hi', 'tr', 'nl', 'id', 'vi', 'th', 'sv', 'da', 'no'
];

export const FALLBACK_LANGUAGE: string = 'en';

export const languageLabels: Record<string, Record<string, string>> = {
  en: { es: 'Inglés', en: 'English', fr: 'Anglais' },
  es: { es: 'Español', en: 'Spanish', fr: 'Espagnol' },
  fr: { es: 'Francés', en: 'French', fr: 'Français' },
  de: { es: 'Alemán', en: 'German', fr: 'Allemand' },
  it: { es: 'Italiano', en: 'Italian', fr: 'Italien' },
  pt: { es: 'Portugués', en: 'Portuguese', fr: 'Portugais' },
  zh: { es: 'Chino', en: 'Chinese', fr: 'Chinois' },
  ja: { es: 'Japonés', en: 'Japanese', fr: 'Japonais' },
  ko: { es: 'Coreano', en: 'Korean', fr: 'Coréen' },
  ar: { es: 'Árabe', en: 'Arabic', fr: 'Arabe' },
  ru: { es: 'Ruso', en: 'Russian', fr: 'Russe' },
  hi: { es: 'Hindi', en: 'Hindi', fr: 'Hindi' },
  tr: { es: 'Turco', en: 'Turkish', fr: 'Turc' },
  nl: { es: 'Neerlandés', en: 'Dutch', fr: 'Néerlandais' },
  id: { es: 'Indonesio', en: 'Indonesian', fr: 'Indonésien' },
  vi: { es: 'Vietnamita', en: 'Vietnamese', fr: 'Vietnamien' },
  th: { es: 'Tailandés', en: 'Thai', fr: 'Thaïlandais' },
  sv: { es: 'Sueco', en: 'Swedish', fr: 'Suédois' },
  da: { es: 'Danés', en: 'Danish', fr: 'Danois' },
  no: { es: 'Noruego', en: 'Norwegian', fr: 'Norvégien' }
};

// Full list of main regions/countries in the world with their configurations
export const REGIONS: Record<string, RegionConfig> = {
  // Europe
  ES: { code: 'ES', currency: 'EUR', languages: ['es', 'en', 'fr'], defaultLanguage: 'es' },
  FR: { code: 'FR', currency: 'EUR', languages: ['fr', 'en', 'es'], defaultLanguage: 'fr' },
  DE: { code: 'DE', currency: 'EUR', languages: ['de', 'en'], defaultLanguage: 'de' },
  IT: { code: 'IT', currency: 'EUR', languages: ['it', 'en'], defaultLanguage: 'it' },
  GB: { code: 'GB', currency: 'GBP', languages: ['en'], defaultLanguage: 'en' },
  NL: { code: 'NL', currency: 'EUR', languages: ['nl', 'en'], defaultLanguage: 'nl' },
  BE: { code: 'BE', currency: 'EUR', languages: ['fr', 'nl', 'en'], defaultLanguage: 'fr' },
  PT: { code: 'PT', currency: 'EUR', languages: ['pt', 'en'], defaultLanguage: 'pt' },
  CH: { code: 'CH', currency: 'CHF', languages: ['de', 'fr', 'it', 'en'], defaultLanguage: 'de' },
  AT: { code: 'AT', currency: 'EUR', languages: ['de', 'en'], defaultLanguage: 'de' },
  SE: { code: 'SE', currency: 'SEK', languages: ['sv', 'en'], defaultLanguage: 'sv' },
  DK: { code: 'DK', currency: 'DKK', languages: ['da', 'en'], defaultLanguage: 'da' },
  NO: { code: 'NO', currency: 'NOK', languages: ['no', 'en'], defaultLanguage: 'no' },
  FI: { code: 'FI', currency: 'EUR', languages: ['en', 'sv'], defaultLanguage: 'en' },
  IE: { code: 'IE', currency: 'EUR', languages: ['en'], defaultLanguage: 'en' },
  PL: { code: 'PL', currency: 'PLN', languages: ['en'], defaultLanguage: 'en' },
  GR: { code: 'GR', currency: 'EUR', languages: ['en'], defaultLanguage: 'en' },
  TR: { code: 'TR', currency: 'TRY', languages: ['tr', 'en'], defaultLanguage: 'tr' },
  RU: { code: 'RU', currency: 'RUB', languages: ['ru', 'en'], defaultLanguage: 'ru' },
  
  // North America
  US: { code: 'US', currency: 'USD', languages: ['en', 'es'], defaultLanguage: 'en' },
  CA: { code: 'CA', currency: 'CAD', languages: ['en', 'fr'], defaultLanguage: 'en' },
  MX: { code: 'MX', currency: 'MXN', languages: ['es', 'en'], defaultLanguage: 'es' },
  
  // South & Central America
  BR: { code: 'BR', currency: 'BRL', languages: ['pt', 'en'], defaultLanguage: 'pt' },
  AR: { code: 'AR', currency: 'ARS', languages: ['es', 'en'], defaultLanguage: 'es' },
  CO: { code: 'CO', currency: 'COP', languages: ['es', 'en'], defaultLanguage: 'es' },
  CL: { code: 'CL', currency: 'CLP', languages: ['es', 'en'], defaultLanguage: 'es' },
  PE: { code: 'PE', currency: 'PEN', languages: ['es', 'en'], defaultLanguage: 'es' },
  VE: { code: 'VE', currency: 'USD', languages: ['es', 'en'], defaultLanguage: 'es' },
  UY: { code: 'UY', currency: 'UYU', languages: ['es', 'en'], defaultLanguage: 'es' },
  EC: { code: 'EC', currency: 'USD', languages: ['es', 'en'], defaultLanguage: 'es' },
  CR: { code: 'CR', currency: 'CRC', languages: ['es', 'en'], defaultLanguage: 'es' },
  PA: { code: 'PA', currency: 'USD', languages: ['es', 'en'], defaultLanguage: 'es' },
  
  // Asia & Oceania
  JP: { code: 'JP', currency: 'JPY', languages: ['ja', 'en'], defaultLanguage: 'ja' },
  CN: { code: 'CN', currency: 'CNY', languages: ['zh', 'en'], defaultLanguage: 'zh' },
  KR: { code: 'KR', currency: 'KRW', languages: ['ko', 'en'], defaultLanguage: 'ko' },
  IN: { code: 'IN', currency: 'INR', languages: ['hi', 'en'], defaultLanguage: 'hi' },
  AU: { code: 'AU', currency: 'AUD', languages: ['en'], defaultLanguage: 'en' },
  NZ: { code: 'NZ', currency: 'NZD', languages: ['en'], defaultLanguage: 'en' },
  SG: { code: 'SG', currency: 'SGD', languages: ['en', 'zh'], defaultLanguage: 'en' },
  HK: { code: 'HK', currency: 'HKD', languages: ['zh', 'en'], defaultLanguage: 'zh' },
  TW: { code: 'TW', currency: 'TWD', languages: ['zh', 'en'], defaultLanguage: 'zh' },
  ID: { code: 'ID', currency: 'IDR', languages: ['id', 'en'], defaultLanguage: 'id' },
  VN: { code: 'VN', currency: 'VND', languages: ['vi', 'en'], defaultLanguage: 'vi' },
  TH: { code: 'TH', currency: 'THB', languages: ['th', 'en'], defaultLanguage: 'th' },
  MY: { code: 'MY', currency: 'MYR', languages: ['en', 'zh'], defaultLanguage: 'en' },
  PH: { code: 'PH', currency: 'PHP', languages: ['en'], defaultLanguage: 'en' },
  
  // Middle East & Africa
  AE: { code: 'AE', currency: 'AED', languages: ['ar', 'en'], defaultLanguage: 'en' },
  SA: { code: 'SA', currency: 'SAR', languages: ['ar', 'en'], defaultLanguage: 'ar' },
  IL: { code: 'IL', currency: 'ILS', languages: ['en'], defaultLanguage: 'en' },
  ZA: { code: 'ZA', currency: 'ZAR', languages: ['en'], defaultLanguage: 'en' },
  EG: { code: 'EG', currency: 'EGP', languages: ['ar', 'en'], defaultLanguage: 'ar' },
  MA: { code: 'MA', currency: 'MAD', languages: ['fr', 'ar', 'en'], defaultLanguage: 'fr' }
};

export const REGION_CODES: string[] = Object.keys(REGIONS);

export const regionLabels: Record<string, Record<string, string>> = {
  ES: { es: 'España', en: 'Spain', fr: 'Espagne' },
  FR: { es: 'Francia', en: 'France', fr: 'France' },
  DE: { es: 'Alemania', en: 'Germany', fr: 'Allemagne' },
  IT: { es: 'Italia', en: 'Italy', fr: 'Italie' },
  GB: { es: 'Reino Unido', en: 'United Kingdom', fr: 'Royaume-Uni' },
  NL: { es: 'Países Bajos', en: 'Netherlands', fr: 'Pays-Bas' },
  BE: { es: 'Bélgica', en: 'Belgium', fr: 'Belgique' },
  PT: { es: 'Portugal', en: 'Portugal', fr: 'Portugal' },
  CH: { es: 'Suiza', en: 'Switzerland', fr: 'Suisse' },
  AT: { es: 'Austria', en: 'Austria', fr: 'Autriche' },
  SE: { es: 'Suecia', en: 'Sweden', fr: 'Suède' },
  DK: { es: 'Dinamarca', en: 'Danish', fr: 'Danemark' },
  NO: { es: 'Noruega', en: 'Norway', fr: 'Norvège' },
  FI: { es: 'Finlandia', en: 'Finland', fr: 'Finlande' },
  IE: { es: 'Irlanda', en: 'Ireland', fr: 'Irlande' },
  PL: { es: 'Polonia', en: 'Poland', fr: 'Pologne' },
  GR: { es: 'Grecia', en: 'Greece', fr: 'Grèce' },
  TR: { es: 'Turquía', en: 'Turkey', fr: 'Turquie' },
  RU: { es: 'Rusia', en: 'Russia', fr: 'Russie' },
  US: { es: 'Estados Unidos', en: 'United States', fr: 'États-Unis' },
  CA: { es: 'Canadá', en: 'Canada', fr: 'Canada' },
  MX: { es: 'México', en: 'Mexico', fr: 'Mexique' },
  BR: { es: 'Brasil', en: 'Brazil', fr: 'Brésil' },
  AR: { es: 'Argentina', en: 'Argentina', fr: 'Argentine' },
  CO: { es: 'Colombia', en: 'Colombia', fr: 'Colombie' },
  CL: { es: 'Chile', en: 'Chile', fr: 'Chili' },
  PE: { es: 'Perú', en: 'Peru', fr: 'Pérou' },
  VE: { es: 'Venezuela', en: 'Venezuela', fr: 'Venezuela' },
  UY: { es: 'Uruguay', en: 'Uruguay', fr: 'Uruguay' },
  EC: { es: 'Ecuador', en: 'Ecuador', fr: 'Équateur' },
  CR: { es: 'Costa Rica', en: 'Costa Rica', fr: 'Costa Rica' },
  PA: { es: 'Panamá', en: 'Panama', fr: 'Panama' },
  JP: { es: 'Japón', en: 'Japan', fr: 'Japon' },
  CN: { es: 'China', en: 'China', fr: 'Chine' },
  KR: { es: 'Corea del Sur', en: 'South Korea', fr: 'Corée du Sud' },
  IN: { es: 'India', en: 'India', fr: 'Inde' },
  AU: { es: 'Australia', en: 'Australia', fr: 'Australie' },
  NZ: { es: 'Nueva Zelanda', en: 'New Zealand', fr: 'Nouvelle-Zélande' },
  SG: { es: 'Singapur', en: 'Singapore', fr: 'Singapour' },
  HK: { es: 'Hong Kong', en: 'Hong Kong', fr: 'Hong Kong' },
  TW: { es: 'Taiwán', en: 'Taiwan', fr: 'Taïwan' },
  ID: { es: 'Indonesia', en: 'Indonesia', fr: 'Indonésie' },
  VN: { es: 'Vietnam', en: 'Vietnam', fr: 'Viêt Nam' },
  TH: { es: 'Tailandia', en: 'Thailand', fr: 'Thaïlande' },
  MY: { es: 'Malasia', en: 'Malaysia', fr: 'Malaisie' },
  PH: { es: 'Filipinas', en: 'Philippines', fr: 'Philippines' },
  AE: { es: 'Emiratos Árabes Unidos', en: 'United Arab Emirates', fr: 'Émirats arabes unis' },
  SA: { es: 'Arabia Saudita', en: 'Saudi Arabia', fr: 'Arabie saoudite' },
  IL: { es: 'Israel', en: 'Israel', fr: 'Israël' },
  ZA: { es: 'Sudáfrica', en: 'South Africa', fr: 'Afrique du Sud' },
  EG: { es: 'Egipto', en: 'Egypt', fr: 'Égypte' },
  MA: { es: 'Marruecos', en: 'Morocco', fr: 'Maroc' }
};

export function getRegionLabel(region: RegionCode, lang: LanguageCode): string {
  return regionLabels[region]?.[lang] ?? regionLabels[region]?.en ?? region;
}

export function getLanguageLabel(language: LanguageCode, displayLang: LanguageCode): string {
  return languageLabels[language]?.[displayLang] ?? languageLabels[language]?.en ?? language;
}

export function getAvailableLanguages(region: RegionCode): LanguageCode[] {
  return REGIONS[region]?.languages || ['en'];
}

export function isLanguageAvailable(region: RegionCode, lang: LanguageCode): boolean {
  return getAvailableLanguages(region).includes(lang);
}

export function detectSuggestedLocale(): { region: RegionCode; language: LanguageCode } {
  if (typeof navigator === 'undefined') return { region: 'ES', language: 'es' };
  const navLang = navigator.language ?? '';
  
  const parts = navLang.split('-');
  const detectedLang = parts[0]?.toLowerCase() ?? 'es';
  const detectedRegion = parts[1]?.toUpperCase() ?? '';
  
  let finalRegion: RegionCode = 'ES';
  let finalLang: LanguageCode = 'es';

  if (LANGUAGE_CODES.includes(detectedLang)) {
    finalLang = detectedLang;
  }

  if (detectedRegion && REGIONS[detectedRegion]) {
    finalRegion = detectedRegion;
  } else {
    // Fallback region mapping based on detected language
    if (finalLang === 'es') finalRegion = 'ES';
    else if (finalLang === 'fr') finalRegion = 'FR';
    else if (finalLang === 'de') finalRegion = 'DE';
    else if (finalLang === 'it') finalRegion = 'IT';
    else if (finalLang === 'ja') finalRegion = 'JP';
    else if (finalLang === 'ko') finalRegion = 'KR';
    else if (finalLang === 'zh') finalRegion = 'CN';
    else if (finalLang === 'pt') finalRegion = 'BR';
    else if (finalLang === 'sv') finalRegion = 'SE';
    else if (finalLang === 'da') finalRegion = 'DK';
    else if (finalLang === 'no') finalRegion = 'NO';
    else finalRegion = 'ES';
  }

  return { region: finalRegion, language: finalLang };
}
