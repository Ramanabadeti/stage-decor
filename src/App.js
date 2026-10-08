import { useEffect, useMemo, useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { business, galleryImages, galleryNote } from "./content";
import "./App.css";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const domId = (code) => `design-${code}`;

/* Render one layout or the other, never both. Rendering both would put
   two elements with the same id in the page, and the scroll-to-design
   jump would land on the hidden copy. */
function useIsDesktop() {
  const query = "(min-width: 768px)";
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    setIsDesktop(mq.matches);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isDesktop;
}

/* ──────────────────────────────────────────────────────────
   Full-screen viewer: pinch, wheel, double-tap and buttons
   ────────────────────────────────────────────────────────── */
function Lightbox({ img, onClose, onPick }) {
  const MIN = 1;
  const MAX = 4;
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const pointers = useRef(new Map());
  const pinch = useRef(null);
  const pan = useRef(null);
  const stage = useRef(null);

  const clamp = (s) => Math.min(MAX, Math.max(MIN, s));
  const zoomBy = (d) => setScale((s) => clamp(s + d));
  const zoomTo = (v) => setScale(() => clamp(v));

  useEffect(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, [img.file]);

  useEffect(() => {
    if (scale === MIN) setOffset({ x: 0, y: 0 });
  }, [scale]);

  // React binds wheel passively, so preventDefault there only warns
  useEffect(() => {
    const el = stage.current;
    if (!el) return undefined;
    const onWheel = (e) => {
      e.preventDefault();
      zoomBy(e.deltaY > 0 ? -0.35 : 0.35);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const gap = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  const down = (e) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture?.(e.pointerId);
    if (pointers.current.size === 2) {
      const [p1, p2] = [...pointers.current.values()];
      pinch.current = { d: gap(p1, p2), scale };
      pan.current = null;
    } else if (scale > MIN) {
      pan.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
    }
  };

  const move = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && pinch.current) {
      const [p1, p2] = [...pointers.current.values()];
      zoomTo(pinch.current.scale * (gap(p1, p2) / (pinch.current.d || 1)));
      return;
    }
    if (pan.current) {
      setOffset({
        x: pan.current.ox + (e.clientX - pan.current.x),
        y: pan.current.oy + (e.clientY - pan.current.y),
      });
    }
  };

  const up = (e) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) pan.current = null;
  };

  return (
    <div
      className="animate-fade fixed inset-0 z-[60] flex flex-col bg-ink"
      role="dialog"
      aria-modal="true"
      aria-label={`Design ${img.code}`}
    >
      <div className="flex items-center justify-between px-5 py-4">
        <span className="font-body text-[0.65rem] uppercase tracking-[0.2em] text-goldlight">
          {img.tag} · Design {img.code}
        </span>
        <button
          onClick={onClose}
          aria-label="Close"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-ivory/15 text-2xl font-light
                     text-ivory transition-colors hover:bg-ivory hover:text-ink"
        >
          ×
        </button>
      </div>

      <div
        ref={stage}
        className="flex flex-1 items-center justify-center overflow-hidden px-4"
        style={{ touchAction: "none" }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onDoubleClick={() => zoomTo(scale > 1 ? 1 : 2.5)}
      >
        <img
          src={`/${img.file}`}
          alt={img.caption}
          draggable="false"
          className="max-h-full max-w-full select-none object-contain"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transition: pan.current || pinch.current ? "none" : "transform .25s ease",
            cursor: scale > 1 ? "grab" : "zoom-in",
          }}
        />
      </div>

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
                       transition-colors hover:bg-ivory hover:text-ink disabled:opacity-30"
          >
            −
          </button>
          <span className="w-14 text-center font-body text-[0.65rem] tracking-[0.15em] text-ivory/70">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => zoomBy(0.5)}
            disabled={scale >= MAX}
            aria-label="Zoom in"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-ivory/15 text-xl text-ivory
                       transition-colors hover:bg-ivory hover:text-ink disabled:opacity-30"
          >
            +
          </button>
        </div>
        <div className="mt-5 flex justify-center">
          <button
            onClick={() => onPick(img)}
            className="inline-flex items-center bg-gold px-6 py-2.5 font-body text-[0.62rem] uppercase
                       tracking-[0.16em] text-ivory transition-colors hover:bg-ivory hover:text-ink"
          >
            I like this design
          </button>
        </div>
      </div>
    </div>
  );
}

/* One picture card: number on the photo, details and action beneath */
function DesignCard({ img, onOpen, onPick, onMissing, flagged }) {
  return (
    <figure
      id={domId(img.code)}
      className={`flex h-full scroll-mt-28 flex-col overflow-hidden bg-white shadow-[0_6px_28px_-20px_rgba(58,51,45,0.5)] ${
        flagged ? "flag-it" : ""
      }`}
    >
      <button
        onClick={() => onOpen(img)}
        aria-label={`Enlarge design ${img.code} — ${img.caption}`}
        className="group relative block w-full overflow-hidden"
      >
        <img
          src={`/${img.file}`}
          alt={img.caption}
          loading="lazy"
          onError={() => onMissing(img.file)}
          className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <span className="absolute left-3 top-3 bg-ivory/90 px-2.5 py-1 font-body text-[0.62rem] uppercase tracking-[0.18em] text-ink">
          {img.code}
        </span>
      </button>

      <figcaption className="flex flex-1 flex-col items-start p-4">
        <span className="font-body text-[0.56rem] uppercase tracking-[0.2em] text-gold">
          {img.tag}
        </span>
        <h3 className="mt-1.5 font-display text-lg font-light leading-snug text-ink">
          {img.caption}
        </h3>
        <button
          onClick={() => onPick(img)}
          className="mt-3 inline-flex items-center bg-gold px-4 py-2 font-body text-[0.58rem] uppercase
                     tracking-[0.16em] text-ivory transition-colors hover:bg-ink"
        >
          I like this design
        </button>
      </figcaption>
    </figure>
  );
}

export default function App() {
  const form = useRef();
  const referenceRef = useRef();
  const swiperRef = useRef(null);

  const [lightbox, setLightbox] = useState(null);
  const [status, setStatus] = useState(null);
  const [reference, setReference] = useState("");
  const [missing, setMissing] = useState(() => new Set());
  const [filter, setFilter] = useState("All");
  const [flagged, setFlagged] = useState(null);

  const markMissing = (file) => setMissing((p) => new Set(p).add(file));

  const isDesktop = useIsDesktop();

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const present = galleryImages.filter((g) => !missing.has(g.file));
  const categories = useMemo(
    () => ["All", ...new Set(galleryImages.map((g) => g.tag))],
    []
  );
  const shown = filter === "All" ? present : present.filter((g) => g.tag === filter);

  // Swiper does not reliably start autoplay when React renders its slides
  useEffect(() => {
    if (reduceMotion) return undefined;
    const kick = () => {
      const sw = swiperRef.current;
      if (sw && !sw.destroyed && sw.autoplay && !sw.autoplay.running) {
        sw.autoplay.start();
      }
    };
    kick();
    const t = window.setTimeout(kick, 600);
    document.addEventListener("visibilitychange", kick);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("visibilitychange", kick);
    };
  }, [reduceMotion, shown.length]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setLightbox(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = lightbox ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  /* Clicking a small picture on the left jumps the big grid to it
     and rings it briefly so the eye finds it. */
  const jumpTo = (img) => {
    if (filter !== "All" && img.tag !== filter) setFilter("All");
    window.setTimeout(() => {
      document
        .getElementById(domId(img.code))
        ?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      setFlagged(img.code);
      window.setTimeout(() => setFlagged(null), 1900);
    }, 60);
  };

  const pickDesign = (img) => {
    setReference(img.code);
    setStatus(null);
    setLightbox(null);
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    window.setTimeout(() => referenceRef.current?.focus({ preventScroll: true }), 700);
  };

  const sendEmail = (e) => {
    e.preventDefault();
    setStatus("sending");

    const data = Object.fromEntries(new FormData(form.current).entries());
    const chosen = data.reference_design?.trim() || "";
    const notes = data.message?.trim() || "";

    const summary = [
      ["Name", data.user_name],
      ["Mobile", data.user_phone],
      ["Email", data.user_email],
      ["Event", data.event_type],
      ["Date", data.event_date],
      ["Venue", data.event_place],
      ["Reference design", chosen || "Not specified"],
      ["Notes", notes || "—"],
    ]
      .map(([k, v]) => `${k}: ${v || "—"}`)
      .join("\n");

    // Folded into `message` too, so nothing is lost whatever the template prints
    const message = notes
      ? `${notes}\n\n— — — Enquiry details — — —\n${summary}`
      : `— — — Enquiry details — — —\n${summary}`;

    emailjs
      .send(
        "service_tg8t50h",
        "template_z4ziarc",
        { ...data, reference_design: chosen || "Not specified", summary, message },
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
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-ivory/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
          <a href="#top" className="flex flex-col leading-none">
            <span className="font-display text-xl font-medium tracking-wide text-ink sm:text-2xl">
              {business.name}
            </span>
            <span className="mt-1 hidden font-body text-[0.52rem] uppercase tracking-luxe text-gold sm:inline sm:text-[0.55rem]">
              Wedding &amp; Event Decoration
            </span>
          </a>

          <nav className="flex items-center gap-5">
            <a
              href="#gallery"
              className="font-body text-[0.65rem] uppercase tracking-[0.18em] text-muted transition-colors hover:text-gold"
            >
              Gallery
            </a>
            <a
              href="#contact"
              className="font-body text-[0.65rem] uppercase tracking-[0.18em] text-muted transition-colors hover:text-gold"
            >
              Contact
            </a>
            <a href={`tel:${business.phone}`} className="btn-gold !px-4 !py-2 !text-[0.6rem]">
              Call
            </a>
          </nav>
        </div>
      </header>

      {/* ── INTRO ──────────────────────────────────────────── */}
      <section id="top" className="px-5 pb-10 pt-14 text-center sm:pt-20">
        <p className="eyebrow">{business.cityRegion}</p>
        <h1 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-light leading-tight text-ink sm:text-5xl">
          Stage decoration for weddings,
          <br className="hidden sm:block" /> engagements and birthdays
        </h1>
        <div className="mx-auto mt-6 flex justify-center">
          <div className="rule" />
        </div>
      </section>

      {/* ── GALLERY ────────────────────────────────────────── */}
      <section id="gallery" className="px-5 pb-16 pt-4">
        <div className="mx-auto max-w-6xl">
          {/* Category filters */}
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`chip ${filter === c ? "chip-on" : ""}`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* ===== PHONE: carousel on top, then every design below ===== */}
          {!isDesktop && (
          <div>
            <div className="relative">
              <Swiper
                modules={[Autoplay, Pagination, Navigation]}
                slidesPerView={1}
                spaceBetween={14}
                loop={shown.length > 2}
                autoplay={
                  reduceMotion
                    ? false
                    : { delay: 4000, disableOnInteraction: false, waitForTransition: false }
                }
                navigation={{ prevEl: ".gallery-prev", nextEl: ".gallery-next" }}
                pagination={{ clickable: true }}
                onSwiper={(sw) => {
                  swiperRef.current = sw;
                }}
                className="gallery-swiper !pb-10"
              >
                {shown.map((img) => (
                  <SwiperSlide key={img.file}>
                    <button
                      onClick={() => setLightbox(img)}
                      className="relative block w-full overflow-hidden"
                      aria-label={`Enlarge design ${img.code}`}
                    >
                      <img
                        src={`/${img.file}`}
                        alt={img.caption}
                        onError={() => markMissing(img.file)}
                        className="aspect-[4/3] w-full object-cover"
                      />
                      <span className="absolute left-3 top-3 bg-ivory/90 px-2.5 py-1 font-body text-[0.62rem] uppercase tracking-[0.18em] text-ink">
                        {img.code}
                      </span>
                    </button>
                  </SwiperSlide>
                ))}
              </Swiper>

              <button
                className="gallery-prev absolute left-2 top-[38%] z-50 flex h-11 w-11 -translate-y-1/2 items-center
                           justify-center rounded-full border border-ivory/40 bg-ink/25 text-ivory backdrop-blur-sm"
                aria-label="Previous design"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                </svg>
              </button>
              <button
                className="gallery-next absolute right-2 top-[38%] z-50 flex h-11 w-11 -translate-y-1/2 items-center
                           justify-center rounded-full border border-ivory/40 bg-ink/25 text-ivory backdrop-blur-sm"
                aria-label="Next design"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                </svg>
              </button>
            </div>

            {/* Every design, one by one */}
            <div className="mt-8 space-y-6">
              {shown.map((img) => (
                <DesignCard
                  key={img.file}
                  img={img}
                  onOpen={setLightbox}
                  onPick={pickDesign}
                  onMissing={markMissing}
                  flagged={flagged === img.code}
                />
              ))}
            </div>
          </div>

          )}

          {/* ===== DESKTOP / TABLET: thumb rail left, big pictures right ===== */}
          {isDesktop && (
          <div className="grid gap-6 md:grid-cols-[190px_1fr] lg:gap-8 lg:grid-cols-[230px_1fr]">
            <aside className="self-start md:sticky md:top-24">
              <p className="mb-3 font-body text-[0.56rem] uppercase tracking-[0.2em] text-muted">
                All designs
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {present.map((img) => (
                  <button
                    key={img.file}
                    onClick={() => jumpTo(img)}
                    title={`${img.code} — ${img.caption}`}
                    className={`relative overflow-hidden border transition-all duration-200 ${
                      flagged === img.code
                        ? "border-gold ring-2 ring-gold"
                        : "border-transparent hover:border-gold"
                    }`}
                  >
                    <img
                      src={`/${img.file}`}
                      alt={img.caption}
                      loading="lazy"
                      onError={() => markMissing(img.file)}
                      className="aspect-square w-full object-cover"
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-ink/70 py-1 text-center font-body text-[0.58rem] uppercase tracking-[0.14em] text-ivory">
                      {img.code}
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            <div className="grid grid-cols-2 gap-6">
              {shown.map((img) => (
                <DesignCard
                  key={img.file}
                  img={img}
                  onOpen={setLightbox}
                  onPick={pickDesign}
                  onMissing={markMissing}
                  flagged={flagged === img.code}
                />
              ))}
            </div>
          </div>
          )}

          <p className="mx-auto mt-12 max-w-xl text-center font-body text-sm font-light leading-relaxed text-muted">
            {galleryNote}
          </p>
        </div>
      </section>

      {/* ── CONTACT ────────────────────────────────────────── */}
      <section id="contact" className="border-t border-gold/20 bg-white/50 px-5 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <p className="eyebrow">Get in touch</p>
            <h2 className="mt-3 font-display text-3xl font-light text-ink sm:text-4xl">
              Tell us about your day
            </h2>
            <div className="mx-auto mt-5 flex justify-center">
              <div className="rule" />
            </div>
          </div>

          <form ref={form} onSubmit={sendEmail} className="mt-10 grid gap-4 sm:grid-cols-2">
            <input type="text" name="user_name" placeholder="Your name" className="field" required />
            <input type="tel" name="user_phone" placeholder="Mobile number" className="field" required />
            <input type="text" name="event_type" placeholder="Type of event" className="field" required />
            <input type="email" name="user_email" placeholder="Email (optional)" className="field" />
            <label className="flex flex-col gap-1">
              <span className="font-body text-[0.58rem] uppercase tracking-[0.16em] text-muted">
                Event date
              </span>
              <input type="date" name="event_date" className="field" required />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-body text-[0.58rem] uppercase tracking-[0.16em] text-muted">
                Design number (optional)
              </span>
              <input
                ref={referenceRef}
                type="text"
                name="reference_design"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. W-02"
                className="field"
              />
            </label>
            <div className="sm:col-span-2">
              <input type="text" name="event_place" placeholder="Venue or city" className="field" />
            </div>
            <div className="sm:col-span-2">
              <textarea
                name="message"
                rows="3"
                placeholder="Colours, theme or anything you have in mind"
                className="field resize-none"
              />
            </div>

            <div className="flex flex-col items-center gap-3 sm:col-span-2">
              {reference && (
                <p className="font-body text-xs font-light text-gold">
                  Design {reference} will be included in your enquiry.
                </p>
              )}
              <button
                type="submit"
                disabled={status === "sending"}
                className="btn-gold w-full disabled:opacity-60 sm:w-auto"
              >
                {status === "sending" ? "Sending…" : "Send enquiry"}
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
          </form>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="border-t border-gold/20 px-5 py-12 text-center">
        <p className="font-display text-2xl font-light text-ink">{business.name}</p>
        <p className="mt-3 font-body text-[0.62rem] uppercase tracking-[0.2em] text-gold">
          {business.cityRegion}
        </p>
        <a
          href={`tel:${business.phone}`}
          className="mt-4 inline-block font-display text-xl font-light text-gold hover:text-ink"
        >
          {business.phoneDisplay}
        </a>
        <p className="mt-2 font-body text-[0.62rem] uppercase tracking-[0.18em] text-muted">
          {business.contactName}
        </p>
        <p className="mt-8 font-body text-[0.62rem] font-light text-muted/80">
          &copy; {new Date().getFullYear()} {business.name}. Serving {business.city} and
          surrounding areas.
        </p>
      </footer>

      {/* ── FLOATING CONTACT ───────────────────────────────── */}
      <div
        className={`fixed bottom-5 right-5 z-30 flex-col gap-3 ${lightbox ? "hidden" : "flex"}`}
      >
        <a
          href={`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(
            "Hello StageDecor, I would like to enquire about stage decoration for my event."
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Message us on WhatsApp"
          className="flex items-center justify-center rounded-full bg-[#25D366] p-3.5 shadow-soft transition-transform hover:scale-110"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white" aria-hidden="true">
            <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.07-.13-.27-.2-.57-.35z" />
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.69 8.23-8.24 8.23z" />
          </svg>
        </a>
        <a
          href={`tel:${business.phone}`}
          aria-label={`Call ${business.phoneDisplay}`}
          className="flex items-center justify-center rounded-full bg-gold p-3.5 shadow-soft transition-transform hover:scale-110"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-ivory" aria-hidden="true">
            <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
          </svg>
        </a>
      </div>

      {lightbox && (
        <Lightbox img={lightbox} onClose={() => setLightbox(null)} onPick={pickDesign} />
      )}
    </div>
  );
}
