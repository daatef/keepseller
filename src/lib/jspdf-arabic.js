/**
 * Simple arabic text reshaper and RTL helper
 */
const arabicMap = {
  "\u0627": ["\uFE8D", "\uFE8E"], /* alif */
  // ...add other Arabic glyph mappings as needed...
};

function reshapeArabic(text) {
  return text.replace(/[\u0600-\u06FF]/g, (ch, idx, str) => {
    const before = str[idx - 1] || "";
    const after = str[idx + 1] || "";
    const [isolated, final] = arabicMap[ch] || [ch, ch];
    return final;
  });
}

export function arabicText(input) {
  const reshaped = reshapeArabic(input);
  return reshaped.split("").reverse().join("");
}
