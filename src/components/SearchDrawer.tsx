"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUI } from "@/context/UIContext";
import { getProducts, Product } from "@/lib/shopify";

export default function SearchDrawer() {
  const { isSearchOpen, closeSearch } = useUI();
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);

  // Fallback recommended products for "You Might Like"
  const fallbackSuggestions = [
    {
      handle: 'camiseta-espejada',
      title: 'tonet core logo tee',
      price: 350.00,
      imageUrl: '/hero/ComfyUI-main_reference_00012_.png'
    },
    {
      handle: 'sweater-rombos',
      title: 'mx1 classic denim jeans',
      price: 1090.00,
      imageUrl: '/hero/ComfyUI-main_reference_00028_.png'
    },
    {
      handle: 'bolso-heirloom',
      title: 'ma-94 court sneaker',
      price: 790.00,
      imageUrl: '/hero/ComfyUI-main_reference_00020_.png'
    }
  ];

  // Fetch shopify products for suggestions
  useEffect(() => {
    if (!isSearchOpen) return;
    getProducts()
      .then((prods) => {
        if (prods && prods.length > 0) {
          setSuggestedProducts(prods.slice(0, 3));
        } else {
          setSuggestedProducts(fallbackSuggestions);
        }
      })
      .catch(() => {
        setSuggestedProducts(fallbackSuggestions);
      });
  }, [isSearchOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setSearchQuery("");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSearchOpen]);

  // Click outside to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(e.target as Node) &&
        isSearchOpen
      ) {
        closeSearch();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isSearchOpen, closeSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    closeSearch();
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handlePopularSearch = (term: string) => {
    closeSearch();
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  if (!isSearchOpen) return null;

  return (
    <>
      <div className="sd-backdrop open" aria-hidden="true" />
      
      <div className="sd-overlay open" ref={drawerRef} role="dialog" aria-modal="true">
        <div className="sd-container">
          
          {/* Top Bar with Close Button */}
          <div className="sd-topbar">
            <span className="sd-topbar-title">Search</span>
            <button className="sd-close-btn" onClick={closeSearch} aria-label="Close search">
              <X size={20} strokeWidth={1} />
            </button>
          </div>

          {/* Search Input field */}
          <form className="sd-search-form" onSubmit={handleSearchSubmit}>
            <div className="sd-input-wrapper">
              <input
                ref={inputRef}
                type="text"
                className="sd-search-input"
                placeholder="SEARCH"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="sd-search-submit-btn" aria-label="Submit search">
                <Search size={18} strokeWidth={1.2} />
              </button>
            </div>
          </form>

          {/* Search content grid */}
          <div className="sd-grid">
            
            {/* Left Column: Popular Searches */}
            <div className="sd-col-popular">
              <h4 className="sd-section-title">Popular Searches</h4>
              <ul className="sd-popular-list">
                <li>
                  <button onClick={() => handlePopularSearch("skel top")}>
                    skel top
                  </button>
                </li>
                <li>
                  <button onClick={() => handlePopularSearch("ma-1")}>
                    ma-1
                  </button>
                </li>
                <li>
                  <button onClick={() => handlePopularSearch("mx1")}>
                    mx1
                  </button>
                </li>
                <li>
                  <button onClick={() => handlePopularSearch("ma-94")}>
                    ma-94
                  </button>
                </li>
                <li>
                  <button onClick={() => handlePopularSearch("stars")}>
                    stars
                  </button>
                </li>
                <li>
                  <button onClick={() => handlePopularSearch("core logo")}>
                    core logo
                  </button>
                </li>
                <li>
                  <button onClick={() => handlePopularSearch("denim")}>
                    denim
                  </button>
                </li>
              </ul>
            </div>

            {/* Right Column: You Might Like */}
            <div className="sd-col-suggestions">
              <h4 className="sd-section-title">You Might Like</h4>
              <div className="sd-suggestions-grid">
                {suggestedProducts.map((p) => {
                  const image = p.imageUrl || p.images?.[0];
                  const priceStr = typeof p.price === 'number' ? `€${p.price.toFixed(2)}` : p.price;
                  return (
                    <Link
                      href={`/product/${p.handle}`}
                      key={p.handle}
                      className="sd-product-card"
                      onClick={closeSearch}
                    >
                      <div className="sd-product-img-wrap">
                        {image && <img src={image} alt={p.title} className="sd-product-img" />}
                      </div>
                      <div className="sd-product-info">
                        <span className="sd-product-name">{p.title.toLowerCase()}</span>
                        <span className="sd-product-price">{priceStr}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </div>

      <style>{`
        /* BACKDROP */
        .sd-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 1000;
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        .sd-backdrop.open {
          opacity: 1;
        }

        /* OVERLAY CONTAINER */
        .sd-overlay {
          position: fixed;
          top: 0; left: 0; right: 0;
          width: 100%;
          background: #ffffff;
          color: #000000;
          z-index: 1001;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          font-family: var(--font-primary), sans-serif;
          transform: translateY(-100%);
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          overflow-y: auto;
          max-height: 90vh;
          border-bottom: 1px solid #eaeaea;
        }
        .sd-overlay.open {
          transform: translateY(0);
        }

        .sd-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px 40px 60px;
        }

        /* TOPBAR */
        .sd-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .sd-topbar-title {
          font-size: 10px;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: rgba(0, 0, 0, 0.4);
        }
        .sd-close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #000000;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.3s ease;
        }
        .sd-close-btn:hover {
          opacity: 0.6;
        }

        /* INPUT ROW */
        .sd-search-form {
          margin-bottom: 48px;
        }
        .sd-input-wrapper {
          display: flex;
          align-items: center;
          border-bottom: 1px solid #000000;
          padding-bottom: 8px;
        }
        .sd-search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-family: inherit;
          font-size: 24px;
          font-weight: 300;
          letter-spacing: 0.05em;
          color: #000000;
          text-transform: uppercase;
        }
        .sd-search-input::placeholder {
          color: rgba(0, 0, 0, 0.15);
        }
        .sd-search-submit-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #000000;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.3s ease;
        }
        .sd-search-submit-btn:hover {
          opacity: 0.6;
        }

        /* CONTENT GRID */
        .sd-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 48px;
        }
        @media (min-width: 768px) {
          .sd-grid {
            grid-template-columns: 35% 65%;
            gap: 60px;
          }
        }

        .sd-section-title {
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: rgba(0, 0, 0, 0.4);
          margin: 0 0 20px;
          border-bottom: 1px solid #eaeaea;
          padding-bottom: 8px;
        }

        /* POPULAR LIST */
        .sd-popular-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .sd-popular-list button {
          background: none;
          border: none;
          padding: 0;
          text-align: left;
          font-family: inherit;
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #000000;
          cursor: pointer;
          transition: opacity 0.3s ease;
        }
        .sd-popular-list button:hover {
          opacity: 0.6;
        }

        /* SUGGESTIONS PRODUCTS */
        .sd-suggestions-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .sd-product-card {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: #000000;
        }
        .sd-product-img-wrap {
          aspect-ratio: 3 / 4;
          background-color: #fcfcfc;
          overflow: hidden;
          margin-bottom: 12px;
        }
        .sd-product-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: opacity 0.5s ease;
        }
        .sd-product-card:hover .sd-product-img {
          opacity: 0.85;
        }
        .sd-product-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .sd-product-name {
          font-size: 9px;
          font-weight: 400;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          line-height: 1.4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sd-product-price {
          font-size: 9px;
          font-weight: 300;
          color: rgba(0, 0, 0, 0.55);
        }

        /* MOBILE STYLING */
        @media (max-width: 767px) {
          .sd-overlay {
            max-height: 100vh;
            height: 100vh;
            border-bottom: none;
          }
          .sd-container {
            padding: 16px 20px 80px;
          }
          .sd-search-form {
            margin-bottom: 32px;
          }
          .sd-search-input {
            font-size: 18px;
          }
          .sd-grid {
            gap: 36px;
          }
          .sd-suggestions-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .sd-suggestions-grid .sd-product-card:last-child {
            display: none; /* Hide third product card on mobile to balance columns */
          }
          
          /* Active states */
          .sd-popular-list button:active,
          .sd-product-card:active {
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  );
}
