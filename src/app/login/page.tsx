"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUI } from "@/context/UIContext";

export default function LoginPage() {
  const router = useRouter();
  const { openAccount } = useUI();

  useEffect(() => {
    // Redirect to homepage and open the Account drawer in-place
    router.replace("/");
    const t = setTimeout(() => {
      openAccount();
    }, 200);
    return () => clearTimeout(t);
  }, [router, openAccount]);

  return (
    <div className="auth-loading-screen">
      <p>Cargando panel de cuenta…</p>
      <style>{`
        .auth-loading-screen {
          background: #ffffff;
          color: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          width: 100vw;
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
}
