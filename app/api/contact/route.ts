import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Payload = {
  name?: string;
  company?: string;
  email?: string;
  service?: string;
  message?: string;
  company_url?: string; // honeypot
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Where enquiries are delivered. Override with CONTACT_TO in env if needed.
const TO = process.env.CONTACT_TO || "hello@journeytravel.group";
// Verified sender on your Resend account (a domain you've verified in Resend).
const FROM = process.env.CONTACT_FROM || "Journey Travel Group <hello@journeytravel.group>";

function esc(s: string) {
  return s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c] as string));
}

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Honeypot: real users never fill this. Pretend success to bots.
  if (body.company_url) {
    return NextResponse.json({ ok: true });
  }

  const name = (body.name || "").trim();
  const company = (body.company || "").trim();
  const email = (body.email || "").trim();
  const service = (body.service || "").trim();
  const message = (body.message || "").trim();

  if (!name || !company || !service || !message || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please complete all fields." }, { status: 422 });
  }

  const apiKey = process.env.RESEND_API_KEY;

  // No key configured yet — accept the submission so the UI works, but log it.
  // Wire RESEND_API_KEY in Vercel to start delivering emails.
  if (!apiKey) {
    console.warn("[contact] RESEND_API_KEY not set — enquiry received but not emailed:", {
      name,
      company,
      email,
      service,
    });
    return NextResponse.json({ ok: true, delivered: false });
  }

  const html = `
    <h2>New enquiry — ${esc(service)}</h2>
    <p><strong>Name:</strong> ${esc(name)}</p>
    <p><strong>Company:</strong> ${esc(company)}</p>
    <p><strong>Email:</strong> ${esc(email)}</p>
    <p><strong>Service:</strong> ${esc(service)}</p>
    <p><strong>Message:</strong></p>
    <p style="white-space:pre-wrap">${esc(message)}</p>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: email,
        subject: `New enquiry from ${name} — ${company} (${service})`,
        html,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("[contact] Resend error:", res.status, detail);
      return NextResponse.json({ error: "Could not send enquiry." }, { status: 502 });
    }

    return NextResponse.json({ ok: true, delivered: true });
  } catch (err) {
    console.error("[contact] Network error:", err);
    return NextResponse.json({ error: "Could not send enquiry." }, { status: 502 });
  }
}
