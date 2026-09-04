
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";

async function getStats() {
  try {
    const count = await prisma.booking.count({ where: { status: "confirmed" } });
    return count;
  } catch {
    return null;
  }
}

export const dynamic = "force-dynamic";

export default async function Home() {
  const stats = await getStats();
  const photos = Array.from({ length: 36 }, (_, i) => `/photos/photo-${String(i + 1).padStart(2, "0")}.jpg`);

  return (
    <main>
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[400px] w-full overflow-hidden">
        <Image
          src="/photos/photo-01.jpg"
          alt="Family Home Protaras villa exterior"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="relative z-10 flex h-full flex-col justify-end p-6 md:p-12 text-white max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-2 drop-shadow-lg">Family Home</h1>
          <p className="text-xl md:text-2xl mb-1 drop-shadow">Protaras, Cyprus</p>
          <p className="text-lg opacity-90 drop-shadow">4 bedrooms · 2 bathrooms · 250m from the beach · Rated 9.9/10</p>
          <Link
            href="/book"
            className="mt-6 inline-block bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8 py-3 rounded-lg text-lg w-fit shadow-lg transition"
          >
            Book direct →
          </Link>
        </div>
      </section>

      {/* Highlights */}
      <section className="max-w-5xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-6">
        {[
          { k: "Location", v: "Ithakis 21A, 5297 Protaras — 250m walk to Vyzakia Beach" },
          { k: "Capacity", v: "Up to 7 guests · 1 queen + 1 queen + 1 twin + 2 twin beds" },
          { k: "Rating", v: "9.9 / 10 on Booking.com (29 reviews)" },
        ].map((h) => (
          <div key={h.k} className="bg-white rounded-xl shadow-sm p-6 border border-stone-200">
            <h3 className="font-semibold text-amber-700 mb-1">{h.k}</h3>
            <p className="text-stone-700">{h.v}</p>
          </div>
        ))}
      </section>

      {/* About */}
      <section className="max-w-5xl mx-auto px-6 py-8 prose">
        <h2>About the villa</h2>
        <p>
          An almost-new private home with a beautiful garden, situated on a quiet private street just 250 meters
          from a lovely sandy beach. Close to the heart of Protaras&apos; restaurants and nightlife, yet peaceful
          and private. Free private parking, fully equipped kitchen, garden with BBQ, sun terrace.
        </p>
        <p>
          Your host: &ldquo;My promise is to get my customers happy.&rdquo;
          <br />
          Languages spoken: Greek, English. Licence ΑΕΜΑΚ - ΑΜΜ 0001322.
        </p>
      </section>

      {/* Amenities */}
      <section className="bg-white border-y border-stone-200 py-12">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-6">Amenities</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              "Free WiFi", "Free private parking", "Air conditioning",
              "Fully equipped kitchen", "BBQ facilities", "Sun terrace & garden",
              "Washing machine", "Balcony with garden views", "Flat-screen TV",
              "Cots / playpen on request", "No smoking", "No pets",
            ].map((a) => (
              <div key={a} className="flex items-center gap-2">
                <span className="text-amber-600">✓</span>
                <span>{a}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-6">Gallery</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {photos.map((src, i) => (
            <a key={src} href={src} target="_blank" rel="noopener" className="block aspect-[4/3] overflow-hidden rounded-lg hover:opacity-90">
              <Image
                src={src}
                alt={`Photo ${i + 1}`}
                width={400}
                height={300}
                sizes="(max-width: 768px) 50vw, 25vw"
                className="w-full h-full object-cover"
              />
            </a>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-stone-100 py-12">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-6">What guests say</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { n: "Mac (UK)", q: "Amazing place, truly 10/10. Great location with couple minutes walk to the beach, 5-10 minutes to major view points, attractions and shops." },
              { n: "Lynn (UK)", q: "Great property very close to the beach, but far enough so we could have some peace and quiet. Easy walk to main restaurants and shops. Very clean and comfortable." },
              { n: "Marta (Poland)", q: "The house is large, comfortable and clean. It was wonderful to eat and relax in the well-kept garden under the sun umbrellas." },
              { n: "Dario (Serbia)", q: "Great accommodation, and an even better host who was there for everything we needed. We can't wait to come again." },
            ].map((r) => (
              <div key={r.n} className="bg-white rounded-xl p-5 shadow-sm border border-stone-200">
                <p className="italic text-stone-700 mb-3">&ldquo;{r.q}&rdquo;</p>
                <p className="text-sm font-semibold text-stone-500">— {r.n}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location + Nearby */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-6">Location &amp; nearby</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-stone-200">
            <ul className="space-y-1 text-stone-700">
              <li>🏖 Vyzakia Beach — 3 min walk</li>
              <li>🏖 Konnos Sandy Beach — 25 min walk</li>
              <li>🌲 Cape Greco National Forest Park — 6 km</li>
              <li>✈️ Larnaca International Airport — 37 miles</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-stone-200">
            <p className="mb-3 text-stone-700">House rules</p>
            <ul className="space-y-1 text-stone-700 text-sm">
              <li>Check-in: 3:00 PM – 7:00 PM (let us know your arrival time)</li>
              <li>Check-out: 11:30 AM – 12:00 PM</li>
              <li>Damage deposit: up to €200</li>
              <li>Children welcome · Free cots on request</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-amber-500 text-black py-12">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-3">Book direct and save</h2>
          <p className="mb-6 text-lg">Skip the commission — check live availability and pay a deposit instantly.</p>
          <Link href="/book" className="inline-block bg-black text-white hover:bg-stone-800 font-semibold px-8 py-3 rounded-lg text-lg transition">
            Check availability →
          </Link>
        </div>
      </section>

      <footer className="bg-stone-900 text-stone-300 py-8">
        <div className="max-w-5xl mx-auto px-6 text-center text-sm">
          <p>© {new Date().getFullYear()} Family Home Protaras · Licence ΑΕΜΑΚ - ΑΜΜ 0001322</p>
          <p className="mt-1">
            <a href="/admin" className="hover:underline">Admin</a> ·{" "}
            <a href="https://www.booking.com/hotel/cy/family-home.html" target="_blank" rel="noopener" className="hover:underline">
              Booking.com listing
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
