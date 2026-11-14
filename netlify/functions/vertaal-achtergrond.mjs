// Vertaalt op de achtergrond alle stukken die nog geen (actuele) vertaling hebben. Mag tot 15 minuten duren.
// Wordt elke nacht gestart na het bijwerken vanuit Etsy.
import { timingSafeEqual, createHash } from "node:crypto";
import { VERTAAL_TALEN } from "./lib/talen.mjs";
import { vertaalBatch } from "./lib/vertaal.mjs";

const hash = (s) => createHash("sha256").update(String(s)).digest();
export default async (req) => {
  const w = Netlify.env.get("BEHEER_WACHTWOORD");
  if (!w || !timingSafeEqual(hash(req.headers.get("x-wachtwoord") || ""), hash(w)) || !Netlify.env.get("GEMINI_API_KEY")) return;
  const einde = Date.now() + 12 * 60 * 1000;
  for (const taal of VERTAAL_TALEN) {
    try { while (Date.now() < einde) { const r = await vertaalBatch(taal); if (!r.rest || !r.gedaan) break; } }
    catch (e) { console.error("Vertalen naar " + taal + " mislukt:", e.message); }
  }
};
export const config = { background: true };
