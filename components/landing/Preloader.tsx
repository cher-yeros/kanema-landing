"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { BRAND_LOGO_ICON } from "@/lib/brand-assets";

export function Preloader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hide = () => setVisible(false);
    if (document.readyState === "complete") {
      hide();
      return;
    }
    window.addEventListener("load", hide);
    return () => window.removeEventListener("load", hide);
  }, []);

  if (!visible) return null;
  return (
    <div id="preloader" aria-hidden="true">
      <Image
        src={BRAND_LOGO_ICON}
        alt=""
        width={72}
        height={72}
        priority
        className="preloader-logo"
      />
    </div>
  );
}
