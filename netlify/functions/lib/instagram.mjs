// Koppeling met Instagram (Instagram API met Instagram-login). Werkt alleen als INSTAGRAM_TOKEN is ingesteld.
// Het token is 60 dagen geldig; de site ververst het elke nacht zelf en bewaart het nieuwe token in de opslag.
import { data } from "./opslag.mjs";

const API = "https://graph.instagram.com";
export const instaAan = () => !!Netlify.env.get("INSTAGRAM_TOKEN");
const fout = (d, r) => new Error("Instagram gaf een fout: " + (d?.error?.error_user_msg || d?.error?.message || r.status));

async function token() {
  const env = Netlify.env.get("INSTAGRAM_TOKEN");
  if (!env) throw new Error("Instagram is nog niet gekoppeld. Zet INSTAGRAM_TOKEN in Netlify.");
  const op = await data().get("instagram-token", { type: "json" });
  // Het bewaarde token hoort bij het token uit Netlify; is dat vervangen, dan geldt het nieuwe.
  return op?.bron === env.slice(-12) && op.token ? op.token : env;
}
async function ig(pad, { method = "GET", body } = {}) {
  const r = await fetch(API + pad, { method, signal: AbortSignal.timeout(30000),
    headers: { authorization: "Bearer " + (await token()), ...(body ? { "content-type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || d.error) throw fout(d, r);
  return d;
}
export async function instaAccount() {
  const d = await ig("/me?fields=user_id,username");
  const op = await data().get("instagram-token", { type: "json" });
  return { id: d.user_id || d.id, naam: d.username, verloopt: op?.verloopt || null };
}
/** Verlengt het token met 60 dagen. Kan pas als het token minstens een dag oud is. */
export async function ververs() {
  const env = Netlify.env.get("INSTAGRAM_TOKEN"), huidig = await token();
  const r = await fetch(API + "/refresh_access_token?grant_type=ig_refresh_token&access_token=" + encodeURIComponent(huidig), { signal: AbortSignal.timeout(20000) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.access_token) throw fout(d, r);
  const verloopt = new Date(Date.now() + (d.expires_in || 5184000) * 1000).toISOString();
  await data().setJSON("instagram-token", { token: d.access_token, verloopt, bron: env.slice(-12) });
  return verloopt;
}
/** Plaatst één foto (JPEG op een openbaar adres) met bijschrift. Geeft de link naar de post terug. */
export async function plaats(fotoUrl, bijschrift) {
  const { id } = await instaAccount();
  const c = await ig(`/${id}/media`, { method: "POST", body: { image_url: fotoUrl, caption: String(bijschrift || "").slice(0, 2200) } });
  for (let i = 0; i < 10; i++) { // Instagram haalt de foto eerst zelf op
    const s = await ig(`/${c.id}?fields=status_code`).catch(() => ({}));
    if (!s.status_code || s.status_code === "FINISHED") break;
    if (s.status_code === "ERROR" || s.status_code === "EXPIRED") throw new Error("Instagram kon de foto niet verwerken. Gebruik een JPG met een verhouding tussen 4:5 en 1,91:1.");
    await new Promise((r) => setTimeout(r, 2000));
  }
  const p = await ig(`/${id}/media_publish`, { method: "POST", body: { creation_id: c.id } });
  const m = await ig(`/${p.id}?fields=permalink`).catch(() => ({}));
  return { id: p.id, link: m.permalink || "https://www.instagram.com/" };
}
