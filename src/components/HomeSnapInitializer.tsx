"use client";

import { useEffect } from "react";

export default function HomeSnapInitializer() {
  useEffect(() => {
    document.documentElement.classList.add("home-snap-active");
    return () => {
      document.documentElement.classList.remove("home-snap-active");
    };
  }, []);

  return null;
}
