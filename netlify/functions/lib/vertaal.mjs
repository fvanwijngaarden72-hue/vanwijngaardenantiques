// Vertaalt titels en omschrijvingen van de stukken met Gemini, per taal en in kleine porties.
import { bronHash, laadProducten, laadTeksten, laadVertaling, mistVertaling, slaVertalingOp } from "./opslag.mjs";
import { STANDAARD_VERTALING, TAALNAAM, TAAL_VELDEN, VERTAAL_TALEN } from "./talen.mjs";
import { tekstJson } from "./gemini.mjs";

const REGELS = (taal) => `Je vertaalt teksten van een Nederlandse webwinkel in vintage porselein en servies naar het ${TAALNAAM[taal]}.
Regels: merknamen, serie- en decornamen (zoals Villeroy & Boch, Botanica, Switch 3, Edme, Sanssouci) en maten blijven onvertaald. Gebruik de gangbare vaktermen voor servies in de doeltaal. Voeg niets toe en laat niets weg. Behoud regeleinden. Een lege tekst blijft leeg. Staat de brontekst al in de doeltaal, neem hem dan ongewijzigd over.`;

export async function vertaalStatus() {
  const producten = await laadProducten();
  const uit = {};
  for (const taal of VERTAAL_TALEN) { const V = await laadVertaling(taal); uit[taal] = producten.filter((p) => mistVertaling(p, V)).length; }
  return uit;
}

/** Vertaalt een portie stukken naar één taal. Geeft terug hoeveel er gedaan zijn en hoeveel er nog wachten. */
export async function vertaalBatch(taal, wachttijd = 50000) {
  if (!VERTAAL_TALEN.includes(taal)) throw new Error("Onbekende taal.");
  const producten = await laadProducten();
  const V = await laadVertaling(taal);
  const wacht = producten.filter((p) => mistVertaling(p, V));
  if (!wacht.length) return { gedaan: 0, rest: 0 };
  const portie = []; let tekens = 0;
  for (const p of wacht) { portie.push(p); tekens += p.titel.length + (p.omschrijving || "").length; if (portie.length >= 8 || tekens > 6000) break; }
  const invoer = portie.map((p) => ({ id: String(p.id), titel: p.titel, omschrijving: (p.omschrijving || "").slice(0, 3000) }));
  const r = await tekstJson(`${REGELS(taal)}
Geef als antwoord alleen JSON: een array met voor elk stuk een object {"id", "titel", "omschrijving"}, met dezelfde id's als in de invoer.
INVOER:
${JSON.stringify(invoer)}`, null, wachttijd);
  const lijst = Array.isArray(r) ? r : Array.isArray(r?.stukken) ? r.stukken : [];
  let gedaan = 0;
  for (const p of portie) {
    const v = lijst.find((x) => String(x?.id) === String(p.id));
    if (!v?.titel) continue;
    V[p.id] = { titel: String(v.titel).slice(0, 300), omschrijving: p.omschrijving ? String(v.omschrijving || "").slice(0, 9000) : "", bron: bronHash(p) };
    gedaan++;
  }
  const ids = new Set(producten.map((p) => String(p.id)));
  for (const id of Object.keys(V)) if (!ids.has(id)) delete V[id]; // vertalingen van verwijderde stukken opruimen
  if (gedaan) await slaVertalingOp(taal, V);
  return { gedaan, rest: wacht.length - gedaan };
}

export async function vertaalTeksten(taal) {
  if (!VERTAAL_TALEN.includes(taal)) throw new Error("Onbekende taal.");
  const t = await laadTeksten();
  const invoer = Object.fromEntries(TAAL_VELDEN.map((k) => [k, t[k]]));
  const r = await tekstJson(`${REGELS(taal)} De bedrijfsnaam Van Wijngaarden Antiques, de naam Rients van Wijngaarden en het woord Etsy blijven staan.
Geef als antwoord alleen JSON: een object met exact dezelfde sleutels als de invoer en de vertaalde teksten als waarden.
INVOER:
${JSON.stringify(invoer)}`);
  const uit = {};
  for (const k of TAAL_VELDEN) uit[k] = typeof r?.[k] === "string" && r[k].trim() ? r[k] : STANDAARD_VERTALING[taal][k];
  return uit;
}
