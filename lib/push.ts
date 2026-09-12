import webpush from "web-push";
import { prisma } from "./db";

type PushSub = { endpoint: string; p256dh: string; auth: string };

function vapidReady(): boolean {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT);
}

/**
 * Send a push notification to every stored admin subscription.
 * Fire-and-forget style: callers should wrap in .catch(() => {}) like sendBookingConfirmation.
 * Dead subscriptions (404/410) are pruned.
 */
export async function notifyAdmins(title: string, body: string, url: string) {
  if (!vapidReady()) return;

  const subs = await prisma.pushSubscription.findMany();
  if (subs.length === 0) return;

  webpush.setVapidDetails(process.env.VAPID_SUBJECT!, process.env.VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);
  const payload = JSON.stringify({ title, body, url });

  const dead: number[] = [];
  await Promise.all(
    subs.map(async (s: PushSub & { id: number }) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload
        );
      } catch (e) {
        const status = (e as { statusCode?: number })?.statusCode;
        if (status === 404 || status === 410) dead.push(s.id);
      }
    })
  );

  if (dead.length > 0) {
    await prisma.pushSubscription.deleteMany({ where: { id: { in: dead } } }).catch(() => {});
  }
}
