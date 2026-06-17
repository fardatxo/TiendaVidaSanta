import Link from "next/link";
import HomeSnapInitializer from "@/components/HomeSnapInitializer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "TONET | Official Online Store",
  description: "Explore the TONET Pre-Fall 2026 Collection, Men's and Women's New Arrivals, and iconic California streetwear.",
};

export default async function Home() {
  return (
    <div className="am-home">
      <HomeSnapInitializer />

      {/* 1. HERO CAMPAIGN BANNER: PRE-FALL 2026 */}
      <section className="am-hero">
        <div className="am-hero-media">
          <video
            src="/hero-video.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="am-hero-video"
          />
        </div>
        <div className="am-hero-overlay">
          <div className="am-hero-content">
            <h2 className="am-hero-title">Pre-Fall 2026 Collection</h2>
            <Link href="/collection/pre-fall-2026" className="am-hero-cta">Discover</Link>
          </div>
        </div>
      </section>

      {/* 2. SPLIT ARRIVALS: MEN'S & WOMEN'S NEW ARRIVALS */}
      <section className="am-split-grid">
        <div className="am-split-col">
          <div className="am-split-media">
            <img src="/hero/ComfyUI-main_reference_00020_.png" alt="men's new arrivals" className="am-split-img" />
          </div>
          <div className="am-split-content">
            <h3 className="am-split-title">Men's New Arrivals</h3>
            <Link href="/collection/mens-new-arrivals" className="am-split-cta">Shop Now</Link>
          </div>
        </div>
        <div className="am-split-col">
          <div className="am-split-media">
            <img src="/hero/ComfyUI-main_reference_00016_.png" alt="women's new arrivals" className="am-split-img" />
          </div>
          <div className="am-split-content">
            <h3 className="am-split-title">Women's New Arrivals</h3>
            <Link href="/collection/womens-new-arrivals" className="am-split-cta">Shop Now</Link>
          </div>
        </div>
      </section>

      {/* 4. LANDSCAPE HIGHLIGHT: SNEAKER MA-94 */}
      <section className="am-landscape">
        <div className="am-landscape-media">
          <img src="/hero/hero_garden_landscape.png" alt="discover ma-94 sneaker campaign" className="am-landscape-img" />
        </div>
        <div className="am-landscape-overlay">
          <div className="am-landscape-content">
            <h2 className="am-landscape-title">Discover MA-94</h2>
            <Link href="/collection/ma-94" className="am-landscape-cta">Discover</Link>
          </div>
        </div>
      </section>

      {/* 5. TRIPLE CORE CATEGORY GRID: DENIM, EYEWEAR, HANDBAGS */}
      <section className="am-triple-grid">
        <div className="am-triple-col">
          <div className="am-triple-media">
            <img src="/hero/ComfyUI-main_reference_00028_.png" alt="men's denim" className="am-triple-img" />
          </div>
          <div className="am-triple-content">
            <h4 className="am-triple-title">Men's Denim</h4>
            <Link href="/collection/mens-denim" className="am-triple-cta">Shop Now</Link>
          </div>
        </div>
        <div className="am-triple-col">
          <div className="am-triple-media">
            <img src="/hero/ComfyUI-main_reference_00022_.png" alt="eyewear" className="am-triple-img" />
          </div>
          <div className="am-triple-content">
            <h4 className="am-triple-title">Eyewear</h4>
            <Link href="/collection/eyewear" className="am-triple-cta">Shop Now</Link>
          </div>
        </div>
        <div className="am-triple-col">
          <div className="am-triple-media">
            <img src="/hero/ComfyUI-main_reference_00018_.png" alt="handbags" className="am-triple-img" />
          </div>
          <div className="am-triple-content">
            <h4 className="am-triple-title">Handbags</h4>
            <Link href="/collection/handbags" className="am-triple-cta">Shop Now</Link>
          </div>
        </div>
      </section>

      {/* 6. BRAND WORLD: RUNWAYS, CAMPAIGNS, HERITAGE */}
      <section className="am-brand-world">
        <h3 className="am-section-title">World of Tonet</h3>
        <div className="am-world-grid">
          <div className="am-world-card">
            <div className="am-world-media">
              <img src="/hero/collection_garden_landscape.png" alt="runways" className="am-world-img" />
            </div>
            <div className="am-world-content">
              <h4 className="am-world-card-title">Runways</h4>
              <Link href="/collection/runways" className="am-world-cta">View Collection</Link>
            </div>
          </div>
          <div className="am-world-card">
            <div className="am-world-media">
              <img src="/hero/world_garden_landscape.png" alt="campaigns" className="am-world-img" />
            </div>
            <div className="am-world-content">
              <h4 className="am-world-card-title">Campaigns</h4>
              <Link href="/collection/campaigns" className="am-world-cta">Explore</Link>
            </div>
          </div>
          <div className="am-world-card">
            <div className="am-world-media">
              <img src="/hero/journal_garden_landscape_1.png" alt="heritage" className="am-world-img" />
            </div>
            <div className="am-world-content">
              <h4 className="am-world-card-title">Savoir-Faire</h4>
              <Link href="/about" className="am-world-cta">Read Story</Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        html.home-snap-active {
          scroll-snap-type: y mandatory;
          scroll-behavior: smooth;
        }
        html.home-snap-active footer {
          scroll-snap-align: end;
        }

        .am-home {
          background-color: #ffffff;
          color: #000000;
          font-family: var(--font-primary), sans-serif;
          width: 100%;
        }

        /* ── HERO ── */
        .am-hero {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background: #ffffff;
          scroll-snap-align: start;
          scroll-snap-stop: always;
        }
        .am-hero-media {
          width: 100%;
          height: 100%;
        }
        .am-hero-img,
        .am-hero-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .am-hero-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: flex-end;
          justify-content: flex-start;
          padding: 60px 48px;
        }
        .am-hero-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
        }
        .am-hero-title {
          font-family: var(--font-cormorant), Georgia, serif;
          font-size: 36px;
          font-weight: 300;
          color: #ffffff;
          margin: 0;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .am-hero-cta {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.15em;
          color: #ffffff;
          text-transform: uppercase;
          text-decoration: underline;
          text-underline-offset: 4px;
          transition: opacity 0.3s;
        }
        .am-hero-cta:hover {
          opacity: 0.7;
        }

        /* ── SECTION TITLE ── */
        .am-section-title {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-align: center;
          margin: 0 0 40px;
          text-transform: uppercase;
          color: #000000;
        }

        /* ── SPLIT ARRIVALS ── */
        .am-split-grid {
          display: grid;
          grid-template-columns: 1fr;
          width: 100%;
          border-bottom: 1px solid #eaeaea;
          height: 100vh;
          scroll-snap-align: start;
          scroll-snap-stop: always;
        }
        @media (min-width: 768px) {
          .am-split-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .am-split-col {
          position: relative;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        @media (min-width: 768px) {
          .am-split-col:first-child {
            border-right: 1px solid #eaeaea;
          }
        }
        .am-split-media {
          width: 100%;
          flex: 1 1 auto;
          overflow: hidden;
          background: #fcfcfc;
        }
        .am-split-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .am-split-content {
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-align: center;
          flex: 0 0 auto;
        }
        .am-split-title {
          font-size: 14px;
          font-weight: 400;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin: 0;
          color: #000000;
        }
        .am-split-cta {
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.15em;
          color: #000000;
          text-transform: uppercase;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: opacity 0.3s;
        }
        .am-split-cta:hover {
          opacity: 0.6;
        }

        /* ── LANDSCAPE ── */
        .am-landscape {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background: #ffffff;
          border-bottom: 1px solid #eaeaea;
          scroll-snap-align: start;
          scroll-snap-stop: always;
        }
        .am-landscape-media {
          width: 100%;
          height: 100%;
        }
        .am-landscape-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .am-landscape-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: flex-end;
          justify-content: flex-start;
          padding: 48px;
        }
        .am-landscape-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
        .am-landscape-title {
          font-family: var(--font-cormorant), Georgia, serif;
          font-size: 28px;
          font-weight: 300;
          color: #ffffff;
          margin: 0;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .am-landscape-cta {
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.15em;
          color: #ffffff;
          text-transform: uppercase;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: opacity 0.3s;
        }
        .am-landscape-cta:hover {
          opacity: 0.7;
        }

        /* ── TRIPLE GRID ── */
        .am-triple-grid {
          display: grid;
          grid-template-columns: 1fr;
          width: 100%;
          border-bottom: 1px solid #eaeaea;
          height: 100vh;
          scroll-snap-align: start;
          scroll-snap-stop: always;
        }
        @media (min-width: 768px) {
          .am-triple-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .am-triple-col {
          display: flex;
          flex-direction: column;
          position: relative;
          height: 100%;
        }
        @media (min-width: 768px) {
          .am-triple-col:not(:last-child) {
            border-right: 1px solid #eaeaea;
          }
        }
        .am-triple-media {
          width: 100%;
          flex: 1 1 auto;
          overflow: hidden;
          background: #fcfcfc;
        }
        .am-triple-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .am-triple-content {
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          text-align: center;
          flex: 0 0 auto;
        }
        .am-triple-title {
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin: 0;
          color: #000000;
        }
        .am-triple-cta {
          font-size: 9px;
          font-weight: 400;
          letter-spacing: 0.15em;
          color: #000000;
          text-transform: uppercase;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: opacity 0.3s;
        }
        .am-triple-cta:hover {
          opacity: 0.6;
        }

        /* ── BRAND WORLD ── */
        .am-brand-world {
          padding: 80px 48px;
          height: 100vh;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: center;
          scroll-snap-align: start;
          scroll-snap-stop: always;
        }
        .am-world-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          flex: 1;
        }
        @media (min-width: 768px) {
          .am-world-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }
        }
        .am-world-card {
          display: flex;
          flex-direction: column;
          position: relative;
          height: 100%;
        }
        .am-world-media {
          width: 100%;
          flex: 1 1 auto;
          overflow: hidden;
          background: #fcfcfc;
          margin-bottom: 20px;
        }
        .am-world-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: opacity 0.5s ease;
        }
        .am-world-card:hover .am-world-img {
          opacity: 0.85;
        }
        .am-world-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          text-align: center;
          flex: 0 0 auto;
        }
        .am-world-card-title {
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin: 0;
          color: #000000;
        }
        .am-world-cta {
          font-size: 9px;
          font-weight: 400;
          letter-spacing: 0.15em;
          color: rgba(0, 0, 0, 0.55);
          text-transform: uppercase;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.3s;
        }
        .am-world-cta:hover {
          color: #000000;
        }

        /* ── MOBILE OVERRIDES ── */
        @media (max-width: 767px) {
          .am-hero {
            height: 100vh;
          }
          .am-hero-overlay {
            padding: 40px 20px;
          }
          .am-hero-title {
            font-size: 26px;
          }
          .am-split-grid {
            grid-template-columns: 1fr;
            height: auto;
            scroll-snap-align: none;
            scroll-snap-stop: none;
            border-bottom: none;
          }
          .am-split-col {
            height: 100vh;
            scroll-snap-align: start;
            scroll-snap-stop: always;
          }
          .am-split-col:not(:last-child) {
            border-bottom: 1px solid #eaeaea;
          }
          .am-split-content {
            padding: 24px 16px;
          }
          .am-split-title {
            font-size: 12px;
          }
          .am-landscape {
            height: 100vh;
          }
          .am-landscape-overlay {
            padding: 32px 20px;
          }
          .am-landscape-title {
            font-size: 22px;
          }
          .am-triple-grid {
            grid-template-columns: 1fr;
            height: auto;
            scroll-snap-align: none;
            scroll-snap-stop: none;
            border-bottom: none;
          }
          .am-triple-col {
            height: 100vh;
            scroll-snap-align: start;
            scroll-snap-stop: always;
          }
          .am-triple-col:not(:last-child) {
            border-bottom: 1px solid #eaeaea;
          }
          .am-triple-content {
            padding: 20px 16px;
          }
          .am-triple-title {
            font-size: 11px;
          }
          .am-brand-world {
            padding: 40px 20px;
            height: auto;
            scroll-snap-align: none;
            scroll-snap-stop: none;
          }
          .am-world-grid {
            gap: 0px;
          }
          .am-world-card {
            height: 100vh;
            scroll-snap-align: start;
            scroll-snap-stop: always;
            justify-content: center;
            padding: 40px 0;
            box-sizing: border-box;
          }
          .am-world-card:not(:last-child) {
            border-bottom: 1px solid #eaeaea;
          }
          .am-world-media {
            margin-bottom: 16px;
          }
          .am-world-card-title {
            font-size: 12px;
          }
          
          /* Active feedbacks */
          .am-prod-card:active,
          .am-split-cta:active,
          .am-hero-cta:active,
          .am-landscape-cta:active,
          .am-triple-cta:active,
          .am-world-cta:active {
            opacity: 0.5;
          }
        }
      `}</style>

    </div>
  );
}
