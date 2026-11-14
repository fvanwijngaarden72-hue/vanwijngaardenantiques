import { CATEGORIEEN, json, laadProducten, laadSfeer, laadTeksten, laadVertaling } from "./lib/opslag.mjs";
import { TALEN, categorieenInTaal, productInTaal, shareSave, tekstenInTaal } from "./lib/talen.mjs";

export function zichtbaar(alle, teksten) {
  const dagen = Math.max(0, parseInt(teksten.verkochtDagen, 10) || 0);
  const grens = new Date(Date.now() - dagen * 864e5).toISOString().slice(0, 10);
  return alle.filter((p) => p.status !== "verborgen" && !(p.autoVerkocht && (p.verkochtOp || "") < grens));
}
/** Alles wat de publieke site in één taal nodig heeft. */
export async function siteData(taal) {
  if (!TALEN.includes(taal)) taal = "nl";
  const [alle, teksten, sfeer, V, Ven] = await Promise.all([laadProducten(), laadTeksten(), laadSfeer(),
    taal === "nl" ? null : laadVertaling(taal), taal === "nl" || taal === "en" ? null : laadVertaling("en")]);
  const lijst = zichtbaar(alle, teksten);
  const producten = [...lijst.filter((p) => p.status !== "verkocht"), ...lijst.filter((p) => p.status === "verkocht")].map((p) => {
    const uit = productInTaal(p, taal, V, Ven);
    uit.etsyUrl = shareSave(uit.etsyUrl, teksten.etsy);
    if (!teksten.toonPrijzen) uit.prijs = null;
    return uit;
  });
  const t = tekstenInTaal(teksten, taal);
  return { taal, producten, teksten: { ...t, etsy: shareSave(t.etsy, t.etsy) }, sfeer, categorieen: categorieenInTaal(CATEGORIEEN, taal) };
}

export default async (req) => json(await siteData(new URL(req.url).searchParams.get("taal") || "nl"), 200, { "cache-control": "public, max-age=30" });
export const config = { path: "/api/site", method: "GET" };
