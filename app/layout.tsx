import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Family Home | Luxury Villa in Protaras, Cyprus",
  description: "Book direct — FAMILY HOME is a stunning 4-bedroom villa in Protaras, Cyprus. Rated 9.9/10, just 250m from Vyzakia Beach. Free parking, garden, BBQ, WiFi.",
  keywords: ["Protaras villa", "Cyprus holiday home", "family home protaras", "booking family home cyprus", "direct booking protaras"],
  openGraph: {
    title: "Family Home | Luxury Villa in Protaras, Cyprus",
    description: "4-bed luxury villa rated 9.9/10. Book direct and save. Just 250m from the beach.",
    images: [{ url: "/photos/photo-01.jpg", width: 1200, height: 630, alt: "Family Home Protaras" }],
    locale: "en_GB",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-stone-50 text-stone-900 antialiased">
        <nav className="fixed top-0 left-0 right-0 z-40 transition-all duration-300" id="main-nav">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <a href="/" className="text-white font-bold text-xl tracking-tight hover:opacity-90 transition">FAMILY HOME</a>
            <div className="hidden md:flex gap-8 text-sm text-white/80 font-medium">
              <a href="/#about" className="hover:text-amber-400 transition">About</a>
              <a href="/#gallery" className="hover:text-amber-400 transition">Gallery</a>
              <a href="/#reviews" className="hover:text-amber-400 transition">Reviews</a>
              <a href="/#location" className="hover:text-amber-400 transition">Location</a>
              <a href="/#faq" className="hover:text-amber-400 transition">FAQ</a>
            </div>
            <a href="/book" className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-5 py-2 rounded-full text-sm transition-all duration-300 hover:scale-105 shadow-sm">
              Book Direct
            </a>
          </div>
        </nav>
        {/* Nav background on scroll — handled by client JS below */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var nav = document.getElementById('main-nav');
            if (!nav) return;
            window.addEventListener('scroll', function(){
              if (window.scrollY > 80) {
                nav.style.background = 'rgba(28,25,23,0.95)';
                nav.style.backdropFilter = 'blur(12px)';
                nav.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              } else {
                nav.style.background = 'transparent';
                nav.style.backdropFilter = 'none';
                nav.style.boxShadow = 'none';
              }
            });
          })();
        `}} />
        {children}
      </body>
    </html>
  );
}
