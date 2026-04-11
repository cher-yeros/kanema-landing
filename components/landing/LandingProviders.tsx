"use client";

import { useEffect } from "react";
import AOS from "aos";
import PureCounter from "@srexi/purecounterjs";

function navmenuScrollspy() {
  const navmenulinks = document.querySelectorAll(".navmenu a");
  navmenulinks.forEach((navmenulink) => {
    const el = navmenulink as HTMLAnchorElement;
    if (!el.hash) return;
    const section = document.querySelector(el.hash);
    if (!section) return;
    const position = window.scrollY + 200;
    const top = (section as HTMLElement).offsetTop;
    const bottom = top + (section as HTMLElement).offsetHeight;
    if (position >= top && position <= bottom) {
      document
        .querySelectorAll(".navmenu a.active")
        .forEach((link) => link.classList.remove("active"));
        el.classList.add("active");
    } else {
      el.classList.remove("active");
    }
  });
}

function toggleScrolled() {
  const selectBody = document.body;
  const selectHeader = document.querySelector("#header");
  if (!selectHeader) return;
  if (
    !selectHeader.classList.contains("scroll-up-sticky") &&
    !selectHeader.classList.contains("sticky-top") &&
    !selectHeader.classList.contains("fixed-top")
  ) {
    return;
  }
  if (window.scrollY > 100) {
    selectBody.classList.add("scrolled");
  } else {
    selectBody.classList.remove("scrolled");
  }
}

function toggleScrollTop() {
  const scrollTop = document.querySelector(".scroll-top");
  if (!scrollTop) return;
  scrollTop.classList.toggle("active", window.scrollY > 100);
}

function scrollToHash() {
  if (!window.location.hash) return;
  const section = document.querySelector(window.location.hash);
  if (!section) return;
  setTimeout(() => {
    const scrollMarginTop = getComputedStyle(section).scrollMarginTop;
    const top =
      (section as HTMLElement).offsetTop -
      parseInt(scrollMarginTop || "0", 10);
    window.scrollTo({ top, behavior: "smooth" });
  }, 100);
}

export function LandingProviders() {
  useEffect(() => {
    const onScroll = () => {
      toggleScrolled();
      toggleScrollTop();
      navmenuScrollspy();
    };

    const onLoad = () => {
      AOS.refresh();
      scrollToHash();
    };

    AOS.init({
      duration: 600,
      easing: "ease-in-out",
      once: true,
      mirror: false,
    });

    new PureCounter();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("load", onLoad);
    onScroll();
    scrollToHash();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  return null;
}
