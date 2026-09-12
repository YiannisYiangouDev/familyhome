# Family Home — Protaras Direct-Booking Site

Next.js + Postgres + Stripe. Self-hosted direct-booking website for
Yiannis' 4-bedroom villa at Ithakis 21A, Protaras, Cyprus.

## Local dev

```bash
npm install
docker compose up -d db
npx prisma db push
npm run dev     # http://localhost:3031
```

## Production (VPS via docker compose)

1. Copy `.env.example` → `.env` and fill in real values.
2. `docker compose up -d --build web`
3. Open `/admin` and configure seasonal rates + deposit % via the UI.
4. Give Booking.com the iCal export URL:
   `https://familyhomeprotaras.yiangouweb.com/api/ical?token=<ICAL_TOKEN>`
   so they can sync blocked dates both ways.

## Stripe

- Test mode keys go in `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`.
- Register webhook: `https://familyhomeprotaras.yiangouweb.com/api/stripe/webhook`
  listening for `checkout.session.completed`.
- Swap to live keys when ready — no code changes.

## Licence

ΑΕΜΑΚ - ΑΜΜ 0001322
