"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const CORAL = "#e85c44";
const ANTON = "var(--font-anton), sans-serif";
const ARCHIVO = "var(--font-archivo), sans-serif";
const EMAIL = "hello@journeytravel.group";

const SECTIONS = ["Home", "Travel", "Activations", "Events", "Contact"] as const;
const SERVICES = ["Travel", "Activations", "Events"] as const;

type Form = {
  name: string;
  company: string;
  email: string;
  service: string;
  message: string;
};

type Errors = Partial<Record<keyof Form, string>>;

const EMPTY_FORM: Form = { name: "", company: "", email: "", service: "", message: "" };

const PILLARS = [
  {
    id: "travel",
    index: 1,
    kicker: "Corporate Travel",
    title: "Travel",
    body: "Flights, stays, and ground handled end to end — so your people arrive ready, not rattled.",
    photo: "/assets/photo-travel.webp",
    objectPosition: "62% 28%",
    background:
      "radial-gradient(120% 100% at 78% 12%,rgba(232,92,68,0.24),transparent 54%),repeating-linear-gradient(135deg,rgba(244,237,216,0.05) 0 1px,transparent 1px 48px),linear-gradient(165deg,#1e1f44 0%,#141431 60%,#0f1026 100%)",
    scrim:
      "linear-gradient(0deg,rgba(9,9,22,0.9) 0%,rgba(9,9,22,0.2) 46%,rgba(9,9,22,0.5) 100%)",
    titleSize: "clamp(72px,13vw,208px)",
  },
  {
    id: "activations",
    index: 2,
    kicker: "Retail Activations",
    title: "Activations",
    body: "Point-of-sale moments that stop traffic and make your brand impossible to walk past.",
    photo: "/assets/photo-activations.webp",
    objectPosition: "50% 42%",
    background:
      "radial-gradient(120% 100% at 74% 14%,rgba(232,92,68,0.26),transparent 56%),repeating-linear-gradient(135deg,rgba(244,237,216,0.05) 0 1px,transparent 1px 48px),linear-gradient(160deg,#26337f 0%,#1b2360 58%,#11163f 100%)",
    scrim:
      "linear-gradient(0deg,rgba(8,10,28,0.9) 0%,rgba(8,10,28,0.2) 46%,rgba(8,10,28,0.5) 100%)",
    titleSize: "clamp(60px,11vw,178px)",
  },
  {
    id: "events",
    index: 3,
    kicker: "Events & Retreats",
    title: "Events",
    body: "Conferences, incentives, and retreats engineered to move the room and bring teams closer.",
    photo: "/assets/photo-events.webp",
    objectPosition: "50% 40%",
    background:
      "radial-gradient(120% 100% at 80% 10%,rgba(232,92,68,0.2),transparent 52%),radial-gradient(100% 90% at 20% 90%,rgba(244,237,216,0.08),transparent 55%),repeating-linear-gradient(135deg,rgba(244,237,216,0.05) 0 1px,transparent 1px 48px),linear-gradient(165deg,#191a3c 0%,#111228 60%,#0b0c1e 100%)",
    scrim:
      "linear-gradient(0deg,rgba(8,8,20,0.92) 0%,rgba(8,8,20,0.2) 46%,rgba(8,8,20,0.5) 100%)",
    titleSize: "clamp(72px,13vw,208px)",
  },
] as const;

export default function Site() {
  const [active, setActive] = useState(0);
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const honeypot = useRef<HTMLInputElement>(null);

  // Active-section tracking — section under the viewport center wins.
  useEffect(() => {
    const secs = document.querySelectorAll<HTMLElement>("[data-snap]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            setActive(Number(en.target.getAttribute("data-index")));
          }
        });
      },
      { root: null, rootMargin: "-50% 0px -50% 0px", threshold: 0 }
    );
    secs.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const goTo = (i: number) =>
    window.scrollTo({ top: i * window.innerHeight, behavior: "smooth" });

  const setField = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const v = e.target.value;
    setForm((s) => ({ ...s, [k]: v }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const pickService = (v: string) => {
    setForm((s) => ({ ...s, service: v }));
    setErrors((er) => ({ ...er, service: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const er: Errors = {};
    if (!form.name.trim()) er.name = "Please enter your name";
    if (!form.company.trim()) er.company = "Please enter your company";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) er.email = "Enter a valid email address";
    if (!form.service) er.service = "Choose a service";
    if (!form.message.trim()) er.message = "Tell us a little more";
    if (Object.keys(er).length) {
      setErrors(er);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, company_url: honeypot.current?.value ?? "" }),
      });
      if (!res.ok) throw new Error("Request failed");
      setSubmitted(true);
    } catch {
      setServerError("Something went wrong sending your enquiry. Please email us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setSubmitted(false);
    setForm(EMPTY_FORM);
    setErrors({});
    setServerError(null);
  };

  const onContact = active === 4;

  const labelStyle: React.CSSProperties = {
    fontFamily: ARCHIVO,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "rgba(22,23,47,0.6)",
  };
  const inputStyle: React.CSSProperties = {
    border: "none",
    borderBottom: "1.5px solid rgba(22,23,47,0.2)",
    background: "transparent",
    padding: "10px 0",
    fontFamily: ARCHIVO,
    fontSize: 17,
    color: "#16172f",
    outline: "none",
  };
  const fieldErr: React.CSSProperties = { fontFamily: ARCHIVO, fontSize: 12, color: CORAL };

  return (
    <>
      {/* Progress bar */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, background: "rgba(140,140,150,0.18)", zIndex: 60 }}>
        <div
          style={{
            width: `${(active / (SECTIONS.length - 1)) * 100}%`,
            height: "100%",
            background: CORAL,
            transition: "width .5s cubic-bezier(.4,0,.2,1)",
          }}
        />
      </div>

      {/* Nav */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "15px 6vw",
          background: "rgba(15,16,36,0.88)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(244,237,216,0.08)",
        }}
      >
        <button
          onClick={() => goTo(0)}
          aria-label="Journey Travel Group — back to top"
          style={{ display: "flex", alignItems: "center", gap: 13, background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          <Image src="/assets/plane-coral.png" alt="" width={40} height={32} style={{ height: 32, width: "auto", display: "block", flex: "none" }} />
          <span style={{ display: "flex", flexDirection: "column", lineHeight: 1, textAlign: "left" }}>
            <span style={{ fontFamily: ANTON, fontSize: 22, fontWeight: 400, letterSpacing: "0.02em", textTransform: "uppercase", lineHeight: 1, color: "#f4e9d8" }}>
              JOURNEY
            </span>
            <span style={{ fontFamily: ARCHIVO, fontSize: 8.5, fontWeight: 600, letterSpacing: "0.32em", textTransform: "uppercase", whiteSpace: "nowrap", color: "rgba(244,237,216,0.62)", marginTop: 5 }}>
              TRAVEL GROUP
            </span>
          </span>
        </button>
        <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 34 }}>
          <NavLink label="Travel" onClick={() => goTo(1)} />
          <NavLink label="Activations" onClick={() => goTo(2)} />
          <NavLink label="Events" onClick={() => goTo(3)} />
          <button
            onClick={() => goTo(4)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: ARCHIVO, fontSize: 13, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: CORAL }}
          >
            Contact
          </button>
        </div>
      </nav>

      {/* Side dot rail */}
      <div className="dot-rail" style={{ position: "fixed", top: "50%", right: 26, transform: "translateY(-50%)", zIndex: 50, display: "flex", flexDirection: "column", gap: 13, alignItems: "flex-end" }}>
        {SECTIONS.map((label, i) => {
          const on = active === i;
          return (
            <button
              key={label}
              onClick={() => goTo(i)}
              aria-label={`Go to ${label}`}
              style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: "3px 0" }}
            >
              <span
                style={{
                  fontFamily: ARCHIVO,
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  color: on ? (onContact ? "#16172f" : "#f4e9d8") : "transparent",
                  opacity: on ? 1 : 0,
                  transform: on ? "translateX(0)" : "translateX(8px)",
                  transition: "all .35s ease",
                }}
              >
                {label}
              </span>
              <span
                style={{
                  display: "block",
                  height: 2,
                  width: on ? 34 : 14,
                  background: on ? CORAL : onContact ? "rgba(22,23,47,0.3)" : "rgba(244,237,216,0.32)",
                  transition: "all .35s cubic-bezier(.4,0,.2,1)",
                }}
              />
            </button>
          );
        })}
      </div>

      {/* 1. Hero */}
      <section
        data-snap
        data-index={0}
        id="home"
        style={{
          height: "100dvh",
          scrollSnapAlign: "start",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 6vw 13vh",
          background:
            "radial-gradient(130% 110% at 80% 8%,rgba(232,92,68,0.26),transparent 52%),repeating-linear-gradient(135deg,rgba(244,237,216,0.05) 0 1px,transparent 1px 52px),linear-gradient(165deg,#1c1d44 0%,#141430 58%,#0e0f26 100%)",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg,rgba(10,10,24,0.55) 0%,rgba(10,10,24,0) 40%)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontFamily: ARCHIVO, fontSize: 13, fontWeight: 600, letterSpacing: "0.34em", textTransform: "uppercase", color: CORAL, marginBottom: 30 }}>
            Corporate Travel · Retail Activations · Events
          </div>
          <h1 style={{ fontFamily: ANTON, fontWeight: 400, fontSize: "clamp(82px,15vw,250px)", lineHeight: 0.82, letterSpacing: "0.01em", color: "#f4e9d8", margin: 0, textTransform: "uppercase" }}>
            ELEVATE<span style={{ color: CORAL }}>.</span>
          </h1>
          <p style={{ fontFamily: ARCHIVO, fontSize: "clamp(17px,1.7vw,24px)", lineHeight: 1.5, color: "rgba(244,237,216,0.82)", margin: "34px 0 0", maxWidth: "46ch", fontWeight: 400 }}>
            Journey Travel Group designs the trips, retail activations, and events your customers remember — engineered for business, built for impact.
          </p>
        </div>
        <button
          onClick={() => goTo(1)}
          aria-label="Scroll to Travel"
          style={{ position: "absolute", bottom: 34, right: "6vw", display: "flex", flexDirection: "column", alignItems: "center", gap: 11, background: "none", border: "none", cursor: "pointer" }}
        >
          <span style={{ fontFamily: ARCHIVO, fontSize: 10, letterSpacing: "0.36em", color: "rgba(244,237,216,0.6)", textTransform: "uppercase" }}>Scroll</span>
          <span style={{ position: "relative", width: 1, height: 54, background: "rgba(244,237,216,0.25)", display: "block", overflow: "hidden" }}>
            <span className="scroll-dot" style={{ position: "absolute", left: -1.5, top: 0, width: 4, height: 4, borderRadius: "50%", background: CORAL, animation: "scrollDot 1.9s cubic-bezier(.4,0,.2,1) infinite", display: "block" }} />
          </span>
        </button>
      </section>

      {/* 2–4. Pillars */}
      {PILLARS.map((p) => (
        <section
          key={p.id}
          data-snap
          data-index={p.index}
          id={p.id}
          style={{
            height: "100dvh",
            scrollSnapAlign: "start",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "0 6vw 12vh",
            background: p.background,
          }}
        >
          <Image src={p.photo} alt="" fill sizes="100vw" style={{ objectFit: "cover", objectPosition: p.objectPosition }} />
          <div style={{ position: "absolute", inset: 0, background: p.scrim, pointerEvents: "none" }} />
          <div style={{ position: "relative", maxWidth: "62ch" }}>
            <div style={{ fontFamily: ARCHIVO, fontSize: 12, fontWeight: 600, letterSpacing: "0.32em", textTransform: "uppercase", color: CORAL, marginBottom: 18 }}>
              {p.kicker}
            </div>
            <h2 style={{ fontFamily: ANTON, fontWeight: 400, fontSize: p.titleSize, lineHeight: 0.92, color: "#f4e9d8", margin: 0, textTransform: "uppercase" }}>
              {p.title}
              <span style={{ color: CORAL }}>.</span>
            </h2>
            <p style={{ fontFamily: ARCHIVO, fontSize: "clamp(17px,1.7vw,24px)", lineHeight: 1.5, color: "rgba(244,237,216,0.82)", margin: "22px 0 0", maxWidth: "44ch" }}>
              {p.body}
            </p>
          </div>
        </section>
      ))}

      {/* 5. Contact */}
      <section
        data-snap
        data-index={4}
        id="contact"
        style={{ minHeight: "100dvh", scrollSnapAlign: "start", position: "relative", background: "#f4e9d8", color: "#16172f", display: "flex", alignItems: "center", padding: "90px 6vw 70px" }}
      >
        <div style={{ width: "100%", maxWidth: 1180, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: "6vw", alignItems: "center" }}>
          <div style={{ flex: "1 1 360px", minWidth: 300 }}>
            <div style={{ fontFamily: ARCHIVO, fontSize: 12, fontWeight: 600, letterSpacing: "0.32em", textTransform: "uppercase", color: CORAL, marginBottom: 20 }}>
              Get in touch
            </div>
            <h2 style={{ fontFamily: ANTON, fontWeight: 400, fontSize: "clamp(64px,9vw,150px)", lineHeight: 0.9, color: "#16172f", margin: 0, textTransform: "uppercase" }}>
              Let&apos;s<br />Talk<span style={{ color: CORAL }}>.</span>
            </h2>
            <p style={{ fontFamily: ARCHIVO, fontSize: "clamp(16px,1.5vw,21px)", lineHeight: 1.55, color: "rgba(22,23,47,0.72)", margin: "26px 0 30px", maxWidth: "36ch" }}>
              Tell us where you&apos;re going. We&apos;ll handle the trips, the floor, and the room.
            </p>
            <a href={`mailto:${EMAIL}`} style={{ fontFamily: ARCHIVO, fontSize: "clamp(17px,1.6vw,22px)", fontWeight: 600, color: "#16172f", textDecoration: "none", borderBottom: `2px solid ${CORAL}`, paddingBottom: 3 }}>
              {EMAIL}
            </a>
          </div>

          <div style={{ flex: "1 1 420px", minWidth: 300 }}>
            {!submitted ? (
              <form onSubmit={submit} noValidate style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                {/* Honeypot — hidden from real users */}
                <input
                  ref={honeypot}
                  type="text"
                  name="company_url"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
                />

                <Field label="Name" error={errors.name} labelStyle={labelStyle} fieldErr={fieldErr}>
                  <input value={form.name} onChange={setField("name")} placeholder="Jane Doe" style={inputStyle} onFocus={focusCoral} onBlur={blurReset} />
                </Field>
                <Field label="Company" error={errors.company} labelStyle={labelStyle} fieldErr={fieldErr}>
                  <input value={form.company} onChange={setField("company")} placeholder="Acme Inc." style={inputStyle} onFocus={focusCoral} onBlur={blurReset} />
                </Field>
                <Field label="Email" error={errors.email} labelStyle={labelStyle} fieldErr={fieldErr}>
                  <input value={form.email} onChange={setField("email")} placeholder="jane@acme.com" type="email" style={inputStyle} onFocus={focusCoral} onBlur={blurReset} />
                </Field>

                <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                  <label style={labelStyle}>Which service</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {SERVICES.map((label) => {
                      const on = form.service === label;
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => pickService(label)}
                          style={{
                            fontFamily: ARCHIVO,
                            fontSize: 12,
                            fontWeight: 600,
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            padding: "11px 18px",
                            cursor: "pointer",
                            transition: "all .25s ease",
                            border: `1.5px solid ${on ? CORAL : "rgba(22,23,47,0.25)"}`,
                            background: on ? CORAL : "transparent",
                            color: on ? "#fff" : "#16172f",
                          }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  {errors.service && <span style={fieldErr}>{errors.service}</span>}
                </div>

                <Field label="Message" error={errors.message} labelStyle={labelStyle} fieldErr={fieldErr}>
                  <textarea value={form.message} onChange={setField("message")} rows={3} placeholder="A few words on what you're planning…" style={{ ...inputStyle, resize: "none" }} onFocus={focusCoral} onBlur={blurReset} />
                </Field>

                {serverError && <span style={fieldErr}>{serverError}</span>}

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    marginTop: 6,
                    width: "100%",
                    padding: 18,
                    background: CORAL,
                    color: "#fff",
                    border: "none",
                    fontFamily: ARCHIVO,
                    fontWeight: 700,
                    fontSize: 13,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    cursor: submitting ? "default" : "pointer",
                    opacity: submitting ? 0.7 : 1,
                    transition: "background .3s ease",
                  }}
                  onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = "#16172f"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = CORAL; }}
                >
                  {submitting ? "Sending…" : "Send enquiry"}
                </button>
              </form>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: "10px 0" }}>
                <span style={{ width: 13, height: 13, background: CORAL, transform: "rotate(45deg)", display: "inline-block" }} />
                <h3 style={{ fontFamily: ANTON, fontWeight: 400, fontSize: "clamp(48px,6vw,84px)", lineHeight: 0.92, color: "#16172f", margin: 0, textTransform: "uppercase" }}>
                  Thank you<span style={{ color: CORAL }}>.</span>
                </h3>
                <p style={{ fontFamily: ARCHIVO, fontSize: 18, lineHeight: 1.55, color: "rgba(22,23,47,0.72)", margin: 0, maxWidth: "34ch" }}>
                  Your enquiry is in. A member of our team will be in touch within one business day.
                </p>
                <button onClick={reset} style={{ alignSelf: "flex-start", background: "none", border: "none", cursor: "pointer", fontFamily: ARCHIVO, fontSize: 13, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#16172f", borderBottom: `2px solid ${CORAL}`, padding: "0 0 3px" }}>
                  Send another
                </button>
              </div>
            )}
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 26, left: "6vw", right: "6vw", display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", fontFamily: ARCHIVO, fontSize: 12, letterSpacing: "0.04em", color: "rgba(22,23,47,0.5)" }}>
          <span>© 2026 Journey Travel Group, LLC</span>
          <span>Corporate travel · Activations · Events</span>
        </div>
      </section>
    </>
  );
}

function focusCoral(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderBottomColor = CORAL;
}
function blurReset(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderBottomColor = "rgba(22,23,47,0.2)";
}

function NavLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: ARCHIVO, fontSize: 13, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#f4e9d8", opacity: 0.62, transition: "opacity .25s ease" }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.62")}
    >
      {label}
    </button>
  );
}

function Field({
  label,
  error,
  labelStyle,
  fieldErr,
  children,
}: {
  label: string;
  error?: string;
  labelStyle: React.CSSProperties;
  fieldErr: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {error && <span style={fieldErr}>{error}</span>}
    </div>
  );
}
