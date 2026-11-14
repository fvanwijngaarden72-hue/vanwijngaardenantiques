import { siteData } from "./site.mjs";
import { TALEN, padInTaal } from "./lib/talen.mjs";

export default async (req) => {
  const url = new URL(req.url);
  if (url.pathname === "/robots.txt")
    return new Response(`User-agent: *\nDisallow: /beheer\nDisallow: /api/\n\nSitemap: ${url.origin}/sitemap.xml\n`, { headers: { "content-type": "text/plain; charset=utf-8" } });
  const S = await siteData("nl");
  const paden = ["/", "/collectie", "/over", "/contact", ...S.categorieen.filter((c) => S.producten.some((p) => p.categorie === c.id)).map((c) => "/collectie/" + c.id), ...S.producten.map((p) => "/stuk/" + p.slug)];
  const adres = (p, t) => url.origin + padInTaal(p, t);
  // Elke pagina staat er in alle talen in, met verwijzingen naar de andere taalversies.
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${paden.flatMap((p) => { const alt = TALEN.map((t) => `<xhtml:link rel="alternate" hreflang="${t}" href="${adres(p, t)}"/>`).join(""); return TALEN.map((t) => `<url><loc>${adres(p, t)}</loc>${alt}</url>`); }).join("\n")}\n</urlset>\n`;
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
};
export const config = { path: ["/sitemap.xml", "/robots.txt"], method: "GET" };
