"use client";

import { useState, useEffect } from 'react';
import { useLocale } from '@/context/LocaleContext';
import {
  REGION_CODES,
  getRegionLabel,
  getLanguageLabel,
  getAvailableLanguages,
} from '@/lib/i18n/regions';
import type { RegionCode, LanguageCode } from '@/lib/i18n/regions';

export default function LocaleSelectorModal() {
  const { selectorOpen, hasPreference, setLocale, closeSelector, region, language } = useLocale();

  const [selectedRegion, setSelectedRegion] = useState<RegionCode>(region);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(language);

  useEffect(() => {
    if (selectorOpen) {
      setSelectedRegion(region);
      setSelectedLanguage(language);
    }
  }, [selectorOpen, region, language]);

  if (!selectorOpen) return null;

  const availableLanguages = getAvailableLanguages(selectedRegion);
  const isBlocking = !hasPreference;

  function handleRegionSelect(code: RegionCode) {
    setSelectedRegion(code);
    const langs = getAvailableLanguages(code);
    if (!langs.includes(selectedLanguage)) {
      setSelectedLanguage(langs[0]);
    }
  }

  function handleLanguageSelect(langCode: LanguageCode) {
    setLocale({
      region: selectedRegion,
      language: langCode,
      remember: true
    });
  }

  const currentRegionLabel = getRegionLabel(region, language);
  const currentLanguageLabel = getLanguageLabel(language, language);

  return (
    <>
      <div className="tonet-locale-overlay" onClick={isBlocking ? undefined : closeSelector} />
      <div className="tonet-locale-container" role="dialog" aria-modal="true" aria-labelledby="tonet-locale-title">
        
        <div className="tonet-locale-header">
          <h2 id="tonet-locale-title" className="tonet-locale-title">Región e idioma</h2>
          {!isBlocking && (
            <button className="tonet-locale-close" onClick={closeSelector} aria-label="Cerrar modal">✕</button>
          )}
        </div>

        <div className="tonet-locale-current">
          <span className="tonet-locale-current-label">Mercado actual:</span>
          <span className="tonet-locale-current-value">
            {currentRegionLabel.toUpperCase()} / {currentLanguageLabel.toUpperCase()}
          </span>
        </div>

        <div className="tonet-locale-divider" />

        <div className="tonet-locale-grid">
          
          <div className="tonet-locale-col">
            <h3 className="tonet-locale-col-title">Seleccionar región</h3>
            <div className="tonet-locale-list">
              {REGION_CODES.map((code) => {
                const isSelected = selectedRegion === code;
                return (
                  <button
                    key={code}
                    type="button"
                    className={`tonet-locale-item-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => handleRegionSelect(code)}
                  >
                    {getRegionLabel(code, language).toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="tonet-locale-col">
            <h3 className="tonet-locale-col-title">Seleccionar idioma</h3>
            <div className="tonet-locale-list">
              {availableLanguages.map((langCode) => {
                const isSelected = selectedRegion === region && language === langCode;
                const nativeLabel = getLanguageLabel(langCode, langCode);
                
                return (
                  <button
                    key={langCode}
                    type="button"
                    className={`tonet-locale-item-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => handleLanguageSelect(langCode)}
                  >
                    {nativeLabel.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      <style>{`
        .tonet-locale-overlay {
          position: fixed;
          inset: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 9998;
        }

        .tonet-locale-container {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 9999;
          background: #ffffff;
          width: 720px;
          max-width: calc(100vw - 40px);
          padding: 48px 48px 60px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.08);
          font-family: var(--font-primary), sans-serif;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .tonet-locale-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          margin-bottom: 8px;
        }

        .tonet-locale-title {
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #000000;
          margin: 0;
        }

        .tonet-locale-close {
          background: none !important;
          border: none !important;
          padding: 4px !important;
          font-size: 14px;
          color: #888888;
          cursor: pointer;
          transition: color 0.2s;
          border-radius: 0 !important;
          transform: none !important;
        }
        .tonet-locale-close:hover {
          color: #000000;
        }

        .tonet-locale-current {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
          font-size: 10px;
          letter-spacing: 0.08em;
        }

        .tonet-locale-current-label {
          color: #888888;
        }

        .tonet-locale-current-value {
          color: #000000;
          font-weight: 400;
        }

        .tonet-locale-divider {
          width: 100%;
          height: 1px;
          background-color: rgba(0, 0, 0, 0.08);
          margin-bottom: 32px;
        }

        .tonet-locale-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          width: 100%;
        }

        .tonet-locale-col {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .tonet-locale-col-title {
          font-size: 9px;
          font-weight: 400;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #888888;
          margin: 0;
        }

        .tonet-locale-list {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
          width: 100%;
        }

        .tonet-locale-item-btn {
          background: none !important;
          border: none !important;
          padding: 6px 0 !important;
          font-family: inherit;
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.12em;
          color: #888888;
          cursor: pointer;
          text-align: left;
          width: auto;
          transition: color 0.3s, text-decoration 0.3s;
          border-radius: 0 !important;
          transform: none !important;
        }

        .tonet-locale-item-btn:hover {
          color: #000000;
        }

        .tonet-locale-item-btn.active {
          color: #000000;
          text-decoration: underline;
          text-underline-offset: 4px;
          font-weight: 400;
        }

        @media (max-width: 1023px) {
          .tonet-locale-container {
            width: 100vw;
            max-width: 100vw;
            height: 100vh;
            max-height: 100vh;
            top: 0;
            left: 0;
            transform: none;
            padding: 40px 24px;
            overflow-y: auto;
            border: none;
            box-shadow: none;
          }

          .tonet-locale-header {
            margin-bottom: 12px;
          }

          .tonet-locale-current {
            margin-bottom: 20px;
          }

          .tonet-locale-divider {
            margin-bottom: 24px;
          }

          .tonet-locale-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .tonet-locale-item-btn {
            font-size: 12px;
            padding: 12px 0 !important;
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
