import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import {
  galleryImages,
  galleryNote,
  heroImage,
  quotes,
  services,
  equipment,
} from "./content";
import "./App.css";

/* Faint line-art motif layer sitting behind a section's content.
   `variant` picks the pattern, `fade` keeps it off the middle of the page. */
function Ornament({ variant = "quatrefoil", fade = "fade-edges" }) {
  return (
    <div
      aria-hidden="true"
      className={`ornament ornament--${variant} ornament--${fade}`}
    />
  );
}

const NAV = [
  ["Home", "home"],
  ["About", "about"],
  ["Services", "services"],
  ["Gallery", "gallery"],
  ["Equipment", "equipment"],
  ["Contact", "contact"],
];

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
};

/* Small gold eyebrow + serif title, used at the head of every section */
function SectionHeading({ eyebrow, title, align = "center" }) {
  const centered = align === "center";
  return (
    <motion.div
      {...fadeUp}
      className={`mb-14 flex flex-col ${centered ? "items-center text-center" : "items-start text-left"}`}
    >
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="mt-4 font-display text-4xl font-light leading-tight text-ink sm:text-5xl">
        {title}
      </h2>
      <div className={`rule mt-6 ${centered ? "" : "ml-0"}`} />
    </motion.div>
  );
}

/* Full-width quotation band over one of the photographs, behind a light ivory veil */
function QuoteBand({ quote, image }) {
  return (
    <section className="relative isolate overflow-hidden">
      <img
        src={`/${image}`}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Light scrim keeps the palette airy and the text readable */}
      <div className="absolute inset-0 bg-ivory/80 backdrop-blur-[3px]" />
      <div className="relative mx-auto max-w-3xl px-6 py-24 text-center sm:py-32">
        <motion.p {...fadeUp} className="eyebrow">
          {quote.label}
        </motion.p>
        <motion.blockquote
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.1 }}
          className="mt-6 font-display text-[1.75rem] font-light italic leading-snug text-ink sm:text-4xl sm:leading-snug"
        >
          &ldquo;{quote.text}&rdquo;
        </motion.blockquote>
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.2 }}
          className="mt-8 flex justify-center"
        >
          <div className="rule" />
        </motion.div>
      </div>
    </section>
  );
}

export default function App() {
  const form = useRef();
  const referenceRef = useRef();
  const [lightbox, setLightbox] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [status, setStatus] = useState(null);
  // Design code the customer picked from the gallery, e.g. "W-02"
  const [reference, setReference] = useState("");
  // Any gallery file that fails to load is dropped rather than shown
  // as a broken-image icon on a page customers are judging us by.
  const [missing, setMissing] = useState(() => new Set());
  const visibleGallery = galleryImages.filter((g) => !missing.has(g.file));

  /* "I like this design" — carry the code down to the enquiry form so the
     email that goes out has both the design AND a way to reply. */
  const pickDesign = (img) => {
    setReference(img.code);
    setStatus(null);
    setLightbox(null);
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    // Land the cursor in the form once the scroll settles
    window.setTimeout(() => referenceRef.current?.focus({ preventScroll: true }), 700);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the lightbox on Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setLightbox(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const sendEmail = (e) => {
    e.preventDefault();
    setStatus("sending");

    const data = Object.fromEntries(new FormData(form.current).entries());
    const chosen = data.reference_design?.trim() || "";

    // A ready-made plain-text block. Even a bare EmailJS template that only
    // prints {{summary}} will show every answer, the design code included.
    const summary = [
      ["Name", data.user_name],
      ["Mobile", data.user_phone],
      ["Email", data.user_email],
      ["Event", data.event_type],
      ["Date", data.event_date],
      ["Time", data.event_time],
      ["Venue", data.event_place],
      ["Reference design", chosen],
      ["Notes", data.message],
    ]
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");

    emailjs
      .send(
        "service_tg8t50h",
        "template_z4ziarc",
        {
          ...data,
          reference_design: chosen || "Not specified",
          summary,
        },
        "bfzg_N3Jx3h92YwQV"
      )
      .then(
        () => {
          setStatus("sent");
          form.current.reset();
          setReference("");
        },
        () => setStatus("error")
      );
  };

  return (
    <div className="min-h-screen">
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
          scrolled || menuOpen
            ? "bg-ivory/95 shadow-[0_1px_0_rgba(184,149,79,0.25)] backdrop-blur"
            : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <a href="#home" className="group flex flex-col leading-none">
            <span className="font-display text-2xl font-medium tracking-wide text-ink">
              StageDecor
            </span>
            <span className="mt-1 font-body text-[0.55rem] uppercase tracking-luxe text-gold">
              Events &amp; Stage Styling
            </span>
          </a>

          {/* Desktop nav */}
          <ul className="hidden items-center gap-8 md:flex">
            {NAV.map(([label, id]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="font-body text-[0.7rem] uppercase tracking-[0.18em] text-muted transition-colors hover:text-gold"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] md:hidden"
          >
            <span
              className={`h-px w-6 bg-ink transition-transform duration-300 ${
                menuOpen ? "translate-y-[6px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-px w-6 bg-ink transition-opacity duration-200 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-px w-6 bg-ink transition-transform duration-300 ${
                menuOpen ? "-translate-y-[6px] -rotate-45" : ""
              }`}
            />
          </button>
        </nav>

        {/* Mobile drawer */}
        <div
          className={`overflow-hidden border-t border-gold/20 bg-ivory/95 backdrop-blur transition-[max-height] duration-500 md:hidden ${
            menuOpen ? "max-h-96" : "max-h-0"
          }`}
        >
          <ul className="flex flex-col px-6 py-2">
            {NAV.map(([label, id]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={() => setMenuOpen(false)}
                  className="block border-b border-ink/5 py-4 font-body text-xs uppercase tracking-[0.18em] text-muted"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section id="home" className="relative isolate flex min-h-screen items-center">
        <img
          src={`/${heroImage}`}
          alt="Wedding stage with ivory seating, gold draping and floral arches"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Soft ivory wash — light enough that the photograph still reads */}
        <div className="absolute inset-0 bg-gradient-to-b from-ivory/70 via-ivory/30 to-ivory/85" />
        {/* Focused veil behind the headline so the type stays legible */}
        <div className="absolute inset-0 bg-[radial-gradient(38rem_26rem_at_50%_45%,rgba(253,251,247,0.88),transparent_72%)]" />

        <div className="relative mx-auto w-full max-w-4xl px-6 pt-24 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="eyebrow"
          >
            Weddings · Engagements · Birthdays
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.12 }}
            className="mt-6 font-display text-5xl font-light leading-[1.08] text-ink sm:text-6xl md:text-7xl"
          >
            Stages made for
            <br />
            <span className="italic text-rose">unforgettable</span> moments
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.24 }}
            className="mx-auto mt-8 max-w-xl font-body text-base font-light leading-relaxed text-muted sm:text-lg"
          >
            Floral arches, draped backdrops and warm lighting — designed around
            your colours, built in your venue, ready before your first guest
            arrives.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.36 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <a href="#contact" className="btn-gold w-full sm:w-auto">
              Enquire About Your Date
            </a>
            <a href="#gallery" className="btn-outline w-full sm:w-auto">
              View Our Work
            </a>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <div className="absolute inset-x-0 bottom-8 flex justify-center">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="h-10 w-px bg-gradient-to-b from-transparent to-gold"
          />
        </div>
      </section>

      {/* ── ABOUT ──────────────────────────────────────────── */}
      <section id="about" className="relative overflow-hidden py-24 sm:py-32">
        <Ornament variant="quatrefoil" fade="fade-tl" />
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-2 lg:gap-20">
          <motion.div
            {...fadeUp}
            className="relative order-2 lg:order-1"
          >
            <span className="eyebrow">Who We Are</span>
            <h2 className="mt-4 font-display text-4xl font-light leading-tight text-ink sm:text-5xl">
              Decoration that feels
              <br />
              <span className="italic text-rose">effortless</span> on the day
            </h2>
            <div className="rule mt-6" />
            <p className="mt-8 font-body text-[1.02rem] font-light leading-[1.85] text-muted">
              We design and build stage décor for weddings, engagements,
              birthdays and corporate events. Every setup begins with your
              colours and your venue — never a template.
            </p>
            <p className="mt-5 font-body text-[1.02rem] font-light leading-[1.85] text-muted">
              Because we own our backdrops, florals, draping, seating and
              lighting, there is nothing to hire in and nothing left to chance.
              We arrive early, build it completely, and hand you a room that is
              ready.
            </p>

            <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-gold/25 pt-8">
              {[
                ["Fully", "Owned Equipment"],
                ["Custom", "Colour Themes"],
                ["On-Site", "Setup & Takedown"],
              ].map(([big, small]) => (
                <div key={small}>
                  <dt className="font-display text-2xl font-light text-gold">
                    {big}
                  </dt>
                  <dd className="mt-1 font-body text-[0.68rem] uppercase tracking-[0.14em] text-muted">
                    {small}
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>

          {/* Layered photographs */}
          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.15 }}
            className="relative order-1 lg:order-2"
          >
            <div className="overflow-hidden shadow-soft">
              <img
                src="/dec3.jpeg"
                alt="Champagne draping framed by pink and blue floral pillars"
                loading="lazy"
                className="aspect-[4/5] w-full object-cover transition-transform duration-[1.2s] hover:scale-105"
              />
            </div>
            <div className="absolute -bottom-10 -left-6 hidden w-44 overflow-hidden border-8 border-ivory shadow-card sm:block lg:-left-12 lg:w-56">
              <img
                src="/dec6.jpeg"
                alt="Banquet hall styled with a decorated head table"
                loading="lazy"
                className="aspect-[3/4] w-full object-cover"
              />
            </div>
            {/* Thin gold frame accent */}
            <div className="pointer-events-none absolute -right-4 -top-4 hidden h-32 w-32 border-r border-t border-gold/50 lg:block" />
          </motion.div>
        </div>
      </section>

      {/* ── QUOTE: WEDDING ─────────────────────────────────── */}
      <QuoteBand quote={quotes.wedding} image="dec5.jpeg" />

      {/* ── SERVICES ───────────────────────────────────────── */}
      <section id="services" className="relative overflow-hidden py-24 sm:py-32">
        <Ornament variant="mandala" fade="fade-edges" />
        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <SectionHeading eyebrow="What We Do" title="Our Services" />

          <div className="grid gap-8 sm:grid-cols-2">
            {services.map((s, i) => (
              <motion.article
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.08 }}
                key={s.title}
                className="group overflow-hidden bg-white/70 shadow-card backdrop-blur-sm"
              >
                <div className="overflow-hidden">
                  <img
                    src={`/${s.image}`}
                    alt={s.title}
                    loading="lazy"
                    className="aspect-[16/10] w-full object-cover transition-transform duration-[1.1s] group-hover:scale-105"
                  />
                </div>
                <div className="p-8">
                  <h3 className="font-display text-2xl font-normal text-ink">
                    {s.title}
                  </h3>
                  <div className="rule mt-4 w-12" />
                  <p className="mt-5 font-body text-[0.95rem] font-light leading-[1.8] text-muted">
                    {s.copy}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUOTE: BIRTHDAY ────────────────────────────────── */}
      <QuoteBand quote={quotes.birthday} image="dec7.jpeg" />

      {/* ── GALLERY ────────────────────────────────────────── */}
      <section id="gallery" className="relative overflow-hidden py-24 sm:py-32">
        <Ornament variant="quatrefoil" fade="fade-br" />
        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <SectionHeading eyebrow="Our Work" title="Gallery" />

          {/* Editorial grid — the first photograph runs full width */}
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
            {visibleGallery.map((img, i) => (
              <motion.div
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: (i % 3) * 0.08 }}
                key={img.file}
                className={`group relative overflow-hidden bg-linen shadow-card ${
                  i === 0 ? "col-span-2 lg:col-span-2 lg:row-span-2" : ""
                }`}
              >
                <img
                  src={`/${img.file}`}
                  alt={img.caption}
                  loading="lazy"
                  onError={() =>
                    setMissing((prev) => new Set(prev).add(img.file))
                  }
                  className={`w-full object-cover transition-transform duration-[1.2s] group-hover:scale-[1.06] ${
                    i === 0 ? "aspect-[4/3] lg:h-full" : "aspect-square"
                  }`}
                />

                {/* Whole tile opens the lightbox */}
                <button
                  onClick={() => setLightbox(img)}
                  aria-label={`View design ${img.code} — ${img.caption}`}
                  className="absolute inset-0 z-10 cursor-pointer"
                />

                {/* Design code — always visible, so it can be quoted */}
                <span className="pointer-events-none absolute left-3 top-3 z-20 bg-ivory/90 px-2.5 py-1 font-body text-[0.6rem] uppercase tracking-[0.18em] text-ink shadow-sm backdrop-blur-sm">
                  {img.code}
                </span>

                {/* Caption + action. Always shown on touch, on hover for pointers. */}
                <div
                  className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-ink/85 via-ink/55 to-transparent p-4 text-left
                             opacity-100 transition-opacity duration-500
                             md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
                >
                  <span className="block font-body text-[0.6rem] uppercase tracking-[0.2em] text-goldlight">
                    {img.tag} · {img.code}
                  </span>
                  <span className="mt-1 block font-display text-lg font-light leading-tight text-ivory">
                    {img.caption}
                  </span>
                  <button
                    onClick={() => pickDesign(img)}
                    className="mt-3 inline-flex items-center gap-1.5 bg-gold px-4 py-2 font-body text-[0.6rem] uppercase tracking-[0.16em]
                               text-ivory transition-colors duration-300 hover:bg-ivory hover:text-ink"
                  >
                    I like this design
                  </button>
                </div>
              </motion.div>
            ))}

            {/* Video tile */}
            <motion.div
              {...fadeUp}
              className="overflow-hidden bg-linen shadow-card"
            >
              <video
                src="/vid1.mp4"
                controls
                muted
                loop
                playsInline
                preload="metadata"
                className="aspect-square w-full object-cover"
              />
            </motion.div>
          </div>

          <motion.p
            {...fadeUp}
            className="mx-auto mt-12 max-w-xl text-center font-body text-sm font-light leading-relaxed text-muted"
          >
            {galleryNote}{" "}
            <a href="#contact" className="text-gold underline underline-offset-4">
              Tell us what you have in mind.
            </a>
          </motion.p>
        </div>
      </section>

      {/* ── QUOTE: ENGAGEMENT ──────────────────────────────── */}
      <QuoteBand quote={quotes.engagement} image="dec2.jpg" />

      {/* ── EQUIPMENT ──────────────────────────────────────── */}
      <section id="equipment" className="relative overflow-hidden py-24 sm:py-32">
        <Ornament variant="mandala" fade="fade-tl" />
        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <motion.div {...fadeUp} className="overflow-hidden shadow-soft">
              <img
                src="/dec4.jpeg"
                alt="Grand draped mandap with gold arch and white florals"
                loading="lazy"
                className="aspect-[5/4] w-full object-cover"
              />
            </motion.div>

            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.12 }}>
              <span className="eyebrow">In Our Store</span>
              <h2 className="mt-4 font-display text-4xl font-light leading-tight text-ink sm:text-5xl">
                Everything arrives
                <br />
                <span className="italic text-rose">with us</span>
              </h2>
              <div className="rule mt-6" />
              <p className="mt-8 font-body text-[1.02rem] font-light leading-[1.85] text-muted">
                We keep our own inventory, so your look is never limited by what
                happens to be available to rent that weekend.
              </p>

              <ul className="mt-10 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                {equipment.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 border-b border-ink/10 pb-3 font-body text-[0.9rem] font-light text-muted"
                  >
                    <span className="h-1 w-1 shrink-0 rotate-45 bg-gold" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── QUOTE: CLOSING ─────────────────────────────────── */}
      <QuoteBand quote={quotes.closing} image="dec8.jpeg" />

      {/* ── CONTACT ────────────────────────────────────────── */}
      <section id="contact" className="relative overflow-hidden py-24 sm:py-32">
        <Ornament variant="quatrefoil" fade="fade-edges" />
        <div className="relative z-10 mx-auto max-w-3xl px-6">
          <SectionHeading
            eyebrow="Get In Touch"
            title="Tell Us About Your Day"
          />

          <motion.form
            {...fadeUp}
            ref={form}
            onSubmit={sendEmail}
            className="bg-white/70 p-8 shadow-card backdrop-blur-sm sm:p-12"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <input
                type="text"
                name="user_name"
                placeholder="Your name"
                className="field"
                required
              />
              <input
                type="tel"
                name="user_phone"
                placeholder="Mobile number"
                className="field"
                required
              />
              <input
                type="text"
                name="event_type"
                placeholder="Type of event"
                className="field"
                required
              />
              <input
                type="email"
                name="user_email"
                placeholder="Email address"
                className="field"
              />
              <label className="flex flex-col">
                <span className="font-body text-[0.6rem] uppercase tracking-[0.18em] text-muted">
                  Event date
                </span>
                <input type="date" name="event_date" className="field" required />
              </label>
              <label className="flex flex-col">
                <span className="font-body text-[0.6rem] uppercase tracking-[0.18em] text-muted">
                  Start time
                </span>
                <input type="time" name="event_time" className="field" />
              </label>
              <div className="sm:col-span-2">
                <input
                  type="text"
                  name="event_place"
                  placeholder="Venue or city"
                  className="field"
                />
              </div>

              {/* Optional design reference — filled automatically by the
                  "I like this design" buttons, or typed in by hand. */}
              <div className="sm:col-span-2">
                <label className="flex flex-col">
                  <span className="font-body text-[0.6rem] uppercase tracking-[0.18em] text-muted">
                    Reference design <span className="text-muted/60">(optional)</span>
                  </span>
                  <input
                    ref={referenceRef}
                    type="text"
                    name="reference_design"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. W-02 — pick one from the gallery above"
                    className="field"
                  />
                </label>
                {reference && (
                  <p className="mt-2 font-body text-xs font-light text-gold">
                    Design {reference} will be included in your enquiry.
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <textarea
                  name="message"
                  rows="3"
                  placeholder="Colours, theme or anything you already have in mind"
                  className="field resize-none"
                />
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center gap-4">
              <button
                type="submit"
                disabled={status === "sending"}
                className="btn-gold w-full disabled:opacity-60 sm:w-auto"
              >
                {status === "sending" ? "Sending…" : "Send Enquiry"}
              </button>

              {status === "sent" && (
                <p className="font-body text-sm font-light text-gold">
                  Thank you — we&rsquo;ll be in touch shortly.
                </p>
              )}
              {status === "error" && (
                <p className="font-body text-sm font-light text-rose">
                  Something went wrong. Please call us instead.
                </p>
              )}
            </div>
          </motion.form>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="relative overflow-hidden border-t border-gold/25 bg-cream/60">
        <Ornament variant="mandala" fade="fade-edges" />
        <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 text-center">
          <p className="font-display text-3xl font-light text-ink">StageDecor</p>
          <div className="mx-auto mt-5 flex justify-center">
            <div className="rule" />
          </div>
          <p className="mt-8 font-body text-[0.7rem] uppercase tracking-[0.2em] text-muted">
            Maumud Mubshar
          </p>
          <a
            href="tel:4145422294"
            className="mt-3 inline-block font-display text-2xl font-light text-gold transition-colors hover:text-ink"
          >
            (414) 542-2294
          </a>
          <p className="mt-10 font-body text-[0.68rem] font-light tracking-wide text-muted/80">
            &copy; {new Date().getFullYear()} StageDecor. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ── LIGHTBOX ───────────────────────────────────────── */}
      {lightbox && (
        <div
          className="animate-fade fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-6 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={() => setLightbox(null)}
            aria-label="Close"
            className="absolute right-6 top-6 font-body text-3xl font-light text-ivory transition-colors hover:text-goldlight"
          >
            ×
          </button>
          <figure onClick={(e) => e.stopPropagation()} className="max-w-5xl">
            <img
              src={`/${lightbox.file}`}
              alt={lightbox.caption}
              className="max-h-[80vh] w-auto border-8 border-ivory/95 object-contain shadow-soft"
            />
            <figcaption className="mt-5 text-center">
              <span className="font-body text-[0.6rem] uppercase tracking-[0.2em] text-goldlight">
                {lightbox.tag} · Design {lightbox.code}
              </span>
              <span className="mt-2 block font-display text-xl font-light text-ivory">
                {lightbox.caption}
              </span>
              <button
                onClick={() => pickDesign(lightbox)}
                className="mt-5 inline-flex items-center bg-gold px-6 py-2.5 font-body text-[0.62rem] uppercase tracking-[0.16em]
                           text-ivory transition-colors duration-300 hover:bg-ivory hover:text-ink"
              >
                I like this design
              </button>
            </figcaption>
          </figure>
        </div>
      )}
    </div>
  );
}
