import { getStore } from "@netlify/blobs";
import { SEED_PRODUCTEN } from "./seed-producten.mjs";

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
  // Een kopie, zodat bewerkingen de startlijst in het geheugen nooit veranderen.
  return (await data().get("producten", { type: "json" })) ?? structuredClone(SEED_PRODUCTEN);
}
export async function laadTeksten() {
  return { ...STANDAARD_TEKSTEN, ...((await data().get("teksten", { type: "json" })) ?? {}) };
}
export async function laadSfeer() {
  return (await data().get("sfeer", { type: "json" })) ?? [];
}
export const slaProductenOp = (p) => data().setJSON("producten", p);
export const json = (d, status = 200, headers = {}) => Response.json(d, { status, headers });
