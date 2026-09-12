"use client";
import { useEffect, useState } from "react";

const links = [
  { href: "/#about", label: "About" },
  { href: "/#gallery", label: "Gallery" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/#location", label: "Location" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#contact", label: "Contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled || open ? "bg-stone-900/95 backdrop-blur-md shadow-lg" : "bg-gradient-to-b from-black/50 to-transparent"}`}
      aria-label="Primary navigation"
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="text-white font-extrabold text-lg tracking-widest hover:opacity-90 transition" aria-label="Family Home — home">
          FAMILY HOME
        </a>

        <div className="hidden md:flex gap-7 text-sm text-white/80 font-medium">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-amber-400 transition">
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a href="/book" className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-5 py-2 rounded-full text-sm transition hover:scale-105 duration-200">
            Book Direct
          </a>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="md:hidden text-white p-2 -mr-2"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-navigation" className="md:hidden bg-stone-900/95 backdrop-blur-md border-t border-white/10" role="menu">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-6 py-3.5 text-white/80 hover:text-amber-400 hover:bg-white/5 text-sm font-medium transition"
              role="menuitem"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
