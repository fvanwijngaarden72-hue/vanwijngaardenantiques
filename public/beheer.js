(() => {
const $ = (s, r = document) => r.querySelector(s);
const h = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
let pw = "", D = null, tab = "stukken";
let studio = { bron: null, resultaat: null, product: null };
let insta = { product: null, foto: null, sjabloon: "etiket", formaat: "45", label: "Nieuw binnen" };

const toast = (t) => { const e = $("#toast"); e.textContent = t; e.classList.add("op"); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove("op"), 3200); };
async function api(a, b = {}) {
  const r = await fetch("/api/beheer/" + a, { method: "POST", headers: { "content-type": "application/json", "x-wachtwoord": pw }, body: JSON.stringify(b) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.fout || "De server gaf geen antwoord. Probeer het opnieuw.");
  return d;
}
async function bezig(knop, fn) { if (knop) knop.disabled = true; try { return await fn(); } catch (e) { toast(e.message); } finally { if (knop) knop.disabled = false; } }
const beeldBron = (u) => /^https:\/\/i\.etsystatic\.com\//.test(u || "") ? "/foto-etsy?u=" + encodeURIComponent(u) : u;
const laadBeeld = (src) => new Promise((ok, nee) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => nee(new Error("Deze foto kon niet worden geladen.")); i.src = src; });
async function verklein(file, max = 1600) {
  const url = URL.createObjectURL(file);
  try { const i = await laadBeeld(url); const f = Math.min(1, max / Math.max(i.width, i.height)); const c = document.createElement("canvas"); c.width = i.width * f; c.height = i.height * f; c.getContext("2d").drawImage(i, 0, 0, c.width, c.height); return c.toDataURL("image/jpeg", .86); }
  finally { URL.revokeObjectURL(url); }
}
async function naarJpeg(dataUrl, max = 2000) {
  if (!dataUrl.startsWith("data:")) return dataUrl;
  const i = await laadBeeld(dataUrl), f = Math.min(1, max / Math.max(i.width, i.height));
  const c = document.createElement("canvas"); c.width = Math.round(i.width * f); c.height = Math.round(i.height * f);
  const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(i, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", .9);
}
const catOpties = (w) => D.categorieen.map((c) => `<option value="${c.id}" ${c.id === w ? "selected" : ""}>${h(c.naam)}</option>`).join("");
const TABS = [["stukken", "Stukken"], ["studio", "Foto Studio"], ["insta", "Instagram-maker"], ["teksten", "Teksten"], ["sfeer", "Sfeerfoto's"], ["koppel", "Etsy en controle"]];
function kies(t) { tab = t; $("#tabs").innerHTML = TABS.map(([i, n]) => `<button data-t="${i}" ${i === t ? 'aria-current="page"' : ""}>${n}</button>`).join(""); ({ stukken, studio: toonStudio, insta: toonInsta, teksten, sfeer, koppel })[t](); scrollTo(0, 0); }
$("#tabs").onclick = (e) => { const b = e.target.closest("button"); if (b) kies(b.dataset.t); };
const P = () => $("#paneel");

/* ---------- Stukken ---------- */
let fz = "", fc = "";
function stukken() {
  P().innerHTML = `<h2>Stukken</h2><div class="rij"><input id="z" type="search" placeholder="Zoek in ${D.producten.length} stukken" value="${h(fz)}"><select id="c"><option value="">Alle categorieën</option>${catOpties(fc)}</select><button class="k" id="nieuw">Nieuw stuk</button></div><div class="lijst" id="l"></div>`;
  const teken = () => {
    const q = fz.toLowerCase();
    const l = D.producten.filter((p) => (!fc || p.categorie === fc) && (p.merk + " " + p.titel).toLowerCase().includes(q));
    $("#l").innerHTML = l.map((p) => `<button class="it" data-id="${h(p.id)}"><img loading="lazy" src="${h(p.foto)}" alt=""><div>${h(p.merk)} ${h(p.titel)}<small>${p.status}${p.uitgelicht ? ", uitgelicht" : ""}${p.omschrijving ? "" : ", zonder omschrijving"}</small></div></button>`).join("") || `<p>Geen stukken gevonden. Maak een nieuw stuk of pas je zoekterm aan.</p>`;
  };
  $("#z").oninput = (e) => { fz = e.target.value; teken(); };
  $("#c").onchange = (e) => { fc = e.target.value; teken(); };
  $("#nieuw").onclick = () => formulier({});
  $("#l").onclick = (e) => { const b = e.target.closest(".it"); if (b) formulier(D.producten.find((p) => p.id === b.dataset.id)); };
  teken();
}
function formulier(p) {
  document.querySelector("dialog")?.remove();
  const d = document.createElement("dialog");
  d.innerHTML = `<form method="dialog"><h2>${p.id ? "Stuk bewerken" : "Nieuw stuk"}</h2>
  ${p.foto ? `<img src="${h(p.foto)}" alt="" style="max-height:200px">` : ""}
  <label>Foto kiezen<input type="file" name="bestand" accept="image/*"></label>
  <label>Merk<input name="merk" value="${h(p.merk)}"></label><label>Titel<input name="titel" value="${h(p.titel)}" required></label>
  <label>Omschrijving<textarea name="omschrijving">${h(p.omschrijving)}</textarea></label>
  <label>Link naar Etsy<input name="etsyUrl" type="url" placeholder="https://www.etsy.com/listing/..." value="${h(p.etsyUrl)}"></label>
  <div class="rij"><label style="flex:1">Categorie<select name="categorie">${catOpties(p.categorie)}</select></label><label style="flex:1">Status<select name="status">${["beschikbaar", "verkocht", "verborgen"].map((s) => `<option ${s === p.status ? "selected" : ""}>${s}</option>`).join("")}</select></label><label style="flex:1">Prijs (euro)<input name="prijs" type="number" step="0.01" min="0" value="${p.prijs ?? ""}"></label></div>
  <label><input type="checkbox" name="uitgelicht" ${p.uitgelicht ? "checked" : ""}>Tonen op de homepage</label>
  <div class="rij"><button class="k" value="ok" id="opsl">Opslaan</button><button class="k l" value="x" formnovalidate>Annuleren</button>${p.id ? `<button type="button" class="k l" id="naarS">Foto Studio</button><button type="button" class="k l" id="naarI">Instagram</button><button type="button" class="k r" id="wis">Verwijderen</button>` : ""}</div></form>`;
  document.body.append(d); d.showModal();
  const f = $("form", d);
  f.onsubmit = (e) => {
    if (e.submitter?.value !== "ok") return; e.preventDefault();
    bezig(e.submitter, async () => {
      const v = Object.fromEntries(new FormData(f));
      let foto = p.foto;
      if (f.bestand.files[0]) foto = (await api("foto-upload", { foto: await verklein(f.bestand.files[0]) })).url;
      const r = await api("product-opslaan", { product: { ...p, ...v, bestand: undefined, foto, uitgelicht: f.uitgelicht.checked } });
      const i = D.producten.findIndex((x) => x.id === r.product.id);
      if (i >= 0) D.producten[i] = r.product; else D.producten.unshift(r.product);
      d.close(); d.remove(); toast("Opgeslagen"); if (tab === "stukken") stukken();
    });
  };
  if (p.id) {
    $("#wis", d).onclick = (e) => { if (!confirm("Dit stuk verwijderen?")) return; bezig(e.target, async () => { await api("product-verwijderen", { id: p.id }); D.producten = D.producten.filter((x) => x.id !== p.id); d.close(); d.remove(); toast("Verwijderd"); stukken(); }); };
    $("#naarS", d).onclick = () => { d.close(); d.remove(); studio = { bron: p.foto, resultaat: null, product: p }; kies("studio"); };
    $("#naarI", d).onclick = () => { d.close(); d.remove(); insta = { ...insta, product: p, foto: p.foto, bijschrift: "" }; kies("insta"); };
  }
}
function stukKiezer(doel) {
  return `<select id="${doel}"><option value="">Kies een stuk uit de collectie</option>${D.producten.map((p) => `<option value="${h(p.id)}">${h(p.merk)} ${h(p.titel)}</option>`).join("")}</select>`;
}
const geenAi = () => D.ai ? "" : `<p class="fout">De Gemini-sleutel ontbreekt nog. Zet GEMINI_API_KEY in Netlify om de AI-knoppen te gebruiken.</p>`;

/* ---------- Foto Studio ---------- */
function toonStudio() {
  const s = studio, huidig = s.resultaat || s.bron, bronSrc = s.resultaat || beeldBron(s.bron);
  P().innerHTML = `<h2>Foto Studio</h2>${geenAi()}<div class="twee"><div class="vak">
  <label>Nieuwe foto<input type="file" id="f" accept="image/*"></label><label>Of een bestaand stuk${stukKiezer("sk")}</label>
  <div class="voorbeeld">${huidig ? `<img id="vb" src="${h(bronSrc)}" alt="Voorbeeld">` : "Kies een foto om te beginnen"}</div>
  ${s.resultaat ? `<div class="rij"><button class="k l" id="terug">Terug naar origineel</button></div>` : ""}</div>
  <div class="vak"><p class="hulp">Gemini bewerkt alleen de omgeving. Controleer altijd of het porselein nog precies klopt met het echte stuk.</p>
  <div class="rij">${[["wit", "Witte achtergrond"], ["linnen", "Op linnen"], ["tafel", "Gedekte tafel"], ["hout", "Eikenhouten tafel"], ["kobalt", "Kobaltblauw"]].map(([m, n]) => `<button class="k l sc" data-m="${m}">${n}</button>`).join("")}</div>
  <label>Eigen opdracht<textarea id="opdr" placeholder="Bijvoorbeeld: zet het op een vensterbank met zacht ochtendlicht" style="min-height:64px"></textarea></label><button class="k l sc" data-m="eigen">Voer opdracht uit</button>
  <label>Wat weet je over dit stuk?<input id="hint" placeholder="Bijvoorbeeld: Villeroy & Boch Botanica, 6 kopjes"></label><button class="k l" id="ai">Tekst voorstellen</button>
  <label>Merk<input id="m" value="${h(s.merk ?? s.product?.merk)}"></label><label>Titel<input id="t" value="${h(s.titel ?? s.product?.titel)}"></label><label>Omschrijving<textarea id="o">${h(s.omschrijving ?? s.product?.omschrijving)}</textarea></label><label>Categorie<select id="cat">${catOpties(s.categorie ?? s.product?.categorie)}</select></label><label>Link naar Etsy<input id="e" type="url" value="${h(s.etsyUrl ?? s.product?.etsyUrl)}"></label>
  <p class="hulp" id="pi">${h(s.prijsindicatie)}</p>
  <div class="rij">${s.product ? `<button class="k" id="vervang">Foto en tekst bewaren bij dit stuk</button>` : ""}<button class="k ${s.product ? "l" : ""}" id="alsnw">Opslaan als nieuw stuk</button><button class="k l" id="naarInsta">Naar Instagram-maker</button></div></div></div>`;
  const onthoud = () => { s.merk = $("#m").value; s.titel = $("#t").value; s.omschrijving = $("#o").value; s.categorie = $("#cat").value; s.etsyUrl = $("#e").value; };
  const nieuweBron = (b, p) => { studio = { bron: b, resultaat: null, product: p }; toonStudio(); };
  $("#f").onchange = async (e) => { if (e.target.files[0]) nieuweBron(await verklein(e.target.files[0]), null); };
  $("#sk").onchange = (e) => { const p = D.producten.find((x) => x.id === e.target.value); if (p) nieuweBron(p.foto, p); };
  if ($("#terug")) $("#terug").onclick = () => { onthoud(); s.resultaat = null; toonStudio(); };
  const aiBron = () => { const b = s.resultaat || s.bron; return b?.startsWith("data:") ? { foto: b } : { fotoUrl: b }; };
  P().querySelectorAll(".sc").forEach((b) => b.onclick = () => { if (!s.bron) return toast("Kies eerst een foto."); onthoud(); toast("Gemini is bezig, dit duurt zo'n 20 seconden"); bezig(b, async () => { const opdracht = $("#opdr").value; const r = await api("ai-foto", { ...(s.bron.startsWith("data:") ? { foto: s.bron } : { fotoUrl: s.bron }), modus: b.dataset.m, opdracht }); s.resultaat = r.foto; toonStudio(); toast("Foto bewerkt"); }); });
  $("#ai").onclick = (e) => { if (!s.bron) return toast("Kies eerst een foto."); bezig(e.target, async () => { const r = await api("ai-tekst", { ...aiBron(), hint: $("#hint").value }); onthoud(); Object.assign(s, { merk: r.merk || s.merk, titel: r.titel, omschrijving: r.omschrijving, categorie: r.categorie, prijsindicatie: r.prijsindicatie }); toonStudio(); }); };
  const opslaan = (nw) => async () => {
    onthoud(); const b = s.resultaat || s.bron; if (!b) throw new Error("Kies eerst een foto.");
    const foto = b.startsWith("data:") ? (await api("foto-upload", { foto: await naarJpeg(b) })).url : b;
    const basis = nw ? { status: "beschikbaar" } : s.product;
    const r = await api("product-opslaan", { product: { ...basis, merk: s.merk, titel: s.titel, omschrijving: s.omschrijving, categorie: s.categorie, etsyUrl: s.etsyUrl, foto } });
    const i = D.producten.findIndex((x) => x.id === r.product.id); if (i >= 0) D.producten[i] = r.product; else D.producten.unshift(r.product);
    studio = { bron: r.product.foto, resultaat: null, product: r.product }; toonStudio(); toast("Opgeslagen");
  };
  if ($("#vervang")) $("#vervang").onclick = (e) => bezig(e.target, opslaan(false));
  $("#alsnw").onclick = (e) => bezig(e.target, opslaan(true));
  $("#naarInsta").onclick = () => { onthoud(); insta = { ...insta, product: s.product || { merk: s.merk, titel: s.titel, omschrijving: s.omschrijving }, foto: s.resultaat || s.bron, bijschrift: "" }; kies("insta"); };
  if (s.product) $("#sk").value = s.product.id;
}

/* ---------- Instagram-maker ---------- */
function regels(ctx, tekst, max) { const w = tekst.split(" "), r = []; let l = ""; for (const x of w) { const t = l ? l + " " + x : x; if (ctx.measureText(t).width > max && l) { r.push(l); l = x; } else l = t; } if (l) r.push(l); return r; }
function zetFoto(ctx, img, x, y, w, h, past) { const f = (past ? Math.min : Math.max)(w / img.width, h / img.height), dw = img.width * f, dh = img.height * f; ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh); }
async function tekenInsta() {
  const c = $("#doek"); if (!c) return; const i = insta, W = 1080, H = i.formaat === "45" ? 1350 : 1080; c.width = W; c.height = H; const x = c.getContext("2d");
  await Promise.all([document.fonts.load("italic 60px 'Bodoni Moda'"), document.fonts.load("500 60px 'Bodoni Moda'"), document.fonts.load("500 30px 'Hanken Grotesk'")]);
  const KOB = "#1c2e8c", GOUD = "#c7a24a"; const merk = i.product?.merk || "", titel = i.product?.titel || "";
  x.fillStyle = "#f7f8fb"; x.fillRect(0, 0, W, H);
  if (!i.foto) { x.fillStyle = "#5a6078"; x.font = "500 40px 'Hanken Grotesk'"; x.textAlign = "center"; x.fillText("Kies een stuk of foto", W / 2, H / 2); return; }
  let img; try { img = await laadBeeld(i.foto.startsWith("data:") ? i.foto : beeldBron(i.foto)); } catch (e) { toast(e.message); return; }
  const tekstBlok = (top, kleur, midden) => {
    x.textAlign = midden ? "center" : "left"; const X = midden ? W / 2 : 64; let y = top;
    x.fillStyle = kleur;
    if (i.label) { x.font = "italic 500 40px 'Bodoni Moda'"; x.fillStyle = GOUD; x.fillText(i.label, X, y); y += 66; x.fillStyle = kleur; }
    x.font = "500 66px 'Bodoni Moda'"; for (const r of regels(x, titel, W - 128).slice(0, 2)) { x.fillText(r, X, y); y += 76; }
    x.font = "500 32px 'Hanken Grotesk'"; x.fillText([merk, "vanwijngaardenantiques.com"].filter(Boolean).join("   "), X, y + 2);
  };
  if (i.sjabloon === "etiket") { const band = 340; x.fillStyle = "#fff"; x.fillRect(0, 0, W, H - band); zetFoto(x, img, 40, 40, W - 80, H - band - 80, true); x.fillStyle = KOB; x.fillRect(0, H - band, W, band); tekstBlok(H - band + 76, "#fff"); }
  else if (i.sjabloon === "vol") { zetFoto(x, img, 0, 0, W, H, false); const g = x.createLinearGradient(0, H * .55, 0, H); g.addColorStop(0, "rgba(18,31,102,0)"); g.addColorStop(1, "rgba(18,31,102,.92)"); x.fillStyle = g; x.fillRect(0, H * .55, W, H * .45); tekstBlok(H - 280, "#fff"); }
  else { x.fillStyle = KOB; x.fillRect(0, 0, W, H); const R = Math.min(W * .4, H * .31), cy = H * .4; x.fillStyle = "#fff"; x.beginPath(); x.arc(W / 2, cy, R + 34, 0, 7); x.fill(); x.save(); x.beginPath(); x.arc(W / 2, cy, R, 0, 7); x.clip(); zetFoto(x, img, W / 2 - R, cy - R, R * 2, R * 2, false); x.restore(); x.strokeStyle = GOUD; x.lineWidth = 5; x.beginPath(); x.arc(W / 2, cy, R + 24, 0, 7); x.stroke(); tekstBlok(cy + R + 110, "#fff", true); }
}
function toonInsta() {
  const i = insta;
  P().innerHTML = `<h2>Instagram-maker</h2>${geenAi()}<div class="twee"><div class="vak voorbeeld" style="padding:0"><canvas id="doek" aria-label="Voorbeeld van de post"></canvas></div><div class="vak">
  <label>Stuk${stukKiezer("ik")}</label><label>Of eigen foto<input type="file" id="iv" accept="image/*"></label>
  <div class="rij"><label style="flex:1">Ontwerp<select id="sj"><option value="etiket">Foto met kobalt band</option><option value="vol">Foto over het hele vlak</option><option value="bord">Foto op een bord</option></select></label><label style="flex:1">Formaat<select id="fm"><option value="45">Staand 4:5</option><option value="11">Vierkant 1:1</option></select></label></div>
  <label>Regel boven de titel<input id="lb" value="${h(i.label)}"></label>
  <div class="rij"><label style="flex:1">Toon<select id="tn"><option>warm en persoonlijk</option><option>verfijnd en rustig</option><option>speels</option></select></label><label style="flex:1">Taal<select id="tl"><option value="nl">Nederlands</option><option value="en">Engels</option><option value="beide">Nederlands en Engels</option></select></label></div>
  <label>Extra wens voor de tekst<input id="ws" placeholder="Bijvoorbeeld: past mooi bij de feestdagen"></label><button class="k l" id="bs">Bijschrift maken met Gemini</button>
  <label>Bijschrift<textarea id="tx" style="min-height:170px">${h(i.bijschrift)}</textarea></label>
  <div class="rij"><button class="k" id="dl">Afbeelding downloaden</button><button class="k l" id="kp">Bijschrift kopiëren</button><button class="k l" id="dl2">Delen vanaf telefoon</button></div></div></div>`;
  $("#sj").value = i.sjabloon; $("#fm").value = i.formaat; if (i.product?.id) $("#ik").value = i.product.id;
  $("#ik").onchange = (e) => { const p = D.producten.find((x) => x.id === e.target.value); if (p) { i.product = p; i.foto = p.foto; tekenInsta(); } };
  $("#iv").onchange = async (e) => { if (e.target.files[0]) { i.foto = await verklein(e.target.files[0]); tekenInsta(); } };
  $("#sj").onchange = (e) => { i.sjabloon = e.target.value; tekenInsta(); }; $("#fm").onchange = (e) => { i.formaat = e.target.value; tekenInsta(); };
  $("#lb").oninput = (e) => { i.label = e.target.value; tekenInsta(); }; $("#tx").oninput = (e) => { i.bijschrift = e.target.value; };
  $("#bs").onclick = (e) => bezig(e.target, async () => {
    if (!i.product) throw new Error("Kies eerst een stuk.");
    const f = i.foto?.startsWith("data:") ? { foto: i.foto } : { fotoUrl: i.foto };
    const r = await api("ai-bijschrift", { ...f, merk: i.product.merk, titel: i.product.titel, omschrijving: i.product.omschrijving, etsyTitel: i.product.etsyTitel, toon: $("#tn").value, taal: $("#tl").value, wens: $("#ws").value });
    i.bijschrift = r.bijschrift + "\n\n" + (r.hashtags || []).join(" "); $("#tx").value = i.bijschrift;
  });
  const blob = () => new Promise((ok) => $("#doek").toBlob(ok, "image/jpeg", .93));
  $("#dl").onclick = async () => { const u = URL.createObjectURL(await blob()); const a = document.createElement("a"); a.href = u; a.download = "vanwijngaarden-instagram.jpg"; a.click(); setTimeout(() => URL.revokeObjectURL(u), 2000); };
  $("#kp").onclick = async () => { await navigator.clipboard.writeText($("#tx").value); toast("Bijschrift gekopieerd"); };
  $("#dl2").onclick = async () => { const file = new File([await blob()], "vanwijngaarden-instagram.jpg", { type: "image/jpeg" }); try { await navigator.clipboard.writeText($("#tx").value); } catch {} if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file] }).catch(() => {}); } else toast("Delen werkt alleen op een telefoon. Download de afbeelding."); };
  tekenInsta();
}

/* ---------- Teksten ---------- */
const VELDEN = [["heroTitel", "Homepage: grote titel"], ["heroTekst", "Homepage: tekst", 1], ["heroKnop", "Homepage: knop"], ["collectieTitel", "Collectie: titel"], ["collectieTekst", "Collectie: tekst", 1], ["overTitel", "Over: titel"], ["overTekst", "Over: tekst", 1], ["koopTitel", "Kopen: titel"], ["koopTekst", "Kopen: tekst", 1], ["contactTitel", "Contact: titel"], ["contactTekst", "Contact: tekst", 1], ["email", "E-mailadres"], ["instagram", "Instagram-link"], ["etsy", "Etsy-winkel"], ["bedrijf", "Bedrijfsgegevens onderaan", 1], ["verkochtDagen", "Aantal dagen dat een via Etsy verkocht stuk nog zichtbaar blijft"]];
function teksten() {
  const t = D.teksten;
  P().innerHTML = `<h2>Teksten</h2><form id="tf" class="vak">${VELDEN.map(([k, n, g]) => `<label>${n}${g ? `<textarea name="${k}">${h(t[k])}</textarea>` : `<input name="${k}" value="${h(t[k])}">`}</label>`).join("")}<label><input type="checkbox" name="toonPrijzen" ${t.toonPrijzen ? "checked" : ""}>Prijzen tonen op de site</label><p class="hulp">Staat dit uit, dan zien bezoekers de prijs pas op Etsy en hoef je niets dubbel bij te houden.</p><button class="k">Teksten opslaan</button></form>`;
  $("#tf").onsubmit = (e) => { e.preventDefault(); bezig(e.submitter, async () => { const v = Object.fromEntries(new FormData(e.target)); v.toonPrijzen = e.target.toonPrijzen.checked; D.teksten = (await api("teksten-opslaan", { teksten: v })).teksten; toast("Teksten opgeslagen"); }); };
}

/* ---------- Sfeerfoto's ---------- */
function sfeer() {
  P().innerHTML = `<h2>Sfeerfoto's</h2><p class="hulp">Deze foto's verschijnen breed tussen de stukken in de collectie, na elke 12 stukken.</p><div class="rij"><input type="file" id="sf" accept="image/*"></div><div class="sfeer">${D.sfeer.map((s, i) => `<div><img src="${h(s.foto)}" alt=""><button class="k r" data-i="${i}" style="margin-top:6px">Verwijderen</button></div>`).join("") || "<p>Nog geen sfeerfoto's. Kies hierboven een foto.</p>"}</div>`;
  const bewaar = async () => { await api("sfeer-opslaan", { sfeer: D.sfeer }); sfeer(); toast("Sfeerfoto's opgeslagen"); };
  $("#sf").onchange = (e) => e.target.files[0] && bezig(null, async () => { const { url } = await api("foto-upload", { foto: await verklein(e.target.files[0], 2200) }); D.sfeer.push({ foto: url, alt: "" }); await bewaar(); });
  P().querySelectorAll("[data-i]").forEach((b) => b.onclick = () => bezig(b, async () => { D.sfeer.splice(+b.dataset.i, 1); await bewaar(); }));
}

/* ---------- Etsy, controle en back-up ---------- */
function csv(t) { const r = []; let rij = [], v = "", q = false; t = t.replace(/^﻿/, ""); for (let i = 0; i < t.length; i++) { const c = t[i]; if (q) { if (c === '"') { if (t[i + 1] === '"') { v += '"'; i++; } else q = false; } else v += c; } else if (c === '"') q = true; else if (c === ",") { rij.push(v); v = ""; } else if (c === "\n") { rij.push(v); r.push(rij); rij = []; v = ""; } else if (c !== "\r") v += c; } if (v || rij.length) { rij.push(v); r.push(rij); } return r; }
const datum = (d) => new Date(d).toLocaleString("nl-NL", { dateStyle: "long", timeStyle: "short" });
const uitslag = (u) => `${u.bijgewerkt} stukken bijgewerkt, ${u.nieuw} toegevoegd${u.verkocht ? `, ${u.verkocht} op verkocht gezet` : ""}.`;
function koppel() {
  const sy = D.sync;
  P().innerHTML = `<h2>Etsy en controle</h2>
  <div class="vak"><h3>Koppelingen controleren</h3><p class="hulp">Test in één keer de opslag, de Gemini-sleutel, de Etsy-foto's en de Etsy-koppeling. De test kost niets.</p><button class="k" id="ctl">Controle starten</button><ul id="ctlres" class="controle" role="status"></ul></div>
  <div class="vak"><h3>Automatisch bijwerken vanuit Etsy</h3>${D.etsy
    ? `<p class="hulp">De site haalt elke nacht de actuele artikelen uit Etsy: nieuwe stukken komen erbij, verkochte stukken krijgen het label Verkocht. Teksten die je hier zelf hebt aangepast, blijven staan.</p><p id="synctxt">${sy ? (sy.fout ? `<span class="fout">Laatste poging op ${datum(sy.wanneer)} mislukt: ${h(sy.fout)}</span>` : `Laatst bijgewerkt op ${datum(sy.wanneer)}: ${uitslag(sy)}`) : "Nog niet bijgewerkt."}</p><button class="k" id="sync">Nu bijwerken</button>`
    : `<p class="hulp">Nog niet ingesteld. Met een Etsy-sleutel (ETSY_API_KEY in Netlify) werkt de site zichzelf elke nacht bij. Hoe je die aanvraagt, staat in LEESMIJ.md. Zonder sleutel gebruik je de CSV-import hieronder.</p>`}</div>
  <div class="vak"><h3>Etsy-bestand inlezen</h3><p class="hulp">Ga op Etsy naar Shop Manager, Instellingen, Opties, Gegevens downloaden en download ‘Currently for sale listings’. Kies dat CSV-bestand hieronder. Bestaande stukken krijgen de beschrijving en alle foto's, ontbrekende stukken komen erbij.</p>
  <label><input type="checkbox" id="mv">Stukken die niet in het bestand staan op verkocht zetten</label><input type="file" id="cs" accept=".csv,text/csv"><p id="res" role="status"></p></div>
  <div class="vak"><h3>Back-up</h3><p class="hulp">Bewaar af en toe een kopie van alle stukken en teksten. Geüploade foto's zitten er niet in; die blijven op de site staan.</p><div class="rij"><button class="k l" id="bu">Back-up downloaden</button><label class="k l" style="font-weight:600">Back-up terugzetten<input type="file" id="bt" accept=".json,application/json" hidden></label></div></div>`;
  $("#ctl").onclick = (e) => bezig(e.target, async () => {
    $("#ctlres").innerHTML = "<li>Bezig met testen…</li>";
    try { const r = await api("controle"); $("#ctlres").innerHTML = r.controles.map((c) => `<li class="${c.ok === true ? "goed" : c.ok === false ? "mis" : "nvt"}"><strong>${h(c.naam)}</strong><br>${h(c.tekst)}</li>`).join(""); }
    catch (err) { $("#ctlres").innerHTML = `<li class="mis">${h(err.message)}</li>`; }
  });
  if ($("#sync")) $("#sync").onclick = (e) => bezig(e.target, async () => { toast("Etsy wordt uitgelezen, dit duurt even"); let u = await api("etsy-sync");
    if (u.teveel) { if (!confirm(`Etsy geeft ${u.totaal} actieve artikelen terug. Daardoor gaan ${u.teveel} stukken op verkocht. Klopt dat?`)) return; u = await api("etsy-sync", { forceer: true }); }
    D = await api("data"); koppel(); toast(uitslag(u)); });
  $("#cs").onchange = (e) => e.target.files[0] && bezig(null, async () => {
    const r = csv(await e.target.files[0].text()); const kop = r.shift().map((x) => x.trim().toUpperCase()); const k = (n) => kop.indexOf(n);
    if (k("TITLE") < 0) throw new Error("Dit is geen Etsy-artikelbestand: de kolom TITLE ontbreekt.");
    const fk = kop.map((n, i) => /^IMAGE\d+$/.test(n) ? i : -1).filter((i) => i >= 0);
    const regels = r.filter((x) => x[k("TITLE")]).map((x) => ({ titel: x[k("TITLE")].trim(), omschrijving: k("DESCRIPTION") >= 0 ? x[k("DESCRIPTION")] : "", prijs: k("PRICE") >= 0 && (k("CURRENCY_CODE") < 0 || x[k("CURRENCY_CODE")] === "EUR") ? parseFloat(x[k("PRICE")]) || null : null, fotos: fk.map((i) => (x[i] || "").trim()).filter(Boolean) }));
    const mv = $("#mv").checked;
    if (mv && !confirm(`Alle stukken die niet in dit bestand met ${regels.length} artikelen staan, worden op verkocht gezet. Doorgaan?`)) return;
    const u = await api("import", { regels, markeerVerkocht: mv }); D = await api("data");
    $("#res").textContent = uitslag(u);
  });
  $("#bu").onclick = () => { const u = URL.createObjectURL(new Blob([JSON.stringify({ gemaakt: new Date().toISOString(), producten: D.producten, teksten: D.teksten, sfeer: D.sfeer }, null, 1)], { type: "application/json" })); const a = document.createElement("a"); a.href = u; a.download = "vanwijngaardenantiques-backup-" + new Date().toISOString().slice(0, 10) + ".json"; a.click(); setTimeout(() => URL.revokeObjectURL(u), 2000); };
  $("#bt").onchange = (e) => e.target.files[0] && bezig(null, async () => {
    let b; try { b = JSON.parse(await e.target.files[0].text()); } catch { throw new Error("Dit bestand is geen back-up van deze site."); }
    if (!confirm(`De huidige collectie vervangen door de ${b.producten?.length ?? 0} stukken uit deze back-up?`)) return;
    await api("backup-terugzetten", { backup: b }); D = await api("data"); koppel(); toast("Back-up teruggezet");
  });
}

$("#logo").innerHTML = stempelSvg();
const start = async () => { D = await api("data"); $("#login").hidden = true; $("#login").style.display = "none"; $("#app").hidden = false; kies("stukken"); };
$("#login").onsubmit = async (e) => { e.preventDefault(); pw = $("#pw").value; try { await start(); try { sessionStorage.setItem("rw", pw); } catch {} } catch (err) { $("#loginfout").textContent = err.message; } };
try { const b = sessionStorage.getItem("rw"); if (b) { pw = b; start().catch(() => sessionStorage.removeItem("rw")); } } catch {}
})();
