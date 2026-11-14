import { CATEGORIEEN, json, laadProducten, laadSfeer, laadTeksten } from "./lib/opslag.mjs";

export function zichtbaar(alle, teksten) {
  const dagen = Math.max(0, parseInt(teksten.verkochtDagen, 10) || 0);
  const grens = new Date(Date.now() - dagen * 864e5).toISOString().slice(0, 10);
  return alle.filter((p) => p.status !== "verborgen" && !(p.autoVerkocht && (p.verkochtOp || "") < grens));
}

export default async () => {
  const [alle, teksten, sfeer] = await Promise.all([laadProducten(), laadTeksten(), laadSfeer()]);
  const lijst = zichtbaar(alle, teksten);
  const producten = [...lijst.filter((p) => p.status !== "verkocht"), ...lijst.filter((p) => p.status === "verkocht")].map((p) => {
    const { etsyTitel, bewerkt, autoVerkocht, verkochtOp, ...rest } = p;
    return teksten.toonPrijzen ? rest : { ...rest, prijs: null };
  });
  return json({ producten, teksten, sfeer, categorieen: CATEGORIEEN }, 200, { "cache-control": "public, max-age=30" });
};
export const config = { path: "/api/site", method: "GET" };
