"use client";
import { useState, useEffect, useRef } from "react";

/* ── scroll-reveal hook ── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, className = "", delay = "" }: { children: React.ReactNode; className?: string; delay?: string }) {
  const ref = useReveal();
  return <div ref={ref} className={`reveal ${delay} ${className}`}>{children}</div>;
}

/* ── lightbox ── */
function Lightbox({ index, onClose, onPrev, onNext }: { index: number; onClose: () => void; onPrev: () => void; onNext: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center lightbox-overlay" onClick={onClose}>
      <button className="absolute top-5 right-5 text-white/80 hover:text-white text-4xl z-50 w-12 h-12 flex items-center justify-center" onClick={onClose}>✕</button>
      <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-5xl z-50 w-14 h-14 flex items-center justify-center rounded-full hover:bg-white/10 transition" onClick={(e) => { e.stopPropagation(); onPrev(); }}>‹</button>
      <img
        src={`/photos/photo-${String(index + 1).padStart(2, "0")}.jpg`}
        alt={`Photo ${index + 1}`}
        className="max-w-[92vw] max-h-[88vh] object-contain rounded-lg shadow-2xl select-none"
        onClick={(e) => e.stopPropagation()}
        draggable={false}
      />
      <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-5xl z-50 w-14 h-14 flex items-center justify-center rounded-full hover:bg-white/10 transition" onClick={(e) => { e.stopPropagation(); onNext(); }}>›</button>
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium">
        {index + 1} / 36
      </div>
    </div>
  );
}

/* ── FAQ accordion ── */
function AccordionItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden hover-lift">
      <button
        className="w-full flex items-center justify-between p-6 text-left hover:bg-stone-50/50 transition"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-stone-800 pr-4">{question}</span>
        <span className={`text-amber-500 text-xl transition-transform duration-300 ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-6 pb-6 text-stone-600 leading-relaxed">{answer}</div>
      </div>
    </div>
  );
}

/* ── main page ── */
export default function Home() {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <main>
      {/* ── Hero ── */}
      <section className="relative h-screen min-h-[650px] overflow-hidden">
        <div className="absolute inset-0">
          <img src="/photos/photo-01.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-6 hero-stagger">
          <span className="badge bg-amber-500/20 text-amber-300 border border-amber-400/30 mb-6">Protaras, Cyprus</span>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold mb-4 tracking-tight">Family Home</h1>
          <p className="text-lg md:text-xl mb-10 max-w-2xl text-white/80 font-light leading-relaxed">
            Where luxury meets family comfort — your private paradise just steps from Protaras&apos; finest beaches.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="/book" className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-10 py-4 rounded-full text-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-amber-500/25">
              Check Availability
            </a>
            <a href="#gallery" className="border-2 border-white/30 hover:border-white/60 hover:bg-white/10 text-white font-semibold px-10 py-4 rounded-full text-lg transition-all duration-300">
              View Gallery
            </a>
          </div>
          <div className="mt-14 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-white/70">
            <span>⭐ <strong className="text-white">9.9</strong> Rating</span>
            <span>🛏 <strong className="text-white">4</strong> Bedrooms</span>
            <span>🛁 <strong className="text-white">2</strong> Bathrooms</span>
            <span>👥 <strong className="text-white">7</strong> Guests</span>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/60">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <span className="badge bg-amber-100 text-amber-700 mb-4">About the Villa</span>
              <h2 className="text-4xl font-bold mb-6 text-stone-800 leading-tight">A Home Away<br/>From Home</h2>
              <p className="text-stone-600 leading-relaxed mb-4 text-lg">
                An almost-new private villa with a beautiful garden, situated on a quiet private street just 250 meters from the lovely sandy beach of Vyzakia.
              </p>
              <p className="text-stone-500 leading-relaxed mb-6">
                Close to the heart of Protaras&apos; restaurants and nightlife, yet peaceful and private. Your host&apos;s promise is simple — <em>&ldquo;To get my customers happy.&rdquo;</em> Languages: Greek, English. Licence ΑΕΜΑΚ - ΑΜΜ 0001322.
              </p>
              <div className="flex gap-4">
                <a href="#gallery" className="text-amber-600 hover:text-amber-700 font-semibold transition">Gallery →</a>
                <a href="/book" className="text-stone-600 hover:text-stone-800 font-semibold transition">Book now →</a>
              </div>
            </Reveal>
            <Reveal delay="reveal-delay-2" className="grid grid-cols-2 gap-4">
              <div className="img-zoom rounded-2xl overflow-hidden shadow-lg row-span-2">
                <img src="/photos/photo-05.jpg" alt="Villa exterior" className="w-full h-full object-cover" />
              </div>
              <div className="img-zoom rounded-2xl overflow-hidden shadow-md">
                <img src="/photos/photo-10.jpg" alt="Living area" className="w-full h-full object-cover" />
              </div>
              <div className="img-zoom rounded-2xl overflow-hidden shadow-md">
                <img src="/photos/photo-15.jpg" alt="Bedroom" className="w-full h-full object-cover" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Highlights ── */}
      <Reveal className="py-16 bg-stone-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "📍", title: "Prime Location", desc: "Ithakis 21A, 5297 Protaras — just 250m walk to Vyzakia Beach, close to shops and restaurants" },
              { icon: "👨‍👩‍👧‍👦", title: "Perfect For Families", desc: "Up to 7 guests · 2 queen + 1 twin + 2 twin beds · Free cots available on request" },
              { icon: "⭐", title: "9.9 Rating", desc: "Exceptional rating on Booking.com based on 29 reviews from satisfied guests worldwide" },
            ].map((item, i) => (
              <div key={i} className={`bg-white rounded-2xl p-8 shadow-sm hover-lift reveal-delay-${i + 1}`}>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-stone-800 mb-2 text-lg">{item.title}</h3>
                <p className="text-stone-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ── Amenities ── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="text-center mb-12">
            <span className="badge bg-amber-100 text-amber-700 mb-4">What&apos;s Included</span>
            <h2 className="text-3xl font-bold text-stone-800">Everything You Need</h2>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[
              { icon: "📶", name: "Free WiFi", desc: "High-speed" },
              { icon: "🅿️", name: "Free Parking", desc: "Private space" },
              { icon: "❄️", name: "A/C", desc: "Every room" },
              { icon: "🍳", name: "Full Kitchen", desc: "Equipped" },
              { icon: "🔥", name: "BBQ Area", desc: "Outdoor" },
              { icon: "🌻", name: "Garden", desc: "Private" },
              { icon: "👕", name: "Washer", desc: "In-unit" },
              { icon: "📺", name: "Smart TV", desc: "Streaming" },
              { icon: "👶", name: "Baby Gear", desc: "Cots & playpen" },
              { icon: "🚭", name: "No Smoking", desc: "Smoke-free" },
              { icon: "🐾", name: "No Pets", desc: "Pet-free" },
              { icon: "☀️", name: "Sun Terrace", desc: "Alfresco" },
            ].map((item, i) => (
              <Reveal key={i} delay={`reveal-delay-${(i % 3) + 1}`}>
                <div className="bg-stone-50 rounded-xl p-5 text-center hover-lift group">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{item.icon}</div>
                  <h3 className="font-semibold text-stone-800 text-sm">{item.name}</h3>
                  <p className="text-xs text-stone-500 mt-0.5">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gallery ── */}
      <section id="gallery" className="py-24 bg-stone-100">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="text-center mb-12">
            <span className="badge bg-amber-100 text-amber-700 mb-4">Explore</span>
            <h2 className="text-3xl font-bold text-stone-800">Our Villa</h2>
            <p className="text-stone-600 mt-2">36 photos — click any image for full-size view</p>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 36 }, (_, i) => (
              <button
                key={i}
                onClick={() => setLightbox(i)}
                className="aspect-square overflow-hidden rounded-xl cursor-pointer img-zoom shadow-sm hover:shadow-xl transition-shadow duration-300"
              >
                <img
                  src={`/photos/photo-${String(i + 1).padStart(2, "0")}.jpg`}
                  alt={`Photo ${i + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <Lightbox
          index={lightbox}
          onClose={() => setLightbox(null)}
          onPrev={() => setLightbox(lightbox > 0 ? lightbox - 1 : 35)}
          onNext={() => setLightbox(lightbox < 35 ? lightbox + 1 : 0)}
        />
      )}

      {/* ── Reviews ── */}
      <section id="reviews" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="text-center mb-12">
            <span className="badge bg-amber-100 text-amber-700 mb-4">Testimonials</span>
            <h2 className="text-3xl font-bold text-stone-800">What Guests Say</h2>
          </Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Mac", country: "🇬🇧 UK", text: "Amazing place, truly 10/10. Great location with couple minutes walk to the beach, 5-10 minutes to major view points, attractions and shops." },
              { name: "Lynn", country: "🇬🇧 UK", text: "Great property very close to the beach, but far enough so we could have some peace and quiet. Easy walk to main restaurants and shops. Very clean and comfortable." },
              { name: "Marta", country: "🇵🇱 Poland", text: "The house is large, comfortable and clean. It was wonderful to eat and relax in the well-kept garden under the sun umbrellas." },
              { name: "Dario", country: "🇷🇸 Serbia", text: "Great accommodation, and an even better host who was there for everything we needed. We can't wait to come again." },
            ].map((r, i) => (
              <Reveal key={i} delay={`reveal-delay-${(i % 3) + 1}`}>
                <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 hover-lift">
                  <div className="text-amber-400 text-sm mb-4 tracking-wide">★★★★★</div>
                  <p className="text-stone-700 italic mb-5 leading-relaxed">&ldquo;{r.text}&rdquo;</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-stone-800">{r.name}</p>
                      <p className="text-xs text-stone-500">{r.country}</p>
                    </div>
                    <span className="bg-amber-100 text-amber-700 font-bold text-sm px-3 py-1 rounded-full">9.9</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Location ── */}
      <section id="location" className="py-24 bg-stone-100">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="text-center mb-12">
            <span className="badge bg-amber-100 text-amber-700 mb-4">Where We Are</span>
            <h2 className="text-3xl font-bold text-stone-800">Location & Nearby</h2>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-12">
            <Reveal>
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg h-[420px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31968.0!2d35.0421!3d34.9853!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14e13c7b3e3b4d3b%3A0x0!2sProtaras%2C%20Cyprus!5e0!3m2!1sen!2sus"
                  width="100%" height="100%" style={{ border: 0 }} allowFullScreen={true} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </Reveal>
            <Reveal delay="reveal-delay-2" className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm hover-lift">
                <h3 className="font-bold text-stone-800 mb-4 text-lg">Nearby</h3>
                <ul className="space-y-3">
                  {[
                    { emoji: "🏖", name: "Vyzakia Beach", time: "3 min walk" },
                    { emoji: "🏖", name: "Konnos Sandy Beach", time: "25 min walk" },
                    { emoji: "🌲", name: "Cape Greco National Park", time: "6 km drive" },
                    { emoji: "🏪", name: "Protaras Centre", time: "10 min walk" },
                    { emoji: "🐠", name: "Aquaworld Aquarium", time: "8 min walk" },
                    { emoji: "✈️", name: "Larnaca Airport", time: "60 km" },
                  ].map((p, i) => (
                    <li key={i} className="flex items-center gap-3 text-stone-700">
                      <span className="text-xl w-7 text-center">{p.emoji}</span>
                      <div className="flex-1">
                        <p className="font-medium">{p.name}</p>
                      </div>
                      <span className="text-sm text-stone-500">{p.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm hover-lift">
                <h3 className="font-bold text-stone-800 mb-4 text-lg">House Rules</h3>
                <ul className="space-y-2 text-stone-700 text-sm">
                  <li className="flex justify-between"><span>Check-in</span><span className="font-medium">3 PM – 7 PM</span></li>
                  <li className="flex justify-between"><span>Check-out</span><span className="font-medium">11:30 AM</span></li>
                  <li className="flex justify-between"><span>Damage deposit</span><span className="font-medium">€200</span></li>
                  <li className="flex justify-between"><span>Children</span><span className="font-medium">Welcome</span></li>
                  <li className="flex justify-between"><span>Smoking / Pets</span><span className="font-medium">Not allowed</span></li>
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <Reveal className="text-center mb-12">
            <span className="badge bg-amber-100 text-amber-700 mb-4">Help</span>
            <h2 className="text-3xl font-bold text-stone-800">Frequently Asked Questions</h2>
          </Reveal>
          <div className="space-y-3">
            {[
              { q: "Can I book directly without a commission?", a: "Yes! By booking through our site you save the 15-20% commission that OTAs charge. This means better value for you and instant confirmation." },
              { q: "What payment methods do you accept?", a: "We accept all major credit and debit cards through secure Stripe payments. A 30% deposit secures your booking, with the balance due before arrival." },
              { q: "Is the villa suitable for young children?", a: "Absolutely! We provide free cots and playpens. The villa is child-safe with gated garden access. Many of our families return year after year." },
              { q: "How early can I check in / late check out?", a: "Standard check-in is 3 PM – 7 PM. Early/late arrangements are possible upon request subject to availability — contact us directly." },
              { q: "Is parking available?", a: "Yes, free private parking is available at the property. There is plenty of space for multiple vehicles." },
              { q: "Can I cancel my booking?", a: "We offer flexible cancellation — full refund up to 7 days before check-in. Cancellations within 7 days forfeit the deposit." },
            ].map((item, i) => (
              <AccordionItem key={i} question={item.q} answer={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="py-24 bg-stone-50">
        <div className="max-w-4xl mx-auto px-6">
          <Reveal className="text-center mb-12">
            <span className="badge bg-amber-100 text-amber-700 mb-4">Get In Touch</span>
            <h2 className="text-3xl font-bold text-stone-800">Questions? We&apos;re Happy to Help</h2>
            <p className="text-stone-600 mt-3 max-w-xl mx-auto">Reach out for availability on dates that don&apos;t work with the calendar, longer stays, group bookings, or anything else about your stay.</p>
          </Reveal>
          <Reveal delay="reveal-delay-1">
            <div className="grid sm:grid-cols-3 gap-4">
              <a href="mailto:yiannis@yiangouweb.com" className="bg-white rounded-2xl p-6 text-center hover-lift border border-stone-200">
                <div className="text-3xl mb-3">✉️</div>
                <h3 className="font-semibold text-stone-800">Email</h3>
                <p className="text-sm text-stone-500 mt-1 break-all">yiannis@yiangouweb.com</p>
              </a>
              <a href="https://wa.me/" className="bg-white rounded-2xl p-6 text-center hover-lift border border-stone-200">
                <div className="text-3xl mb-3">💬</div>
                <h3 className="font-semibold text-stone-800">WhatsApp</h3>
                <p className="text-sm text-stone-500 mt-1">Fastest reply — usually within hours</p>
              </a>
              <a href="https://www.booking.com/hotel/cy/family-home.html" target="_blank" rel="noopener noreferrer" className="bg-white rounded-2xl p-6 text-center hover-lift border border-stone-200">
                <div className="text-3xl mb-3">🏨</div>
                <h3 className="font-semibold text-stone-800">Booking.com</h3>
                <p className="text-sm text-stone-500 mt-1">Prefer an OTA? See our listing</p>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-28 bg-stone-900 overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <img src="/photos/photo-01.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <Reveal>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Book?</h2>
            <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto font-light">
              Book direct and save — skip the commission, get instant confirmation, and enjoy the best rate guaranteed.
            </p>
            <a href="/book" className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-bold px-14 py-5 rounded-full text-xl transition-all duration-300 hover:scale-105 shadow-xl shadow-amber-500/20">
              Check Availability →
            </a>
          </Reveal>
        </div>
      </section>

      {/* ── Trust badges ── */}
      <section className="py-10 bg-white">
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap justify-center gap-x-10 gap-y-4 text-stone-500 text-sm">
          {[
            { color: "text-green-600", label: "Secure Payment" },
            { color: "text-blue-600", label: "Instant Confirmation" },
            { color: "text-purple-600", label: "Best Rate Guarantee" },
            { color: "text-orange-600", label: "Licensed Property" },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-2">
              <svg className={`w-5 h-5 ${b.color}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              <span className="font-medium">{b.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-stone-900 text-stone-400 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-3">Family Home</h3>
              <p className="text-sm leading-relaxed">A luxury 4-bedroom villa in Protaras, Cyprus. Rated 9.9/10 by our guests.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="hover:text-white transition">About</a></li>
                <li><a href="#gallery" className="hover:text-white transition">Gallery</a></li>
                <li><a href="#reviews" className="hover:text-white transition">Reviews</a></li>
                <li><a href="/book" className="hover:text-white transition">Book Direct</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Contact</h4>
              <p className="text-sm">Ithakis 21A, 5297 Protaras, Cyprus</p>
              <p className="text-sm mt-1">Licence ΑΕΜΑΚ - ΑΜΜ 0001322</p>
            </div>
          </div>
          <div className="border-t border-stone-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>© {new Date().getFullYear()} Family Home Protaras. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="/admin" className="hover:text-white transition">Admin</a>
              <a href="https://www.booking.com/hotel/cy/family-home.html" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Booking.com</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
