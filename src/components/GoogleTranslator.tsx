"use client";

import { useEffect } from 'react';

export default function GoogleTranslator() {
  useEffect(() => {
    // 1. Define the Google Translate initialization callback
    (window as any).googleTranslateElementInit = function () {
      if (typeof (window as any).google !== 'undefined' && (window as any).google.translate) {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          'google_translate_element'
        );
      }
    };

    // 2. Load the Google Translate script dynamically if not already loaded
    const scriptId = 'google-translate-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'text/javascript';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <>
      {/* Hidden container required by Google Translate */}
      <div id="google_translate_element" style={{ display: 'none' }} />

      <style jsx global>{`
        /* ══ CUSTOM WHITE-LABEL HIDING OF GOOGLE TRANSLATE UI ══ */
        .skiptranslate,
        .goog-te-banner-frame,
        .goog-te-banner-frame.skiptranslate,
        #goog-gt-tt,
        .goog-te-balloon-frame,
        .goog-te-menu-value,
        .goog-te-menu-frame,
        .goog-te-spinner-pos,
        .goog-te-spinner,
        .VIpgJd-ZVi9od-ORHb-OEVmcd,
        .VIpgJd-ZVi9od-l4eHX-hSRGPd,
        .VIpgJd-yAWNEb-L7lbkb {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }

        body {
          top: 0 !important;
          position: static !important;
        }

        /* Hide translation tooltips on hover */
        font[style*="background-color"] {
          background-color: transparent !important;
          box-shadow: none !important;
          box-sizing: border-box !important;
        }
        
        font {
          background: transparent !important;
          box-shadow: none !important;
        }
      `}</style>
    </>
  );
}
