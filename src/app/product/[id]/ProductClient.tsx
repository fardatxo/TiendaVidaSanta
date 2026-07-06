"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { X, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useUI } from '@/context/UIContext';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/lib/i18n';
import { useLocale } from '@/context/LocaleContext';
import { Product, ShopifyVariant, RecommendedProduct, getOptimizedImageUrl } from '@/lib/shopify';
import { useTranslatedText } from '@/hooks/useTranslatedText';
import RecommendedCard from '@/components/RecommendedCard';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';

interface Props {
  product: Product;
  relatedProductsByTag?: Product[];
}

function parseMetadata(desc?: string | null): Record<string, string> {
  if (!desc) return {};
  const regex = /(Item Number|Gender|Fabric Weight|Fabric Thickness|Fabric Stretch|Fabric|Care Instructions|Features|Print Size|Notes):\s*/gi;
  const matches: { key: string; index: number; length: number }[] = [];
  let match;
  while ((match = regex.exec(desc)) !== null) {
    matches.push({
      key: match[1],
      index: match.index,
      length: match[0].length
    });
  }
  
  const result: Record<string, string> = {};
  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const next = matches[i + 1];
    const start = current.index + current.length;
    const end = next ? next.index : desc.length;
    let keyName = current.key.trim();
    if (keyName.toLowerCase() === 'fabric strench') {
      keyName = 'Fabric Stretch';
    }
    result[keyName] = desc.substring(start, end).trim();
  }
  return result;
}

function colorNameToCSS(name: string): string {
  const n = name.toLowerCase().trim();
  const map: Record<string, string> = {
    black: '#111111', white: '#ffffff', grey: '#888888', gray: '#888888',
    'light gray': '#c8c8c8', 'dark gray': '#444444', 'dark grey': '#444444',
    navy: '#1a2744', blue: '#2a5caa', 'light blue': '#7ab3e0', 'sky blue': '#87ceeb',
    red: '#cc2222', burgundy: '#6e1520', wine: '#722f37', maroon: '#7b0020',
    green: '#2d6a2d', 'olive green': '#6b7c3b', olive: '#6b7c3b', khaki: '#c3b091',
    brown: '#6b3a2a', camel: '#c19a6b', tan: '#d2b48c', beige: '#f5f0e8',
    yellow: '#e8c832', gold: '#cfaa3c', orange: '#e07020', pink: '#e87090',
    purple: '#6a3090', lavender: '#b090d0', cream: '#fffdd0', ivory: '#fffff0',
    sand: '#c2b280', stone: '#928e85', ecru: '#c2b280', off_white: '#f5f0e8',
    'off white': '#f5f0e8', charcoal: '#3c3c3c', slate: '#708090',
    mint: '#98d8c8', teal: '#2a9090', cobalt: '#0047ab',
    'dark brown': '#3b1a0a', 'light brown': '#a0704a',
  };
  if (map[n]) return map[n];
  for (const key of Object.keys(map)) {
    if (n.includes(key) || key.includes(n)) return map[key];
  }
  return '#888888';
}

const RECENTLY_VIEWED_KEY = 'rv_products';
const MAX_RECENTLY_VIEWED = 10;

type RecentProduct = Pick<RecommendedProduct, 'handle' | 'title' | 'imageUrl' | 'price' | 'currencyCode'>;

const getProductType = (p: RecommendedProduct): 'footwear' | 'top' | 'pants' | 'accessory' => {
  const title = p.title.toLowerCase();
  if (title.includes('shoe') || title.includes('sneaker') || title.includes('slide') || title.includes('boot') || title.includes('loafer')) {
    return 'footwear';
  }
  if (title.includes('short') || title.includes('pant') || title.includes('trouser') || title.includes('jeans') || title.includes('denim')) {
    return 'pants';
  }
  if (title.includes('sunglasses') || title.includes('eyewear') || title.includes('glasses') || title.includes('hat') || title.includes('cap') || title.includes('bag') || title.includes('wallet')) {
    return 'accessory';
  }
  return 'top';
};

const getProductColor = (p: RecommendedProduct): string => {
  const title = p.title.toLowerCase();
  const colors = [
    'white', 'black', 'grey', 'gray', 'navy', 'blue', 'beige', 'cream', 
    'brown', 'camel', 'olive', 'green', 'red', 'orange', 'yellow', 'pink', 
    'purple', 'blanco', 'negro', 'gris', 'azul', 'verde', 'rojo', 'rosa', 'amarillo'
  ];
  for (const color of colors) {
    if (title.includes(color)) {
      return color === 'gray' ? 'grey' : color;
    }
  }
  const hash = p.title.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const fallbackColors = ['black', 'white', 'grey', 'beige', 'navy'];
  return fallbackColors[hash % fallbackColors.length];
};

const arrangeRecommendations = (pool: RecommendedProduct[]): RecommendedProduct[] => {
  if (pool.length < 4) return pool;

  const annotated = pool.map(p => ({
    product: p,
    type: getProductType(p),
    color: getProductColor(p)
  }));

  const result: RecommendedProduct[] = [];

  // --- VIEWPORT 1 (Indices 0, 1, 2, 3) ---
  // Try to find a combination of 4 products with 4 different types and 4 different colors.
  let v1Combo: typeof annotated = [];
  
  for (let i = 0; i < annotated.length; i++) {
    for (let j = i + 1; j < annotated.length; j++) {
      for (let k = j + 1; k < annotated.length; k++) {
        for (let l = k + 1; l < annotated.length; l++) {
          const combo = [annotated[i], annotated[j], annotated[k], annotated[l]];
          const types = new Set(combo.map(c => c.type));
          const colors = new Set(combo.map(c => c.color));
          
          if (types.size === 4 && colors.size === 4) {
            v1Combo = combo;
            break;
          }
        }
        if (v1Combo.length > 0) break;
      }
      if (v1Combo.length > 0) break;
    }
    if (v1Combo.length > 0) break;
  }

  // Fallback 1: Try 4 unique types
  if (v1Combo.length === 0) {
    for (let i = 0; i < annotated.length; i++) {
      for (let j = i + 1; j < annotated.length; j++) {
        for (let k = j + 1; k < annotated.length; k++) {
          for (let l = k + 1; l < annotated.length; l++) {
            const combo = [annotated[i], annotated[j], annotated[k], annotated[l]];
            const types = new Set(combo.map(c => c.type));
            if (types.size === 4) {
              v1Combo = combo;
              break;
            }
          }
          if (v1Combo.length > 0) break;
        }
        if (v1Combo.length > 0) break;
      }
      if (v1Combo.length > 0) break;
    }
  }

  // Fallback 2: Take the first 4 products
  if (v1Combo.length === 0) {
    v1Combo = annotated.slice(0, 4);
  }

  // Add Viewport 1
  v1Combo.forEach(c => result.push(c.product));

  // Remaining pool for Viewport 2
  const v1Handles = new Set(v1Combo.map(c => c.product.handle));
  const remaining = annotated.filter(c => !v1Handles.has(c.product.handle));

  if (remaining.length < 4) {
    remaining.forEach(c => result.push(c.product));
    return result;
  }

  // --- VIEWPORT 2 (Indices 4, 5, 6, 7) ---
  // Try to find a combination of 4 products that has:
  // - 2 of one type and 2 of another type (e.g. 2 tops, 2 pants)
  // - AND 2 of one color and 2 of another color (e.g. 2 black, 2 white)
  let v2Combo: typeof annotated = [];

  for (let i = 0; i < remaining.length; i++) {
    for (let j = i + 1; j < remaining.length; j++) {
      for (let k = j + 1; k < remaining.length; k++) {
        for (let l = k + 1; l < remaining.length; l++) {
          const combo = [remaining[i], remaining[j], remaining[k], remaining[l]];
          
          const typeCounts: Record<string, number> = {};
          combo.forEach(c => { typeCounts[c.type] = (typeCounts[c.type] || 0) + 1; });
          const typeVals = Object.values(typeCounts).sort();
          
          const colorCounts: Record<string, number> = {};
          combo.forEach(c => { colorCounts[c.color] = (colorCounts[c.color] || 0) + 1; });
          const colorVals = Object.values(colorCounts).sort();

          const matchesTypePattern = typeVals.length === 2 && typeVals[0] === 2 && typeVals[1] === 2;
          const matchesColorPattern = colorVals.length === 2 && colorVals[0] === 2 && colorVals[1] === 2;

          if (matchesTypePattern && matchesColorPattern) {
            v2Combo = combo;
            break;
          }
        }
        if (v2Combo.length > 0) break;
      }
      if (v2Combo.length > 0) break;
    }
    if (v2Combo.length > 0) break;
  }

  // Phase 2: Try 2/2 types OR 2/2 colors
  if (v2Combo.length === 0) {
    for (let i = 0; i < remaining.length; i++) {
      for (let j = i + 1; j < remaining.length; j++) {
        for (let k = j + 1; k < remaining.length; k++) {
          for (let l = k + 1; l < remaining.length; l++) {
            const combo = [remaining[i], remaining[j], remaining[k], remaining[l]];
            
            const typeCounts: Record<string, number> = {};
            combo.forEach(c => { typeCounts[c.type] = (typeCounts[c.type] || 0) + 1; });
            const typeVals = Object.values(typeCounts).sort();
            
            const colorCounts: Record<string, number> = {};
            combo.forEach(c => { colorCounts[c.color] = (colorCounts[c.color] || 0) + 1; });
            const colorVals = Object.values(colorCounts).sort();

            const matchesTypePattern = typeVals.length === 2 && typeVals[0] === 2 && typeVals[1] === 2;
            const matchesColorPattern = colorVals.length === 2 && colorVals[0] === 2 && colorVals[1] === 2;

            if (matchesTypePattern || matchesColorPattern) {
              v2Combo = combo;
              break;
            }
          }
          if (v2Combo.length > 0) break;
        }
        if (v2Combo.length > 0) break;
      }
      if (v2Combo.length > 0) break;
    }
  }

  // Fallback: Take the first 4 remaining items
  if (v2Combo.length === 0) {
    v2Combo = remaining.slice(0, 4);
  }

  // Add Viewport 2
  v2Combo.forEach(c => result.push(c.product));

  return result;
};

export default function ProductClient({ product: rawProduct, relatedProductsByTag }: Props) {
  const product = useMemo(() => {
    if (rawProduct.handle.includes('sprayer-comb') || rawProduct.handle.includes('brush')) {
      return {
        ...rawProduct,
        title: "CEPILLO DESENREDANTE 2 EN 1 CON PULVERIZADOR",
        description: `CEPILLO Y PEINE DE PELUQUERÍA PROFESIONAL 2 EN 1 CON PULVERIZADOR DE AGUA REUTILIZABLE. DISEÑADO CON CERDAS SUAVES DESENREDANTES, IDEAL PARA LA HIDRATACIÓN DIARIA Y EL PEINADO DEL CABELLO. APLICA UNA BRUMA ULTRA FINA QUE FACILITA EL PEINADO Y REHIDRATA SIN EMPAPAR EL CABELLO. PERMITE AÑADIR AGUA, TÓNICOS CAPILARES O ACEITES ESENCIALES PARA UN CUIDADO CAPILAR DE LUJO EN CUALQUIER MOMENTO.

Item Number: VS-2026-SC01
Features: Bruma Ultrafina, Cerdas Suaves Desenredantes, Depósito Reutilizable
Care Instructions: LIMPIAR EL DEPÓSITO DESPUÉS DE CADA USO CON AGUA TEMPLADA. EVITAR SUMERGIR LAS CERDAS EN AGUA HIRVIENDO.`
      };
    }
    if (rawProduct.handle.includes('patch') || rawProduct.handle.includes('parche') || rawProduct.title.toLowerCase().includes('patch')) {
      return {
        ...rawProduct,
        title: "PARCHES DE COLÁGENO PARA OJOS (60 UNIDADES)",
        description: `PARCHES DE COLÁGENO PARA OJOS ENRIQUECIDOS CON PÉPTIDOS Y NIACINAMIDA. HIDRATAN, SUAVIZAN Y REVITALIZAN EL CONTORNO DE OJOS, REDUCIENDO VISIBLEMENTE LA APARIENCIA DE OJERAS, BOLSAS Y LÍNEAS DE EXPRESIÓN. APTOS PARA TODO TIPO DE PIELES. CONTENIDO: 60 PARCHES (30 PARES).`
      };
    }
    return rawProduct;
  }, [rawProduct]);

  const router = useRouter();
  const [recommended, setRecommended] = useState<RecommendedProduct[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentProduct[]>([]);
  const [completeOutfit, setCompleteOutfit] = useState<RecommendedProduct[]>([]);

  const arrangedRecommended = useMemo(() => {
    return arrangeRecommendations(recommended);
  }, [recommended]);

  useEffect(() => {
    import('@/lib/shopify').then(({ getRecommendedProducts }) => {
      getRecommendedProducts(product.handle, 16)
        .then(setRecommended)
        .catch(() => {});
    });
  }, [product.handle]);

  useEffect(() => {
    import('@/lib/shopify').then(({ getRecommendedProducts }) => {
      getRecommendedProducts(product.handle, 8)
        .then(prods => setCompleteOutfit(prods.slice(0, 6)))
        .catch(() => {});
    });
  }, [product.handle]);

  useEffect(() => {
    try {
      const stored: RecentProduct[] = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) ?? '[]');
      const current: RecentProduct = {
        handle: product.handle,
        title: product.title,
        imageUrl: product.imageUrl,
        price: product.price,
        currencyCode: product.currencyCode,
      };
      const filtered = stored.filter(p => p.handle !== product.handle);
      const updated = [current, ...filtered].slice(0, MAX_RECENTLY_VIEWED);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
      setRecentlyViewed(filtered.slice(0, 8));
    } catch {}
  }, [product.handle]);

  useEffect(() => {
    const el = ctlCarouselRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;

      const canScrollLeft = el.scrollLeft > 0;
      const canScrollRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 1;

      if ((e.deltaY > 0 && canScrollRight) || (e.deltaY < 0 && canScrollLeft)) {
        e.preventDefault();
        el.scrollBy({
          left: e.deltaY,
          behavior: 'smooth'
        });
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [completeOutfit]);

  // Find pink variant as default if no search param is set
  const defaultVariant = useMemo(() => {
    const pinkMatch = product.variants.find(v =>
      v.selectedOptions.some(opt =>
        (opt.name.toLowerCase() === 'color' || opt.name.toLowerCase() === 'colour') &&
        (opt.value.toLowerCase().includes('pink') || opt.value.toLowerCase().includes('rosa'))
      )
    );
    return pinkMatch || product.variants[0] || { id: '', title: '', availableForSale: true, price: { amount: String(product.price), currencyCode: product.currencyCode }, selectedOptions: [] };
  }, [product]);

  const [selectedVariant, setSelectedVariant] = useState<ShopifyVariant>(defaultVariant);

  const searchParams = useSearchParams();
  const initialColor = searchParams.get('color');

  useEffect(() => {
    if (initialColor) {
      const match = product.variants.find(v =>
        v.selectedOptions.some(opt =>
          (opt.name.toLowerCase() === 'color' || opt.name.toLowerCase() === 'colour') &&
          opt.value.toLowerCase() === initialColor.toLowerCase()
        )
      );
      if (match) {
        setSelectedVariant(match);
        // Also sync selectedColor and selectedOptionsState so images/UI reflect the URL color
        const colorOpt = match.selectedOptions.find(o => {
          const n = o.name.toLowerCase();
          return n === 'color' || n === 'colour';
        });
        if (colorOpt) {
          setSelectedColor(colorOpt.value);
        }
        setSelectedSize('');
        const opts: Record<string, string> = {};
        for (const o of match.selectedOptions) {
          opts[o.name] = o.value;
        }
        setSelectedOptionsState(opts);
      }
    }
  }, [initialColor, product.variants]);

  // images calculated below based on color index
  const [adding, setAdding] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);
  const [availModal, setAvailModal] = useState(false);
  const [availSizes, setAvailSizes] = useState<string[]>([]);
  const [availEmail, setAvailEmail] = useState('');
  const [availPhone, setAvailPhone] = useState('');
  const [availSubmitted, setAvailSubmitted] = useState(false);
  const [availSubmitting, setAvailSubmitting] = useState(false);
  const [ceremonyOpen, setCeremonyOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [sizeDropdownOpen, setSizeDropdownOpen] = useState(false);
  const [stickyDropdownOpen, setStickyDropdownOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const mobileCarouselRef = useRef<HTMLDivElement>(null);
  const desktopCarouselRef = useRef<HTMLDivElement>(null);

  const [stickyBarVisible, setStickyBarVisible] = useState(false);
  const mainButtonWrapRef = useRef<HTMLDivElement>(null);

  const [smsPhone, setSmsPhone] = useState("");
  const [smsSubscribed, setSmsSubscribed] = useState(false);
  const [smsError, setSmsError] = useState("");

  useEffect(() => {
    const isSub = localStorage.getItem("sms-subscribed") === "true";
    setSmsSubscribed(isSub);

    const handleGlobalSmsSub = () => {
      setSmsSubscribed(true);
    };
    window.addEventListener("sms-subscribed-event", handleGlobalSmsSub);
    return () => window.removeEventListener("sms-subscribed-event", handleGlobalSmsSub);
  }, []);

  const handleSmsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsPhone || smsPhone.trim().length < 9) {
      setSmsError("TELÉFONO INVÁLIDO");
      return;
    }
    try {
      await fetch("/api/sms-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: smsPhone }),
      }).catch(() => {});

      localStorage.setItem("sms-subscribed", "true");
      setSmsSubscribed(true);
      setSmsError("");
      window.dispatchEvent(new Event("sms-subscribed-event"));
    } catch (err) {
      setSmsError("ERROR");
    }
  };

  useEffect(() => {
    const el = mainButtonWrapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      const isAbove = entry.boundingClientRect.top < 0;
      setStickyBarVisible(!entry.isIntersecting && isAbove);
    }, {
      root: null,
      threshold: 0,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);


  const [ctlScrollProgress, setCtlScrollProgress] = useState(0);
  const ctlCarouselRef = useRef<HTMLDivElement>(null);

  const handleCtlScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll > 0) {
      setCtlScrollProgress(el.scrollLeft / maxScroll);
    }
  };


  const handleMobileScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const width = container.clientWidth;
    if (width > 0) {
      setCurrentSlide(Math.round(scrollLeft / width));
    }
  };

  const handleDesktopScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const height = container.clientHeight;
    if (height > 0) {
      setDesktopImageIndex(Math.round(scrollTop / height));
    }
  };

  const handleDesktopDotClick = (index: number) => {
    setDesktopImageIndex(index);
    if (desktopCarouselRef.current) {
      const slides = desktopCarouselRef.current.querySelectorAll('.tonet-desktop-slide');
      const targetSlide = slides[index];
      if (targetSlide) {
        targetSlide.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  const { t } = useTranslation();
  const { toggle, has, items } = useWishlist();
  const inWishlist = has(product.handle);

  const getHouseState = (handle: string) => {
    const hash = handle.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    if (hash % 3 === 0) return 'HOUSE_01 — PERMANENCE';
    if (hash % 3 === 1) return 'HOUSE_02 — REPLICA';
    return 'HOUSE_03 — INHERITANCE';
  };

  const getArchiveRef = (handle: string) => {
    const hash = handle.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const num = String((hash % 9000) + 1000).padStart(4, '0');
    return `ARC-26-${num}`;
  };

  const metadata = useMemo(() => parseMetadata(product.description), [product.description]);

  const detailsRows = useMemo(() => {
    const title = product.title.toLowerCase();
    const handle = product.handle.toLowerCase();
    
    const isSkincareOrCosmetic = 
      title.includes('patch') || title.includes('parche') || 
      title.includes('colágeno') || title.includes('collagen') ||
      title.includes('comb') || title.includes('cepillo') || 
      title.includes('brush') || title.includes('sprayer') ||
      title.includes('gel') || title.includes('crema') || 
      title.includes('cream') || title.includes('serum') || 
      title.includes('sérum') || title.includes('tónico') || 
      title.includes('toner') || title.includes('gloss') ||
      title.includes('oil') || title.includes('aceite') ||
      handle.includes('patch') || handle.includes('comb') || 
      handle.includes('brush') || handle.includes('gloss') ||
      handle.includes('serum') || handle.includes('cream');

    if (isSkincareOrCosmetic) {
      if (handle.includes('sprayer-comb') || handle.includes('brush')) {
        return [
          { label: 'TIPO', value: 'Cepillo desenredante 2 en 1' },
          { label: 'USO', value: 'Hidratación y peinado diario' },
          { label: 'BRUMA', value: 'Pulverizador recargable de agua ultra fina' },
          { label: 'MATERIAL', value: 'Cerdas suaves y cuerpo de polímero premium' },
          { label: 'EDICIÓN', value: 'Unidades limitadas' }
        ];
      }
      
      if (title.includes('patch') || title.includes('parche') || handle.includes('patch')) {
        return [
          { label: 'TIPO', value: 'Parches de colágeno para ojos' },
          { label: 'CONTENIDO', value: '60 parches (30 pares)' },
          { label: 'USO', value: 'Contorno de ojos hidratante y antiojeras' },
          { label: 'INGREDIENTES', value: 'Colágeno, péptidos y niacinamida' },
          { label: 'APTO PARA', value: 'Todo tipo de pieles' }
        ];
      }

      return [
        { label: 'LÍNEA', value: 'Cuidado facial y capilar Vida Santa' },
        { label: 'EDICIÓN', value: 'Lanzamiento exclusivo' },
        { label: 'APLICACIÓN', value: 'Uso diario recomendado' },
        { label: 'ORIGEN', value: 'Ingredientes de alta calidad' }
      ];
    }

    const features = (metadata['Features'] || '').split(',').map(f => f.trim());
    const fitKeywords = ['loose', 'regular', 'oversized', 'slim', 'boxy', 'cropped', 'structured', 'relaxed', 'fit'];
    const foundFit = features
      .filter(f => fitKeywords.includes(f.toLowerCase()))
      .map(f => f.charAt(0).toUpperCase() + f.slice(1).toLowerCase());
    const fitValue = foundFit.length > 0 ? foundFit.join(' / ') : 'Structured / relaxed';

    const finishKeywords = ['washed', 'ripped', 'pleated', 'drawstring', 'pocket', 'raw edge', 'hooded', 'button', 'zipper', 'embroidered'];
    const foundFinish = features
      .filter(f => finishKeywords.includes(f.toLowerCase()))
      .map(f => f.charAt(0).toUpperCase() + f.slice(1).toLowerCase());
    const finishValue = foundFinish.length > 0 ? foundFinish.join(' / ') : 'Soft wash';

    const rawFabric = metadata['Fabric'] || '';
    const formattedFabric = rawFabric ? rawFabric.replace(/,\s*/g, ' / ') : '';

    return [
      { label: 'Fabric', value: formattedFabric },
      { label: 'Weight', value: metadata['Fabric Weight'] || '240 GSM' },
      { label: 'Fit', value: fitValue },
      { label: 'Finish', value: finishValue },
      { label: 'Production', value: 'Limited production' }
    ].filter(r => r.value);
  }, [metadata, product.handle, product.title]);

  const wishlistItem = {
    handle: product.handle,
    title: product.title,
    imageUrl: product.imageUrl,
    price: product.price,
    currencyCode: product.currencyCode,
    collectionTitle: '',
  };

  const [selectedColor, setSelectedColor] = useState<string>(
    () => defaultVariant.selectedOptions.find(o => {
      const n = o.name.toLowerCase(); return n === 'color' || n === 'colour';
    })?.value ?? ''
  );
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [desktopImageIndex, setDesktopImageIndex] = useState(0);

  useEffect(() => {
    setDesktopImageIndex(0);
    if (desktopCarouselRef.current) {
      desktopCarouselRef.current.scrollTop = 0;
    }
  }, [selectedColor]);

  const [selectedOptionsState, setSelectedOptionsState] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (defaultVariant) {
      for (const o of defaultVariant.selectedOptions) {
        initial[o.name] = o.value;
      }
    }
    return initial;
  });

  const { openCart } = useUI();
  const { addToCart } = useCart();

  const colorOptionName = useMemo(() => {
    for (const v of product.variants)
      for (const o of v.selectedOptions) {
        const n = o.name.toLowerCase();
        if (n === 'color' || n === 'colour') return o.name;
      }
    return null;
  }, []);

  const sizeOptionName = useMemo(() => {
    for (const v of product.variants)
      for (const o of v.selectedOptions)
        if (o.name.toLowerCase() === 'size') return o.name;
    // Fallback: match any variant option that is NOT 'color' or 'colour'
    for (const v of product.variants)
      for (const o of v.selectedOptions) {
        const n = o.name.toLowerCase();
        if (n !== 'color' && n !== 'colour') return o.name;
      }
    if (product.handle === 'e-gift-card') {
      const first = product.variants[0]?.selectedOptions[0];
      return first?.name ?? null;
    }
    return null;
  }, []);

  const colorOptions = useMemo(() => {
    if (!colorOptionName) return [];
    const seen = new Set<string>();
    const result: { value: string; imageUrl: string }[] = [];
    for (const v of product.variants) {
      const opt = v.selectedOptions.find(o => o.name === colorOptionName);
      if (opt && !seen.has(opt.value)) {
        seen.add(opt.value);
        result.push({ value: opt.value, imageUrl: v.image?.url ?? '' });
      }
    }
    return result;
  }, [colorOptionName]);

  const sizeOptions = useMemo(() => {
    if (!sizeOptionName) return [];
    const seen = new Set<string>();
    const result: string[] = [];
    for (const v of product.variants) {
      const opt = v.selectedOptions.find(o => o.name === sizeOptionName);
      if (opt && !seen.has(opt.value)) { seen.add(opt.value); result.push(opt.value); }
    }
    return result;
  }, [sizeOptionName]);

  const allImages = product.images.length > 0 ? product.images : [product.imageUrl].filter(Boolean);
  
  const images = useMemo(() => {
    const otherColorsVariantImages = new Set<string>();
    for (const v of product.variants) {
      const colorOpt = v.selectedOptions.find(o => {
        const n = o.name.toLowerCase(); return n === 'color' || n === 'colour';
      });
      if (colorOpt && colorOpt.value.toLowerCase() !== selectedColor.toLowerCase() && v.image?.url) {
        otherColorsVariantImages.add(v.image.url);
      }
    }
    
    const currentVariantImage = selectedVariant?.image?.url;
    const filtered = allImages.filter(img => !otherColorsVariantImages.has(img));
    let result = [...filtered];
    if (currentVariantImage) {
      result = result.filter(img => img !== currentVariantImage);
      result.unshift(currentVariantImage);
    }
    return result.length > 0 ? result : allImages.slice(0, 2);
  }, [allImages, selectedColor, selectedVariant, product.variants]);

  const priceNum = parseFloat(selectedVariant.price.amount);
  const compareAtPriceNum = selectedVariant.compareAtPrice ? parseFloat(selectedVariant.compareAtPrice.amount) : null;
  const currencyCode = selectedVariant.price.currencyCode || 'EUR';
  const currencySymbol = currencyCode === 'USD' ? '$' : '€';
  const priceFormatted = Number.isInteger(priceNum)
    ? `${currencySymbol}${priceNum} ${currencyCode}`
    : `${currencySymbol}${priceNum.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencyCode}`;

  const compareAtPriceFormatted = compareAtPriceNum
    ? (Number.isInteger(compareAtPriceNum)
        ? `${currencySymbol}${compareAtPriceNum} ${currencyCode}`
        : `${currencySymbol}${compareAtPriceNum.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencyCode}`)
    : null;

  const allSizes = sizeOptions;
  const hasSizes = sizeOptions.length > 0;
  const needsSizeSelection = hasSizes && !selectedSize;

  function findVariantByOptions(optionsMap: Record<string, string>): ShopifyVariant | undefined {
    return product.variants.find(v => 
      v.selectedOptions.every(o => {
        const val = optionsMap[o.name];
        return !val || val === o.value;
      })
    );
  }

  async function handleSizeSelectInDrawer(sizeValue: string) {
    setSelectedSize(sizeValue);
    let targetVariant = selectedVariant;
    if (sizeOptionName) {
      const updated = { ...selectedOptionsState, [sizeOptionName]: sizeValue };
      setSelectedOptionsState(updated);
      const next = findVariantByOptions(updated);
      if (next) {
        setSelectedVariant(next);
        targetVariant = next;
      }
    }

    setSizeDropdownOpen(false);
    setStickyDropdownOpen(false);

    if (targetVariant?.id && !adding) {
      setAdding(true);
      try {
        await addToCart(targetVariant.id, 1);
        openCart();
      } catch (err) {
        console.error("Error adding to cart:", err);
      } finally {
        setAdding(false);
      }
    }
  }

  async function handleAddToBag() {
    if (!selectedVariant.id || adding) return;
    if (needsSizeSelection) {
      setSizeDropdownOpen(true);
      return;
    }
    setAdding(true);
    try {
      await addToCart(selectedVariant.id, 1);
      openCart();
    } finally {
      setAdding(false);
    }
  }

  function findVariant(color: string, size: string): ShopifyVariant | undefined {
    const opts: Record<string, string> = {};
    if (colorOptionName) opts[colorOptionName] = color;
    if (sizeOptionName) opts[sizeOptionName] = size;
    return findVariantByOptions(opts);
  }

  function isSizeAvailable(size: string): boolean {
    if (!sizeOptionName) return false;
    const targetOptions = { ...selectedOptionsState, [sizeOptionName]: size };
    const v = findVariantByOptions(targetOptions);
    return v?.availableForSale ?? false;
  }

  function openAvailModal(preSize?: string) {
    const soldOut = allSizes.filter(s => !isSizeAvailable(s));
    setAvailSizes(preSize ? [preSize] : soldOut.length === 1 ? soldOut : []);
    setAvailEmail('');
    setAvailPhone('');
    setAvailSubmitted(false);
    setAvailSubmitting(false);
    setAvailModal(true);
  }

  function toggleAvailSize(size: string) {
    setAvailSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  }

  async function handleAvailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!availEmail || availSizes.length === 0) return;
    setAvailSubmitting(true);
    try {
      const stored = JSON.parse(localStorage.getItem('tonet-avail-requests') ?? '[]');
      stored.push({
        id: `${product.handle}-${Date.now()}`,
        product: product.handle,
        title: product.title,
        sizes: availSizes,
        email: availEmail,
        submittedAt: Date.now(),
      });
      localStorage.setItem('tonet-avail-requests', JSON.stringify(stored));
    } finally {
      setAvailSubmitted(true);
      setAvailSubmitting(false);
    }
  }

  function handleColorChange(colorValue: string) {
    setSelectedColor(colorValue);
    if (colorOptionName) {
      const updated = { ...selectedOptionsState, [colorOptionName]: colorValue };
      setSelectedOptionsState(updated);
      const next = findVariantByOptions(updated);
      if (next) setSelectedVariant(next);
    }
  }

  function toggleAccordion(key: string) {
    setExpandedAccordion(prev => prev === key ? null : key);
  }

  return (
    <>
      <div className="tonet-pdp-page">


        <div className="tonet-pdp-layout">
          
          {/* GALLERY COLUMN (Left side ~65% on desktop) */}
          <div className="tonet-gallery-column">
            {/* Mobile Carousel (horizontal scroll snapping) */}
            <div className="tonet-mobile-gallery">
              <div className="tonet-mobile-carousel" ref={mobileCarouselRef} onScroll={handleMobileScroll}>
                {images.map((img, i) => (
                  <div key={i} className="tonet-mobile-slide">
                    <img 
                      src={getOptimizedImageUrl(img, 1000)} 
                      alt={`${product.title} - ${i}`} 
                      className="tonet-pdp-img amiri-fade-in" 
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                      onLoad={(e) => e.currentTarget.classList.add('loaded')}
                      ref={(el) => {
                        if (el && el.complete) el.classList.add('loaded');
                      }}
                    />
                  </div>
                ))}
              </div>
              
              {/* Carousel Dots */}
              {images.length > 1 && (
                <div className="tonet-mobile-dots">
                  {images.map((_, i) => (
                    <span
                      key={i}
                      className={`tonet-mobile-dot ${currentSlide === i ? 'active' : ''}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Gallery with Vertical dots on the left */}
            <div className="tonet-desktop-gallery-slider">
              {images.length > 1 && (
                <div className="tonet-desktop-slider-dots">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`tonet-desktop-slider-dot ${desktopImageIndex === i ? 'active' : ''}`}
                      onClick={() => handleDesktopDotClick(i)}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}
              <div 
                className="tonet-desktop-img-wrapper-scrollable"
                ref={desktopCarouselRef}
                onScroll={handleDesktopScroll}
              >
                {images.map((img, i) => (
                  <div key={i} className="tonet-desktop-slide">
                    <img 
                      src={getOptimizedImageUrl(img, 1600)} 
                      alt={`${product.title} - ${i}`} 
                      className="tonet-pdp-img amiri-fade-in" 
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                      onLoad={(e) => e.currentTarget.classList.add('loaded')}
                      ref={(el) => {
                        if (el && el.complete) el.classList.add('loaded');
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* INFO COLUMN (Right side buy box ~25% on desktop, sticky) */}
          <div className="tonet-info-column">
            <div className="tonet-info-sticky">
              
              {/* Product Title (uppercase, clean sans-serif) */}
              <h1 className="tonet-product-title">{product.title.toUpperCase()}</h1>
              
              {/* Thick divider line */}
              <div className="tonet-product-title-divider"></div>

              {/* Price and Favorite Star row */}
              <div className="tonet-product-price-row">
                <div className="tonet-price-wrapper">
                  <span className="tonet-price-amount">{priceFormatted}</span>
                  {compareAtPriceFormatted && (
                    <span className="tonet-price-compare" style={{ textDecoration: 'line-through', marginLeft: '12px', color: '#767676', fontSize: '14px', fontWeight: '400' }}>
                      {compareAtPriceFormatted}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className={`tonet-pdp-favorite-btn ${has(product.handle) ? 'is-active' : ''}`}
                  onClick={() => toggle({
                    handle: product.handle,
                    title: product.title,
                    imageUrl: product.imageUrl || '',
                    price: product.price,
                    currencyCode: product.currencyCode,
                    collectionTitle: ''
                  })}
                >
                  {has(product.handle) ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Swatches Section */}
              {colorOptions.length > 0 && (
                <div className="tonet-pdp-swatches-section">
                  <div className="tonet-pdp-swatches-row">
                    <div className="tonet-pdp-swatches-list">
                      {colorOptions.map((co) => {
                        const isSelected = selectedColor === co.value;
                        let content = '';
                        let customBg = colorNameToCSS(co.value);
                        let customColor = '#ffffff';

                        if (co.value.toLowerCase().includes('2 x')) {
                          content = '2';
                          customBg = isSelected ? '#000000' : '#f5f5f5';
                          customColor = isSelected ? '#ffffff' : '#000000';
                        } else if (co.value.toLowerCase().includes('60pcs')) {
                          content = '1';
                          customBg = isSelected ? '#000000' : '#f5f5f5';
                          customColor = isSelected ? '#ffffff' : '#000000';
                        }

                        return (
                          <button
                            key={co.value}
                            type="button"
                            className={`tonet-pdp-swatch-circle ${isSelected ? 'active' : ''}`}
                            onClick={() => handleColorChange(co.value)}
                            aria-label={`Select color ${co.value}`}
                            style={{ 
                              background: customBg,
                              color: customColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              fontWeight: '600',
                              fontFamily: 'var(--font-primary), sans-serif',
                            }}
                          >
                            {content}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="tonet-pdp-swatch-meta">
                    <span className="tonet-pdp-swatch-name">
                      <span className="tonet-pdp-swatch-dot" style={{ background: colorNameToCSS(selectedColor) }} />
                      {selectedColor.toUpperCase()}
                    </span>
                    <span className="tonet-pdp-novedad-badge">NOVEDAD</span>
                  </div>
                </div>
              )}

              {/* SMS PROMO BOX */}
              <div className="tonet-pdp-sms-box">
                {!smsSubscribed ? (
                  <div className="tonet-pdp-sms-form">
                    <span className="tonet-pdp-sms-tag">🎁 CONSIGUE UN 10% DE DESCUENTO</span>
                    <p className="tonet-pdp-sms-desc">SUSCRÍBETE A NUESTRO CANAL SMS Y RECIBE UN 10% DE DESCUENTO AL INSTANTE PARA TU PRIMERA COMPRA.</p>
                    <form onSubmit={handleSmsSubmit} className="tonet-pdp-sms-input-row">
                      <input 
                        type="tel" 
                        placeholder="TU NÚMERO DE TELÉFONO" 
                        value={smsPhone} 
                        onChange={(e) => {
                          setSmsPhone(e.target.value);
                          setSmsError("");
                        }}
                        className="tonet-pdp-sms-input"
                        required
                      />
                      <button type="submit" className="tonet-pdp-sms-btn">UNIRSE</button>
                    </form>
                    {smsError && <span className="tonet-pdp-sms-error">{smsError}</span>}
                  </div>
                ) : (
                  <div className="tonet-pdp-sms-success">
                    <span className="tonet-pdp-sms-tag">✓ ¡10% DESCUENTO ACTIVO!</span>
                    <p className="tonet-pdp-sms-desc">CÓDIGO DE CUPÓN: <strong className="tonet-pdp-sms-code">VIDASANTA10</strong> (APLÍCALO EN EL CHECKOUT)</p>
                  </div>
                )}
              </div>

              {/* URGENCY & TRUST WIDGET */}
              <div className="tonet-pdp-urgency-box">
                <div className="tonet-urgency-row tonet-urgency-stock">
                  <span className="tonet-urgency-pulse"></span>
                  <span className="tonet-urgency-text">¡ÚLTIMAS UNIDADES! SOLO QUEDAN 3 EN STOCK</span>
                </div>
                <div className="tonet-urgency-row tonet-urgency-stars">
                  <span className="tonet-urgency-star-icon">★ ★ ★ ★ ★</span>
                  <span className="tonet-urgency-text">ESTÁ GUSTANDO MUCHO (VALORACIÓN 5/5 ESTRELLAS)</span>
                </div>
              </div>

              {/* SELECT SIZE / ADD TO BAG Button */}
              <div className="tonet-size-selector-wrap" ref={mainButtonWrapRef}>
                {hasSizes ? (
                  <button 
                    type="button"
                    className="tonet-select-size-btn"
                    onClick={() => setSizeDropdownOpen(true)}
                  >
                    <span>{selectedSize ? `TALLA: ${selectedSize.toUpperCase()}` : 'SELECCIONAR TALLA'} ▾</span>
                  </button>
                ) : (
                  <button 
                    type="button"
                    className="tonet-select-size-btn"
                    onClick={handleAddToBag}
                    disabled={adding}
                  >
                    <span>{adding ? 'AÑADIENDO...' : 'AÑADIR A LA CESTA'}</span>
                  </button>
                )}
              </div>

              {/* Subtitle / Description */}
              <div className="tonet-product-subtitle-block">
                <p className="tonet-product-subtitle">
                  {(product.description || "").split(/[.:!|]/)[0]?.trim()}
                </p>
                <a 
                  href="#description" 
                  className="tonet-product-more-info"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleAccordion('desc');
                    document.querySelector('.tonet-accordions')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Más información
                </a>
                <span className="tonet-product-ref">
                  Ref. {selectedVariant.sku || '158444'}
                </span>
              </div>

              {/* Sub-button details */}
              <div className="tonet-pdp-delivery-info">
                <p>Entregas y devoluciones gratuitas.</p>
                <a 
                  href="#reviews" 
                  className="tonet-product-reviews-link"
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                >
                  Opiniones clientes
                </a>
              </div>

              {/* Accordions */}
              <div className="tonet-accordions">
                
                {/* DESCRIPTION */}
                <div className="tonet-accordion-item">
                  <button className="tonet-accordion-header" onClick={() => toggleAccordion('desc')}>
                    <span>DESCRIPCIÓN</span>
                    <span className="tonet-accordion-icon">{expandedAccordion === 'desc' ? '—' : '+'}</span>
                  </button>
                  {expandedAccordion === 'desc' && (
                    <div className="tonet-accordion-content">
                      <p>{product.description?.split('Item Number:')[0]?.trim().toUpperCase()}</p>
                      <ul className="tonet-specs-list">
                        {detailsRows.map((row, i) => (
                           <li key={i}>— {row.label.toUpperCase()}: {row.value.toUpperCase()}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* CARE AND MAINTENANCE */}
                <div className="tonet-accordion-item">
                  <button className="tonet-accordion-header" onClick={() => toggleAccordion('care')}>
                    <span>CUIDADO Y MANTENIMIENTO</span>
                    <span className="tonet-accordion-icon">{expandedAccordion === 'care' ? '—' : '+'}</span>
                  </button>
                  {expandedAccordion === 'care' && (
                    <div className="tonet-accordion-content">
                      <p>{metadata['Care Instructions'] ? metadata['Care Instructions'].toUpperCase() : 'SÓLO LIMPIEZA EN SECO. TRATAR CON CUIDADO.'}</p>
                    </div>
                  )}
                </div>

                {/* SHIPPING / RETURNS */}
                <div className="tonet-accordion-item">
                  <button className="tonet-accordion-header" onClick={() => toggleAccordion('shipping')}>
                    <span>ENVÍO / DEVOLUCIONES</span>
                    <span className="tonet-accordion-icon">{expandedAccordion === 'shipping' ? '—' : '+'}</span>
                  </button>
                  {expandedAccordion === 'shipping' && (
                    <div className="tonet-accordion-content">
                      <p>ENVÍO ESTÁNDAR GRATUITO EN TODOS LOS PEDIDOS. EL TIEMPO DE ENTREGA ES DE 2 A 4 DÍAS HÁBILES. DEVOLUCIÓN SENCILLA EN UN PLAZO DE 14 DÍAS A PARTIR DE LA RECEPCIÓN DEL ENVÍO.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Mobile-only grid below accordions */}
              <div className="tonet-mobile-extra-grid">
                <div className={images.length === 1 ? "tonet-mobile-single" : "tonet-mobile-grid"}>
                  {images.map((img, i) => (
                    <div key={i} className="tonet-mobile-grid-item">
                      <img 
                        src={img} 
                        alt={`${product.title} - ${i}`} 
                        className="tonet-pdp-img amiri-fade-in" 
                        onLoad={(e) => e.currentTarget.classList.add('loaded')}
                        ref={(el) => {
                          if (el && el.complete) el.classList.add('loaded');
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>



        {/* RELATED CAROUSEL (YOU MIGHT ALSO LIKE) */}
        {arrangedRecommended.length > 0 && (
          <section className="amiri-ctl-section">
            <div className="amiri-ctl-header">
              <span className="amiri-ctl-logo">VIDA SANTA</span>
              <h2 className="amiri-ctl-title">TAMBIÉN TE PUEDE INTERESAR</h2>
            </div>
            
            <div className="amiri-ctl-carousel-wrapper">
              <div className="amiri-ctl-carousel">
                {arrangedRecommended.map((p) => {
                  const pType = getProductType(p);
                  const symbol = p.currencyCode === 'USD' ? '$' : '€';
                  const formattedPrice = Number.isInteger(p.price)
                    ? `${symbol}${p.price} ${p.currencyCode}`
                    : `${symbol}${p.price.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${p.currencyCode}`;
                  
                  return (
                    <div className="amiri-ctl-item" key={p.handle}>
                      <Link href={`/product/${p.handle}`} className="amiri-ctl-card">
                        <div className="amiri-ctl-image-panel">
                          {p.imageUrl && (
                            <img 
                              src={p.imageUrl} 
                              alt={p.title} 
                              className={`amiri-ctl-image amiri-ctl-image--${pType} amiri-fade-in`}
                              loading="lazy"
                              decoding="async"
                              onLoad={(e) => e.currentTarget.classList.add('loaded')}
                              ref={(el) => {
                                if (el && el.complete) el.classList.add('loaded');
                              }}
                            />
                          )}
                        </div>
                        <div className="amiri-ctl-meta">
                          <span className="amiri-ctl-name">{p.title.toUpperCase()}</span>
                          <span className="amiri-ctl-price">{formattedPrice}</span>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </div>



      {/* ══ SIZE SELECTOR OVERLAY MODAL ══ */}
      {sizeDropdownOpen && (
        <div className="tonet-size-selector-overlay" onClick={() => setSizeDropdownOpen(false)}>
          <div className="tonet-size-selector-modal" onClick={e => e.stopPropagation()}>
            <div className="tonet-size-modal-header">
              <div className="tonet-size-header-left">
                <button type="button" className="tonet-size-close-btn" onClick={() => setSizeDropdownOpen(false)}>✕</button>
                <button type="button" className="tonet-size-guide-btn" onClick={() => { setSizeDropdownOpen(false); setSizeGuideOpen(true); }}>SIZE GUIDE</button>
              </div>
            </div>
            
            <div className="tonet-size-modal-body">
              <span className="tonet-size-modal-title">SELECT SIZE</span>
              
              <div className="tonet-size-modal-grid">
                {sizeOptions.map(size => {
                  const isAvailable = isSizeAvailable(size);
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      className={`tonet-size-box-btn ${!isAvailable ? 'sold-out' : ''} ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        if (isAvailable) {
                          handleSizeSelectInDrawer(size);
                        } else {
                          openAvailModal(size);
                        }
                      }}
                    >
                      {size.toUpperCase()}
                    </button>
                  );
                })}
              </div>
              
              {selectedSize && isSizeAvailable(selectedSize) && (
                <div className="tonet-stock-warning">LOW STOCK</div>
              )}
            </div>

            <button 
              type="button"
              className="tonet-size-modal-cta"
              onClick={() => {
                if (selectedSize) {
                  handleAddToBag();
                  setSizeDropdownOpen(false);
                }
              }}
              disabled={adding || !selectedSize}
            >
              {adding ? 'AÑADIENDO...' : 'AÑADIR A LA CESTA'}
            </button>
          </div>
        </div>
      )}

      {/* ══ AVAILABILITY REQUEST MODAL ══ */}
      {availModal && (
        <div className="tonet-modal-overlay" onClick={() => setAvailModal(false)}>
          <div className="tonet-modal" onClick={e => e.stopPropagation()}>
            <div className="tonet-modal-header">
              <span className="tonet-modal-title">NOTIFY AVAILABILITY</span>
              <button className="tonet-modal-close" onClick={() => setAvailModal(false)} aria-label="Close">
                ✕
              </button>
            </div>

            {availSubmitted ? (
              <div className="tonet-modal-success">
                <span className="tonet-modal-success-title">REQUEST REGISTERED.</span>
                <p className="tonet-modal-success-sub">WE WILL NOTIFY YOU IF STOCK BECOMES AVAILABLE.</p>
              </div>
            ) : (
              <form className="tonet-modal-body" onSubmit={handleAvailSubmit}>
                <p className="tonet-modal-desc">
                  LEAVE YOUR EMAIL ADDRESS TO RECEIVE AN ALERT AS SOON AS THIS SIZE BECOMES AVAILABLE.
                </p>

                <div className="tonet-modal-field">
                  <label className="tonet-modal-field-label">SELECTED SIZE</label>
                  <div className="tonet-modal-sizes-list">
                    {availSizes.map(s => <span key={s} className="tonet-modal-size-tag">{s.toUpperCase()}</span>)}
                  </div>
                </div>

                <div className="tonet-modal-field">
                  <label className="tonet-modal-field-label" htmlFor="tonet-email">EMAIL ADDRESS</label>
                  <input
                    id="tonet-email"
                    className="tonet-modal-input"
                    type="email"
                    required
                    placeholder="EMAIL@DOMAIN.COM"
                    value={availEmail}
                    onChange={e => setAvailEmail(e.target.value)}
                  />
                </div>

                <button
                  className="tonet-modal-cta"
                  type="submit"
                  disabled={availSubmitting || !availEmail}
                >
                  {availSubmitting ? 'SENDING…' : 'NOTIFY ME'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ══ SIZE GUIDE MODAL ══ */}
      {sizeGuideOpen && (
        <div className="tonet-modal-overlay" onClick={() => setSizeGuideOpen(false)}>
          <div className="tonet-modal" onClick={e => e.stopPropagation()}>
            <div className="tonet-modal-header">
              <span className="tonet-modal-title">SIZE GUIDE</span>
              <button className="tonet-modal-close" onClick={() => setSizeGuideOpen(false)} aria-label="Close">
                ✕
              </button>
            </div>

            <div className="tonet-modal-body">
              <p className="tonet-modal-desc" style={{ marginBottom: '16px' }}>
                MEASUREMENTS ARE APPROXIMATE AND TAKEN FLAT.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', letterSpacing: '0.05em' }}>
                {([
                  { size: 'XS', chest: '54 CM', length: '66 CM' },
                  { size: 'S',  chest: '56 CM', length: '68 CM' },
                  { size: 'M',  chest: '58 CM', length: '70 CM' },
                  { size: 'L',  chest: '60 CM', length: '72 CM' },
                  { size: 'XL', chest: '62 CM', length: '74 CM' },
                ] as const).map((row) => (
                  <div key={row.size} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f2f2f2', paddingBottom: '6px' }}>
                    <span style={{ fontWeight: 400 }}>{row.size}</span>
                    <span>CHEST {row.chest}</span>
                    <span>LENGTH {row.length}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ CINEMATIC ARCHIVAL CEREMONY MODAL ══ */}
      {ceremonyOpen && (
        <div className="tonet-ceremony-overlay" onClick={() => setCeremonyOpen(false)}>
          <div className="tonet-ceremony-modal" onClick={e => e.stopPropagation()}>
            <button className="tonet-ceremony-close" onClick={() => setCeremonyOpen(false)} aria-label="Close">
              ✕
            </button>

            <div className="tonet-ceremony-header">
              <span className="tonet-ceremony-supra">ARCHIVE REGISTRY</span>
              <h2 className="tonet-ceremony-title">GARMENT ARCHIVED</h2>
              <p className="tonet-ceremony-desc">
                THIS PIECE HAS BEEN TEMPORARILY RECORDED IN YOUR DIGITAL ARCHIVE.
              </p>
            </div>

            <div className="tonet-ceremony-split">
              <div className="tonet-ceremony-image">
                {product.imageUrl && (
                  <img src={getOptimizedImageUrl(product.imageUrl, 800)} alt={product.title} className="ac-tonet-img" />
                )}
              </div>

              <div className="tonet-ceremony-details">
                <div className="tonet-ceremony-grid">
                  <div className="tonet-ceremony-item">
                    <span className="tonet-ceremony-label">NAME</span>
                    <span className="tonet-ceremony-value">{product.title.toUpperCase()}</span>
                  </div>

                  <div className="tonet-ceremony-item">
                    <span className="tonet-ceremony-label">COLLECTION</span>
                    <span className="tonet-ceremony-value">{getHouseState(product.handle).toUpperCase()}</span>
                  </div>

                  <div className="tonet-ceremony-item">
                    <span className="tonet-ceremony-label">REF</span>
                    <span className="tonet-ceremony-value">{getArchiveRef(product.handle).toUpperCase()}</span>
                  </div>

                  <div className="tonet-ceremony-item">
                    <span className="tonet-ceremony-label">STATUS</span>
                    <span className="tonet-ceremony-value">
                      {selectedVariant.availableForSale ? 'AVAILABLE' : 'TEMPORARILY ARCHIVED'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="tonet-ceremony-actions">
              <Link href="/archive" className="tonet-ceremony-btn-primary">
                VIEW ARCHIVE
              </Link>
              <button className="tonet-ceremony-btn-secondary" onClick={() => setCeremonyOpen(false)}>
                RETURN TO STORE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Sticky Buy Bar */}
      <div className={`tonet-sticky-buy-bar ${stickyBarVisible ? 'visible' : ''}`}>
        {/* Inline size dropdown that unfolds above the bar */}
        {stickyDropdownOpen && hasSizes && (
          <>
            <div className="sticky-size-backdrop" onClick={() => setStickyDropdownOpen(false)} />
            <div className="sticky-size-dropdown">
              {sizeOptions.map(size => {
                const isAvailable = isSizeAvailable(size);
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    className={`sticky-size-option ${isSelected ? 'selected' : ''} ${!isAvailable ? 'sold-out' : ''}`}
                    onClick={() => {
                      if (isAvailable) {
                        handleSizeSelectInDrawer(size);
                        setStickyDropdownOpen(false);
                      } else {
                        setStickyDropdownOpen(false);
                        openAvailModal(size);
                      }
                    }}
                  >
                    {size.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </>
        )}

        <div className="tonet-sticky-buy-bar-inner">
          <div className="tonet-sticky-buy-left">
            {product.imageUrl && (
              <div className="tonet-sticky-buy-thumb">
                <img src={getOptimizedImageUrl(product.imageUrl, 200)} alt={product.title} />
              </div>
            )}
            <span className="tonet-sticky-buy-price">
              {priceFormatted}
              {compareAtPriceFormatted && (
                <span className="tonet-sticky-buy-compare" style={{ textDecoration: 'line-through', marginLeft: '8px', color: '#767676', fontSize: '11px', fontWeight: '400' }}>
                  {compareAtPriceFormatted}
                </span>
              )}
            </span>
          </div>
          
          <button 
            type="button" 
            className="tonet-sticky-buy-btn"
            onClick={hasSizes ? () => setStickyDropdownOpen(prev => !prev) : handleAddToBag}
            disabled={adding}
          >
            <span>
              {hasSizes 
                ? (selectedSize ? `TALLA: ${selectedSize.toUpperCase()}` : 'SELECCIONAR TALLA') 
                : (adding ? 'AÑADIENDO...' : 'AÑADIR A LA CESTA')
              }
            </span>
            {hasSizes && <span className={`tonet-sticky-arrow ${stickyDropdownOpen ? 'flipped' : ''}`}> ▾</span>}
          </button>
        </div>
      </div>

      <style>{`
        /* ══════════════════════════════════════
           TONET PDP HIGH-FIDELITY STYLES
        ══════════════════════════════════════ */

        .tonet-pdp-page {
          background-color: #ffffff;
          color: #000000;
          min-height: 100vh;
          font-family: var(--font-primary), sans-serif;
          font-variant-numeric: lining-nums tabular-nums;
          padding-top: 0px;
          position: relative;
        }

        @media (min-width: 1024px) {
          .tonet-pdp-page {
            padding-top: 0;
          }
        }

        /* Small collection label top-left */
        .tonet-pdp-season {
          position: absolute;
          top: 72px;
          left: 40px;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #000000;
          z-index: 10;
        }
        @media (min-width: 1024px) {
          .tonet-pdp-season {
            left: 64px;
          }
        }

        .tonet-pdp-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0;
          width: 100%;
          padding: 0 16px;
          box-sizing: border-box;
        }

        @media (min-width: 1024px) {
          .tonet-pdp-layout {
            grid-template-columns: 55% 45%;
            column-gap: 80px;
            padding: 150px 40px 120px 40px;
            max-width: 1200px;
            margin: 0 auto;
            box-sizing: border-box;
          }
        }

        /* ── GALLERY COLUMN (Left side ~50% width) ── */
        .tonet-gallery-column {
          width: 100%;
        }
        @media (min-width: 1024px) {
          .tonet-gallery-column {
            background-color: #ffffff;
            padding-top: 0;
          }
        }

        /* Mobile Swipe Gallery */
        .tonet-mobile-gallery {
          display: block;
          width: 100%;
          overflow: hidden;
        }
        .tonet-mobile-carousel {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .tonet-mobile-carousel::-webkit-scrollbar {
          display: none;
        }
        .tonet-mobile-slide {
          flex: 0 0 100%;
          width: 100%;
          scroll-snap-align: start;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #ffffff;
          padding: 60px 40px;
          box-sizing: border-box;
          aspect-ratio: 3 / 4;
        }
        .tonet-mobile-slide img {
          max-width: 70%;
          max-height: 70%;
          width: auto;
          height: auto;
          display: block;
          object-fit: contain;
          mix-blend-mode: multiply;
        }

        .tonet-mobile-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
          margin-bottom: 12px;
        }
        .tonet-mobile-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: #e0e0e0;
          transition: background-color 0.3s;
        }
        .tonet-mobile-dot.active {
          background-color: #000000;
        }

        /* Mobile Extra Grid (below accordions) */
        .tonet-mobile-extra-grid {
          display: block;
          width: 100%;
          margin-top: 32px;
          padding: 0;
          box-sizing: border-box;
        }
        @media (min-width: 1024px) {
          .tonet-mobile-extra-grid {
            display: none !important;
          }
        }
        .tonet-mobile-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2px;
          background-color: #ffffff;
        }
        .tonet-mobile-single {
          display: block;
          width: 100%;
        }
        .tonet-mobile-grid-item {
          aspect-ratio: 3 / 4;
          background-color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 8px;
          box-sizing: border-box;
        }
        .tonet-mobile-grid-item img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          mix-blend-mode: multiply;
        }
        .tonet-mobile-stack {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-top: 2px;
        }
        .tonet-mobile-stack-item {
          aspect-ratio: 3 / 4;
          background-color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 16px;
          box-sizing: border-box;
        }
        .tonet-mobile-stack-item img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          mix-blend-mode: multiply;
        }

        /* Desktop Gallery with Vertical dots on the left */
        .tonet-desktop-gallery-slider {
          position: relative;
          width: 100%;
          display: none;
          align-items: flex-start;
          justify-content: center;
          background-color: #ffffff;
        }
        @media (min-width: 1024px) {
          .tonet-mobile-gallery { display: none; }
          .tonet-desktop-gallery-slider {
            display: flex;
            min-height: 500px;
          }
        }
        .tonet-desktop-slider-dots {
          position: absolute;
          left: 48px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 10;
        }
        .tonet-desktop-slider-dot {
          width: 6px;
          height: 6px;
          border-radius: 0; /* Rectangular borders */
          border: 1px solid #000000;
          background-color: transparent;
          cursor: pointer;
          padding: 0;
          transition: background-color 0.3s, border-color 0.3s;
        }
        .tonet-desktop-slider-dot.active {
          background-color: #000000;
        }
        .tonet-desktop-img-wrapper-scrollable {
          width: 100%;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          scroll-snap-type: y mandatory;
          aspect-ratio: 3 / 4;
          box-sizing: border-box;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .tonet-desktop-img-wrapper-scrollable::-webkit-scrollbar {
          display: none;
        }
        .tonet-desktop-slide {
          flex-shrink: 0;
          width: 100%;
          aspect-ratio: 3 / 4;
          display: flex;
          justify-content: center;
          align-items: center;
          scroll-snap-align: start;
          padding: 80px;
          box-sizing: border-box;
        }
        .tonet-desktop-slide img {
          max-height: 80%;
          max-width: 80%;
          object-fit: contain;
          mix-blend-mode: multiply;
        }

        /* ── INFO COLUMN (Right side buy box ~27%) ── */
        .tonet-info-column {
          display: block;
          padding: 12px 20px 80px;
          box-sizing: border-box;
          width: 100%;
        }
        @media (min-width: 1024px) {
          .tonet-info-column {
            padding: 80px 0 0 0;
          }
        }
        .tonet-info-sticky {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          width: 100%;
        }
        @media (min-width: 1024px) {
          .tonet-info-sticky {
            position: sticky;
            top: 100px;
            align-items: flex-start;
            text-align: left;
            max-width: 460px;
            margin-left: 0;
            margin-right: 0;
          }
        }

        /* Title */
        .tonet-product-title {
          font-family: var(--font-primary), sans-serif;
          font-size: 20px;
          font-weight: 500;
          letter-spacing: 0.1em;
          line-height: 1.3;
          margin: 0;
          text-transform: uppercase;
          color: #000000;
          text-align: left;
        }
        @media (min-width: 1024px) {
          .tonet-product-title {
            font-size: 24px;
            text-align: left;
          }
        }

        .tonet-product-title-divider {
          width: 100%;
          height: 2px;
          background-color: #000000;
          margin-top: 14px;
          margin-bottom: 14px;
        }

        /* Subtitle block */
        .tonet-product-subtitle-block {
          margin-bottom: 24px;
          width: 100%;
        }
        .tonet-product-subtitle {
          font-family: var(--font-primary), sans-serif;
          font-size: 13px;
          line-height: 1.5;
          color: #000000;
          margin: 0 0 6px 0;
        }
        .tonet-product-more-info {
          font-size: 11px;
          color: #000000;
          text-decoration: underline;
          text-underline-offset: 3px;
          cursor: pointer;
          display: inline-block;
          margin-bottom: 8px;
        }
        .tonet-product-ref {
          display: block;
          font-size: 11px;
          color: #767676;
        }

        /* Price & Star Row */
        .tonet-product-price-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding-bottom: 16px;
          border-bottom: 1px solid #d8d8d8;
          margin-bottom: 24px;
        }
        .tonet-price-wrapper {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }
        .tonet-price-amount {
          font-family: var(--font-primary), sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: #000000;
        }
        .tonet-price-per-kg {
          font-size: 10.5px;
          color: #767676;
        }
        .tonet-pdp-favorite-btn {
          background: transparent;
          border: none;
          padding: 4px;
          cursor: pointer;
          color: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s ease;
        }
        .tonet-pdp-favorite-btn:hover {
          color: #767676;
        }

        /* Swatches Section */
        .tonet-pdp-swatches-section {
          width: 100%;
          margin-bottom: 32px;
        }
        .tonet-pdp-swatches-row {
          margin-bottom: 14px;
        }
        .tonet-pdp-swatches-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .tonet-pdp-swatch-circle {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.1);
          cursor: pointer;
          padding: 0;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .tonet-pdp-swatch-circle.active {
          border: 1px solid #000000;
          box-shadow: inset 0 0 0 3px #ffffff;
        }
        .tonet-pdp-swatch-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        .tonet-pdp-swatch-name {
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          font-weight: 500;
          color: #000000;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .tonet-pdp-swatch-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
        }
        .tonet-pdp-novedad-badge {
          font-family: var(--font-primary), sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.1em;
          background-color: #f2f2f2;
          color: #000000;
          padding: 4px 8px;
          text-transform: uppercase;
        }

        /* SELECT SIZE CTA Button */
        .tonet-size-selector-wrap {
          margin-bottom: 24px;
          width: 100%;
          display: flex;
          justify-content: flex-start;
        }
        .tonet-select-size-btn {
          background-color: #000000;
          color: #ffffff;
          border: none;
          padding: 18px 28px;
          font-size: 12px;
          font-family: var(--font-primary), sans-serif;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          border-radius: 0 !important;
          transition: background-color 0.3s, color 0.3s;
        }
        .tonet-select-size-btn:hover {
          background-color: #333333;
          color: #ffffff;
          opacity: 1;
        }

        .tonet-pdp-delivery-info {
          width: 100%;
          font-size: 11px;
          line-height: 1.5;
          color: #555555;
          margin-bottom: 32px;
        }
        .tonet-pdp-delivery-info p {
          margin: 0 0 6px 0;
        }
        .tonet-product-reviews-link {
          color: #000000;
          text-decoration: underline;
          text-underline-offset: 3px;
          cursor: pointer;
        }

        /* Minimal Accordions */
        .tonet-accordions {
          width: 100%;
          border-top: 1px solid #d8d8d8;
        }
        .tonet-accordion-item {
          border-bottom: 1px solid #d8d8d8;
          width: 100%;
        }
        .tonet-accordion-header {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          font-size: 11px;
          font-family: var(--font-primary), sans-serif;
          font-weight: 400;
          letter-spacing: 0.1em;
          color: #000000;
          text-transform: uppercase;
          cursor: pointer;
        }
        .tonet-accordion-icon {
          font-size: 11px;
          font-weight: 300;
          color: #888888;
        }
        .tonet-accordion-content {
          padding: 0 0 20px;
          text-align: left;
          font-size: 10.5px;
          line-height: 1.6;
          font-weight: 300;
          letter-spacing: 0.05em;
          color: #555555;
          text-transform: uppercase;
        }
        .tonet-accordion-content p {
          margin: 0 0 10px;
        }
        .tonet-specs-list {
          list-style: none;
          padding: 0;
          margin: 12px 0 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .tonet-size-guide-link {
          background: none;
          border: none;
          padding: 0;
          margin-top: 8px;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #000000;
          text-decoration: underline;
          text-underline-offset: 3px;
          cursor: pointer;
          display: block;
        }

        /* ── RELATED CAROUSEL ── */
        .tonet-related-carousel {
          padding: 60px 20px;
          background-color: #ffffff;
          text-align: center;
          border-top: 1px solid rgba(0, 0, 0, 0.04);
        }
        @media (min-width: 1024px) {
          .tonet-related-carousel {
            padding: 100px 64px;
          }
        }
        .tonet-carousel-title {
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.15em;
          color: #000000;
          margin: 0 auto 32px;
          text-transform: uppercase;
          line-height: 1;
        }
        @media (min-width: 1024px) {
          .tonet-carousel-title {
            font-size: 11px;
          }
        }
        .tonet-carousel-wrap {
          width: 100%;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .tonet-carousel-wrap::-webkit-scrollbar {
          display: none;
        }
        .tonet-carousel-track {
          display: flex;
          gap: 20px;
          width: max-content;
          margin: 0 auto;
        }
        .tonet-carousel-item {
          width: 220px;
        }

        /* ── FLOATING CONCIERGE CHAT BADGE ── */
        .tonet-concierge-badge {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 44px;
          height: 44px;
          background-color: #000000;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          z-index: 999;
          transition: transform 0.2s ease;
        }
        .tonet-concierge-badge:hover {
          transform: scale(1.05);
        }
        .tonet-concierge-badge:active {
          transform: scale(0.95);
        }

        /* ── SIZE SELECTOR OVERLAY MODAL ── */
        .tonet-size-selector-overlay {
          position: fixed;
          inset: 0;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tonet-size-selector-modal {
          background: #ffffff;
          border: none;
          width: 90%;
          max-width: 360px;
          padding: 32px;
          box-shadow: 0 20px 45px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-sizing: border-box;
          position: relative;
        }
        .tonet-size-modal-header {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          width: 100%;
        }
        .tonet-size-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .tonet-size-close-btn {
          background: none;
          border: none;
          outline: none;
          font-size: 14px;
          cursor: pointer;
          color: #000000;
          padding: 0;
        }
        .tonet-size-guide-btn {
          background: none;
          border: none;
          outline: none;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.05em;
          color: #888888;
          cursor: pointer;
          text-transform: uppercase;
          padding: 0;
        }
        .tonet-size-guide-btn:hover {
          color: #000000;
        }
        .tonet-size-modal-body {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          width: 100%;
        }
        .tonet-size-modal-title {
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #000000;
        }
        .tonet-size-modal-grid {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin: 8px 0;
          width: 100%;
        }
        .tonet-size-box-btn {
          border: none;
          background: transparent;
          color: #000000;
          padding: 8px 16px;
          font-size: 12px;
          font-weight: 400;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.05em;
          box-sizing: border-box;
        }
        .tonet-size-box-btn:hover {
          color: #888888;
        }
        .tonet-size-box-btn.selected {
          border: none;
          text-decoration: underline;
          text-underline-offset: 4px;
          font-weight: 700;
        }
        .tonet-size-box-btn.sold-out {
          color: #cccccc;
          text-decoration: line-through;
          cursor: not-allowed;
        }
        .tonet-stock-warning {
          color: #ff0000;
          font-size: 10px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .tonet-size-modal-cta {
          width: 100%;
          background: #000000;
          color: #ffffff;
          border: none;
          padding: 14px 0;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: opacity 0.3s;
          text-align: center;
          text-transform: uppercase;
        }
        .tonet-size-modal-cta:hover {
          opacity: 0.85;
        }
        .tonet-size-modal-cta:disabled {
          background-color: #cccccc;
          color: #ffffff;
          cursor: not-allowed;
        }

        /* ── MODALS ── */
        .tonet-modal-overlay, .tonet-ceremony-overlay {
          position: fixed;
          inset: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }
        .tonet-modal, .tonet-ceremony-modal {
          background: #ffffff;
          border: 1px solid #000000;
          width: 90%;
          max-width: 440px;
          padding: 32px;
          position: relative;
          color: #000000;
          box-shadow: 0 20px 50px rgba(0,0,0,0.06);
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .tonet-modal-close, .tonet-ceremony-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: none;
          border: none;
          color: #000000;
          font-size: 14px;
          cursor: pointer;
          padding: 0;
        }
        .tonet-modal-title, .tonet-ceremony-title {
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .tonet-modal-desc, .tonet-ceremony-desc {
          font-size: 11px;
          font-weight: 300;
          line-height: 1.6;
          letter-spacing: 0.05em;
          color: #666666;
          margin: 0;
          text-transform: uppercase;
        }
        .tonet-modal-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .tonet-modal-field-label, .tonet-ceremony-label {
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.05em;
          color: #999999;
          text-transform: uppercase;
        }
        .tonet-modal-input {
          border: none;
          border-bottom: 1px solid #000000;
          padding: 8px 0;
          font-size: 12px;
          outline: none;
          background: transparent;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .tonet-modal-cta, .tonet-ceremony-btn-primary {
          background: #000000;
          color: #ffffff;
          border: 1px solid #000000;
          padding: 14px 0;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-align: center;
          text-transform: uppercase;
          cursor: pointer;
          transition: opacity 0.3s;
          display: block;
          width: 100%;
        }
        .tonet-modal-cta:hover, .tonet-ceremony-btn-primary:hover {
          opacity: 0.85;
        }

        .tonet-ceremony-split {
          display: grid;
          grid-template-columns: 80px 1fr;
          gap: 20px;
          align-items: center;
        }
        .tonet-ceremony-image {
          aspect-ratio: 3/4;
          background: #ffffff;
          overflow: hidden;
        }
        .tonet-ceremony-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .tonet-ceremony-item {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          letter-spacing: 0.05em;
        }
        .tonet-ceremony-value {
          font-weight: 400;
          color: #000000;
        }
        .tonet-ceremony-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .tonet-ceremony-btn-secondary {
          background: transparent;
          border: 1px solid #eaeaea;
          color: #666666;
          padding: 14px 0;
          font-size: 11px;
          cursor: pointer;
          text-transform: uppercase;
          text-align: center;
          letter-spacing: 0.1em;
          transition: color 0.2s, border-color 0.2s;
        }
        .tonet-ceremony-btn-secondary:hover {
          border-color: #000000;
          color: #000000;
        }

        /* ── COMPLETE THE LOOK SECTION ── */
        .amiri-ctl-section {
          background-color: #ffffff;
          padding: 80px 0;
          width: 100%;
          overflow: hidden;
          border-top: 1px solid rgba(0, 0, 0, 0.04);
        }
        @media (min-width: 1024px) {
          .amiri-ctl-section {
            padding: 120px 0;
          }
        }

        .amiri-ctl-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 40px;
        }
        @media (min-width: 1024px) {
          .amiri-ctl-header {
            margin-bottom: 48px;
          }
        }

        .amiri-ctl-logo {
          font-family: 'Big Noodle Titling', sans-serif;
          font-size: 26px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #000000;
          margin-bottom: 8px;
          line-height: 1;
        }
        @media (min-width: 1024px) {
          .amiri-ctl-logo {
            font-size: 30px;
            margin-bottom: 12px;
          }
        }

        .amiri-ctl-title {
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #000000;
          margin: 0;
          line-height: 1;
        }
        @media (min-width: 1024px) {
          .amiri-ctl-title {
            font-size: 11px;
          }
        }

        .amiri-ctl-carousel-wrapper {
          position: relative;
          width: 100%;
          padding: 0;
          box-sizing: border-box;
        }
        @media (min-width: 1024px) {
          .amiri-ctl-carousel-wrapper {
            padding: 0;
          }
        }

        .amiri-ctl-carousel {
          display: flex;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-snap-type: x mandatory;
          gap: 0;
          width: 100%;
          padding-left: 40px;
          padding-right: 40px;
          box-sizing: border-box;
        }
        @media (min-width: 1024px) {
          .amiri-ctl-carousel {
            padding-left: 64px;
            padding-right: 64px;
          }
        }
        .amiri-ctl-carousel::-webkit-scrollbar {
          display: none;
        }

        .amiri-ctl-item {
          flex: 0 0 86%;
          width: 86%;
          scroll-snap-align: center;
          box-sizing: border-box;
        }
        .amiri-ctl-item:not(:last-child) {
          border-right: 2px solid #ffffff;
        }
        @media (min-width: 1024px) {
          .amiri-ctl-item {
            flex: 0 0 25%;
            width: 25%;
            min-width: 322px;
            max-width: 380px;
            scroll-snap-align: start;
          }
        }

        .amiri-ctl-card {
          display: flex;
          flex-direction: column;
          width: 100%;
          text-decoration: none;
          color: inherit;
        }

        .amiri-ctl-image-panel {
          width: 100%;
          aspect-ratio: 3 / 4;
          background-color: #f6f6f6;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          box-sizing: border-box;
        }
        @media (min-width: 1024px) {
          .amiri-ctl-image-panel {
            padding: 8px;
          }
        }

        .amiri-ctl-image {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
          mix-blend-mode: multiply;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .amiri-ctl-card:hover .amiri-ctl-image {
          transform: scale(1.02);
        }

        /* ── Optical image scaling classes ── */
        .amiri-ctl-image--top {
          max-width: 75%;
          max-height: 60%;
        }
        .amiri-ctl-image--pants {
          max-width: 70%;
          max-height: 52%;
        }
        .amiri-ctl-image--footwear {
          max-width: 80%;
          max-height: 48%;
        }
        .amiri-ctl-image--accessory {
          max-width: 60%;
          max-height: 35%;
        }

        .amiri-ctl-meta {
          padding-top: 16px;
          padding-bottom: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-align: center;
          align-items: center;
        }
        @media (min-width: 1024px) {
          .amiri-ctl-meta {
            padding-top: 16px;
          }
        }

        .amiri-ctl-name {
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.08em;
          color: #000000;
          text-transform: uppercase;
          line-height: 1.4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        @media (min-width: 1024px) {
          .amiri-ctl-name {
            font-size: 10.5px;
          }
        }

        .amiri-ctl-price {
          font-family: var(--font-primary), sans-serif;
          font-size: 9.5px;
          font-weight: 300;
          letter-spacing: 0.05em;
          color: #555555;
          text-transform: uppercase;
        }
        @media (min-width: 1024px) {
          .amiri-ctl-price {
            font-size: 10px;
          }
        }

        /* ── Discreet scroll pill indicator ── */
        .amiri-ctl-indicator-track {
          width: 80px;
          height: 1.5px;
          background-color: rgba(0, 0, 0, 0.06);
          margin: 32px auto 0;
          position: relative;
          border-radius: 1px;
          overflow: hidden;
        }
        .amiri-ctl-indicator-pill {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          background-color: rgba(0, 0, 0, 0.4);
          border-radius: 1px;
          transition: transform 0.1s ease-out;
        }

        /* ── Floating Circular Monogram Badge ── */
        .amiri-ctl-monogram-badge {
          position: absolute;
          bottom: 48px;
          right: 28px;
          width: 44px;
          height: 44px;
          background-color: #000000;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          z-index: 10;
          transition: transform 0.2s ease;
        }
        @media (min-width: 1024px) {
          .amiri-ctl-monogram-badge {
            right: 52px;
            bottom: 60px;
          }
        }
        .amiri-ctl-monogram-badge:hover {
          transform: scale(1.05);
        }
        .amiri-ctl-monogram-badge:active {
          transform: scale(0.95);
        }

        /* ── STICKY BUY BAR ── */
        .tonet-sticky-buy-bar {
          position: fixed;
          top: 54px;
          left: 0;
          right: 0;
          height: 54px;
          background: #000000;
          color: #ffffff;
          z-index: 490;
          transform: translateY(-100%);
          opacity: 0;
          transition: transform 0.3s ease, opacity 0.3s ease;
          pointer-events: none;
        }
        .tonet-sticky-buy-bar.visible {
          transform: translateY(0);
          opacity: 1;
          pointer-events: auto;
        }
        .tonet-sticky-buy-bar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
          padding: 0 16px;
          box-sizing: border-box;
          width: 100%;
        }
        .tonet-sticky-buy-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .tonet-sticky-buy-thumb {
          width: 32px;
          height: 32px;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .tonet-sticky-buy-thumb img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .tonet-sticky-buy-price {
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.05em;
        }
        .tonet-sticky-buy-btn {
          background: transparent;
          border: none;
          color: #ffffff;
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.1em;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0;
          text-transform: uppercase;
          outline: none;
        }
        .tonet-sticky-buy-btn:hover {
          opacity: 0.8;
        }
        .tonet-sticky-arrow {
          font-size: 10px;
          margin-left: 2px;
          transition: transform 0.2s ease;
          display: inline-block;
        }
        .tonet-sticky-arrow.flipped {
          transform: rotate(180deg);
        }

        /* ── STICKY BAR INLINE SIZE DROPDOWN ── */
        .sticky-size-backdrop {
          position: fixed;
          inset: 0;
          z-index: 488;
        }
        .sticky-size-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: #000000;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-top: none;
          display: flex;
          flex-direction: column;
          min-width: 160px;
          z-index: 489;
          max-height: 280px;
          overflow-y: auto;
        }
        .sticky-size-option {
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          color: #ffffff;
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.12em;
          padding: 12px 20px;
          text-align: left;
          cursor: pointer;
          transition: background 0.15s ease;
          text-transform: uppercase;
        }
        .sticky-size-option:last-child {
          border-bottom: none;
        }
        .sticky-size-option:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .sticky-size-option.selected {
          background: rgba(255, 255, 255, 0.15);
          font-weight: 600;
        }
        .sticky-size-option.sold-out {
          color: rgba(255, 255, 255, 0.3);
          text-decoration: line-through;
          cursor: pointer;
        }

        @media (min-width: 1024px) {
          .tonet-sticky-buy-bar {
            top: calc(var(--header-height, 64px) + var(--nav-top, 0px) + 12px);
            left: auto;
            right: 64px;
            width: 400px;
            height: 54px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
            transform: translateY(-20px);
          }
          .tonet-sticky-buy-bar.visible {
            transform: translateY(0);
            opacity: 1;
          }
          .tonet-sticky-buy-bar-inner {
            padding: 0 24px;
          }
        }

        /* Mobile specific layout tweaks to group title, price, swatches, and buy button closely */
        @media (max-width: 1023px) {
          .tonet-product-title-divider {
            margin-top: 10px;
            margin-bottom: 10px;
          }
          .tonet-product-price-row {
            padding-bottom: 10px;
            margin-bottom: 14px;
          }
          .tonet-pdp-swatches-section {
            margin-bottom: 14px;
          }
          .tonet-size-selector-wrap {
            margin-bottom: 16px;
          }
        }

        /* Urgency box styles */
        .tonet-pdp-urgency-box {
          width: 100%;
          border: 1px solid #d8d8d8;
          padding: 14px;
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-sizing: border-box;
          border-radius: 0 !important; /* Rectangular borders */
          background-color: #fafafa;
        }
        .tonet-urgency-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .tonet-urgency-pulse {
          width: 8px;
          height: 8px;
          background-color: #d93838;
          display: inline-block;
          animation: tonet-pulse 1.5s infinite ease-in-out;
          border-radius: 0 !important; /* Rectangular borders */
        }
        @keyframes tonet-pulse {
          0% { transform: scale(0.9); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.5; }
        }
        .tonet-urgency-star-icon {
          color: #000000;
          font-size: 11px;
          letter-spacing: 0.1em;
        }
        .tonet-urgency-text {
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.08em;
          color: #000000;
          text-transform: uppercase;
        }
        @media (max-width: 1023px) {
          .tonet-pdp-urgency-box {
            margin-bottom: 16px;
            padding: 12px;
          }
        }

        /* PDP SMS Box styles */
        .tonet-pdp-sms-box {
          width: 100%;
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 16px;
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          border-radius: 0 !important; /* Rectangular borders */
          background-color: #000000;
          color: #ffffff;
        }
        .tonet-pdp-sms-form,
        .tonet-pdp-sms-success {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
        }
        .tonet-pdp-sms-tag {
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.15em;
          color: #ffffff;
          text-transform: uppercase;
        }
        .tonet-pdp-sms-desc {
          font-family: var(--font-primary), sans-serif;
          font-size: 9px;
          font-weight: 300;
          line-height: 1.5;
          letter-spacing: 0.05em;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
          text-transform: uppercase;
        }
        .tonet-pdp-sms-input-row {
          display: flex;
          gap: 10px;
          width: 100%;
          margin-top: 4px;
        }
        .tonet-pdp-sms-input {
          flex: 1;
          border: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.25);
          padding: 12px 0;
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          letter-spacing: 0.08em;
          background: transparent;
          color: #ffffff;
          border-radius: 0 !important; /* Rectangular borders */
          outline: none;
          text-transform: uppercase;
          transition: border-color 0.2s;
        }
        .tonet-pdp-sms-input:focus {
          border-bottom-color: #ffffff;
        }
        .tonet-pdp-sms-input::placeholder {
          color: rgba(255, 255, 255, 0.35);
        }
        .tonet-pdp-sms-btn {
          background: #ffffff;
          color: #000000;
          border: none;
          padding: 12px 20px;
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          cursor: pointer;
          border-radius: 0 !important; /* Rectangular borders */
          transition: background-color 0.2s;
        }
        .tonet-pdp-sms-btn:hover {
          background: #eaeaea;
        }
        .tonet-pdp-sms-error {
          font-family: var(--font-primary), sans-serif;
          font-size: 9px;
          color: #d93838;
          font-weight: 600;
          letter-spacing: 0.05em;
        }
        .tonet-pdp-sms-code {
          font-weight: 700;
          color: #ffffff;
          background: rgba(255, 255, 255, 0.15);
          padding: 2px 8px;
        }
        @media (max-width: 1023px) {
          .tonet-pdp-sms-box {
            margin-bottom: 16px;
            padding: 12px;
          }
        }
      `}</style>
    </>
  );
}
