// Zet per pagina en per taal de juiste titel, omschrijving, deelfoto en taalverwijzingen in de pagina,
// zodat Google, WhatsApp en Instagram een nette voorvertoning tonen. De pagina zelf blijft dezelfde.
import { siteData } from "./site.mjs";
import { META, TALEN, padInTaal, taalVanPad } from "./lib/talen.mjs";

const NOOD = `<!DOCTYPE html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Van Wijngaarden Antiques</title><meta name="description" content=""><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..700;1,6..96,400..700&family=Hanken+Grotesk:wght@400;500;600&display=swap" rel="stylesheet"><link rel="stylesheet" href="/style.css"></head><body><a class="skip" href="#inhoud">Naar de inhoud</a><aside class="kolom"><a href="/" class="stempel-link" aria-label="Van Wijngaarden Antiques" id="stempel"></a><select id="taalkeuze" class="taalkeuze" aria-label="Taal"></select><button class="menuknop" id="menuknop" aria-expanded="false" aria-controls="menu">Menu</button><nav id="menu" class="menu" aria-label="Menu"></nav></aside><main id="inhoud" tabindex="-1"><p class="laden">…</p></main><script src="/stempel.js"></script><script src="/app.js"></script></body></html>`;
const h = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
let sjabloon;

export default async (req) => {
  const url = new URL(req.url);
  if (!sjabloon) {
    try { const r = await fetch(new URL("/index.html", url), { signal: AbortSignal.timeout(4000) }); const t = r.ok ? await r.text() : ""; if (t.includes('id="inhoud"')) sjabloon = t; } catch {}
  }
  const { taal, rest } = taalVanPad(decodeURIComponent(url.pathname).replace(/(.)\/$/, "$1"));
  const S = await siteData(taal), M = META[taal], d = rest.split("/").filter(Boolean);
  const naamSite = "Van Wijngaarden Antiques";
  let titel = M.home, tekst = S.teksten.heroTekst, beeld = "", status = 200, extra = "";
  const mis = () => { status = 404; titel = M.niet + " | " + naamSite; extra = '<meta name="robots" content="noindex">'; };
  if (!d.length) { /* homepage */ }
  else if (d[0] === "stuk" && d.length === 2) {
    const p = S.producten.find((x) => x.slug === d[1]);
    if (!p) mis();
    else {
      const naam = [p.merk, p.titel].filter(Boolean).join(" ");
      titel = naam + " | " + naamSite;
      tekst = (p.omschrijving || M.stuk(naam)).replace(/\s+/g, " ").slice(0, 200);
      beeld = p.foto;
      const ld = { "@context": "https://schema.org", "@type": "Product", name: naam, image: p.foto.startsWith("/") ? url.origin + p.foto : p.foto, description: tekst, ...(p.merk ? { brand: { "@type": "Brand", name: p.merk } } : {}) };
      if (p.prijs != null && p.etsyUrl) ld.offers = { "@type": "Offer", url: p.etsyUrl, priceCurrency: "EUR", price: p.prijs.toFixed(2), itemCondition: "https://schema.org/UsedCondition", availability: "https://schema.org/" + (p.status === "verkocht" ? "SoldOut" : "InStock") };
      extra = `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`;
    }
  } else if (d[0] === "collectie" && d.length <= 2) {
    const c = d[1] && S.categorieen.find((x) => x.id === d[1]);
    if (d[1] && !c) mis();
    else if (c) { titel = c.naam + " | " + naamSite; tekst = M.cat(c.naam) + S.teksten.collectieTekst; beeld = S.producten.find((p) => p.categorie === c.id && p.status === "beschikbaar")?.foto || ""; }
    else { titel = S.teksten.collectieTitel + " | " + naamSite; tekst = S.teksten.collectieTekst; }
  } else if (d[0] === "over" && d.length === 1) { titel = S.teksten.overTitel + " | " + naamSite; tekst = S.teksten.overTekst.replace(/\s+/g, " ").slice(0, 200); }
  else if (d[0] === "contact" && d.length === 1) { titel = S.teksten.contactTitel + " | " + naamSite; tekst = S.teksten.contactTekst; }
  else mis();
  if (beeld.startsWith("/")) beeld = url.origin + beeld;
  const hier = url.origin + padInTaal(rest, taal);
  const talen = status === 200 ? TALEN.map((t) => `<link rel="alternate" hreflang="${t}" href="${h(url.origin + padInTaal(rest, t))}">`).join("") + `<link rel="alternate" hreflang="x-default" href="${h(url.origin + padInTaal(rest, "en"))}">` : "";
  const kop = `<title>${h(titel)}</title><meta name="description" content="${h(tekst)}"><link rel="canonical" href="${h(hier)}">${talen}<meta property="og:type" content="website"><meta property="og:site_name" content="${naamSite}"><meta property="og:locale" content="${taal}"><meta property="og:title" content="${h(titel)}"><meta property="og:description" content="${h(tekst)}"><meta property="og:url" content="${h(hier)}">${beeld ? `<meta property="og:image" content="${h(beeld)}"><meta name="twitter:card" content="summary_large_image">` : ""}${extra}`;
  const html = (sjabloon || NOOD).replace(/<html lang="[^"]*">/, `<html lang="${taal}">`).replace(/<title>[^<]*<\/title>/, "").replace(/<meta name="description"[^>]*>/, "").replace(/<meta property="og:[^>]*>/g, "").replace("</head>", () => kop + "</head>");
  return new Response(html, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=0, must-revalidate" } });
};
export const config = { path: ["/stuk/:slug", "/collectie/:cat", ...["en", "de", "fr", "it", "es"].flatMap((t) => ["/" + t, "/" + t + "/*"])], method: "GET" };
