import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface BookingEmailData {
  guestName: string;
  email: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalCents: number;
  depositCents: number;
}

export async function sendBookingConfirmation(data: BookingEmailData) {
  const { guestName, email, checkIn, checkOut, nights, totalCents, depositCents } = data;

  try {
    await resend.emails.send({
      from: "Family Home Protaras <noreply@yiangouweb.com>",
      to: [email],
      subject: "Booking Confirmation — Family Home Protaras",
      react: (
        <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 580, margin: "0 auto", padding: 24, color: "#1c1917" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: 2, color: "#d97706" }}>FAMILY HOME</div>
            <div style={{ fontSize: 13, color: "#a8a29e", marginTop: 4, letterSpacing: 1 }}>PROTARAS, CYPRUS</div>
          </div>

          {/* Greeting */}
          <h2 style={{ fontSize: 22, fontWeight: 600, color: "#1c1917", marginBottom: 12 }}>Thank you, {guestName}</h2>
          <p style={{ color: "#57534e", lineHeight: 1.6 }}>
            Your booking request for <strong>Family Home Protaras</strong> has been received. Here are your reservation details:
          </p>

          {/* Booking Details Card */}
          <div style={{ background: "#f5f5f4", borderRadius: 12, padding: 20, margin: "24px 0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {[
                  ["Check-in", `${checkIn} · From 15:00`],
                  ["Check-out", `${checkOut} · Before 11:00`],
                  ["Nights", String(nights)],
                  ["Rate", "€250 / night"],
                  ["Total (30% deposit)", `€${(depositCents / 100).toFixed(2)} of €${(totalCents / 100).toFixed(2)}`],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td style={{ padding: "8px 0", color: "#78716c", fontSize: 14, borderBottom: "1px solid #e7e5e4" }}>{label}</td>
                    <td style={{ padding: "8px 0", textAlign: "right", fontWeight: 500, fontSize: 14, borderBottom: "1px solid #e7e5e4" }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Next Steps */}
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: 16, margin: "20px 0" }}>
            <strong style={{ color: "#92400e" }}>⚡ Next Step</strong>
            <p style={{ color: "#78350f", fontSize: 14, lineHeight: 1.6, margin: "8px 0 0 0" }}>
              Please complete your deposit payment to confirm your booking. You will receive a link shortly.
            </p>
          </div>

          {/* House Rules Summary */}
          <div style={{ fontSize: 13, color: "#78716c", marginTop: 20 }}>
            <p><strong>House Rules:</strong></p>
            <ul style={{ margin: "8px 0", paddingLeft: 20, lineHeight: 1.8 }}>
              <li>Check-in: 15:00 — Check-out: 11:00</li>
              <li>No smoking, no parties, no pets</li>
              <li>Maximum occupancy: 7 guests</li>
              <li>Licence ΑΕΜΑΚ — ΑΜΜ 0001322</li>
            </ul>
          </div>

          {/* Contact */}
          <div style={{ borderTop: "1px solid #e7e5e4", paddingTop: 20, marginTop: 24, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "#57534e" }}>
              Questions? Reply to this email or contact us:
            </p>
            <a href="mailto:familyhome@yiangouweb.com" style={{ color: "#d97706", textDecoration: "none", fontWeight: 600 }}>
              familyhome@yiangouweb.com
            </a>
          </div>

          {/* Footer */}
          <p style={{ fontSize: 11, color: "#a8a29e", textAlign: "center", marginTop: 32 }}>
            Family Home Protaras · Ithakis 21A, 5297 Protaras, Cyprus<br />
            © {new Date().getFullYear()} Family Home. All rights reserved.
          </p>
        </div>
      ),
    });

    return { ok: true };
  } catch (error: any) {
    console.error("Failed to send booking confirmation:", error.message);
    return { ok: false, error: error.message };
  }
}
