import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/next';
import { Jost } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { UIProvider } from "@/context/UIContext";
import { CartProvider } from "@/context/CartContext";
import { LocaleProvider } from "@/context/LocaleContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";
import CartDrawer from "@/components/CartDrawer";
import ShippingBanner from "@/components/ShippingBanner";
import MenuDrawer from "@/components/MenuDrawer";

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jost",
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
    <html lang="en" className={jost.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <LocaleProvider>
          <UIProvider>
            <CartProvider>
              <AuthProvider>
              <WishlistProvider>
                <ShippingBanner />
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
