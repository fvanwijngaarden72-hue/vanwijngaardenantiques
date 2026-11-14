import { timingSafeEqual, createHash, randomUUID } from "node:crypto";
import { CATEGORIEEN, CAT_IDS, bronHash, data, fotos, json, laadProducten, laadSfeer, laadTeksten, laadVertaling, slaProductenOp, slaVertalingOp, STANDAARD_TEKSTEN } from "./lib/opslag.mjs";
import { TAAL_VELDEN, VERTAAL_TALEN } from "./lib/talen.mjs";
import { vertaalBatch, vertaalStatus, vertaalTeksten } from "./lib/vertaal.mjs";
import { instaAan, instaAccount, plaats } from "./lib/instagram.mjs";
import { maakBijschrift } from "./lib/bijschrift.mjs";
import { beeldModelKeuze, beschikbareModellen, bewerkFoto, gebruiktModel, tekstJson } from "./lib/gemini.mjs";
import { etsyAan, etsyShop } from "./lib/etsy.mjs";
import { etsySync, slugify, uniekeSlug, verwerk } from "./lib/sync.mjs";

const hash = (s) => createHash("sha256").update(String(s)).digest();
const magErin = (pw) => { const w = Netlify.env.get("BEHEER_WACHTWOORD"); return !!w && timingSafeEqual(hash(pw || ""), hash(w)); };
const STATUSSEN = ["beschikbaar", "verkocht", "verborgen"];

const SCENES = {
  wit: "Replace the background with a clean, seamless, bright white studio background with a soft natural shadow under the object.",
  linnen: "Place the object on a softly creased natural linen tablecloth in gentle daylight, with a shallow depth of field.",
  tafel: "Place the object on an elegantly set dining table with linen, a simple glass and a small sprig of flowers, in soft window light. Other items must stay in the blurred background.",
  hout: "Place the object on a warm antique oak table in soft window light.",
  kobalt: "Place the object on a smooth deep cobalt-blue surface against a matching cobalt-blue backdrop, with soft studio light.",
};
const BEHOUD = " Keep the porcelain object itself exactly as in the photo: identical shape, proportions, decoration, colours, gold edges, number of pieces and any wear or damage. Do not add, remove or repair anything on the object. Do not add text or logos. Photorealistic.";

function dataUrlNaarDeel(d) {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(d || "");
  if (!m) throw new Error("Dit is geen foto (alleen JPG, PNG of WebP).");
  return { mimeType: m[1], data: m[2] };
}
async function fotoVoorAi(b) {
  if (b.foto) return dataUrlNaarDeel(b.foto);
  if (!b.fotoUrl) return null;
  const pad = /^\/foto\/([\w.-]+)$/.exec(b.fotoUrl);
  if (pad) {
    const e = await fotos().getWithMetadata(pad[1], { type: "arrayBuffer" });
    if (e) return { mimeType: e.metadata?.type || "image/jpeg", data: Buffer.from(e.data).toString("base64") };
    throw new Error("Foto niet gevonden.");
  }
  let u; try { u = new URL(b.fotoUrl); } catch { throw new Error("Deze foto kan niet worden opgehaald."); }
  if (u.protocol !== "https:" || u.hostname !== "i.etsystatic.com") throw new Error("Deze foto kan niet worden opgehaald.");
  const r = await fetch(u, { signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error("De Etsy-foto kon niet worden opgehaald.");
  return { mimeType: (r.headers.get("content-type") || "image/jpeg").split(";")[0], data: Buffer.from(await r.arrayBuffer()).toString("base64") };
}
const getal = (v) => (v === "" || v == null || isNaN(+v) ? null : +v);

const ACTIES = {
  login: async () => ({ ok: true }),
  data: async () => {
    const [producten, teksten, sfeer, sync, instellingen, instaFout] = await Promise.all([laadProducten(), laadTeksten(), laadSfeer(), data().get("etsy-sync", { type: "json" }), data().get("instellingen", { type: "json" }), data().get("instagram-fout", { type: "json" })]);
    return { producten, teksten, sfeer, categorieen: CATEGORIEEN, ai: !!Netlify.env.get("GEMINI_API_KEY"), etsy: etsyAan(), sync, vertaalRest: await vertaalStatus(), insta: instaAan(), instellingen: instellingen ?? {}, instaFout };
  },
  "product-opslaan": async ({ product: p }) => {
    if (!p?.titel?.trim()) throw new Error("Vul een titel in.");
    if (!p.foto || !/^(\/foto\/|https:\/\/)/.test(p.foto)) throw new Error("Kies eerst een foto.");
    if (p.etsyUrl && !/^https:\/\//.test(p.etsyUrl)) throw new Error("De Etsy-link moet met https:// beginnen.");
    const alle = await laadProducten();
    const id = String(p.id || randomUUID());
    const oud = alle.find((x) => String(x.id) === id);
    const status = STATUSSEN.includes(p.status) ? p.status : "beschikbaar";
    const nieuw = { ...oud, id, merk: (p.merk || "").trim(), titel: p.titel.trim(), omschrijving: (p.omschrijving || "").trim(),
      categorie: CAT_IDS.includes(p.categorie) ? p.categorie : "los", foto: p.foto, etsyUrl: (p.etsyUrl || "").trim(), prijs: getal(p.prijs),
      status, uitgelicht: !!p.uitgelicht, bewerkt: true,
      slug: oud?.slug || uniekeSlug(slugify(p.merk + " " + p.titel), alle, id) };
    if (!oud) nieuw.toegevoegd = new Date().toISOString().slice(0, 10);
    delete nieuw.autoVerkocht; delete nieuw.verkochtOp; // een handmatige keuze gaat voor de automatische Etsy-controle
    await slaProductenOp(oud ? alle.map((x) => (String(x.id) === id ? nieuw : x)) : [nieuw, ...alle]);
    // Vertalingen die in het formulier zijn nagekeken of verbeterd.
    for (const taal of VERTAAL_TALEN) {
      const v = p.i18n?.[taal];
      if (!v || !String(v.titel || "").trim()) continue;
      const V = await laadVertaling(taal);
      V[id] = { titel: String(v.titel).trim().slice(0, 300), omschrijving: String(v.omschrijving || "").trim().slice(0, 9000), bron: bronHash(nieuw) };
      await slaVertalingOp(taal, V);
    }
    return { product: nieuw };
  },
  "product-verwijderen": async ({ id }) => {
    await slaProductenOp((await laadProducten()).filter((x) => String(x.id) !== String(id)));
    return { ok: true };
  },
  "teksten-opslaan": async ({ teksten, taal }) => {
    const oud = (await data().get("teksten", { type: "json" })) ?? {};
    if (VERTAAL_TALEN.includes(taal)) {
      const v = {};
      for (const k of TAAL_VELDEN) if (String(teksten?.[k] || "").trim()) v[k] = String(teksten[k]).slice(0, 5000);
      await data().setJSON("teksten", { ...oud, i18n: { ...oud.i18n, [taal]: v } });
      return { teksten: await laadTeksten() };
    }
    const schoon = {};
    for (const k of Object.keys(STANDAARD_TEKSTEN)) if (k in (teksten || {})) schoon[k] = k === "toonPrijzen" ? !!teksten[k] : String(teksten[k]).slice(0, 5000);
    for (const k of ["instagram", "etsy"]) if (schoon[k] && !/^https:\/\//.test(schoon[k])) throw new Error("De link bij ‘" + k + "’ moet met https:// beginnen.");
    await data().setJSON("teksten", { ...schoon, i18n: oud.i18n });
    return { teksten: await laadTeksten() };
  },
  "vertaal-batch": async ({ taal }) => vertaalBatch(taal),
  "vertaal-status": async () => vertaalStatus(),
  "vertaling-lezen": async ({ id }) => {
    const uit = {};
    for (const taal of VERTAAL_TALEN) { const v = (await laadVertaling(taal))[String(id)]; uit[taal] = { titel: v?.titel || "", omschrijving: v?.omschrijving || "" }; }
    return uit;
  },
  "ai-vertaal-teksten": async ({ taal }) => ({ teksten: await vertaalTeksten(taal) }),
  backup: async () => {
    const [producten, teksten, sfeer] = await Promise.all([laadProducten(), laadTeksten(), laadSfeer()]);
    const vertalingen = {};
    for (const taal of VERTAAL_TALEN) vertalingen[taal] = await laadVertaling(taal);
    return { gemaakt: new Date().toISOString(), producten, teksten, sfeer, vertalingen };
  },
  "sfeer-opslaan": async ({ sfeer }) => {
    await data().setJSON("sfeer", (Array.isArray(sfeer) ? sfeer : []).filter((s) => /^\/foto\//.test(s?.foto)).map((s) => ({ foto: s.foto, alt: String(s.alt || "").slice(0, 200) })));
    return { ok: true };
  },
  "foto-upload": async ({ foto }) => {
    const d = dataUrlNaarDeel(foto);
    const key = randomUUID() + ({ "image/png": ".png", "image/webp": ".webp" }[d.mimeType] ?? ".jpg");
    await fotos().set(key, Buffer.from(d.data, "base64"), { metadata: { type: d.mimeType } });
    return { url: "/foto/" + key };
  },
  import: async ({ regels, markeerVerkocht }) => {
    if (!Array.isArray(regels) || !regels.length) throw new Error("Geen artikelen gevonden in dit bestand.");
    const alle = await laadProducten();
    const items = regels.map((r) => ({ titel: String(r.titel || "").trim(), omschrijving: String(r.omschrijving || ""), prijs: getal(r.prijs), fotos: Array.isArray(r.fotos) ? r.fotos : [] }));
    const uit = verwerk(alle, items, (await laadTeksten()).etsy, !!markeerVerkocht);
    await slaProductenOp(alle);
    return uit;
  },
  "etsy-sync": async ({ forceer }) => etsySync(!!forceer),
  "backup-terugzetten": async ({ backup: b }) => {
    if (!Array.isArray(b?.producten) || !b.producten.every((p) => p && p.id && p.titel && p.slug && p.foto)) throw new Error("Dit is geen geldige back-up van deze site.");
    await slaProductenOp(b.producten);
    if (b.teksten && typeof b.teksten === "object") {
      await ACTIES["teksten-opslaan"]({ teksten: b.teksten });
      for (const taal of VERTAAL_TALEN) if (b.teksten.i18n?.[taal]) await ACTIES["teksten-opslaan"]({ teksten: b.teksten.i18n[taal], taal });
    }
    for (const taal of VERTAAL_TALEN) { const v = b.vertalingen?.[taal]; if (v && typeof v === "object" && !Array.isArray(v)) await slaVertalingOp(taal, v); }
    if (Array.isArray(b.sfeer)) await ACTIES["sfeer-opslaan"]({ sfeer: b.sfeer });
    return { ok: true };
  },
  controle: async () => {
    const uit = [];
    const stap = async (naam, fn) => { try { const t = await fn(); uit.push(typeof t === "string" ? { naam, ok: true, tekst: t } : { naam, ...t }); } catch (e) { uit.push({ naam, ok: false, tekst: e.message }); } };
    let producten = [];
    await stap("Opslag van stukken en teksten", async () => {
      const v = String(Date.now()); await data().set("controle", v);
      if ((await data().get("controle")) !== v) throw new Error("Schrijven lukt, maar teruglezen niet.");
      producten = await laadProducten();
      return `Werkt. Er staan ${producten.length} stukken in.`;
    });
    await stap("Opslag van foto's", async () => { await fotos().list({ prefix: "controle-" }); return "Werkt."; });
    await stap("Beheerwachtwoord", async () => (Netlify.env.get("BEHEER_WACHTWOORD").length < 12 ? { ok: false, tekst: "Het wachtwoord is korter dan 12 tekens. Kies in Netlify een langer wachtwoord." } : "Lang genoeg."));
    let lijst = null;
    await stap("Gemini-sleutel", async () => { lijst = await beschikbareModellen(); return `Geldig. ${lijst.length} modellen beschikbaar.`; });
    if (lijst) {
      await stap("Gemini-tekst (omschrijvingen en bijschriften)", async () => { const r = await tekstJson('Antwoord met precies deze JSON: {"ok": true}'); if (r?.ok !== true) throw new Error("Onverwacht antwoord."); return "Werkt met model " + gebruiktModel("tekst") + "."; });
      await stap("Gemini-beeld (Foto Studio)", async () => { const m = beeldModelKeuze(lijst); if (!m) throw new Error("Bij deze sleutel is geen beeldmodel beschikbaar. Zet facturering aan in Google AI Studio of stel GEMINI_BEELD_MODEL in."); return "Model " + m + " is beschikbaar. Een echte proef doe je in Foto Studio (kost een paar cent)."; });
    }
    await stap("Vertalingen", async () => {
      const r = await vertaalStatus(), n = Math.max(...Object.values(r));
      return n ? { ok: null, tekst: `Nog ${n} stukken te vertalen. Klik hieronder op ‘Vertalingen bijwerken’.` } : "Alle stukken zijn vertaald in vijf talen.";
    });
    await stap("Foto's van Etsy", async () => {
      const p = producten.find((x) => (x.foto || "").includes("i.etsystatic.com"));
      if (!p) return { ok: null, tekst: "Er zijn geen stukken met een Etsy-foto." };
      const r = await fetch(p.foto, { signal: AbortSignal.timeout(10000) }).catch(() => { throw new Error("Etsy is niet bereikbaar vanaf de server."); });
      if (!r.ok || !(r.headers.get("content-type") || "").startsWith("image/")) throw new Error("Etsy gaf de foto niet (status " + r.status + ").");
      return "Bereikbaar.";
    });
    await stap("Instagram-koppeling", async () => {
      if (!instaAan()) return { ok: null, tekst: "Niet ingesteld. Dit is optioneel: zonder koppeling download je de afbeelding en plaats je hem zelf." };
      const a = await instaAccount();
      return `Verbonden met @${a.naam}.` + (a.verloopt ? ` Het token is geldig tot ${new Date(a.verloopt).toLocaleDateString("nl-NL")} en wordt elke nacht verlengd.` : " Het token wordt vannacht voor het eerst verlengd.");
    });
    await stap("Etsy-koppeling (automatisch bijwerken)", async () => {
      if (!etsyAan()) return { ok: null, tekst: "Niet ingesteld. Dit is optioneel: zonder sleutel gebruik je de CSV-import." };
      const s = await etsyShop();
      return `Verbonden met ${s.shop_name}: ${s.listing_active_count ?? "?"} actieve artikelen.`;
    });
    return { controles: uit };
  },
  "ai-tekst": async (b) => {
    const foto = await fotoVoorAi(b);
    if (!foto) throw new Error("Kies eerst een foto.");
    return tekstJson(`Je helpt een Nederlandse verkoper van vintage porselein. Bekijk de foto. Aanvullende informatie van de verkoper: "${String(b.hint || "geen").slice(0, 500)}".
Geef JSON met: "merk" (alleen als het zichtbaar is of door de verkoper is genoemd, anders ""), "titel" (kort, Nederlands, bijvoorbeeld "Botanica theepot"), "omschrijving" (2 tot 3 rustige zinnen Nederlands; beschrijf wat zichtbaar is; verzin geen leeftijd, herkomst, staat of maten), "categorie" (een van ${CAT_IDS.join(", ")}), "prijsindicatie" (korte vrijblijvende schatting in euro's met als voorbehoud dat het een schatting is).`, foto);
  },
  "ai-foto": async (b) => {
    const foto = await fotoVoorAi(b);
    if (!foto) throw new Error("Kies eerst een foto.");
    const scene = b.modus === "eigen" ? String(b.opdracht || "").trim().slice(0, 600) : SCENES[b.modus];
    if (!scene) throw new Error("Beschrijf wat er moet veranderen.");
    return { foto: await bewerkFoto(scene + BEHOUD, foto) };
  },
  "ai-bijschrift": async (b) => maakBijschrift(b, await fotoVoorAi(b).catch(() => null)),
  "ai-etsy": async (b) => {
    const foto = await fotoVoorAi(b).catch(() => null);
    const taal = b.taal === "en" ? "Engels" : "Nederlands";
    const r = await tekstJson(`Je helpt een verkoper van vintage porselein een artikel op Etsy te zetten. Schrijf in het ${taal}.
Stuk: ${String(b.merk || "").slice(0, 80)} ${String(b.titel || "").slice(0, 200)}. Omschrijving van de verkoper: ${String(b.omschrijving || "geen").slice(0, 3000)}.
Geef JSON met: "titel" (Etsy-titel van hoogstens 140 tekens: merk en serie vooraan, daarna wat het is en bruikbare zoekwoorden, gescheiden door komma's), "omschrijving" (nette Etsy-beschrijving in korte alinea's op basis van de omschrijving van de verkoper en de foto; verzin geen leeftijd, staat, maten of aantallen; eindig met een regel dat vintage stukken gebruikssporen kunnen hebben), "tags" (array van precies 13 zoektermen van elk hoogstens 20 tekens, zonder #).`, foto);
    return { titel: String(r.titel || "").slice(0, 140), omschrijving: String(r.omschrijving || ""), tags: (Array.isArray(r.tags) ? r.tags : []).map((t) => String(t).replace(/^#/, "").slice(0, 20)).filter(Boolean).slice(0, 13) };
  },
  "insta-plaatsen": async ({ foto, bijschrift, id }, req) => {
    const d = dataUrlNaarDeel(foto);
    if (d.mimeType !== "image/jpeg") throw new Error("Instagram accepteert alleen JPG-foto's.");
    if (!String(bijschrift || "").trim()) throw new Error("Schrijf eerst een bijschrift.");
    const key = "insta-" + randomUUID() + ".jpg";
    await fotos().set(key, Buffer.from(d.data, "base64"), { metadata: { type: "image/jpeg" } });
    const site = Netlify.env.get("URL") || new URL(req.url).origin;
    const post = await plaats(site + "/foto/" + key, bijschrift);
    if (id) {
      const alle = await laadProducten(), p = alle.find((x) => String(x.id) === String(id));
      if (p) { p.instagram = { wanneer: new Date().toISOString(), link: post.link }; await slaProductenOp(alle); }
    }
    return post;
  },
  "instellingen-opslaan": async ({ instellingen: i }) => {
    const uit = { instaAuto: !!i?.instaAuto, instaTaal: ["nl", "en", "beide"].includes(i?.instaTaal) ? i.instaTaal : "beide" };
    await data().setJSON("instellingen", uit);
    return { instellingen: uit };
  },
};

export default async (req, context) => {
  if (!Netlify.env.get("BEHEER_WACHTWOORD")) return json({ fout: "Het beheerwachtwoord is nog niet ingesteld in Netlify." }, 503);
  if (!magErin(req.headers.get("x-wachtwoord"))) {
    await new Promise((r) => setTimeout(r, 700)); // remt raden van het wachtwoord
    return json({ fout: "Dit wachtwoord klopt niet." }, 401);
  }
  const actie = ACTIES[context.params.actie];
  if (!actie) return json({ fout: "Onbekende actie." }, 404);
  try { return json(await actie(await req.json().catch(() => ({})), req), 200, { "cache-control": "no-store" }); }
  catch (e) { console.error(e); return json({ fout: e.message || "Er ging iets mis." }, 400); }
};
export const config = { path: "/api/beheer/:actie", method: "POST",
  rateLimit: { action: "rate_limit", windowLimit: 90, windowSize: 60, aggregateBy: ["ip", "domain"] } };
