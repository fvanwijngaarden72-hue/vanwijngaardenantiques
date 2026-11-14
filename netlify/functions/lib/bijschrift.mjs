import { tekstJson } from "./gemini.mjs";

const kort = (s, n) => String(s || "").slice(0, n);
/** Laat Gemini een Instagram-bijschrift met hashtags schrijven. */
export async function maakBijschrift(b, foto) {
  const taal = { nl: "Nederlands", en: "Engels", beide: "eerst Nederlands, dan een witregel en dezelfde tekst in het Engels" }[b.taal] || "Nederlands";
  const r = await tekstJson(`Schrijf een Instagram-bijschrift voor een verkoper van vintage porselein (Van Wijngaarden Antiques).
Stuk: ${kort(b.merk, 80)} ${kort(b.titel, 200)}. Omschrijving: ${kort(b.omschrijving, 1500) || "geen"}. Etsy-titel: ${kort(b.etsyTitel, 300) || "geen"}. Extra wens: ${kort(b.wens, 300) || "geen"}.
Toon: ${kort(b.toon, 60) || "warm en persoonlijk"}. Taal: ${taal}. Noem aan het eind dat het stuk te koop is via de link in de bio. Verzin geen leeftijd, staat of prijs. Gebruik hoogstens één emoji.
Geef JSON met "bijschrift" (string zonder hashtags) en "hashtags" (array van 8 tot 12 relevante hashtags met #).`, foto);
  return { bijschrift: String(r.bijschrift || ""), hashtags: Array.isArray(r.hashtags) ? r.hashtags.map(String).slice(0, 25) : [] };
}
