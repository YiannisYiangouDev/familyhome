
import Link from "next/link";
export default function Cancel() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-20 text-center">
      <h1 className="text-3xl font-bold mb-4">Checkout cancelled</h1>
      <p className="text-stone-600 mb-8">Your dates are still available if you&apos;d like to try again.</p>
      <Link href="/book" className="inline-block bg-amber-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-amber-600">
        Try again
      </Link>
    </main>
  );
}
