// Zet per stuk en per categorie de juiste titel, omschrijving en deelfoto in de pagina,
// zodat Google, WhatsApp en Instagram een nette voorvertoning tonen. De pagina zelf blijft dezelfde.
import { CATEGORIEEN, laadProducten, laadTeksten } from "./lib/opslag.mjs";
import { zichtbaar } from "./site.mjs";

const NOOD = `<!DOCTYPE html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Van Wijngaarden Antiques</title><meta name="description" content=""><link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..700;1,6..96,400..700&family=Hanken+Grotesk:wght@400;500;600&display=swap" rel="stylesheet"><link rel="stylesheet" href="/style.css"></head><body><a class="skip" href="#inhoud">Naar de inhoud</a><aside class="kolom"><a href="/" class="stempel-link" aria-label="Van Wijngaarden Antiques, naar de homepage" id="stempel"></a><button class="menuknop" id="menuknop" aria-expanded="false" aria-controls="menu">Menu</button><nav id="menu" class="menu" aria-label="Hoofdmenu"></nav></aside><main id="inhoud" tabindex="-1"><p class="laden">Collectie laden</p></main><script src="/stempel.js"></script><script src="/app.js"></script></body></html>`;
const h = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
let sjabloon;

export default async (req, context) => {
  const url = new URL(req.url);
  if (!sjabloon) {
    try { const r = await fetch(new URL("/index.html", url), { signal: AbortSignal.timeout(4000) }); const t = r.ok ? await r.text() : ""; if (t.includes('id="inhoud"')) sjabloon = t; } catch {}
  }
  const [alle, teksten] = await Promise.all([laadProducten(), laadTeksten()]);
  let titel = "Van Wijngaarden Antiques", tekst = teksten.heroTekst, beeld = "", status = 200, extra = "";
  if (context.params.slug) {
    const p = zichtbaar(alle, teksten).find((x) => x.slug === context.params.slug);
    if (!p) { status = 404; titel = "Niet gevonden | Van Wijngaarden Antiques"; extra = '<meta name="robots" content="noindex">'; }
    else {
      const naam = [p.merk, p.titel].filter(Boolean).join(" ");
      titel = naam + " | Van Wijngaarden Antiques";
      tekst = (p.omschrijving || naam + ". Vintage porselein, te koop via de Etsy-winkel van Van Wijngaarden Antiques.").replace(/\s+/g, " ").slice(0, 200);
      beeld = p.foto.startsWith("/") ? url.origin + p.foto : p.foto;
      const ld = { "@context": "https://schema.org", "@type": "Product", name: naam, image: beeld, description: tekst, ...(p.merk ? { brand: { "@type": "Brand", name: p.merk } } : {}) };
      if (teksten.toonPrijzen && p.prijs != null && p.etsyUrl) ld.offers = { "@type": "Offer", url: p.etsyUrl, priceCurrency: "EUR", price: p.prijs.toFixed(2), itemCondition: "https://schema.org/UsedCondition", availability: "https://schema.org/" + (p.status === "verkocht" ? "SoldOut" : "InStock") };
      extra = `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`;
    }
  } else {
    const c = CATEGORIEEN.find((x) => x.id === context.params.cat);
    if (!c) { status = 404; titel = "Niet gevonden | Van Wijngaarden Antiques"; extra = '<meta name="robots" content="noindex">'; }
    else { titel = c.naam + " | Van Wijngaarden Antiques"; tekst = c.naam + " van vintage porselein. " + teksten.collectieTekst; beeld = alle.find((p) => p.categorie === c.id && p.status === "beschikbaar")?.foto || ""; if (beeld.startsWith("/")) beeld = url.origin + beeld; }
  }
  const kop = `<title>${h(titel)}</title><meta name="description" content="${h(tekst)}"><link rel="canonical" href="${h(url.origin + url.pathname)}"><meta property="og:type" content="website"><meta property="og:site_name" content="Van Wijngaarden Antiques"><meta property="og:title" content="${h(titel)}"><meta property="og:description" content="${h(tekst)}"><meta property="og:url" content="${h(url.origin + url.pathname)}">${beeld ? `<meta property="og:image" content="${h(beeld)}"><meta name="twitter:card" content="summary_large_image">` : ""}${extra}`;
  const html = (sjabloon || NOOD).replace(/<title>[^<]*<\/title>/, "").replace(/<meta name="description"[^>]*>/, "").replace(/<meta property="og:[^>]*>/g, "").replace("</head>", () => kop + "</head>");
  return new Response(html, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=0, must-revalidate" } });
};
export const config = { path: ["/stuk/:slug", "/collectie/:cat"], method: "GET" };
