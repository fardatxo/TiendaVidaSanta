"use client";

import { useState, useEffect } from 'react';
import { useLocale } from '@/context/LocaleContext';
import { X, ChevronDown } from 'lucide-react';
import {
  REGION_CODES,
  getRegionLabel,
  getLanguageLabel,
  getAvailableLanguages,
} from '@/lib/i18n/regions';
import type { RegionCode, LanguageCode } from '@/lib/i18n/regions';

import enCatalog from '@/lib/i18n/locales/en.json';
import esCatalog from '@/lib/i18n/locales/es.json';
import frCatalog from '@/lib/i18n/locales/fr.json';

const catalogs: Record<string, any> = {
  en: enCatalog,
  es: esCatalog,
  fr: frCatalog,
};

function getLocalTranslation(key: string, lang: string): string {
  const catalog = catalogs[lang] ?? catalogs['en'];
  const keys = key.split('.');
  let current = catalog;
  for (const k of keys) {
    if (current && typeof current === 'object') {
      current = current[k];
    } else {
      return key;
    }
  }
  return typeof current === 'string' ? current : key;
}

export default function LocaleSelectorModal() {
  const { selectorOpen, hasPreference, setLocale, closeSelector, region, language } = useLocale();

  const [selectedRegion, setSelectedRegion] = useState<RegionCode>(region);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(language);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    if (selectorOpen) {
      setDismissing(false);
      setSelectedRegion(region);
      setSelectedLanguage(language);
      setSearchQuery('');
      setRegionDropdownOpen(false);
      setLanguageDropdownOpen(false);
    }
  }, [selectorOpen, region, language]);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest('.loc-custom-dropdown-container')) {
        setRegionDropdownOpen(false);
        setLanguageDropdownOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (!selectorOpen) return null;

  const availableLanguages = getAvailableLanguages(selectedRegion);
  const isBlocking = !hasPreference;

  function handleRegionChange(code: RegionCode) {
    setSelectedRegion(code);
    const langs = getAvailableLanguages(code);
    // If current language is not available, default to the region's first language
    if (!langs.includes(selectedLanguage)) {
      setSelectedLanguage(langs[0]);
    }
  }

  function handleConfirm() {
    setDismissing(true);
    setTimeout(() => {
      setLocale({
        region: selectedRegion,
        language: selectedLanguage,
        remember: true
      });
    }, 700); // matches animation duration
  }

  function handleClose() {
    setDismissing(true);
    setTimeout(() => {
      closeSelector();
    }, 700);
  }

  // Filter regions based on search query
  const filteredRegions = REGION_CODES.filter((code) => {
    const label = getRegionLabel(code, selectedLanguage).toLowerCase();
    const query = searchQuery.toLowerCase();
    return label.includes(query) || code.toLowerCase().includes(query);
  });

  // Get translations matching the *selected* language dynamically
  const bannerTitle = getLocalTranslation('locale.title', selectedLanguage);
  const regionLabel = getLocalTranslation('locale.region', selectedLanguage);
  const languageLabel = getLocalTranslation('locale.language', selectedLanguage);
  const confirmBtnText = getLocalTranslation('locale.continue', selectedLanguage);

  return (
    <>
      <div className={`loc-bar${dismissing ? ' loc-dismissing' : ''}`} role="dialog" aria-label="Locale selector">
        <div className="loc-inner">
          <div className="loc-text">
            <p className="loc-title">{bannerTitle}</p>
            <p className="loc-desc">
              {selectedLanguage === 'es' 
                ? 'Selecciona tu región e idioma para ver precios locales, envíos y opciones personalizadas.' 
                : selectedLanguage === 'fr'
                ? 'Sélectionnez votre région et langue pour voir les tarifs, livraisons et options personnalisées.'
                : 'Select your region and language to view local pricing, shipping, and tailored options.'
              }
            </p>
          </div>

          <div className="loc-selectors">
            {/* Language Custom Dropdown */}
            <div className="loc-select-group">
              <label className="loc-select-label">{languageLabel}</label>
              <div className="loc-custom-dropdown-container">
                <button 
                  type="button" 
                  className={`loc-dropdown-trigger ${languageDropdownOpen ? 'active' : ''}`}
                  onClick={() => {
                    setLanguageDropdownOpen(!languageDropdownOpen);
                    setRegionDropdownOpen(false);
                  }}
                >
                  <span className="loc-trigger-text">
                    {getLanguageLabel(selectedLanguage, selectedLanguage).toUpperCase()}
                  </span>
                  <ChevronDown size={12} strokeWidth={1.5} className="loc-chevron" />
                </button>

                {languageDropdownOpen && (
                  <div className="loc-dropdown-panel loc-dropdown-panel--language">
                    <div className="loc-dropdown-list">
                      {availableLanguages.map((langCode) => (
                        <button
                          key={langCode}
                          type="button"
                          className={`loc-dropdown-item ${selectedLanguage === langCode ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedLanguage(langCode);
                            setLanguageDropdownOpen(false);
                          }}
                        >
                          {getLanguageLabel(langCode, selectedLanguage).toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Region Custom Dropdown with Search Box */}
            <div className="loc-select-group">
              <label className="loc-select-label">{regionLabel}</label>
              <div className="loc-custom-dropdown-container">
                <button 
                  type="button" 
                  className={`loc-dropdown-trigger ${regionDropdownOpen ? 'active' : ''}`}
                  onClick={() => {
                    setRegionDropdownOpen(!regionDropdownOpen);
                    setLanguageDropdownOpen(false);
                  }}
                >
                  <span className="loc-trigger-text">
                    {getRegionLabel(selectedRegion, selectedLanguage).toUpperCase()}
                  </span>
                  <ChevronDown size={12} strokeWidth={1.5} className="loc-chevron" />
                </button>

                {regionDropdownOpen && (
                  <div className="loc-dropdown-panel loc-dropdown-panel--region">
                    <div className="loc-dropdown-search-wrap">
                      <input 
                        type="text" 
                        placeholder={selectedLanguage === 'es' ? 'Buscar región...' : selectedLanguage === 'fr' ? 'Rechercher...' : 'Search region...'} 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="loc-dropdown-search-input"
                        autoFocus
                        onClick={(e) => e.stopPropagation()} // Prevent closing dropdown on search click
                      />
                    </div>
                    <div className="loc-dropdown-list">
                      {filteredRegions.length > 0 ? (
                        filteredRegions.map((code) => (
                          <button
                            key={code}
                            type="button"
                            className={`loc-dropdown-item ${selectedRegion === code ? 'selected' : ''}`}
                            onClick={() => {
                              handleRegionChange(code);
                              setRegionDropdownOpen(false);
                              setSearchQuery('');
                            }}
                          >
                            {getRegionLabel(code, selectedLanguage).toUpperCase()}
                          </button>
                        ))
                      ) : (
                        <div className="loc-dropdown-no-results">
                          {selectedLanguage === 'es' ? 'Sin resultados' : selectedLanguage === 'fr' ? 'Aucun résultat' : 'No results'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button className="loc-btn loc-btn--confirm" onClick={handleConfirm}>
              {confirmBtnText}
            </button>
          </div>

          {!isBlocking && (
            <button className="loc-close" onClick={handleClose} aria-label="Close locale selector">
              <X size={18} strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>

      <style>{`
        /* ══ LOCALE SELECTION BAR (Cookie-Banner Style) ══ */
        .loc-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 9998;
          background: #1a1a1a;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          animation: loc-rise 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
          box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.35);
        }

        @keyframes loc-rise {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }

        @keyframes loc-fall {
          from { transform: translateY(0);    opacity: 1; }
          to   { transform: translateY(100%); opacity: 0; }
        }

        .loc-bar.loc-dismissing {
          animation: loc-fall 0.8s cubic-bezier(0.7, 0, 0.84, 0) forwards;
        }

        .loc-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
          max-width: 100%;
          margin: 0 auto;
          padding: 18px 24px;
          position: relative;
        }

        .loc-text {
          flex: 1;
          min-width: 0;
        }

        .loc-title {
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.15em;
          color: #ffffff;
          margin: 0 0 4px 0;
          text-transform: uppercase;
        }

        .loc-desc {
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.02em;
          color: rgba(255, 255, 255, 0.55);
          line-height: 1.55;
          margin: 0;
        }

        .loc-selectors {
          display: flex;
          align-items: flex-end;
          gap: 16px;
          flex-shrink: 0;
        }

        .loc-select-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .loc-select-label {
          font-family: var(--font-primary), sans-serif;
          font-size: 8px;
          font-weight: 400;
          letter-spacing: 0.12em;
          color: rgba(255, 255, 255, 0.45);
          text-transform: uppercase;
        }

        /* Custom Dropdown Styling */
        .loc-custom-dropdown-container {
          position: relative;
        }

        .loc-dropdown-trigger {
          background: #1c1c1c;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 10px 16px 10px 14px;
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-radius: 0 !important; /* Rectangular borders */
          cursor: pointer;
          min-width: 170px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: border-color 0.3s, background-color 0.3s;
          text-align: left;
        }

        .loc-dropdown-trigger:hover,
        .loc-dropdown-trigger.active {
          border-color: rgba(255, 255, 255, 0.6);
          background-color: #242424;
        }

        .loc-trigger-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
        }

        .loc-chevron {
          margin-left: 8px;
          color: rgba(255, 255, 255, 0.6);
          transition: transform 0.3s;
          flex-shrink: 0;
        }

        .loc-dropdown-trigger.active .loc-chevron {
          transform: rotate(180deg);
        }

        /* Floating Panels */
        .loc-dropdown-panel {
          position: absolute;
          bottom: 100%;
          right: 0;
          margin-bottom: 8px;
          background: #242424;
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.4);
          z-index: 10000;
          border-radius: 0 !important; /* Rectangular borders */
          display: flex;
          flex-direction: column;
        }

        .loc-dropdown-panel--region {
          width: 250px;
        }

        .loc-dropdown-panel--language {
          width: 170px;
        }

        /* Search Input */
        .loc-dropdown-search-wrap {
          padding: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: #1c1c1c;
        }

        .loc-dropdown-search-input {
          width: 100%;
          background: #121212;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 8px 10px;
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          letter-spacing: 0.04em;
          border-radius: 0 !important;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.3s;
        }

        .loc-dropdown-search-input:focus {
          border-color: rgba(255, 255, 255, 0.45);
        }

        /* List Items */
        .loc-dropdown-list {
          max-height: 200px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }

        .loc-dropdown-list::-webkit-scrollbar {
          width: 4px;
        }

        .loc-dropdown-list::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.2);
        }

        .loc-dropdown-item {
          width: 100%;
          background: none !important;
          border: none !important;
          color: rgba(255, 255, 255, 0.7);
          padding: 10px 16px;
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.08em;
          text-align: left;
          cursor: pointer;
          transition: background-color 0.2s, color 0.2s;
          border-radius: 0 !important;
          text-transform: uppercase;
        }

        .loc-dropdown-item:hover {
          background-color: rgba(255, 255, 255, 0.08) !important;
          color: #ffffff;
        }

        .loc-dropdown-item.selected {
          background-color: rgba(255, 255, 255, 0.12) !important;
          color: #ffffff;
          font-weight: 500;
        }

        .loc-dropdown-no-results {
          padding: 16px;
          color: rgba(255, 255, 255, 0.4);
          font-size: 10px;
          text-align: center;
          font-family: var(--font-primary), sans-serif;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* Confirm Button */
        .loc-btn loc-btn--confirm {
          /* Inherit base button style properties */
        }

        .loc-btn--confirm {
          color: #000000;
          background: #ffffff;
          border: 1px solid #ffffff;
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.08em;
          cursor: pointer;
          padding: 10px 24px;
          height: 38px;
          transition: background-color 0.3s, color 0.3s, border-color 0.3s;
          white-space: nowrap;
          border-radius: 0 !important; /* Rectangular borders */
          text-transform: uppercase;
        }

        .loc-btn--confirm:hover {
          background: rgba(255, 255, 255, 0.85);
          border-color: rgba(255, 255, 255, 0.85);
        }

        /* Close X button */
        .loc-close {
          background: none !important;
          border: none !important;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: color 0.3s;
          border-radius: 0 !important;
        }

        .loc-close:hover {
          color: #ffffff;
        }

        /* ══ RESPONSIVE ══ */
        @media (max-width: 767px) {
          .loc-inner {
            flex-direction: column;
            align-items: stretch;
            gap: 20px;
            padding: 24px 20px 28px;
          }

          .loc-selectors {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .loc-custom-dropdown-container {
            width: 100%;
          }

          .loc-dropdown-trigger {
            width: 100%;
          }

          .loc-dropdown-panel {
            width: 100% !important;
            bottom: 100%;
            left: 0;
          }

          .loc-select-group {
            width: 100%;
          }

          .loc-btn--confirm {
            text-align: center;
            width: 100%;
            margin-top: 4px;
          }

          .loc-close {
            position: absolute;
            top: 12px;
            right: 12px;
          }
        }
      `}</style>
    </>
  );
}
