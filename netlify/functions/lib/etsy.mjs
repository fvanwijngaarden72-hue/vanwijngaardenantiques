// Optionele koppeling met de Etsy Open API v3. Werkt alleen als ETSY_API_KEY is ingesteld,
// in de vorm keystring:shared_secret (te vinden bij etsy.com/developers/your-apps).
const API = "https://openapi.etsy.com/v3/application";
export const STANDAARD_SHOP_ID = "37637858";
export const SHOP_NAAM = "RientsPorselein";
export const etsyAan = () => !!Netlify.env.get("ETSY_API_KEY");

async function etsy(pad) {
  const key = Netlify.env.get("ETSY_API_KEY");
  if (!key) throw new Error("De Etsy-sleutel ontbreekt. Zet ETSY_API_KEY in Netlify.");
  const r = await fetch(API + pad, { headers: { "x-api-key": key, accept: "application/json" }, signal: AbortSignal.timeout(20000) });
  const d = await r.json().catch(() => ({}));
  if (r.status === 401 || r.status === 403) throw new Error("Etsy weigert de sleutel" + (key.includes(":") ? "" : ". Gebruik de vorm keystring:shared_secret") + ": " + (d.error || d.error_description || r.status));
  if (r.status === 429) throw new Error("De daglimiet van de Etsy-sleutel is bereikt. Probeer het morgen opnieuw.");
  if (!r.ok) { const e = new Error("Etsy gaf een fout: " + (d.error || r.status)); e.status = r.status; throw e; }
  return d;
}

export async function etsyShop() {
  const id = Netlify.env.get("ETSY_SHOP_ID") || STANDAARD_SHOP_ID;
  try { return await etsy("/shops/" + id); }
  catch (e) {
    if (e.status !== 404) throw e;
    const d = await etsy("/shops?shop_name=" + SHOP_NAAM);
    if (!d.results?.[0]) throw new Error("De Etsy-winkel is niet gevonden. Zet ETSY_SHOP_ID in Netlify.");
    return d.results[0];
  }
}

export async function actieveListings(shopId) {
  const alle = [];
  for (let offset = 0; offset < 2000; offset += 100) {
    const d = await etsy(`/shops/${shopId}/listings/active?limit=100&offset=${offset}&includes=Images`);
    alle.push(...(d.results || []));
    if ((d.results || []).length < 100 || alle.length >= (d.count ?? Infinity)) break;
  }
  // Niet elke variant van dit eindpunt geeft de foto's mee: haal ze dan per 100 artikelen op.
  const zonder = alle.filter((l) => !l.images?.length);
  for (let i = 0; i < zonder.length; i += 100) {
    const ids = zonder.slice(i, i + 100).map((l) => l.listing_id);
    const d = await etsy(`/listings/batch?listing_ids=${ids.join(",")}&includes=Images`);
    const op = new Map((d.results || []).map((l) => [l.listing_id, l.images]));
    for (const l of zonder.slice(i, i + 100)) l.images = op.get(l.listing_id) || [];
  }
  return alle;
}
