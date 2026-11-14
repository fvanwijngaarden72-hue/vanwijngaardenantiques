// Draait elke nacht: werkt de collectie bij vanuit Etsy, verlengt het Instagram-token,
// plaatst desgewenst één nieuw stuk op Instagram en laat nieuwe stukken vertalen.
// Elk onderdeel doet alleen iets als de bijbehorende sleutel is ingesteld.
import { etsyAan } from "./lib/etsy.mjs";
import { etsySync } from "./lib/sync.mjs";
import { data, laadProducten, slaProductenOp } from "./lib/opslag.mjs";
import { instaAan, plaats, ververs } from "./lib/instagram.mjs";
import { maakBijschrift } from "./lib/bijschrift.mjs";

const jpg = (u) => /\.jpe?g$/i.test(u || "");
async function autoPost(site) {
  const inst = (await data().get("instellingen", { type: "json" })) ?? {};
  if (!inst.instaAuto) return;
  const alle = await laadProducten();
  const grens = new Date(Date.now() - 14 * 864e5).toISOString().slice(0, 10);
  // Alleen recent toegevoegde stukken die nog niet geplaatst zijn, het oudste eerst.
  const p = alle.filter((x) => x.status === "beschikbaar" && !x.instagram && (x.toegevoegd || "") >= grens && jpg(x.foto)).sort((a, b) => a.toegevoegd.localeCompare(b.toegevoegd))[0];
  if (!p) return;
  let tekst = [p.merk, p.titel].filter(Boolean).join(" ") + "\n\nTe koop via de link in de bio.\n\n#vintageporselein #vintageservies #porselein #tableware";
  try { const b = await maakBijschrift({ ...p, taal: inst.instaTaal || "beide" }); if (b.bijschrift) tekst = b.bijschrift + "\n\n" + b.hashtags.join(" "); } catch (e) { console.error(e.message); }
  const eigen = p.foto.startsWith("/"), basis = eigen ? site + p.foto : p.foto;
  // Etsy-foto: eerst de grote maat, en als de verhouding niet past de bijgesneden liggende maat.
  const pogingen = eigen ? [basis] : [basis.replace(/il_(?:\d+x\w+|fullxfull)\./, "il_1140xN."), basis.replace(/il_(?:\d+x\w+|fullxfull)\./, "il_680x540.")];
  let post, laatste;
  for (const u of pogingen) { try { post = await plaats(u, tekst); break; } catch (e) { laatste = e; } }
  if (!post) throw laatste;
  const vers = await laadProducten(), doel = vers.find((x) => String(x.id) === String(p.id));
  if (doel) { doel.instagram = { wanneer: new Date().toISOString(), link: post.link }; await slaProductenOp(vers); }
  console.log("Op Instagram geplaatst:", p.titel);
}

export default async () => {
  const site = Netlify.env.get("URL");
  if (etsyAan()) {
    try {
      const uit = await etsySync();
      if (uit.teveel) throw new Error(`Etsy gaf maar ${uit.totaal} artikelen terug, waardoor ${uit.teveel} stukken op verkocht zouden gaan. Er is niets gewijzigd. Klopt het toch, klik dan in het beheer op ‘Nu bijwerken’.`);
      console.log("Etsy bijgewerkt", uit);
    } catch (e) { console.error(e); await data().setJSON("etsy-sync", { fout: e.message, wanneer: new Date().toISOString() }); }
  }
  if (instaAan()) {
    try { await ververs(); } catch (e) { console.error("Instagram-token verlengen mislukt:", e.message); }
    try { if (site) await autoPost(site); await data().delete("instagram-fout"); }
    catch (e) { console.error(e); await data().setJSON("instagram-fout", { fout: e.message, wanneer: new Date().toISOString() }); }
  }
  // Nieuwe en gewijzigde stukken daarna op de achtergrond laten vertalen.
  if (site && Netlify.env.get("GEMINI_API_KEY")) await fetch(site + "/.netlify/functions/vertaal-achtergrond", { method: "POST", headers: { "x-wachtwoord": Netlify.env.get("BEHEER_WACHTWOORD") || "" } }).catch(() => {});
};
// 04:15 UTC is 05:15 (winter) of 06:15 (zomer) in Nederland.
export const config = { schedule: "15 4 * * *" };
