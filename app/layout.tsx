
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Family Home Protaras | 4-Bedroom Villa near the Beach",
  description:
    "Book direct — FAMILY HOME is a 4-bedroom villa in Protaras, Cyprus. 250m from Vyzakia Beach, private parking, garden, BBQ, WiFi. Rated 9.9/10.",
  openGraph: {
    title: "Family Home Protaras | 4-Bedroom Villa near the Beach",
    description: "Book direct and save. 4-bed villa, 250m from the beach, 9.9/10 rated.",
    images: ["/photos/photo-01.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-stone-50 text-stone-900 antialiased">{children}</body>
    </html>
  );
}
