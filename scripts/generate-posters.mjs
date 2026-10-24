import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const media = [
  {
    slug: "blade-runner-2049",
    title: ["BLADE", "RUNNER", "2049"],
    year: "2017",
    meta: "SCI-FI · 164 MIN",
    from: "#07222b",
    to: "#c4552b",
    accent: "#f2a65a",
    motif: "rings",
  },
  {
    slug: "dune-part-two",
    title: ["DUNE", "PART", "TWO"],
    year: "2024",
    meta: "SCI-FI · 166 MIN",
    from: "#2a1608",
    to: "#d98b3a",
    accent: "#ffe0a3",
    motif: "sun",
  },
  {
    slug: "arrival",
    title: ["ARRIVAL"],
    year: "2016",
    meta: "SCI-FI · 116 MIN",
    from: "#0b1720",
    to: "#456b7a",
    accent: "#cfe8ef",
    motif: "rings",
  },
  {
    slug: "whiplash",
    title: ["WHIPLASH"],
    year: "2014",
    meta: "DRAMA · 106 MIN",
    from: "#130b0b",
    to: "#7c1f1a",
    accent: "#ffb15c",
    motif: "lines",
  },
  {
    slug: "everything-everywhere",
    title: ["EVERYTHING", "EVERYWHERE", "ALL AT ONCE"],
    year: "2022",
    meta: "SCI-FI · 139 MIN",
    from: "#201021",
    to: "#d9487d",
    accent: "#79e0d2",
    motif: "orbit",
  },
  {
    slug: "parasite",
    title: ["PARASITE"],
    year: "2019",
    meta: "THRILLER · 132 MIN",
    from: "#0d1c13",
    to: "#4d7a4a",
    accent: "#e6e2bd",
    motif: "lines",
  },
  {
    slug: "her",
    title: ["HER"],
    year: "2013",
    meta: "ROMANCE · 126 MIN",
    from: "#2a1013",
    to: "#d96f5d",
    accent: "#ffd9c7",
    motif: "sun",
  },
  {
    slug: "the-batman",
    title: ["THE", "BATMAN"],
    year: "2022",
    meta: "CRIME · 176 MIN",
    from: "#0c0708",
    to: "#6e1417",
    accent: "#e8a0a0",
    motif: "orbit",
  },
  {
    slug: "sicario",
    title: ["SICARIO"],
    year: "2015",
    meta: "THRILLER · 121 MIN",
    from: "#1b140d",
    to: "#9a6a3e",
    accent: "#f3d6a2",
    motif: "sun",
  },
  {
    slug: "mad-max-fury-road",
    title: ["MAD MAX", "FURY ROAD"],
    year: "2015",
    meta: "ACTION · 120 MIN",
    from: "#2a1006",
    to: "#df6a1d",
    accent: "#8fd0e8",
    motif: "lines",
  },
  {
    slug: "severance",
    title: ["SEVERANCE"],
    year: "2022",
    meta: "SERIES · 9 EPISODES",
    from: "#071918",
    to: "#2f6f68",
    accent: "#eaf4ef",
    motif: "lines",
  },
  {
    slug: "mr-robot",
    title: ["MR.", "ROBOT"],
    year: "2015",
    meta: "SERIES · 10 EPISODES",
    from: "#0a0a0c",
    to: "#3f444d",
    accent: "#c5ff6b",
    motif: "orbit",
  },
  {
    slug: "dark",
    title: ["DARK"],
    year: "2017",
    meta: "SERIES · 10 EPISODES",
    from: "#071015",
    to: "#223c4a",
    accent: "#a7d8e8",
    motif: "rings",
  },
  {
    slug: "the-bear",
    title: ["THE", "BEAR"],
    year: "2022",
    meta: "SERIES · 8 EPISODES",
    from: "#151310",
    to: "#5c5347",
    accent: "#ffd27a",
    motif: "sun",
  },
  {
    slug: "cyberpunk-edgerunners",
    title: ["CYBERPUNK", "EDGERUNNERS"],
    year: "2022",
    meta: "SERIES · 10 EPISODES",
    from: "#1a0b24",
    to: "#c4d600",
    accent: "#ff3f8e",
    motif: "orbit",
  },
  {
    slug: "andor",
    title: ["ANDOR"],
    year: "2022",
    meta: "SERIES · 12 EPISODES",
    from: "#0b1016",
    to: "#4e4a3d",
    accent: "#ffc857",
    motif: "rings",
  },
  {
    slug: "poor-things",
    title: ["POOR", "THINGS"],
    year: "2023",
    meta: "COMEDY · 141 MIN",
    from: "#24101f",
    to: "#7c9b6d",
    accent: "#ffb7d5",
    motif: "orbit",
  },
  {
    slug: "past-lives",
    title: ["PAST", "LIVES"],
    year: "2023",
    meta: "ROMANCE · 105 MIN",
    from: "#1a1410",
    to: "#8a6a54",
    accent: "#f2d2b6",
    motif: "rings",
  },
  {
    slug: "the-substance",
    title: ["THE", "SUBSTANCE"],
    year: "2024",
    meta: "HORROR · 141 MIN",
    from: "#150a0d",
    to: "#8c2537",
    accent: "#ffd166",
    motif: "sun",
  },
  {
    slug: "perfect-days",
    title: ["PERFECT", "DAYS"],
    year: "2023",
    meta: "DRAMA · 124 MIN",
    from: "#0d1410",
    to: "#5f7a68",
    accent: "#e8d9a8",
    motif: "lines",
  },
];

const escapeXml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

function motifSvg(kind, accent) {
  if (kind === "rings") {
    return `
      <g fill="none" stroke="${accent}" opacity="0.5">
        <circle cx="480" cy="190" r="70" stroke-width="1.5"/>
        <circle cx="480" cy="190" r="120" stroke-width="1"/>
        <circle cx="480" cy="190" r="180" stroke-width="0.7"/>
        <circle cx="480" cy="190" r="250" stroke-width="0.45"/>
      </g>`;
  }
  if (kind === "sun") {
    return `
      <circle cx="452" cy="250" r="126" fill="${accent}" opacity="0.9"/>
      <g stroke="${accent}" opacity="0.35">
        <line x1="40" y1="700" x2="560" y2="700" stroke-width="1"/>
        <line x1="40" y1="732" x2="560" y2="732" stroke-width="1"/>
        <line x1="40" y1="764" x2="560" y2="764" stroke-width="1"/>
      </g>`;
  }
  if (kind === "orbit") {
    return `
      <g fill="none" stroke="${accent}" opacity="0.55">
        <ellipse cx="300" cy="330" rx="250" ry="88" transform="rotate(-24 300 330)"/>
        <ellipse cx="300" cy="330" rx="210" ry="66" transform="rotate(18 300 330)"/>
        <ellipse cx="300" cy="330" rx="290" ry="120" transform="rotate(-6 300 330)" opacity="0.5"/>
      </g>
      <circle cx="300" cy="330" r="58" fill="${accent}" opacity="0.9"/>`;
  }
  return `
    <g stroke="${accent}" opacity="0.35">
      ${Array.from({ length: 14 }, (_, i) => `<line x1="${60 + i * 36}" y1="60" x2="${18 + i * 36}" y2="840" stroke-width="1"/>`).join("")}
    </g>`;
}

function posterSvg(item) {
  const fontSize = item.title.length > 2 ? 58 : 80;
  const startY = 510 - (item.title.length - 1) * 34;
  const title = item.title
    .map((line, index) => `<tspan x="56" dy="${index === 0 ? 0 : fontSize * 0.98}">${escapeXml(line)}</tspan>`)
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900" role="img" aria-label="${escapeXml(item.title.join(" "))} poster">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${item.from}"/>
      <stop offset="100%" stop-color="${item.to}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.72" cy="0.28" r="0.75">
      <stop offset="0%" stop-color="${item.accent}" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="${item.accent}" stop-opacity="0"/>
    </radialGradient>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.13"/></feComponentTransfer>
    </filter>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="55%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.82"/>
    </linearGradient>
  </defs>
  <rect width="600" height="900" fill="url(#bg)"/>
  <rect width="600" height="900" fill="url(#glow)"/>
  ${motifSvg(item.motif, item.accent)}
  <rect width="600" height="900" filter="url(#grain)" opacity="0.9"/>
  <rect width="600" height="900" fill="url(#fade)"/>
  <g fill="#f6f2e9" font-family="ui-sans-serif, Inter, Helvetica, Arial, sans-serif">
    <text x="56" y="74" font-size="20" font-weight="700" letter-spacing="5" opacity="0.85">POPCORN</text>
    <text x="544" y="74" font-size="16" letter-spacing="3" text-anchor="end" opacity="0.7">${escapeXml(item.year)}</text>
    <text x="56" y="${startY}" font-size="${fontSize}" font-weight="800" letter-spacing="-2">${title}</text>
    <text x="58" y="824" font-size="15" letter-spacing="3.5" opacity="0.78">${escapeXml(item.meta)}</text>
  </g>
  <rect x="56" y="850" width="44" height="3" fill="${item.accent}"/>
</svg>`;
}

function backdropSvg(item) {
  const title = item.title.join(" ");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-label="${escapeXml(title)} backdrop">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${item.from}"/>
      <stop offset="100%" stop-color="${item.to}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.72" cy="0.35" r="0.62">
      <stop offset="0%" stop-color="${item.accent}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${item.accent}" stop-opacity="0"/>
    </radialGradient>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.1"/></feComponentTransfer>
    </filter>
    <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="35%" stop-color="#000" stop-opacity="0.72"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#bg)"/>
  <rect width="1600" height="900" fill="url(#glow)"/>
  <g transform="translate(1180 420) scale(1.7)">${motifSvg(item.motif, item.accent)}</g>
  <rect width="1600" height="900" filter="url(#grain)"/>
  <rect width="1600" height="900" fill="url(#fade)"/>
  <g fill="#f6f2e9" font-family="ui-sans-serif, Inter, Helvetica, Arial, sans-serif">
    <text x="90" y="760" font-size="26" font-weight="700" letter-spacing="7" opacity="0.8">POPCORN</text>
    <text x="90" y="820" font-size="18" letter-spacing="4" opacity="0.6">${escapeXml(item.meta)}</text>
  </g>
</svg>`;
}

const posterDir = path.join(process.cwd(), "public", "posters");
const backdropDir = path.join(process.cwd(), "public", "backdrops");
await mkdir(posterDir, { recursive: true });
await mkdir(backdropDir, { recursive: true });

for (const item of media) {
  await writeFile(path.join(posterDir, `${item.slug}.svg`), posterSvg(item));
  await writeFile(path.join(backdropDir, `${item.slug}.svg`), backdropSvg(item));
}

console.log(`Generated ${media.length} posters and backdrops.`);
