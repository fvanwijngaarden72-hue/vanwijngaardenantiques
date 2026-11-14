// Haalt elke nacht de actuele artikelen uit Etsy op. Doet niets zolang ETSY_API_KEY niet is ingesteld.
import { etsyAan } from "./lib/etsy.mjs";
import { etsySync } from "./lib/sync.mjs";
import { data } from "./lib/opslag.mjs";

export default async () => {
  if (!etsyAan()) return;
  try {
    const uit = await etsySync();
    if (uit.teveel) throw new Error(`Etsy gaf maar ${uit.totaal} artikelen terug, waardoor ${uit.teveel} stukken op verkocht zouden gaan. Er is niets gewijzigd. Klopt het toch, klik dan in het beheer op ‘Nu bijwerken’.`);
    console.log("Etsy bijgewerkt", uit);
    // Nieuwe en gewijzigde stukken daarna op de achtergrond laten vertalen.
    const site = Netlify.env.get("URL");
    if (site && Netlify.env.get("GEMINI_API_KEY")) await fetch(site + "/.netlify/functions/vertaal-achtergrond", { method: "POST", headers: { "x-wachtwoord": Netlify.env.get("BEHEER_WACHTWOORD") || "" } }).catch(() => {});
  }
  catch (e) { console.error(e); await data().setJSON("etsy-sync", { fout: e.message, wanneer: new Date().toISOString() }); }
};
// 04:15 UTC is 05:15 (winter) of 06:15 (zomer) in Nederland.
export const config = { schedule: "15 4 * * *" };
