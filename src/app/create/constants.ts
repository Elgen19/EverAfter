export const WAX_SEAL_COLORS = [
  { name: "Vintage Crimson", value: "#9c1c2e" },
  { name: "Deep Burgundy", value: "#5e0b1c" },
  { name: "Antique Gold", value: "#b38f36" },
  { name: "Midnight Navy", value: "#1b264f" },
  { name: "Sage Green", value: "#526e5b" },
  { name: "Dusty Rose", value: "#8c6b8c" }
];

export const THEMES = [
  { id: "royal", name: "Royal Gilt", desc: "Gold vine patterns, burgundy accents, and a royal crown crest" },
  { id: "scroll", name: "Royal Scroll", desc: "3D wooden scroll rollers and wavy deckle edges" },
  { id: "blush", name: "Blush Rose Gold", desc: "Soft cream paper, double-line borders, and rose-gold script" },
  { id: "lavender", name: "Crimson Gold Rose", desc: "Burgundy velvet paper, golden rose filigree borders, and a golden rose emblem" },
  { id: "midnight_rose", name: "Emerald Ivy", desc: "Cream parchment with deep green borders and antiqued bronze ivy frames" },
  { id: "celestial", name: "Celestial Eagle", desc: "Navy blue velvet paper, silver eagle ornaments, and twinkling stars" },
  { id: "obsidian_poppy", name: "Obsidian Poppy", desc: "Charcoal paper, geometric rose gold borders, and vintage dried poppy pods" }
];

export const SYMBOLS = [
  { id: "heart", char: "❤", name: "Heart" },
  { id: "rose", char: "🌹", name: "Rose" },
  { id: "star", char: "⭐", name: "Star" },
  { id: "ring", char: "💍", name: "Ring" }
];

export const BACKDROPS = [
  { id: "none", name: "No Backdrop", desc: "Solid theme background" },
  { id: "campfire", name: "Campfire Night", desc: "Couples stargazing near a warm campfire" },
  { id: "ocean_sunset", name: "Ocean Sunset", desc: "A warm walk along a sandy beach at sunset" },
  { id: "cozy_cafe", name: "Cozy Café", desc: "Warm city lights through a rainy window" },
  { id: "cherry_blossoms", name: "Cherry Blossoms", desc: "Dreamy cherry blossom trees path in full bloom" },
  { id: "vintage_library", name: "Vintage Library", desc: "Bookshelves, leather chairs, and fireplace" }
];

export const BACKDROP_PREVIEWS: Record<string, string> = {
  campfire: "/campfire_letter.png",
  ocean_sunset: "/ocean_sunset.png",
  cozy_cafe: "/cozy_cafe.png",
  cherry_blossoms: "/cherry_blossoms.png",
  vintage_library: "/vintage_library.png",
};
