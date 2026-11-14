// Koppeling met de Gemini API. Modelnamen wisselen vaak: de code probeert eerst de bekende namen
// en zoekt anders zelf in de lijst met modellen die bij de sleutel beschikbaar zijn.
const BASIS = "https://generativelanguage.googleapis.com/v1beta/models";
const uniek = (a) => [...new Set(a.filter(Boolean))];
const STANDAARD = {
  tekst: ["gemini-flash-latest", "gemini-3.8-flash", "gemini-3.5-flash-lite"],
  beeld: ["gemini-nano-banana-2.1", "gemini-3.1-flash-image", "gemini-3.1-flash-lite-image", "gemini-3-pro-image"],
};
const ENV = { tekst: "GEMINI_TEKST_MODEL", beeld: "GEMINI_BEELD_MODEL" };
const werkend = {};

const sleutel = () => {
  const s = Netlify.env.get("GEMINI_API_KEY");
  if (!s) throw new Error("De Gemini-sleutel ontbreekt. Zet GEMINI_API_KEY in Netlify en deploy opnieuw.");
  return s;
};

export async function beschikbareModellen() {
  const r = await fetch(BASIS + "?pageSize=1000", { headers: { "x-goog-api-key": sleutel() }, signal: AbortSignal.timeout(15000) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error("Gemini weigert de sleutel: " + (d.error?.message || r.status));
  return (d.models || []).filter((m) => (m.supportedGenerationMethods || []).includes("generateContent")).map((m) => m.name.replace(/^models\//, ""));
}
export function kiesUitLijst(soort, lijst) {
  const nee = /preview|exp|tts|live|audio|embedding|robotics|computer-use|gemma|learnlm|aqa/;
  const beeld = /image|banana/;
  const l = lijst.filter((n) => !nee.test(n) && (soort === "beeld" ? beeld.test(n) : !beeld.test(n) && /flash/.test(n) && !/lite/.test(n)));
  return l.sort().reverse();
}

async function vraag(soort, parts, generationConfig, wachttijd = 50000) {
  const key = sleutel();
  const geprobeerd = new Set();
  let laatste = "";
  const probeer = async (m) => {
    geprobeerd.add(m);
    const r = await fetch(BASIS + "/" + m + ":generateContent", {
      method: "POST", signal: AbortSignal.timeout(wachttijd),
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({ contents: [{ role: "user", parts }], generationConfig }),
    });
    const d = await r.json().catch(() => ({}));
    const melding = d.error?.message || "";
    if (r.status === 404 || (r.status === 400 && /not found|not supported|no longer available|does not support/i.test(melding))) { laatste = m; return null; }
    if (r.status === 429) throw new Error("De limiet van de Gemini-sleutel is bereikt. Probeer het later opnieuw of zet facturering aan in Google AI Studio.");
    if (!r.ok) throw new Error("Gemini gaf een fout: " + (melding || r.status));
    const kandidaat = d.candidates?.[0];
    if (!kandidaat?.content?.parts?.length) {
      const reden = d.promptFeedback?.blockReason || kandidaat?.finishReason;
      throw new Error("Gemini gaf geen resultaat" + (reden ? " (" + reden + ")" : "") + ". Probeer een andere foto of opdracht.");
    }
    werkend[soort] = m;
    return kandidaat.content.parts;
  };
  for (const m of uniek([Netlify.env.get(ENV[soort]), werkend[soort], ...STANDAARD[soort]])) { const uit = await probeer(m); if (uit) return uit; }
  for (const m of kiesUitLijst(soort, await beschikbareModellen()).filter((n) => !geprobeerd.has(n)).slice(0, 3)) { const uit = await probeer(m); if (uit) return uit; }
  throw new Error("Geen werkend Gemini-model gevonden (laatst geprobeerd: " + laatste + "). Stel " + ENV[soort] + " in bij Netlify.");
}
export const gebruiktModel = (soort) => werkend[soort] || null;

export async function tekstJson(prompt, foto, wachttijd) {
  const parts = [{ text: prompt }];
  if (foto) parts.push({ inlineData: foto });
  const uit = await vraag("tekst", parts, { responseMimeType: "application/json" }, wachttijd);
  const t = uit.map((p) => p.text || "").join("").replace(/^```(?:json)?\s*|\s*```$/g, "");
  try { return JSON.parse(t); } catch { throw new Error("Gemini gaf geen bruikbaar antwoord. Probeer het nog eens."); }
}

export async function bewerkFoto(prompt, foto) {
  const uit = await vraag("beeld", [{ text: prompt }, { inlineData: foto }], { responseModalities: ["TEXT", "IMAGE"] });
  const beeld = uit.find((p) => p.inlineData)?.inlineData;
  if (!beeld) throw new Error("Gemini gaf geen foto terug. Probeer een andere opdracht.");
  return "data:" + (beeld.mimeType || "image/png") + ";base64," + beeld.data;
}

export function beeldModelKeuze(lijst) {
  const eigen = Netlify.env.get(ENV.beeld);
  if (eigen) return lijst.includes(eigen) ? eigen : null;
  return STANDAARD.beeld.find((m) => lijst.includes(m)) || kiesUitLijst("beeld", lijst)[0] || null;
}
