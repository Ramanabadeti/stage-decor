import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import {
  business,
  galleryImages,
  galleryNote,
  heroImage,
  quotes,
  services,
  equipment,
} from "./content";
import "./App.css";

// Swiper powers the phone carousel
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

/* Full-screen viewer with zoom. Supports the pinch gesture, the wheel,
   double-tap and explicit buttons, because on a phone people reach for
   pinch and on a desktop they look for a + button. */
function Lightbox({ img, onClose, onPick }) {
  const MIN = 1;
  const MAX = 4;
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const pointers = useRef(new Map());
  const pinchStart = useRef(null);
  const panStart = useRef(null);

  const reset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  // Start fresh whenever a different design is opened
  useEffect(reset, [img.file]);

  const clamp = (s) => Math.min(MAX, Math.max(MIN, s));

  // Functional updates: several clicks (or wheel ticks) can land before a
  // re-render, and each must build on the last, not on a stale value.
  const zoomBy = (delta) => setScale((s) => clamp(s + delta));
  const zoomTo = (value) => setScale(() => clamp(value));

  // Once fully zoomed out there is nothing to pan to
  useEffect(() => {
    if (scale === MIN) setOffset({ x: 0, y: 0 });
  }, [scale]);

  const onWheel = (e) => {
    e.preventDefault();
    zoomBy(e.deltaY > 0 ? -0.35 : 0.35);
  };

  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  const onPointerDown = (e) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture?.(e.pointerId);

    if (pointers.current.size === 2) {
      const [p1, p2] = [...pointers.current.values()];
      pinchStart.current = { d: dist(p1, p2), scale };
      panStart.current = null;
    } else if (scale > MIN) {
      panStart.current = {
        startX: e.clientX,
        startY: e.clientY,
        ox: offset.x,
        oy: offset.y,
      };
    }
  };

  const onPointerMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2 && pinchStart.current) {
      const [p1, p2] = [...pointers.current.values()];
      const ratio = dist(p1, p2) / (pinchStart.current.d || 1);
      zoomTo(pinchStart.current.scale * ratio);
      return;
    }

    if (panStart.current) {
      setOffset({
        x: panStart.current.ox + (e.clientX - panStart.current.startX),
        y: panStart.current.oy + (e.clientY - panStart.current.startY),
      });
    }
  };

  const onPointerUp = (e) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
    if (pointers.current.size === 0) panStart.current = null;
  };

  return (
    <div
      className="animate-fade fixed inset-0 z-[60] flex flex-col bg-ink"
      role="dialog"
      aria-modal="true"
      aria-label={`Design ${img.code}`}
    >
      {/* Top bar: code and close */}
      <div className="flex items-center justify-between px-5 py-4">
        <span className="font-body text-[0.65rem] uppercase tracking-[0.2em] text-goldlight">
          {img.tag} · Design {img.code}
        </span>
        <button
          onClick={onClose}
          aria-label="Close"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-ivory/15 text-2xl font-light text-ivory
                     transition-colors hover:bg-ivory hover:text-ink"
        >
          ×
        </button>
      </div>

      {/* The picture */}
      <div
        className="flex flex-1 items-center justify-center overflow-hidden px-4"
        style={{ touchAction: "none" }}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={() => zoomTo(scale > 1 ? 1 : 2.5)}
      >
        <img
          src={`/${img.file}`}
          alt={img.caption}
          draggable="false"
          className="max-h-full max-w-full select-none object-contain shadow-soft"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transition: panStart.current || pinchStart.current ? "none" : "transform 0.25s ease",
            cursor: scale > 1 ? "grab" : "zoom-in",
          }}
        />
      </div>

      {/* Bottom bar: caption, zoom controls, action */}
      <div className="px-5 pb-6 pt-4">
        <p className="text-center font-display text-lg font-light text-ivory">
          {img.caption}
        </p>

        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => zoomBy(-0.5)}
            disabled={scale <= MIN}
            aria-label="Zoom out"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-ivory/15 text-xl text-ivory
                       transition-colors hover:bg-ivory hover:text-ink disabled:opacity-30 disabled:hover:bg-ivory/15 disabled:hover:text-ivory"
          >
            −
          </button>
          <span className="w-14 text-center font-body text-[0.65rem] uppercase tracking-[0.15em] text-ivory/70">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => zoomBy(0.5)}
            disabled={scale >= MAX}
            aria-label="Zoom in"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-ivory/15 text-xl text-ivory
                       transition-colors hover:bg-ivory hover:text-ink disabled:opacity-30 disabled:hover:bg-ivory/15 disabled:hover:text-ivory"
          >
            +
          </button>
          {scale > 1 && (
            <button
              onClick={reset}
              className="ml-2 font-body text-[0.6rem] uppercase tracking-[0.15em] text-ivory/70 underline underline-offset-4 hover:text-goldlight"
            >
              Reset
            </button>
          )}
        </div>

        <div className="mt-5 flex justify-center">
          <button
            onClick={() => onPick(img)}
            className="inline-flex items-center bg-gold px-6 py-2.5 font-body text-[0.62rem] uppercase tracking-[0.16em]
                       text-ivory transition-colors duration-300 hover:bg-ivory hover:text-ink"
          >
            I like this design
          </button>
        </div>
      </div>
    </div>
  );
}

/* One gallery card, used by both the phone carousel and the desktop grid.
   The number sits ON the photograph; the description and the action sit
   BELOW it, so nothing covers the design the customer is judging. */
function GalleryCard({ img, onOpen, onPick, onMissing, tall = false }) {
  return (
    <figure className="group flex h-full flex-col overflow-hidden bg-white/80 shadow-card backdrop-blur-sm">
      <button
        onClick={() => onOpen(img)}
        aria-label={`Open design ${img.code} — ${img.caption}`}
        className="relative block w-full overflow-hidden"
      >
        <img
          src={`/${img.file}`}
          alt={img.caption}
          loading="lazy"
          onError={() => onMissing(img.file)}
          className={`w-full object-cover transition-transform duration-[1.2s] group-hover:scale-[1.05] ${
            tall ? "aspect-[4/3]" : "aspect-[4/3]"
          }`}
        />
        {/* Picture number, over the photograph */}
        <span className="absolute left-3 top-3 bg-ivory/90 px-2.5 py-1 font-body text-[0.62rem] uppercase tracking-[0.18em] text-ink shadow-sm backdrop-blur-sm">
          {img.code}
        </span>
        {/* Hint that the picture opens */}
        <span className="pointer-events-none absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-ivory/85 text-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
            <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zm.5-7H9v2H7v1h2v2h1v-2h2V9h-2V7z" />
          </svg>
        </span>
      </button>

      {/* Description and action, below the photograph */}
      <figcaption className="flex flex-1 flex-col items-start p-5">
        <span className="font-body text-[0.58rem] uppercase tracking-[0.2em] text-gold">
          {img.tag} · {img.code}
        </span>
        <h3 className="mt-2 font-display text-xl font-light leading-snug text-ink">
          {img.caption}
        </h3>
        <button
          onClick={() => onPick(img)}
          className="mt-4 inline-flex items-center bg-gold px-5 py-2.5 font-body text-[0.6rem] uppercase tracking-[0.16em]
                     text-ivory transition-colors duration-300 hover:bg-ink"
        >
          I like this design
        </button>
      </figcaption>
    </figure>
  );
}

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
  const markMissing = (file) => setMissing((prev) => new Set(prev).add(file));

  // Respect a reduced-motion preference by not auto-advancing the carousel
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

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

  // Stop the page scrolling behind the open viewer
  useEffect(() => {
    document.body.style.overflow = lightbox ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  const sendEmail = (e) => {
    e.preventDefault();
    setStatus("sending");

    const data = Object.fromEntries(new FormData(form.current).entries());
    const chosen = data.reference_design?.trim() || "";
    const notes = data.message?.trim() || "";

    // Every answer as plain text.
    const summary = [
      ["Name", data.user_name],
      ["Mobile", data.user_phone],
      ["Email", data.user_email],
      ["Event", data.event_type],
      ["Date", data.event_date],
      ["Time", data.event_time],
      ["Venue", data.event_place],
      ["Reference design", chosen || "Not specified"],
      ["Notes", notes || "—"],
    ]
      .map(([k, v]) => `${k}: ${v || "—"}`)
      .join("\n");

    /* No-data-loss guarantee.
       The EmailJS template decides which variables get printed, and we
       cannot see it from here. So the full summary is folded into
       `message` as well — the one field the original template already
       printed. Whatever that template contains, the enquiry arrives
       complete. A template that prints the individual variables too will
       simply repeat a few lines, which is the right trade against
       silently dropping a customer's event date or design code. */
    const messageWithEverything = notes
      ? `${notes}\n\n— — — Enquiry details — — —\n${summary}`
      : `— — — Enquiry details — — —\n${summary}`;

    emailjs
      .send(
        "service_tg8t50h",
        "template_z4ziarc",
        {
          ...data,
          reference_design: chosen || "Not specified",
          summary,
          message: messageWithEverything,
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
            {business.cityRegion} · Weddings · Engagements · Birthdays
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
            your colours and built in your {business.city} venue, ready before
            your first guest arrives.
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
              birthdays and corporate events across {business.city} and the
              surrounding Wisconsin area. Every setup begins with your colours
              and your venue — never a template.
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

          {/* PHONE — auto-advancing carousel, every design in one place */}
          <motion.div {...fadeUp} className="md:hidden">
            <Swiper
              modules={[Autoplay, Pagination]}
              slidesPerView={1}
              spaceBetween={16}
              loop={visibleGallery.length > 2}
              autoplay={
                reduceMotion
                  ? false
                  : { delay: 2000, disableOnInteraction: false }
              }
              pagination={{ clickable: true }}
              className="gallery-swiper !pb-12"
            >
              {visibleGallery.map((img) => (
                <SwiperSlide key={img.file} className="!h-auto">
                  <GalleryCard
                    img={img}
                    onOpen={setLightbox}
                    onPick={pickDesign}
                    onMissing={markMissing}
                  />
                </SwiperSlide>
              ))}
              <SwiperSlide className="!h-auto">
                <figure className="flex h-full flex-col overflow-hidden bg-white/80 shadow-card backdrop-blur-sm">
                  <video
                    src="/vid1.mp4"
                    controls
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <figcaption className="p-5">
                    <span className="font-body text-[0.58rem] uppercase tracking-[0.2em] text-gold">
                      Walkthrough
                    </span>
                    <h3 className="mt-2 font-display text-xl font-light text-ink">
                      See a setup in motion
                    </h3>
                  </figcaption>
                </figure>
              </SwiperSlide>
            </Swiper>
          </motion.div>

          {/* DESKTOP — grid of the same cards */}
          <div className="hidden gap-5 md:grid md:grid-cols-2 lg:grid-cols-3">
            {visibleGallery.map((img, i) => (
              <motion.div
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: (i % 3) * 0.08 }}
                key={img.file}
              >
                <GalleryCard
                  img={img}
                  onOpen={setLightbox}
                  onPick={pickDesign}
                  onMissing={markMissing}
                />
              </motion.div>
            ))}

            <motion.figure
              {...fadeUp}
              className="flex flex-col overflow-hidden bg-white/80 shadow-card backdrop-blur-sm"
            >
              <video
                src="/vid1.mp4"
                controls
                muted
                loop
                playsInline
                preload="metadata"
                className="aspect-[4/3] w-full object-cover"
              />
              <figcaption className="p-5">
                <span className="font-body text-[0.58rem] uppercase tracking-[0.2em] text-gold">
                  Walkthrough
                </span>
                <h3 className="mt-2 font-display text-xl font-light text-ink">
                  See a setup in motion
                </h3>
              </figcaption>
            </motion.figure>
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
          <p className="font-display text-3xl font-light text-ink">
            {business.name}
          </p>
          <div className="mx-auto mt-5 flex justify-center">
            <div className="rule" />
          </div>
          <p className="mt-6 font-body text-[0.7rem] uppercase tracking-[0.2em] text-gold">
            Stage &amp; Event Decoration · {business.cityRegion}
          </p>
          <p className="mt-6 font-body text-[0.7rem] uppercase tracking-[0.2em] text-muted">
            {business.contactName}
          </p>
          <a
            href={`tel:${business.phone}`}
            className="mt-3 inline-block font-display text-2xl font-light text-gold transition-colors hover:text-ink"
          >
            {business.phoneDisplay}
          </a>
          <div className="mt-5 flex justify-center">
            <a
              href={`https://wa.me/${business.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-[0.68rem] uppercase tracking-[0.18em] text-muted underline underline-offset-4 transition-colors hover:text-gold"
            >
              Message us on WhatsApp
            </a>
          </div>
          <p className="mt-10 font-body text-[0.68rem] font-light tracking-wide text-muted/80">
            &copy; {new Date().getFullYear()} {business.name}. Serving{" "}
            {business.city} and surrounding areas. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ── FLOATING CONTACT ───────────────────────────────────
          Always within thumb reach. On a phone these are the two
          actions that actually turn a visitor into a booking. */}
      <div
        className={`fixed bottom-5 right-5 z-40 flex-col gap-3 print:hidden ${
          lightbox ? "hidden" : "flex"
        }`}
      >
        <a
          href={`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(
            "Hello StageDecor, I would like to enquire about stage decoration for my event."
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Message us on WhatsApp"
          className="flex items-center justify-center rounded-full bg-[#25D366] p-3.5 shadow-soft
                     transition-transform duration-300 hover:scale-110"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white" aria-hidden="true">
            <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.07-.13-.27-.2-.57-.35z" />
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.69 8.23-8.24 8.23z" />
          </svg>
        </a>

        <a
          href={`tel:${business.phone}`}
          aria-label={`Call ${business.phoneDisplay}`}
          className="flex items-center justify-center rounded-full bg-gold p-3.5 shadow-soft
                     transition-transform duration-300 hover:scale-110"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-ivory" aria-hidden="true">
            <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
          </svg>
        </a>
      </div>

      {/* ── LIGHTBOX ───────────────────────────────────────── */}
      {lightbox && (
        <Lightbox
          img={lightbox}
          onClose={() => setLightbox(null)}
          onPick={pickDesign}
        />
      )}
    </div>
  );
}
