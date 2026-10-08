// One place for the business details that appear across the site.
export const business = {
  name: "StageDecor",
  contactName: "Maumud Mubshar",
  city: "Milwaukee",
  region: "WI",
  cityRegion: "Milwaukee, WI",
  // Digits only — used to build tel: and wa.me links
  phone: "4146171267",
  phoneDisplay: "(414) 617-1267",
  whatsapp: "14146171267",
};

// Gallery photos. `code` is the reference a customer quotes when they
// want "that design" — it is shown on the tile and travels into the email.
export const galleryImages = [
  { code: "W-01", file: "dec1.jpg", caption: "Ivory & Burgundy Wedding Stage", tag: "Wedding" },
  { code: "W-02", file: "dec5.jpeg", caption: "Gold Arch with Blush Florals", tag: "Wedding" },
  { code: "W-03", file: "dec4.jpeg", caption: "Grand Draped Mandap Setting", tag: "Wedding" },
  { code: "E-01", file: "dec2.jpg", caption: "Royal Gold & Teal Thrones", tag: "Engagement" },
  { code: "W-04", file: "dec8.jpeg", caption: "Burgundy & Gold Drape with Silver Chaise", tag: "Wedding" },
  { code: "W-05", file: "dec9.jpeg", caption: "White & Gold Arch with Floral Archways", tag: "Wedding" },
  { code: "W-06", file: "dec11.jpeg", caption: "Champagne & Ivory Drape with Rose Garland", tag: "Wedding" },
  { code: "R-01", file: "dec3.jpeg", caption: "Champagne Drape & Floral Pillars", tag: "Reception" },
  { code: "R-02", file: "dec6.jpeg", caption: "Full Hall Styling & Head Table", tag: "Reception" },
  { code: "R-03", file: "dec10.jpeg", caption: "Gold Archway with Pillars & Topiary", tag: "Reception" },
  { code: "B-01", file: "dec7.jpeg", caption: "Guest Tables in Rose & Gold", tag: "Banquet" },
];

// Shown under the video tile so the code system explains itself.
export const galleryNote =
  "Every setup carries a reference code. Quote it when you enquire and we will recreate that look in your colours.";

export const heroImage = "dec1.jpg";

// Quotations written for this site — elegant lines for each kind of celebration.
export const quotes = {
  wedding: {
    text:
      "Two hearts, one story — and a stage worthy of the chapter that begins today.",
    label: "For Weddings",
  },
  birthday: {
    text:
      "Every candle deserves a room that celebrates as loudly as the wish behind it.",
    label: "For Birthdays",
  },
  engagement: {
    text:
      "Before the vows and before the guests, there is a moment. We build the setting it deserves.",
    label: "For Engagements",
  },
  closing: {
    text:
      "The flowers will fade. The photographs never will.",
    label: "Our Promise",
  },
};

export const services = [
  {
    title: "Wedding Stages",
    image: "dec5.jpeg",
    copy:
      "Mandaps, reception backdrops and floral arches styled in your colours, from intimate ceremonies to grand halls.",
  },
  {
    title: "Birthday & Milestones",
    image: "dec7.jpeg",
    copy:
      "Themed setups, balloon and floral installations, and dessert-table styling that make the photographs worth keeping.",
  },
  {
    title: "Engagements & Receptions",
    image: "dec2.jpg",
    copy:
      "Statement seating, draped backdrops and gold detailing designed to hold every eye in the room.",
  },
  {
    title: "Lighting & Draping",
    image: "dec3.jpeg",
    copy:
      "Warm uplighting, fairy curtains and full-hall draping that transform a plain venue end to end.",
  },
];

export const equipment = [
  "Backdrop frames & panels",
  "Silk and shimmer draping",
  "Fresh & artificial florals",
  "Roman pillars and plinths",
  "Throne and lounge seating",
  "Fairy lights & uplighting",
  "Walkways and aisle décor",
  "Table linen & centrepieces",
];
