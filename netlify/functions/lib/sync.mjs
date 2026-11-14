import { randomUUID } from "node:crypto";
import { CAT_IDS, SECTIES, data, laadProducten, laadTeksten, slaProductenOp } from "./opslag.mjs";
import { actieveListings, etsyShop } from "./etsy.mjs";

export const slugify = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/&/g, "en").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "stuk";
export const uniekeSlug = (basis, alle, eigenId) => { let s = basis, i = 2; while (alle.some((p) => p.slug === s && p.id !== eigenId)) s = basis + "-" + i++; return s; };
const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
// Het nummer in een Etsy-fotoadres (il_680x540.8226660240_ruob.jpg) is bij elke maat gelijk.
// Etsy-bestanden verwijzen naar de originele foto van vele megabytes: gebruik de webmaat.
export const webMaat = (u) => (/^https:\/\/i\.etsystatic\.com\//.test(u) ? u.replace(/il_fullxfull\./, "il_794xN.") : u);
export const fotoId = (u) => /il_[^./]+\.(\d+)_/.exec(u || "")?.[1];

const MERKEN = ["Villeroy & Boch", "Wedgwood", "Rosenthal", "Arzberg", "Winterling", "Jaeger & Co", "Scherzer", "Thomas", "Fürstenberg", "Royal Tettau", "Hutschenreuther", "AK Kaiser", "Kahla", "Kronester", "KPM", "Limoges", "Royal Albert", "Royal Doulton", "Royal Dux", "Royal Copenhagen", "Noritake", "Seltmann", "Bareuther", "Meissen", "Tirschenreuth", "Heinrich", "Lindner", "Gerold", "Carstens", "Mosa", "Petrus Regout", "Societe Ceramique", "Boch", "Regout", "Bavaria", "Johnson Brothers", "Spode", "Denby", "Arabia", "Bing & Grondahl"];
export function splitsTitel(etsyTitel) {
  const t = String(etsyTitel).trim();
  const merk = MERKEN.find((m) => t.toLowerCase().startsWith(m.toLowerCase())) || "";
  const rest = t.slice(merk.length).replace(/^[\s:,-]+/, "").replace(/^(Bavaria|Germany)\s+/i, "").split(",")[0].trim();
  return { merk: merk === "Bavaria" ? "" : merk, titel: rest ? rest[0].toUpperCase() + rest.slice(1) : t };
}
export function raadCategorie(t) {
  t = t.toLowerCase();
  if (/second choice|2nd choice|2e keus|tweede keus/.test(t)) return "koopjes";
  if (/\bvase|\bvaas|vazen|bloempot|flower pot/.test(t)) return "vazen";
  if (/figurine|ornament|beeldje|kandelaar/.test(t)) return "sier";
  if (/ceramic|keramiek|keramische/.test(t)) return "keramiek";
  if (/cake|pastry|taart|gebak/.test(t)) return "taart";
  if (/egg cup|eierdop/.test(t)) return "eierdopjes";
  if (/(coffee|tea|mocha|espresso|koffie|thee|mokka)[\w/ -]*(set|service|servies)/.test(t)) return "servies";
  if (/cream set|teapot|tea pot|coffee pot|roomstel|theepot|koffiepot|melkkan/.test(t)) return "potten";
  if (/trio|breakfast|ontbijt|dejeuner/.test(t)) return "ontbijt";
  if (/plate|bord/.test(t)) return "borden";
  return "los";
}

/**
 * Verwerkt artikelen uit Etsy (via de API of het CSV-bestand) in de collectie.
 * items: { listingId?, titel, omschrijving, prijs, fotos[], url?, categorie? }
 */
export function verwerk(alle, items, shopUrl, markeerVerkocht) {
  const opId = new Map(alle.map((p) => [String(p.id), p]));
  const opFoto = new Map();
  for (const p of alle) for (const u of [p.foto, ...(p.fotos || [])]) { const i = fotoId(u); if (i && !opFoto.has(i)) opFoto.set(i, p); }
  const opTitel = new Map(alle.map((p) => [norm(p.etsyTitel || p.titel), p]));
  const gezien = new Set();
  let bijgewerkt = 0, nieuw = 0, verkocht = 0;
  for (const it of items) {
    if (!it.titel) continue;
    const fotos = (it.fotos || []).filter((u) => /^https:\/\//.test(u)).map(webMaat);
    const p = (it.listingId && opId.get(String(it.listingId))) || fotos.map((u) => opFoto.get(fotoId(u))).find(Boolean) || opTitel.get(norm(it.titel));
    const afgeleid = splitsTitel(it.titel);
    if (p) {
      if (gezien.has(p.id)) continue;
      gezien.add(p.id);
      p.etsyTitel = it.titel;
      if (!p.bewerkt) { p.titel = afgeleid.titel; if (afgeleid.merk) p.merk = afgeleid.merk; if (it.categorie) p.categorie = it.categorie; }
      if (it.omschrijving && (!p.bewerkt || !p.omschrijving)) p.omschrijving = it.omschrijving;
      if (fotos.length) { p.fotos = fotos; if (!p.foto || p.foto.includes("etsystatic")) p.foto = fotos[0]; }
      if (it.prijs != null) p.prijs = it.prijs;
      if (it.url) p.etsyUrl = it.url;
      if (p.status === "verkocht" && p.autoVerkocht) { p.status = "beschikbaar"; delete p.autoVerkocht; delete p.verkochtOp; }
      bijgewerkt++;
    } else {
      if (!fotos.length) continue;
      const id = it.listingId ? String(it.listingId) : randomUUID();
      const n = { id, merk: afgeleid.merk, titel: afgeleid.titel, etsyTitel: it.titel, omschrijving: it.omschrijving || "",
        categorie: CAT_IDS.includes(it.categorie) ? it.categorie : raadCategorie(it.titel), foto: fotos[0], fotos,
        etsyUrl: it.url || shopUrl.replace(/\/$/, "") + "?search_query=" + encodeURIComponent(it.titel.slice(0, 60)),
        prijs: it.prijs ?? null, status: "beschikbaar", uitgelicht: false, toegevoegd: new Date().toISOString().slice(0, 10),
        slug: uniekeSlug(slugify(afgeleid.merk + " " + afgeleid.titel), alle, id) };
      alle.push(n); opId.set(id, n); opTitel.set(norm(it.titel), n); gezien.add(id); nieuw++;
    }
  }
  if (markeerVerkocht && gezien.size) for (const p of alle) {
    if (gezien.has(p.id) || p.status !== "beschikbaar" || !/etsy\.com/.test(p.etsyUrl || "")) continue;
    p.status = "verkocht"; p.autoVerkocht = true; p.verkochtOp = new Date().toISOString().slice(0, 10); verkocht++;
  }
  return { bijgewerkt, nieuw, verkocht };
}

export async function etsySync(forceer = false) {
  const shop = await etsyShop();
  const listings = await actieveListings(shop.shop_id);
  if (!listings.length) throw new Error("Etsy gaf geen actieve artikelen terug. Er is niets gewijzigd.");
  const items = listings.map((l) => ({
    listingId: l.listing_id, titel: l.title, omschrijving: l.description || "",
    prijs: l.price?.currency_code === "EUR" && l.price.divisor ? l.price.amount / l.price.divisor : null,
    fotos: [...(l.images || [])].sort((a, b) => (a.rank || 0) - (b.rank || 0)).map((i) => i.url_570xN || i.url_fullxfull).filter(Boolean),
    url: "https://www.etsy.com/listing/" + l.listing_id, categorie: SECTIES[l.shop_section_id],
  }));
  const alle = await laadProducten();
  const vooraf = alle.filter((p) => p.status === "beschikbaar").length;
  const uit = verwerk(alle, items, (await laadTeksten()).etsy, true);
  // Vangnet: zou meer dan de helft ineens op verkocht gaan, dan klopt er waarschijnlijk iets niet aan de Etsy-kant.
  if (!forceer && uit.verkocht > 10 && uit.verkocht > vooraf / 2) return { teveel: uit.verkocht, totaal: listings.length };
  await slaProductenOp(alle);
  const log = { ...uit, totaal: listings.length, wanneer: new Date().toISOString() };
  await data().setJSON("etsy-sync", log);
  return log;
}
