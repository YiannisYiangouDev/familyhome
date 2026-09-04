export default function SuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-stone-50 px-6">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-stone-800 mb-3">Booking Confirmed!</h1>
        <p className="text-stone-600 mb-6 leading-relaxed">
          Thank you for booking Family Home Protaras. A confirmation email has been sent with your booking details and deposit receipt.
        </p>
        <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6 text-left text-sm space-y-3">
          <div className="flex justify-between"><span className="text-stone-500">What happens next?</span></div>
          <p className="text-stone-700">1. You&apos;ll receive a confirmation email shortly</p>
          <p className="text-stone-700">2. We&apos;ll reach out closer to your check-in date</p>
          <p className="text-stone-700">3. The remaining balance is due at check-in</p>
        </div>
        <a href="/" className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-3 rounded-lg transition">
          Back to Home
        </a>
      </div>
    </main>
  );
}
