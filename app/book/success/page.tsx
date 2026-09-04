
import Link from "next/link";
export default function Success() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-20 text-center">
      <div className="text-6xl mb-4">🎉</div>
      <h1 className="text-3xl font-bold mb-4">Booking confirmed!</h1>
      <p className="text-stone-600 mb-8">
        Thank you. A confirmation email is on its way. You&apos;ll receive check-in instructions before your arrival.
      </p>
      <Link href="/" className="inline-block bg-amber-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-amber-600">
        Back to home
      </Link>
    </main>
  );
}
