"use client";

export function ScrollTop() {
  return (
    <a
      href="#"
      id="scroll-top"
      className="scroll-top d-flex align-items-center justify-content-center"
      onClick={(e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      <i className="bi bi-arrow-up-short" />
    </a>
  );
}
