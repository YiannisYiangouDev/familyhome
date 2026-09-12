import type { Metadata } from "next";
import Nav from "@/components/Nav";
import "./globals.css";

const SITE_URL = "https://familyhomeprotaras.yiangouweb.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Family Home | 4-Bedroom Villa in Protaras, Cyprus",
  description: "Book direct and save — FAMILY HOME is a 4-bedroom villa in Protaras, Cyprus. 250m from Vyzakia Beach, rated 9.9/10. Private parking, garden, BBQ, WiFi.",
  keywords: ["Protaras villa", "Cyprus holiday home", "family home protaras", "direct booking protaras", "4 bedroom villa cyprus"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Family Home | 4-Bedroom Villa in Protaras, Cyprus",
    description: "Book direct and save. Rated 9.9/10, just 250m from Vyzakia Beach.",
    url: SITE_URL,
    images: [{ url: "/photos/photo-01.jpg", width: 1200, height: 630, alt: "Family Home Protaras villa" }],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Family Home | Protaras, Cyprus",
    description: "4-bed villa rated 9.9/10 — book direct and skip the commission.",
    images: ["/photos/photo-01.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "VacationRental",
  "identifier": { "@type": "PropertyValue", propertyID: "ΑΕΜΑΚ-ΑΜΜ", value: "0001322" },
  name: "Family Home Protaras",
  description: "4-bedroom villa in Protaras, Cyprus, 250m from Vyzakia Beach. Rated 9.9/10.",
  url: SITE_URL,
  image: [
    `${SITE_URL}/photos/photo-01.jpg`,
    `${SITE_URL}/photos/photo-02.jpg`,
    `${SITE_URL}/photos/photo-03.jpg`,
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: "Ithakis 21A",
    addressLocality: "Protaras",
    postalCode: "5297",
    addressCountry: "CY",
  },
  aggregateRating: { "@type": "AggregateRating", ratingValue: "9.9", bestRating: "10", reviewCount: "29" },
  amenityFeature: [
    { "@type": "LocationFeatureSpecification", name: "Free WiFi", value: true },
    { "@type": "LocationFeatureSpecification", name: "Free private parking", value: true },
    { "@type": "LocationFeatureSpecification", name: "Air conditioning", value: true },
    { "@type": "LocationFeatureSpecification", name: "Kitchen", value: true },
    { "@type": "LocationFeatureSpecification", name: "BBQ facilities", value: true },
    { "@type": "LocationFeatureSpecification", name: "Garden", value: true },
    { "@type": "LocationFeatureSpecification", name: "Washing machine", value: true },
  ],
  occupancy: { "@type": "QuantitativeValue", minValue: 1, value: 7 },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-stone-50 text-stone-900 antialiased">
        <Nav />
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
