import { getStore } from "@netlify/blobs";
import { createHash } from "node:crypto";
import { SEED_PRODUCTEN } from "./seed-producten.mjs";
import { STANDAARD_VERTALING, TAAL_VELDEN, VERTAAL_TALEN } from "./talen.mjs";

export const data = () => getStore({ name: "vwa-data", consistency: "strong" });
export const fotos = () => getStore({ name: "vwa-fotos", consistency: "strong" });

export const CATEGORIEEN = [
  ["servies", "Koffie- en theeserviezen"], ["los", "Losse stukken"], ["borden", "Borden"],
  ["potten", "Potten en roomstellen"], ["ontbijt", "Trio's en ontbijt"], ["taart", "Taart en gebak"],
  ["eierdopjes", "Eierdopjes"], ["vazen", "Vazen"], ["sier", "Siervoorwerpen"],
  ["keramiek", "Keramiek"], ["koopjes", "Koopjeshoek"],
].map(([id, naam]) => ({ id, naam }));

export const CAT_IDS = CATEGORIEEN.map((c) => c.id);
// De afdelingen (shop sections) van de Etsy-winkel, gekoppeld aan de categorieën op de site.
export const SECTIES = { 50653304: "servies", 51101251: "los", 49636498: "borden", 49643438: "potten", 50664403: "ontbijt",
  50665945: "taart", 53325560: "eierdopjes", 51382550: "vazen", 53336311: "sier", 50664381: "keramiek", 53092452: "koopjes" };

export const STANDAARD_TEKSTEN = {
  heroTitel: "Voor een sensationeel gedekte tafel",
  heroTekst: "Vintage porselein en servies van onder meer Villeroy & Boch, Wedgwood en Rosenthal. Kijk hier rustig rond en koop veilig via mijn winkel op Etsy.",
  heroKnop: "Bekijk de collectie",
  collectieTitel: "Collectie",
  collectieTekst: "Complete serviezen en losse stukken om je eigen servies aan te vullen. Prijs, maten en beschikbaarheid vind je bij elk stuk op Etsy.",
  overTitel: "Over Van Wijngaarden Antiques",
  overTekst: "Ik ben Rients van Wijngaarden en vanuit Groningen verkoop ik vintage porselein en servies.\n\nJe vindt hier complete koffie- en theeserviezen, maar ook losse borden, kopjes en potten. Handig als er thuis eens iets sneuvelt of als je een servies wilt uitbreiden.",
  koopTitel: "Zo koop je een stuk",
  koopTekst: "Elk stuk op deze site staat te koop in mijn winkel op Etsy. Klik bij een stuk op ‘Bekijk op Etsy’ en reken daar af. Verzendkosten, retourvoorwaarden en de levertijd staan op de Etsy-pagina van het stuk.",
  contactTitel: "Contact",
  contactTekst: "Op zoek naar een bepaald servies of een ontbrekend onderdeel? Mail me gerust.",
  email: "info@vanwijngaardenantiques.com",
  instagram: "",
  etsy: "https://www.etsy.com/shop/RientsPorselein",
  bedrijf: "Rients van Wijngaarden, Van Wijngaarden Antiques\nNieuw Kijk in 't Jatstraat 63, 9712 SE Groningen",
  toonPrijzen: false,
  verkochtDagen: "30",
};

export async function laadProducten() {
  const p = await data().get("producten", { type: "json" });
  if (p) return p;
  // Een kopie, zodat bewerkingen de startlijst in het geheugen nooit veranderen.
  return structuredClone(SEED_PRODUCTEN).map(({ i18n, ...rest }) => rest);
}
export async function laadTeksten() {
  const t = { ...STANDAARD_TEKSTEN, ...((await data().get("teksten", { type: "json" })) ?? {}) };
  const i18n = {};
  for (const taal of VERTAAL_TALEN) { i18n[taal] = {}; for (const k of TAAL_VELDEN) i18n[taal][k] = t.i18n?.[taal]?.[k] || STANDAARD_VERTALING[taal][k]; }
  return { ...t, i18n };
}
// Vingerafdruk van de Nederlandse tekst: verandert die, dan is de vertaling verouderd.
export const bronHash = (p) => createHash("sha1").update(p.titel + "\n" + (p.omschrijving || "")).digest("hex").slice(0, 10);
/** Vertalingen van één taal: { [stuk-id]: { titel, omschrijving, bron } }. */
export async function laadVertaling(taal) {
  const v = await data().get("vertaling-" + taal, { type: "json" });
  if (v) return v;
  const uit = {};
  for (const p of SEED_PRODUCTEN) if (p.i18n?.[taal]?.titel) uit[p.id] = { ...p.i18n[taal], bron: bronHash(p) };
  return uit;
}
export const slaVertalingOp = (taal, v) => data().setJSON("vertaling-" + taal, v);
export const mistVertaling = (p, V) => !V[p.id]?.titel || V[p.id].bron !== bronHash(p);
export async function laadSfeer() {
  return (await data().get("sfeer", { type: "json" })) ?? [];
}
export const slaProductenOp = (p) => data().setJSON("producten", p);
export const json = (d, status = 200, headers = {}) => Response.json(d, { status, headers });
