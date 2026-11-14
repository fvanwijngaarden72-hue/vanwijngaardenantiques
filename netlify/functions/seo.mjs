import { CATEGORIEEN, laadProducten, laadTeksten } from "./lib/opslag.mjs";
import { zichtbaar } from "./site.mjs";

export default async (req) => {
  const url = new URL(req.url);
  if (url.pathname === "/robots.txt")
    return new Response(`User-agent: *\nDisallow: /beheer\nDisallow: /api/\n\nSitemap: ${url.origin}/sitemap.xml\n`, { headers: { "content-type": "text/plain; charset=utf-8" } });
  const [alle, teksten] = await Promise.all([laadProducten(), laadTeksten()]);
  const lijst = zichtbaar(alle, teksten);
  const paden = ["/", "/collectie", "/over", "/contact", ...CATEGORIEEN.filter((c) => lijst.some((p) => p.categorie === c.id)).map((c) => "/collectie/" + c.id), ...lijst.map((p) => "/stuk/" + p.slug)];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paden.map((p) => `<url><loc>${url.origin}${p}</loc></url>`).join("\n")}\n</urlset>\n`;
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
};
export const config = { path: ["/sitemap.xml", "/robots.txt"], method: "GET" };
