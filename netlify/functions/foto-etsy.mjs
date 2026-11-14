// Haalt een Etsy-foto op via de eigen site, zodat Foto Studio en de Instagram-maker ermee kunnen werken.
export default async (req) => {
  let u;
  try { u = new URL(new URL(req.url).searchParams.get("u")); } catch { return new Response("Ongeldig adres", { status: 400 }); }
  if (u.protocol !== "https:" || u.hostname !== "i.etsystatic.com") return new Response("Alleen Etsy-foto's", { status: 403 });
  const r = await fetch(u);
  if (!r.ok) return new Response("Foto niet gevonden", { status: 404 });
  return new Response(await r.arrayBuffer(), { headers: {
    "content-type": r.headers.get("content-type") || "image/jpeg", "cache-control": "public, max-age=86400" } });
};
export const config = { path: "/foto-etsy", method: "GET" };
