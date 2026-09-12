export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { importExternalCalendar } = await import("./lib/ical-import");

    const run = () => importExternalCalendar().catch(() => {});
    // Initial import shortly after the server boots, then every 6 hours.
    setTimeout(run, 60_000);
    setInterval(run, 6 * 60 * 60 * 1000);
  }
}
