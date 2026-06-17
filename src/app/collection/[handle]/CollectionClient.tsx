'use client';

import { useState, useMemo, useEffect } from 'react';
import { Plus, Minus, X } from 'lucide-react';
import type { CollectionDetail, Product } from '@/lib/shopify';
import { useLocale } from '@/context/LocaleContext';
import Link from 'next/link';

// Predefined set of ComfyUI fashion lifestyle images
const LIFESTYLE_IMAGES = [
  '/hero/ComfyUI-main_reference_00012_.png',
  '/hero/ComfyUI-main_reference_00016_.png',
  '/hero/ComfyUI-main_reference_00017_.png',
  '/hero/ComfyUI-main_reference_00018_.png',
  '/hero/ComfyUI-main_reference_00019_.png',
  '/hero/ComfyUI-main_reference_00020_.png',
  '/hero/ComfyUI-main_reference_00021_.png',
  '/hero/ComfyUI-main_reference_00022_.png',
  '/hero/ComfyUI-main_reference_00023_.png',
  '/hero/ComfyUI-main_reference_00028_.png',
  '/hero/ComfyUI-main_reference_00032_.png'
];

interface GridItem {
  key: string;
  type: 'product' | 'lifestyle';
  product?: Product;
  imageUrl?: string;
  colSpan: number; // 1 or 2
  rowSpan: number; // 1 or 2
}

// Function to classify product for optical image scaling classes
function getProductImageClass(title: string, tags: string[]): string {
  const tLower = title.toLowerCase();
  const tagsLower = tags.map(t => t.toLowerCase());

  const isSneaker = tLower.includes('sneaker') || tLower.includes('shoes') || tLower.includes('clog') || tagsLower.includes('footwear') || tagsLower.includes('sneakers');
  const isPants = tLower.includes('pants') || tLower.includes('shorts') || tLower.includes('trouser') || tagsLower.includes('bottoms') || tagsLower.includes('pants');
  const isAccessory = tLower.includes('ball') || tLower.includes('sunglasses') || tLower.includes('bag') || tagsLower.includes('accessories');
  
  if (isSneaker) return 'amiri-product-img--sneaker';
  if (isPants) return 'amiri-product-img--pants';
  if (isAccessory) return 'amiri-product-img--accessory';
  return 'amiri-product-img--top'; // Default
}

export default function CollectionClient({ collection }: { collection: CollectionDetail }) {
  const { formatPrice } = useLocale();

  // Committed Filters State (Controls the Grid)
  const [selectedSort, setSelectedSort] = useState<string>('featured');
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);

  // Temporary Filters State (Inside the Refine Drawer)
  const [tempSort, setTempSort] = useState<string>('featured');
  const [tempAvailability, setTempAvailability] = useState<string[]>([]);
  const [tempColors, setTempColors] = useState<string[]>([]);
  const [tempSizes, setTempSizes] = useState<string[]>([]);
  const [tempMaterials, setTempMaterials] = useState<string[]>([]);

  const [refineOpen, setRefineOpen] = useState(false);
  const [activeFilterAccordion, setActiveFilterAccordion] = useState<string | null>(null);

  // Dynamic filter options extraction
  const filterOptions = useMemo(() => {
    const colors = new Set<string>();
    const sizes = new Set<string>();
    const materials = new Set<string>();

    const materialKeywords = ['cotton', 'fleece', 'denim', 'leather', 'wool', 'silk', 'nylon', 'polyester', 'linen', 'knit', 'cashmere', 'waffle'];

    collection.products.forEach(p => {
      p.variants.forEach(v => {
        v.selectedOptions.forEach(opt => {
          const nameLower = opt.name.toLowerCase();
          if (nameLower === 'color' || nameLower === 'colour') {
            colors.add(opt.value);
          } else if (nameLower === 'size' || nameLower === 'talla') {
            sizes.add(opt.value);
          }
        });
      });

      p.tags.forEach(t => {
        const tLower = t.toLowerCase();
        if (materialKeywords.includes(tLower)) {
          materials.add(t);
        }
      });

      materialKeywords.forEach(mat => {
        if (p.description?.toLowerCase().includes(mat) || p.title.toLowerCase().includes(mat)) {
          materials.add(mat.charAt(0).toUpperCase() + mat.slice(1));
        }
      });
    });

    return {
      colors: Array.from(colors).sort(),
      sizes: Array.from(sizes).sort(),
      materials: Array.from(materials).sort()
    };
  }, [collection.products]);

  // Open / Close Drawer Handling
  const openRefine = () => {
    setTempSort(selectedSort);
    setTempAvailability(selectedAvailability);
    setTempColors(selectedColors);
    setTempSizes(selectedSizes);
    setTempMaterials(selectedMaterials);
    setRefineOpen(true);
  };

  const applyFilters = () => {
    setSelectedSort(tempSort);
    setSelectedAvailability(tempAvailability);
    setSelectedColors(tempColors);
    setSelectedSizes(tempSizes);
    setSelectedMaterials(tempMaterials);
    setRefineOpen(false);
  };

  const clearFilters = () => {
    setTempSort('featured');
    setTempAvailability([]);
    setTempColors([]);
    setTempSizes([]);
    setTempMaterials([]);
  };

  const toggleTempFilter = (list: string[], setList: (val: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(x => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  // committed filtering
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...collection.products];

    // 1. Availability
    if (selectedAvailability.length > 0) {
      result = result.filter(p => {
        const inStock = p.variants.some(v => v.availableForSale);
        if (selectedAvailability.includes('in-stock') && inStock) return true;
        if (selectedAvailability.includes('out-of-stock') && !inStock) return true;
        return false;
      });
    }

    // 2. Color
    if (selectedColors.length > 0) {
      result = result.filter(p => 
        p.variants.some(v => 
          v.selectedOptions.some(opt => 
            (opt.name.toLowerCase() === 'color' || opt.name.toLowerCase() === 'colour') && 
            selectedColors.includes(opt.value)
          )
        )
      );
    }

    // 3. Size
    if (selectedSizes.length > 0) {
      result = result.filter(p => 
        p.variants.some(v => 
          v.selectedOptions.some(opt => 
            (opt.name.toLowerCase() === 'size' || opt.name.toLowerCase() === 'talla') && 
            selectedSizes.includes(opt.value)
          )
        )
      );
    }

    // 4. Material
    if (selectedMaterials.length > 0) {
      result = result.filter(p => {
        const tagsLower = p.tags.map(t => t.toLowerCase());
        const titleLower = p.title.toLowerCase();
        const descLower = p.description?.toLowerCase() ?? '';
        return selectedMaterials.some(mat => {
          const matLower = mat.toLowerCase();
          return tagsLower.includes(matLower) || titleLower.includes(matLower) || descLower.includes(matLower);
        });
      });
    }

    // 5. Sorting
    if (selectedSort === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (selectedSort === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [collection.products, selectedSort, selectedAvailability, selectedColors, selectedSizes, selectedMaterials]);

  // temp count inside drawer
  const tempFilteredCount = useMemo(() => {
    let result = [...collection.products];

    if (tempAvailability.length > 0) {
      result = result.filter(p => {
        const inStock = p.variants.some(v => v.availableForSale);
        if (tempAvailability.includes('in-stock') && inStock) return true;
        if (tempAvailability.includes('out-of-stock') && !inStock) return true;
        return false;
      });
    }

    if (tempColors.length > 0) {
      result = result.filter(p => 
        p.variants.some(v => 
          v.selectedOptions.some(opt => 
            (opt.name.toLowerCase() === 'color' || opt.name.toLowerCase() === 'colour') && 
            tempColors.includes(opt.value)
          )
        )
      );
    }

    if (tempSizes.length > 0) {
      result = result.filter(p => 
        p.variants.some(v => 
          v.selectedOptions.some(opt => 
            (opt.name.toLowerCase() === 'size' || opt.name.toLowerCase() === 'talla') && 
            tempSizes.includes(opt.value)
          )
        )
      );
    }

    if (tempMaterials.length > 0) {
      result = result.filter(p => {
        const tagsLower = p.tags.map(t => t.toLowerCase());
        const titleLower = p.title.toLowerCase();
        const descLower = p.description?.toLowerCase() ?? '';
        return tempMaterials.some(mat => {
          const matLower = mat.toLowerCase();
          return tagsLower.includes(matLower) || titleLower.includes(matLower) || descLower.includes(matLower);
        });
      });
    }

    return result.length;
  }, [collection.products, tempAvailability, tempColors, tempSizes, tempMaterials]);

  // Dynamic layout generator (Interweaving lifestyle images into the grid)
  const gridItems = useMemo(() => {
    const items: GridItem[] = [];
    let productIdx = 0;
    let lifestyleIdx = 0;

    const totalProducts = filteredAndSortedProducts.length;
    if (totalProducts === 0) return [];

    // Simple grid layout if very few products
    if (totalProducts <= 3) {
      filteredAndSortedProducts.forEach((p) => {
        items.push({
          key: `prod-${p.id}`,
          type: 'product',
          product: p,
          colSpan: 1,
          rowSpan: 1
        });
      });
      items.push({
        key: 'lifestyle-end',
        type: 'lifestyle',
        imageUrl: LIFESTYLE_IMAGES[0],
        colSpan: 1,
        rowSpan: 1
      });
      return items;
    }

    // High fidelity modular pattern
    const pattern = [
      { type: 'product', colSpan: 1, rowSpan: 1 },
      { type: 'product', colSpan: 1, rowSpan: 1 },
      { type: 'lifestyle', colSpan: 2, rowSpan: 2 }, // large lifestyle cover
      { type: 'product', colSpan: 1, rowSpan: 1 },
      { type: 'product', colSpan: 1, rowSpan: 1 },
      { type: 'product', colSpan: 1, rowSpan: 1 },
      { type: 'product', colSpan: 1, rowSpan: 1 },
      { type: 'lifestyle', colSpan: 2, rowSpan: 1 }, // wide lifestyle cover
      { type: 'product', colSpan: 1, rowSpan: 1 },
      { type: 'product', colSpan: 1, rowSpan: 1 },
      { type: 'product', colSpan: 1, rowSpan: 1 },
      { type: 'product', colSpan: 1, rowSpan: 1 },
      { type: 'product', colSpan: 2, rowSpan: 2 }, // spotlight product cell
      { type: 'lifestyle', colSpan: 1, rowSpan: 1 }, // small lifestyle cell
      { type: 'product', colSpan: 1, rowSpan: 1 },
      { type: 'product', colSpan: 1, rowSpan: 1 },
      { type: 'product', colSpan: 1, rowSpan: 1 },
      { type: 'product', colSpan: 1, rowSpan: 1 },
      { type: 'lifestyle', colSpan: 2, rowSpan: 2 } // large lifestyle cover
    ];

    let patternIdx = 0;
    while (productIdx < totalProducts) {
      const pRule = pattern[patternIdx % pattern.length];
      
      if (pRule.type === 'product') {
        const p = filteredAndSortedProducts[productIdx++];
        items.push({
          key: `prod-${p.id}-${productIdx}`,
          type: 'product',
          product: p,
          colSpan: pRule.colSpan,
          rowSpan: pRule.rowSpan
        });
      } else {
        const img = LIFESTYLE_IMAGES[lifestyleIdx % LIFESTYLE_IMAGES.length];
        lifestyleIdx++;
        items.push({
          key: `lifestyle-${lifestyleIdx}`,
          type: 'lifestyle',
          imageUrl: img,
          colSpan: pRule.colSpan,
          rowSpan: pRule.rowSpan
        });
      }
      patternIdx++;
    }

    // Grid balancing row completion (to fill a 4-column row layout cleanly)
    if (items.length % 4 !== 0) {
      const remainder = 4 - (items.length % 4);
      for (let i = 0; i < remainder; i++) {
        const img = LIFESTYLE_IMAGES[lifestyleIdx % LIFESTYLE_IMAGES.length];
        lifestyleIdx++;
        items.push({
          key: `lifestyle-fill-${lifestyleIdx}`,
          type: 'lifestyle',
          imageUrl: img,
          colSpan: 1,
          rowSpan: 1
        });
      }
    }

    return items;
  }, [filteredAndSortedProducts]);

  const toggleAccordion = (name: string) => {
    setActiveFilterAccordion(activeFilterAccordion === name ? null : name);
  };

  return (
    <>
      <div className="amiri-collection-container">
        
        {/* TOP BAR: Title & Refine Trigger */}
        <div className="amiri-collection-top">
          <h1 className="amiri-collection-title">
            {collection.title}
          </h1>
          <button 
            type="button" 
            className="amiri-refine-trigger"
            onClick={openRefine}
          >
            REFINE
          </button>
        </div>

        {/* MAIN MODULAR GRID */}
        <div className="amiri-grid-wrapper">
          {gridItems.length > 0 ? (
            <div className="amiri-modular-grid">
              {gridItems.map((item) => {
                if (item.type === 'product' && item.product) {
                  const p = item.product;
                  const isLarge = item.colSpan === 2 && item.rowSpan === 2;
                  const imageClass = getProductImageClass(p.title, p.tags);
                  
                  return (
                    <Link
                      href={`/product/${p.handle}`}
                      key={item.key}
                      className={`amiri-grid-item amiri-grid-item--product ${
                        isLarge ? 'amiri-grid-item--span-2 amiri-grid-item--row-2' : ''
                      }`}
                    >
                      <span className="amiri-product-tag">TOURNAMENT</span>
                      <div className="amiri-product-img-wrap">
                        {p.imageUrl && (
                          <img
                            src={p.imageUrl}
                            alt={p.title}
                            className={`amiri-product-img ${imageClass}`}
                          />
                        )}
                      </div>
                      <div className="amiri-product-info">
                        <span className="amiri-product-name">{p.title}</span>
                        <span className="amiri-product-price">
                          {formatPrice(p.price, p.currencyCode)}
                        </span>
                      </div>
                    </Link>
                  );
                } else {
                  const isLarge = item.colSpan === 2 && item.rowSpan === 2;
                  const isWide = item.colSpan === 2 && item.rowSpan === 1;
                  
                  return (
                    <div
                      key={item.key}
                      className={`amiri-grid-item amiri-grid-item--lifestyle ${
                        isLarge ? 'amiri-grid-item--span-2 amiri-grid-item--row-2' : ''
                      } ${isWide ? 'amiri-grid-item--span-2 amiri-grid-item--wide' : ''}`}
                    >
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt="Collection Lifestyle"
                          className="amiri-lifestyle-img"
                        />
                      )}
                    </div>
                  );
                }
              })}
            </div>
          ) : (
            <div className="amiri-empty-grid">
              <span>NO PRODUCTS FOUND MATCHING THE ACTIVE FILTERS</span>
            </div>
          )}
        </div>
      </div>

      {/* FLOATING MONOGRAM BADGE */}
      <div className="amiri-monogram-badge">
        <span>T</span>
      </div>

      {/* REFINE DRAWER OVERLAY */}
      <div 
        className={`amiri-refine-overlay ${refineOpen ? 'open' : ''}`}
        onClick={applyFilters}
      />

      {/* REFINE DRAWER */}
      <div className={`amiri-refine-drawer ${refineOpen ? 'open' : ''}`}>
        <div className="amiri-refine-header">
          <h2>REFINE</h2>
          <button 
            type="button" 
            className="amiri-refine-close" 
            onClick={applyFilters}
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        <div className="amiri-refine-body">
          {/* SORT BY ACCORDION */}
          <div className="amiri-refine-section">
            <button 
              type="button"
              className="amiri-refine-section-header"
              onClick={() => toggleAccordion('sort')}
            >
              <span>SORT BY</span>
              {activeFilterAccordion === 'sort' ? <Minus size={11} strokeWidth={1.5} /> : <Plus size={11} strokeWidth={1.5} />}
            </button>
            {activeFilterAccordion === 'sort' && (
              <div className="amiri-refine-section-content">
                <button
                  type="button"
                  className={`amiri-refine-option ${tempSort === 'featured' ? 'active' : ''}`}
                  onClick={() => setTempSort('featured')}
                >
                  <span className="amiri-refine-option-check" />
                  <span>FEATURED</span>
                </button>
                <button
                  type="button"
                  className={`amiri-refine-option ${tempSort === 'price-asc' ? 'active' : ''}`}
                  onClick={() => setTempSort('price-asc')}
                >
                  <span className="amiri-refine-option-check" />
                  <span>PRICE: LOW TO HIGH</span>
                </button>
                <button
                  type="button"
                  className={`amiri-refine-option ${tempSort === 'price-desc' ? 'active' : ''}`}
                  onClick={() => setTempSort('price-desc')}
                >
                  <span className="amiri-refine-option-check" />
                  <span>PRICE: HIGH TO LOW</span>
                </button>
              </div>
            )}
          </div>

          {/* AVAILABILITY ACCORDION */}
          <div className="amiri-refine-section">
            <button 
              type="button"
              className="amiri-refine-section-header"
              onClick={() => toggleAccordion('availability')}
            >
              <span>AVAILABILITY</span>
              {activeFilterAccordion === 'availability' ? <Minus size={11} strokeWidth={1.5} /> : <Plus size={11} strokeWidth={1.5} />}
            </button>
            {activeFilterAccordion === 'availability' && (
              <div className="amiri-refine-section-content">
                <button
                  type="button"
                  className={`amiri-refine-option ${tempAvailability.includes('in-stock') ? 'active' : ''}`}
                  onClick={() => toggleTempFilter(tempAvailability, setTempAvailability, 'in-stock')}
                >
                  <span className="amiri-refine-option-check" />
                  <span>IN STOCK</span>
                </button>
                <button
                  type="button"
                  className={`amiri-refine-option ${tempAvailability.includes('out-of-stock') ? 'active' : ''}`}
                  onClick={() => toggleTempFilter(tempAvailability, setTempAvailability, 'out-of-stock')}
                >
                  <span className="amiri-refine-option-check" />
                  <span>OUT OF STOCK</span>
                </button>
              </div>
            )}
          </div>

          {/* COLOR ACCORDION */}
          {filterOptions.colors.length > 0 && (
            <div className="amiri-refine-section">
              <button 
                type="button"
                className="amiri-refine-section-header"
                onClick={() => toggleAccordion('color')}
              >
                <span>COLOR</span>
                {activeFilterAccordion === 'color' ? <Minus size={11} strokeWidth={1.5} /> : <Plus size={11} strokeWidth={1.5} />}
              </button>
              {activeFilterAccordion === 'color' && (
                <div className="amiri-refine-section-content">
                  {filterOptions.colors.map(col => (
                    <button
                      key={col}
                      type="button"
                      className={`amiri-refine-option ${tempColors.includes(col) ? 'active' : ''}`}
                      onClick={() => toggleTempFilter(tempColors, setTempColors, col)}
                    >
                      <span className="amiri-refine-option-check" />
                      <span>{col}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SIZE ACCORDION */}
          {filterOptions.sizes.length > 0 && (
            <div className="amiri-refine-section">
              <button 
                type="button"
                className="amiri-refine-section-header"
                onClick={() => toggleAccordion('size')}
              >
                <span>SIZE</span>
                {activeFilterAccordion === 'size' ? <Minus size={11} strokeWidth={1.5} /> : <Plus size={11} strokeWidth={1.5} />}
              </button>
              {activeFilterAccordion === 'size' && (
                <div className="amiri-refine-section-content">
                  {filterOptions.sizes.map(sz => (
                    <button
                      key={sz}
                      type="button"
                      className={`amiri-refine-option ${tempSizes.includes(sz) ? 'active' : ''}`}
                      onClick={() => toggleTempFilter(tempSizes, setTempSizes, sz)}
                    >
                      <span className="amiri-refine-option-check" />
                      <span>{sz}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MATERIAL ACCORDION */}
          {filterOptions.materials.length > 0 && (
            <div className="amiri-refine-section">
              <button 
                type="button"
                className="amiri-refine-section-header"
                onClick={() => toggleAccordion('material')}
              >
                <span>MATERIAL</span>
                {activeFilterAccordion === 'material' ? <Minus size={11} strokeWidth={1.5} /> : <Plus size={11} strokeWidth={1.5} />}
              </button>
              {activeFilterAccordion === 'material' && (
                <div className="amiri-refine-section-content">
                  {filterOptions.materials.map(mat => (
                    <button
                      key={mat}
                      type="button"
                      className={`amiri-refine-option ${tempMaterials.includes(mat) ? 'active' : ''}`}
                      onClick={() => toggleTempFilter(tempMaterials, setTempMaterials, mat)}
                    >
                      <span className="amiri-refine-option-check" />
                      <span>{mat}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* REFINE DRAWER FOOTER */}
        <div className="amiri-refine-footer">
          <button 
            type="button" 
            className="amiri-refine-btn-clear"
            onClick={clearFilters}
          >
            CLEAR ALL
          </button>
          <button 
            type="button" 
            className="amiri-refine-btn-view"
            onClick={applyFilters}
          >
            VIEW ({tempFilteredCount})
          </button>
        </div>
      </div>

      <style>{`
        /* AMIRI LUXURY EDITORIAL PLP STYLE REPLICA */
        .amiri-collection-container {
          padding-top: 56px;
          padding-bottom: 120px;
          background-color: #ffffff;
        }

        /* TOP AREA */
        .amiri-collection-top {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          padding: 36px 40px 60px;
          box-sizing: border-box;
        }
        .amiri-collection-title {
          font-family: var(--font-brand), var(--font-serif), serif;
          font-size: clamp(24px, 3.5vw, 36px);
          font-weight: 300;
          color: #000000;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0;
          line-height: 1.2;
        }
        .amiri-refine-trigger {
          position: absolute;
          right: 40px;
          bottom: 60px;
          background: none;
          border: none;
          color: #000000;
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          cursor: pointer;
          padding: 0;
          transition: opacity 0.2s ease;
        }
        .amiri-refine-trigger:hover {
          opacity: 0.6;
        }

        @media (max-width: 767px) {
          .amiri-collection-top {
            padding: 24px 16px 40px;
          }
          .amiri-refine-trigger {
            position: static;
            margin-top: 24px;
          }
        }

        /* GRID SYSTEM */
        .amiri-grid-wrapper {
          padding: 0 40px;
          box-sizing: border-box;
          width: 100%;
        }
        @media (max-width: 767px) {
          .amiri-grid-wrapper {
            padding: 0 16px;
          }
        }

        .amiri-modular-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2px;
          background-color: rgba(0, 0, 0, 0.04); /* hairline dividers */
          box-sizing: border-box;
          border: 1px solid rgba(0, 0, 0, 0.04);
        }
        @media (max-width: 1023px) {
          .amiri-modular-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 767px) {
          .amiri-modular-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1px;
          }
        }

        .amiri-empty-grid {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 120px 24px;
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          letter-spacing: 0.15em;
          color: #888888;
        }

        /* GRID ITEMS */
        .amiri-grid-item {
          background-color: #f6f6f6;
          position: relative;
          box-sizing: border-box;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          text-decoration: none;
          color: inherit;
          aspect-ratio: 3 / 4;
        }

        .amiri-grid-item--span-2 {
          grid-column: span 2;
        }
        .amiri-grid-item--row-2 {
          grid-row: span 2;
        }
        .amiri-grid-item--wide {
          aspect-ratio: 3 / 2;
        }

        @media (max-width: 767px) {
          .amiri-grid-item--span-2 {
            grid-column: span 2;
          }
          .amiri-grid-item--row-2 {
            grid-row: span 2;
          }
        }

        /* PRODUCT CELLS INTERIOR */
        .amiri-product-tag {
          position: absolute;
          top: 20px;
          left: 20px;
          font-family: var(--font-primary), sans-serif;
          font-size: 8.5px;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #888888;
          z-index: 2;
        }

        .amiri-product-img-wrap {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          box-sizing: border-box;
          width: 100%;
          height: 100%;
          position: relative;
          isolation: isolate;
          background-color: #f6f6f6;
        }

        .amiri-product-img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          mix-blend-mode: multiply;
        }

        .amiri-grid-item--product:hover .amiri-product-img {
          transform: scale(1.03);
        }

        /* Optical Scaling classes - Overridden for full fill */
        .amiri-product-img--top,
        .amiri-product-img--pants,
        .amiri-product-img--sneaker,
        .amiri-product-img--accessory {
          width: 100%;
          height: 100%;
          max-width: 100%;
          max-height: 100%;
        }

        .amiri-product-info {
          padding: 20px 24px;
          background-color: #f6f6f6;
          display: flex;
          flex-direction: column;
          gap: 6px;
          box-sizing: border-box;
          z-index: 2;
          width: 100%;
          align-items: flex-start;
          text-align: left;
        }

        .amiri-product-name {
          font-family: var(--font-primary), sans-serif;
          font-size: 9.5px;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #000000;
          margin: 0;
          line-height: 1.3;
          width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .amiri-product-price {
          font-family: var(--font-primary), sans-serif;
          font-size: 9px;
          font-weight: 300;
          color: #555555;
          letter-spacing: 0.08em;
          margin: 0;
        }

        /* LIFESTYLE CELLS INTERIOR */
        .amiri-lifestyle-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* FLOATING MONOGRAM BADGE */
        .amiri-monogram-badge {
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
          color: #ffffff;
          font-family: var(--font-brand);
          font-size: 18px;
          z-index: 999;
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        .amiri-monogram-badge:hover {
          transform: scale(1.05);
        }

        /* REFINE DRAWER OVERLAY */
        .amiri-refine-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.15);
          z-index: 10000;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .amiri-refine-overlay.open {
          opacity: 1;
          pointer-events: all;
        }

        /* REFINE DRAWER */
        .amiri-refine-drawer {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 100%;
          max-width: 360px;
          background-color: #ffffff;
          z-index: 10001;
          transform: translateX(-100%);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          box-shadow: 10px 0 30px rgba(0, 0, 0, 0.02);
        }
        .amiri-refine-drawer.open {
          transform: translateX(0);
        }

        .amiri-refine-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 32px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
        }
        .amiri-refine-header h2 {
          font-family: var(--font-primary), sans-serif;
          font-size: 12px;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #000000;
          margin: 0;
        }
        .amiri-refine-close {
          background: none;
          border: none;
          color: #000000;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.2s ease;
        }
        .amiri-refine-close:hover {
          opacity: 0.6;
        }

        .amiri-refine-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px 32px;
          scrollbar-width: none;
        }
        .amiri-refine-body::-webkit-scrollbar {
          display: none;
        }

        .amiri-refine-section {
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
          padding: 18px 0;
        }
        .amiri-refine-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          background: none;
          border: none;
          padding: 8px 0;
          font-family: var(--font-primary), sans-serif;
          font-size: 10.5px;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #000000;
          cursor: pointer;
          text-align: left;
        }
        .amiri-refine-section-content {
          padding: 12px 0 8px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .amiri-refine-option {
          display: flex;
          align-items: center;
          gap: 10px;
          background: none;
          border: none;
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 300;
          color: #555555;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          cursor: pointer;
          padding: 2px 0;
          text-align: left;
          transition: color 0.2s ease;
        }
        .amiri-refine-option:hover {
          color: #000000;
        }
        .amiri-refine-option.active {
          color: #000000;
          font-weight: 400;
        }
        .amiri-refine-option-check {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: #000000;
          opacity: 0;
          flex-shrink: 0;
        }
        .amiri-refine-option.active .amiri-refine-option-check {
          opacity: 1;
        }

        .amiri-refine-footer {
          padding: 24px 32px;
          border-top: 1px solid rgba(0, 0, 0, 0.04);
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 12px;
          background-color: #ffffff;
        }
        .amiri-refine-btn-clear {
          background-color: #ffffff;
          color: #000000;
          border: 1px solid #000000;
          border-radius: 0;
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 12px;
          cursor: pointer;
          text-align: center;
          transition: opacity 0.2s ease;
        }
        .amiri-refine-btn-view {
          background-color: #000000;
          color: #ffffff;
          border: none;
          border-radius: 0;
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 12px;
          cursor: pointer;
          text-align: center;
          transition: opacity 0.2s ease;
        }
        .amiri-refine-btn-clear:hover,
        .amiri-refine-btn-view:hover {
          opacity: 0.8;
        }

        @media (max-width: 767px) {
          .amiri-refine-drawer {
            max-width: 100%;
          }
        }
      `}</style>
    </>
  );
}
