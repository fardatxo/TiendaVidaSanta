import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/next';
import { Josefin_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { UIProvider } from "@/context/UIContext";
import { CartProvider } from "@/context/CartContext";
import { LocaleProvider } from "@/context/LocaleContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";
import CartDrawer from "@/components/CartDrawer";
import MenuDrawer from "@/components/MenuDrawer";

const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  weight: ["100", "300", "400", "600", "700"],
  variable: "--font-josefin",
});

export const metadata: Metadata = {
  title: "TONET",
  description: "TONET — Online Store",
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={josefinSans.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <LocaleProvider>
          <UIProvider>
            <CartProvider>
              <AuthProvider>
              <WishlistProvider>
                <div style={{
                  width: '100%',
                  background: '#000',
                  borderBottom: 'none',
                  textAlign: 'center',
                  padding: '3px 16px',
                  fontSize: '10px',
                  fontWeight: 400,
                  letterSpacing: '0.06em',
                  color: '#fff',
                }}>
                  Free shipping to Spain on all orders
                </div>
                <Navbar />
                <CartDrawer />
                <MenuDrawer />
                <main>{children}</main>
                <Footer />
                <Analytics />
              </WishlistProvider>
              </AuthProvider>
            </CartProvider>
          </UIProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
