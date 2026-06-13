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

  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;

  // No key configured yet — accept the submission so the UI works, but log it.
  // Set WEB3FORMS_ACCESS_KEY in Vercel to start delivering emails.
  if (!accessKey) {
    console.warn("[contact] WEB3FORMS_ACCESS_KEY not set — enquiry received but not emailed:", {
      name,
      company,
      email,
      service,
    });
    return NextResponse.json({ ok: true, delivered: false });
  }

  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: accessKey,
        subject: `New enquiry from ${name} — ${company} (${service})`,
        from_name: "Journey Travel Group Website",
        replyto: email, // replies go straight to the enquirer
        // These fields are included in the email body:
        name,
        company,
        email,
        service,
        message,
      }),
    });

    const data = (await res.json().catch(() => ({}))) as { success?: boolean; message?: string };

    if (!res.ok || !data.success) {
      console.error("[contact] Web3Forms error:", res.status, data.message);
      return NextResponse.json(
        { error: "Could not send enquiry.", _diag: { status: res.status, message: data.message } },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, delivered: true });
  } catch (err) {
    console.error("[contact] Network error:", err);
    return NextResponse.json({ error: "Could not send enquiry." }, { status: 502 });
  }
}
