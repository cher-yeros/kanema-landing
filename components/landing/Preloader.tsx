"use client";

import { useEffect, useState } from "react";

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
  return <div id="preloader" />;
}
