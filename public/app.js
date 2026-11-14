(() => {
const h = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const $ = (s) => document.querySelector(s);
const main = $("#inhoud");
let S, zoek = "", merkKeuze = "", sorteer = "", eerste = true;
const fotoAlt = (p) => [p.merk, p.titel].filter(Boolean).join(" ");
const prijs = (p) => p.prijs != null ? new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(p.prijs) : "";
const etsyKnop = (p, kl) => p.etsyUrl && p.status !== "verkocht" ? `<a class="${kl}" href="${h(p.etsyUrl)}" target="_blank" rel="noopener">Bekijk op Etsy</a>` : "";
// Etsy levert elke foto in meerdere maten: vraag voor de stukpagina een grotere op.
const groot = (u) => /^https:\/\/i\.etsystatic\.com\//.test(u) ? u.replace(/il_(?:\d+x\w+|fullxfull)\./, "il_1140xN.") : u;
const fotoNr = (u) => /il_[^./]+\.(\d+)_/.exec(u || "")?.[1] || u;
const nieuw = (p) => p.toegevoegd && p.status === "beschikbaar" && Date.now() - new Date(p.toegevoegd) < 21 * 864e5;
const LEEG = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400"><rect width="500" height="400" fill="#eceef5"/><circle cx="250" cy="200" r="120" fill="#fff" stroke="#c7a24a" stroke-width="3"/><circle cx="250" cy="200" r="78" fill="none" stroke="#dde1ee" stroke-width="2"/></svg>');
// Laadt een foto niet (bijvoorbeeld omdat hij bij Etsy is vervangen), toon dan de kleinere maat of een leeg bord.
document.addEventListener("error", (e) => {
  const i = e.target; if (i.tagName !== "IMG" || i.dataset.op) return;
  if (i.dataset.terug) { const t = i.dataset.terug; delete i.dataset.terug; i.src = t; return; }
  const vol = i.src.replace(/il_(?:\d+x\w+)\./, "il_fullxfull.");
  if (/i\.etsystatic\.com/.test(i.src) && vol !== i.src && !i.dataset.vol) { i.dataset.vol = 1; i.src = vol; return; }
  i.dataset.op = 1; i.src = LEEG;
}, true);

function kaart(p) {
  return `<article class="stuk">
    <a class="beeld" href="/stuk/${h(p.slug)}" tabindex="-1" aria-hidden="true"><img loading="lazy" src="${h(p.foto)}" alt=""></a>
    ${p.status === "verkocht" ? '<span class="verkocht">Verkocht</span>' : nieuw(p) ? '<span class="verkocht nieuw">Nieuw</span>' : ""}
    ${p.merk ? `<p class="merk">${h(p.merk)}</p>` : ""}
    <h3><a href="/stuk/${h(p.slug)}">${h(p.titel)}</a></h3>
    <p class="regel">${etsyKnop(p, "etsy")}<span class="prijs">${prijs(p)}</span></p>
  </article>`;
}
function rooster(lijst) {
  let i = 0, uit = "";
  lijst.forEach((p, n) => { uit += kaart(p); const s = S.sfeer[i]; if ((n + 1) % 12 === 0 && n + 1 < lijst.length && s) { i++; uit += `<figure class="sfeerbreed"><img loading="lazy" src="${h(s.foto)}" alt="${h(s.alt || "")}"></figure>`; } });
  return uit;
}
const voet = () => `<footer class="voet"><p>${h(S.teksten.bedrijf)}</p><p><a href="mailto:${h(S.teksten.email)}">${h(S.teksten.email)}</a>${S.teksten.instagram ? `\n<a href="${h(S.teksten.instagram)}" target="_blank" rel="noopener">Instagram</a>` : ""}\n<a href="${h(S.teksten.etsy)}" target="_blank" rel="noopener">Winkel op Etsy</a></p></footer>`;
function zet(html, titel) { main.innerHTML = html + voet(); document.title = titel ? titel + " | Van Wijngaarden Antiques" : "Van Wijngaarden Antiques: vintage servies en porselein"; }

function home() {
  const t = S.teksten, vrij = S.producten.filter((p) => p.status === "beschikbaar");
  // Staan er te weinig stukken op 'uitgelicht', vul dan aan met de rest van de collectie.
  const uit = [...vrij.filter((p) => p.uitgelicht), ...vrij.filter((p) => !p.uitgelicht)];
  const borden = uit.slice(0, 5).map((p, i) => `<a class="bord b${i + 1}" href="/stuk/${h(p.slug)}" aria-label="${h(fotoAlt(p))}"><img src="${h(p.foto)}" alt=""></a>`).join("");
  const rest = uit.slice(5, 5 + Math.max(8, Math.min(16, vrij.filter((p) => p.uitgelicht).length - 5)));
  zet(`<section class="hero"><div class="borden">${borden}</div><h1>${h(t.heroTitel)}</h1><p>${h(t.heroTekst)}</p><div><a class="knop" href="/collectie">${h(t.heroKnop)}</a></div></section>
  <section class="sectie"><div class="kop"><h2>Nu in de winkel</h2></div><div class="rooster">${rest.map(kaart).join("")}</div><p style="margin-top:44px"><a class="knop blauw" href="/collectie">Alle ${S.producten.length} stukken</a></p></section>`);
}
function collectie(cat) {
  const t = S.teksten, c = S.categorieen.find((x) => x.id === cat);
  if (cat && !c) return nietGevonden();
  const basis = c ? S.producten.filter((p) => p.categorie === c.id) : S.producten;
  const merken = [...new Set(basis.map((p) => p.merk).filter(Boolean))].sort((a, b) => a.localeCompare(b, "nl"));
  if (!merken.includes(merkKeuze)) merkKeuze = "";
  const metPrijs = basis.some((p) => p.prijs != null);
  zet(`<section class="sectie"><div class="kop"><h1>${h(c ? c.naam : t.collectieTitel)}</h1>${c ? "" : `<p>${h(t.collectieTekst)}</p>`}</div>
  <div class="filters"><input id="zoek" type="search" placeholder="Zoek op merk of servies, bijvoorbeeld Botanica" aria-label="Zoeken" value="${h(zoek)}">
  <select id="merk" aria-label="Merk"><option value="">Alle merken</option>${merken.map((m) => `<option ${m === merkKeuze ? "selected" : ""}>${h(m)}</option>`).join("")}</select>
  <select id="sort" aria-label="Volgorde"><option value="">Aanbevolen</option><option value="merk">Merk A tot Z</option>${metPrijs ? '<option value="laag">Prijs laag naar hoog</option><option value="hoog">Prijs hoog naar laag</option>' : ""}</select></div>
  <p class="aantal" id="aantal" role="status"></p><div class="rooster" id="rooster"></div></section>`, c ? c.naam : t.collectieTitel);
  if (!metPrijs && (sorteer === "laag" || sorteer === "hoog")) sorteer = "";
  $("#sort").value = sorteer;
  const teken = () => {
    const q = zoek.toLowerCase().trim();
    const l = basis.filter((p) => (!merkKeuze || p.merk === merkKeuze) && (!q || (p.merk + " " + p.titel + " " + (p.omschrijving || "")).toLowerCase().includes(q)));
    if (sorteer === "merk") l.sort((a, b) => (a.merk || "~").localeCompare(b.merk || "~", "nl") || a.titel.localeCompare(b.titel, "nl"));
    if (sorteer === "laag" || sorteer === "hoog") l.sort((a, b) => ((a.prijs ?? Infinity) - (b.prijs ?? Infinity)) * (sorteer === "laag" ? 1 : -1));
    $("#rooster").innerHTML = l.length ? rooster(l) : `<p>Geen stukken gevonden. Probeer een andere zoekterm of <a href="/contact">vraag het mij</a>.</p>`;
    $("#aantal").textContent = l.length + (l.length === 1 ? " stuk" : " stukken");
  };
  $("#zoek").oninput = (e) => { zoek = e.target.value; teken(); };
  $("#merk").onchange = (e) => { merkKeuze = e.target.value; teken(); };
  $("#sort").onchange = (e) => { sorteer = e.target.value; teken(); };
  teken();
}
function nietGevonden() { zet(`<section class="sectie"><div class="kop"><h1>Deze pagina bestaat niet</h1></div><p class="tekst">Misschien is het stuk verkocht of is de link verouderd.</p><p><a class="knop blauw" href="/collectie">Bekijk de collectie</a></p></section>`, "Niet gevonden"); }
function stuk(slug) {
  const p = S.producten.find((x) => x.slug === slug);
  if (!p) return nietGevonden();
  const c = S.categorieen.find((x) => x.id === p.categorie);
  const verwant = S.producten.filter((x) => x.id !== p.id && x.status === "beschikbaar" && ((p.merk && x.merk === p.merk) || x.categorie === p.categorie))
    .sort((a, b) => ((b.merk === p.merk) + (b.categorie === p.categorie)) - ((a.merk === p.merk) + (a.categorie === p.categorie))).slice(0, 4);
  const alle = [p.foto, ...(p.fotos || [])].filter((u, i, a) => u && a.findIndex((x) => fotoNr(x) === fotoNr(u)) === i).slice(0, 10);
  const beeld = (u) => `src="${h(groot(u))}"${groot(u) !== u ? ` data-terug="${h(u)}"` : ""}`;
  zet(`<section class="sectie"><a class="terug" href="/collectie/${h(p.categorie)}">Terug naar ${h(c?.naam.toLowerCase() || "de collectie")}</a>
  <div class="pagina"><div><div class="foto"><img id="hoofdfoto" ${beeld(alle[0])} alt="${h(fotoAlt(p))}"></div>
  ${alle.length > 1 ? `<div class="duimen">${alle.map((u, i) => `<button type="button" data-i="${i}" aria-label="Foto ${i + 1} van ${alle.length}" ${i ? "" : 'aria-current="true"'}><img loading="lazy" src="${h(u)}" alt=""></button>`).join("")}</div>` : ""}</div>
  <div>${p.merk ? `<p class="merk">${h(p.merk)}</p>` : ""}<h1>${h(p.titel)}</h1>
  ${prijs(p) ? `<p class="prijs">${prijs(p)}</p>` : ""}
  ${p.status === "verkocht" ? "<p><strong>Dit stuk is verkocht.</strong> Zoek je iets vergelijkbaars? Mail me gerust.</p>" : etsyKnop(p, "knop blauw")}
  <p class="tekst">${h(p.omschrijving || "De volledige beschrijving, de maten en de prijs per onderdeel staan op Etsy.")}</p>
  <p class="klein">Je rekent af via Etsy. Vragen over dit stuk? <a href="mailto:${h(S.teksten.email)}?subject=${encodeURIComponent(fotoAlt(p))}">Mail me</a>.</p></div></div>
  ${verwant.length ? `<div class="kop" style="margin-top:64px"><h2>Past hierbij</h2></div><div class="rooster">${verwant.map(kaart).join("")}</div>` : ""}</section>`, fotoAlt(p));
  const duimen = main.querySelector(".duimen");
  if (duimen) duimen.onclick = (e) => {
    const b = e.target.closest("button"); if (!b) return;
    const i = $("#hoofdfoto"), u = alle[+b.dataset.i]; delete i.dataset.op; delete i.dataset.vol;
    if (groot(u) !== u) i.dataset.terug = u; else delete i.dataset.terug;
    i.src = groot(u);
    duimen.querySelectorAll("button").forEach((x) => x === b ? x.setAttribute("aria-current", "true") : x.removeAttribute("aria-current"));
  };
}
function over() {
  const t = S.teksten;
  zet(`<section class="sectie"><div class="kop"><h1>${h(t.overTitel)}</h1></div><p class="tekst">${h(t.overTekst)}</p><div class="twee"><div><h2>${h(t.koopTitel)}</h2><p class="tekst">${h(t.koopTekst)}</p><p><a class="knop blauw" href="${h(t.etsy)}" target="_blank" rel="noopener">Naar de Etsy-winkel</a></p></div></div></section>`, t.overTitel);
}
function contact() {
  const t = S.teksten;
  zet(`<section class="sectie"><div class="kop"><h1>${h(t.contactTitel)}</h1></div><p class="tekst">${h(t.contactTekst)}</p><p><a class="knop blauw" href="mailto:${h(t.email)}">Mail naar ${h(t.email)}</a></p>${t.instagram ? `<p class="tekst">Nieuwe stukken zie je het eerst op <a href="${h(t.instagram)}" target="_blank" rel="noopener">Instagram</a>.</p>` : ""}</section>`, t.contactTitel);
}
function menu() {
  $("#menu").innerHTML = `<a class="hoofd" href="/">Home</a><a class="hoofd" href="/collectie">Collectie</a><hr>
  ${S.categorieen.filter((c) => S.producten.some((p) => p.categorie === c.id)).map((c) => `<a href="/collectie/${c.id}">${h(c.naam)}</a>`).join("")}
  <hr><a class="hoofd" href="/over">Over</a><a class="hoofd" href="/contact">Contact</a><a class="hoofd" href="${h(S.teksten.etsy)}" target="_blank" rel="noopener">Etsy-winkel</a>`;
}
function route() {
  const d = location.pathname.split("/").filter(Boolean).map(decodeURIComponent);
  if (!d[0]) home(); else if (d[0] === "collectie" && d.length < 3) collectie(d[1]); else if (d[0] === "stuk" && d.length === 2) stuk(d[1]); else if (d[0] === "over" && d.length === 1) over(); else if (d[0] === "contact" && d.length === 1) contact();
  else nietGevonden();
  document.querySelectorAll("#menu a").forEach((a) => a.getAttribute("href") === location.pathname ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"));
  $("#menu").classList.remove("open"); $("#menuknop").setAttribute("aria-expanded", "false");
  if (!eerste) main.focus({ preventScroll: true });
  eerste = false;
}
document.addEventListener("click", (e) => {
  const a = e.target.closest("a[href^='/']"); if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button || a.target === "_blank" || !S) return;
  e.preventDefault(); if (a.getAttribute("href") !== location.pathname) history.pushState(null, "", a.getAttribute("href")); route(); scrollTo(0, 0);
});
addEventListener("popstate", () => S && route());
$("#stempel").innerHTML = stempelSvg();
$("#menuknop").onclick = () => { const o = $("#menu").classList.toggle("open"); $("#menuknop").setAttribute("aria-expanded", o); };
fetch("/api/site").then((r) => { if (!r.ok) throw 0; return r.json(); }).then((d) => { S = d; menu(); route(); })
  .catch(() => { main.innerHTML = '<section class="sectie"><h1>De collectie kon niet worden geladen</h1><p>Vernieuw de pagina of bekijk de <a href="https://www.etsy.com/shop/RientsPorselein">winkel op Etsy</a>.</p></section>'; });
})();
