export default function CancelPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-stone-50 px-6">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-stone-800 mb-3">Payment Cancelled</h1>
        <p className="text-stone-600 mb-6 leading-relaxed">
          Your booking was not completed and no charge has been made. Feel free to try again or contact us directly if you need help.
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/book" className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-3 rounded-lg transition">
            Try Again
          </a>
          <a href="/" className="border border-stone-300 text-stone-700 font-semibold px-8 py-3 rounded-lg hover:bg-stone-100 transition">
            Home
          </a>
        </div>
      </div>
    </main>
  );
}
