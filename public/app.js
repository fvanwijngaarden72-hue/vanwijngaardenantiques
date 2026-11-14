(() => {
const h = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const $ = (s) => document.querySelector(s);
const main = $("#inhoud");
const NAAM = "Van Wijngaarden Antiques";

/* ---------- Talen ---------- */
const TALEN = { nl: "Nederlands", en: "English", de: "Deutsch", fr: "Français", it: "Italiano", es: "Español" };
const UI = {
  nl: { locale: "nl-NL", titel: NAAM + ": vintage servies en porselein", etsy: "Bekijk op Etsy", verkocht: "Verkocht", nieuw: "Nieuw", nuWinkel: "Nu in de winkel", alle: (n) => `Alle ${n} stukken`,
    zoekPh: "Zoek op merk of servies, bijvoorbeeld Botanica", zoeken: "Zoeken", merk: "Merk", alleMerken: "Alle merken", volgorde: "Volgorde", aanbevolen: "Aanbevolen", merkAZ: "Merk A tot Z", laag: "Prijs laag naar hoog", hoog: "Prijs hoog naar laag",
    stuk: (n) => n + (n === 1 ? " stuk" : " stukken"), geen: "Geen stukken gevonden. Probeer een andere zoekterm of", vraag: "vraag het mij", nietTitel: "Deze pagina bestaat niet", nietTekst: "Misschien is het stuk verkocht of is de link verouderd.", bekijk: "Bekijk de collectie",
    terug: (n) => "Terug naar " + n.toLowerCase(), foto: (i, n) => `Foto ${i} van ${n}`, isVerkocht: "Dit stuk is verkocht.", vergelijkbaar: "Zoek je iets vergelijkbaars? Mail me gerust.",
    geenOmschr: "De volledige beschrijving, de maten en de prijs per onderdeel staan op Etsy.", afrekenen: "Je rekent af via Etsy. Vragen over dit stuk?", mailMe: "Mail me", past: "Past hierbij", naarEtsy: "Naar de Etsy-winkel", mailNaar: "Mail naar ", insta: "Nieuwe stukken zie je het eerst op ",
    home: "Home", collectie: "Collectie", over: "Over", contact: "Contact", etsyWinkel: "Etsy-winkel", winkelEtsy: "Winkel op Etsy", menu: "Menu", skip: "Naar de inhoud", taal: "Taal", laadFout: "De collectie kon niet worden geladen", beheer: "Beheer" },
  en: { locale: "en-GB", titel: NAAM + ": vintage tableware and porcelain", etsy: "View on Etsy", verkocht: "Sold", nieuw: "New", nuWinkel: "In the shop now", alle: (n) => `All ${n} pieces`,
    zoekPh: "Search by brand or pattern, for example Botanica", zoeken: "Search", merk: "Brand", alleMerken: "All brands", volgorde: "Sort order", aanbevolen: "Recommended", merkAZ: "Brand A to Z", laag: "Price low to high", hoog: "Price high to low",
    stuk: (n) => n + (n === 1 ? " piece" : " pieces"), geen: "No pieces found. Try another search term or", vraag: "ask me", nietTitel: "This page does not exist", nietTekst: "The piece may have been sold or the link may be out of date.", bekijk: "View the collection",
    terug: (n) => "Back to " + n.toLowerCase(), foto: (i, n) => `Photo ${i} of ${n}`, isVerkocht: "This piece has been sold.", vergelijkbaar: "Looking for something similar? Feel free to email me.",
    geenOmschr: "The full description, dimensions and price per item are on Etsy.", afrekenen: "You pay through Etsy. Questions about this piece?", mailMe: "Email me", past: "Goes well with this", naarEtsy: "Go to the Etsy shop", mailNaar: "Email ", insta: "New pieces appear first on ",
    home: "Home", collectie: "Collection", over: "About", contact: "Contact", etsyWinkel: "Etsy shop", winkelEtsy: "Shop on Etsy", menu: "Menu", skip: "Skip to content", taal: "Language", laadFout: "The collection could not be loaded", beheer: "Beheer" },
  de: { locale: "de-DE", titel: NAAM + ": Vintage-Geschirr und Porzellan", etsy: "Auf Etsy ansehen", verkocht: "Verkauft", nieuw: "Neu", nuWinkel: "Jetzt im Shop", alle: (n) => `Alle ${n} Stücke`,
    zoekPh: "Suche nach Marke oder Serie, zum Beispiel Botanica", zoeken: "Suchen", merk: "Marke", alleMerken: "Alle Marken", volgorde: "Sortierung", aanbevolen: "Empfohlen", merkAZ: "Marke A bis Z", laag: "Preis aufsteigend", hoog: "Preis absteigend",
    stuk: (n) => n + (n === 1 ? " Stück" : " Stücke"), geen: "Keine Stücke gefunden. Versuchen Sie einen anderen Suchbegriff oder", vraag: "fragen Sie mich", nietTitel: "Diese Seite gibt es nicht", nietTekst: "Vielleicht ist das Stück verkauft oder der Link ist veraltet.", bekijk: "Zur Kollektion",
    terug: (n) => "Zurück zu " + n, foto: (i, n) => `Foto ${i} von ${n}`, isVerkocht: "Dieses Stück ist verkauft.", vergelijkbaar: "Suchen Sie etwas Ähnliches? Schreiben Sie mir gern.",
    geenOmschr: "Die vollständige Beschreibung, die Maße und der Preis pro Teil stehen auf Etsy.", afrekenen: "Die Bezahlung läuft über Etsy. Fragen zu diesem Stück?", mailMe: "Schreiben Sie mir", past: "Passt dazu", naarEtsy: "Zum Etsy-Shop", mailNaar: "E-Mail an ", insta: "Neue Stücke sehen Sie zuerst auf ",
    home: "Start", collectie: "Kollektion", over: "Über uns", contact: "Kontakt", etsyWinkel: "Etsy-Shop", winkelEtsy: "Shop auf Etsy", menu: "Menü", skip: "Zum Inhalt", taal: "Sprache", laadFout: "Die Kollektion konnte nicht geladen werden", beheer: "Beheer" },
  fr: { locale: "fr-FR", titel: NAAM + " : vaisselle et porcelaine vintage", etsy: "Voir sur Etsy", verkocht: "Vendu", nieuw: "Nouveau", nuWinkel: "En boutique en ce moment", alle: (n) => `Voir les ${n} pièces`,
    zoekPh: "Recherchez une marque ou un modèle, par exemple Botanica", zoeken: "Rechercher", merk: "Marque", alleMerken: "Toutes les marques", volgorde: "Tri", aanbevolen: "Recommandé", merkAZ: "Marque de A à Z", laag: "Prix croissant", hoog: "Prix décroissant",
    stuk: (n) => n + (n === 1 ? " pièce" : " pièces"), geen: "Aucune pièce trouvée. Essayez un autre terme ou", vraag: "écrivez-moi", nietTitel: "Cette page n'existe pas", nietTekst: "La pièce a peut-être été vendue ou le lien n'est plus valable.", bekijk: "Voir la collection",
    terug: (n) => "Retour : " + n, foto: (i, n) => `Photo ${i} sur ${n}`, isVerkocht: "Cette pièce est vendue.", vergelijkbaar: "Vous cherchez quelque chose de semblable ? Écrivez-moi.",
    geenOmschr: "La description complète, les dimensions et le prix par pièce figurent sur Etsy.", afrekenen: "Le paiement se fait sur Etsy. Une question sur cette pièce ?", mailMe: "Écrivez-moi", past: "À associer", naarEtsy: "Aller à la boutique Etsy", mailNaar: "Écrire à ", insta: "Les nouveautés apparaissent d'abord sur ",
    home: "Accueil", collectie: "Collection", over: "À propos", contact: "Contact", etsyWinkel: "Boutique Etsy", winkelEtsy: "Boutique sur Etsy", menu: "Menu", skip: "Aller au contenu", taal: "Langue", laadFout: "La collection n'a pas pu être chargée", beheer: "Beheer" },
  it: { locale: "it-IT", titel: NAAM + ": servizi e porcellane vintage", etsy: "Vedi su Etsy", verkocht: "Venduto", nieuw: "Novità", nuWinkel: "Ora in negozio", alle: (n) => `Tutti i ${n} pezzi`,
    zoekPh: "Cerca per marca o serie, ad esempio Botanica", zoeken: "Cerca", merk: "Marca", alleMerken: "Tutte le marche", volgorde: "Ordine", aanbevolen: "Consigliati", merkAZ: "Marca dalla A alla Z", laag: "Prezzo crescente", hoog: "Prezzo decrescente",
    stuk: (n) => n + (n === 1 ? " pezzo" : " pezzi"), geen: "Nessun pezzo trovato. Provate un altro termine oppure", vraag: "scrivetemi", nietTitel: "Questa pagina non esiste", nietTekst: "Forse il pezzo è stato venduto o il link non è più valido.", bekijk: "Scopri la collezione",
    terug: (n) => "Torna a: " + n, foto: (i, n) => `Foto ${i} di ${n}`, isVerkocht: "Questo pezzo è stato venduto.", vergelijkbaar: "Cercate qualcosa di simile? Scrivetemi pure.",
    geenOmschr: "La descrizione completa, le misure e il prezzo per pezzo si trovano su Etsy.", afrekenen: "Il pagamento avviene su Etsy. Domande su questo pezzo?", mailMe: "Scrivetemi", past: "Si abbina bene", naarEtsy: "Vai al negozio Etsy", mailNaar: "Scrivi a ", insta: "Le novità si vedono prima su ",
    home: "Home", collectie: "Collezione", over: "Chi sono", contact: "Contatti", etsyWinkel: "Negozio Etsy", winkelEtsy: "Negozio su Etsy", menu: "Menu", skip: "Vai al contenuto", taal: "Lingua", laadFout: "Non è stato possibile caricare la collezione", beheer: "Beheer" },
  es: { locale: "es-ES", titel: NAAM + ": vajilla y porcelana vintage", etsy: "Ver en Etsy", verkocht: "Vendido", nieuw: "Novedad", nuWinkel: "Ahora en la tienda", alle: (n) => `Ver las ${n} piezas`,
    zoekPh: "Busque por marca o serie, por ejemplo Botanica", zoeken: "Buscar", merk: "Marca", alleMerken: "Todas las marcas", volgorde: "Orden", aanbevolen: "Recomendado", merkAZ: "Marca de la A a la Z", laag: "Precio de menor a mayor", hoog: "Precio de mayor a menor",
    stuk: (n) => n + (n === 1 ? " pieza" : " piezas"), geen: "No se han encontrado piezas. Pruebe con otro término o", vraag: "escríbame", nietTitel: "Esta página no existe", nietTekst: "Puede que la pieza se haya vendido o que el enlace esté desactualizado.", bekijk: "Ver la colección",
    terug: (n) => "Volver a: " + n, foto: (i, n) => `Foto ${i} de ${n}`, isVerkocht: "Esta pieza está vendida.", vergelijkbaar: "¿Busca algo parecido? Escríbame.",
    geenOmschr: "La descripción completa, las medidas y el precio por pieza están en Etsy.", afrekenen: "El pago se realiza en Etsy. ¿Preguntas sobre esta pieza?", mailMe: "Escríbame", past: "Combina con", naarEtsy: "Ir a la tienda de Etsy", mailNaar: "Escribir a ", insta: "Las novedades aparecen primero en ",
    home: "Inicio", collectie: "Colección", over: "Sobre mí", contact: "Contacto", etsyWinkel: "Tienda de Etsy", winkelEtsy: "Tienda en Etsy", menu: "Menú", skip: "Ir al contenido", taal: "Idioma", laadFout: "No se pudo cargar la colección", beheer: "Beheer" },
};
// In het voorbeeldbestand zit de inhoud in de pagina zelf en verandert het webadres niet.
const VB = window.VOORBEELD || null;
let vbPad = "/";
const pad = () => (VB ? vbPad : location.pathname.replace(/(.)\/$/, "$1"));
const zetPad = (p, vervang) => { if (VB) vbPad = p; else if (p !== location.pathname) history[vervang ? "replaceState" : "pushState"](null, "", p); };
const splits = (p) => { const m = /^\/(en|de|fr|it|es)(?=\/|$)/.exec(p); return { taal: m ? m[1] : "nl", rest: (m ? p.slice(3) : p) || "/" }; };
const inTaal = (rest, taal) => (taal === "nl" ? "" : "/" + taal) + (rest === "/" && taal !== "nl" ? "" : rest);
const onthoud = (t) => { try { localStorage.setItem("taal", t); } catch {} };
// De taal van de bezoeker: een eerdere eigen keuze, anders de taal van de browser, anders Engels.
function voorkeur() {
  try { const t = localStorage.getItem("taal"); if (TALEN[t]) return t; } catch {}
  if (/bot|crawl|spider|slurp|preview/i.test(navigator.userAgent)) return null; // zoekmachines zien elke taal op het eigen adres
  for (const l of navigator.languages || [navigator.language || ""]) { const t = String(l).slice(0, 2).toLowerCase(); if (TALEN[t]) return t; }
  return "en";
}
const cache = {};
const laad = async (taal) => (cache[taal] ||= VB ? VB[taal] : await fetch("/api/site?taal=" + taal).then((r) => { if (!r.ok) throw 0; return r.json(); }));

let S, U = UI.nl, TAAL = null, zoek = "", merkKeuze = "", sorteer = "", eerste = true;
const L = (p) => inTaal(p, TAAL);
const fotoAlt = (p) => [p.merk, p.titel].filter(Boolean).join(" ");
const prijs = (p) => p.prijs != null ? new Intl.NumberFormat(U.locale, { style: "currency", currency: "EUR" }).format(p.prijs) : "";
const etsyKnop = (p, kl) => p.etsyUrl && p.status !== "verkocht" ? `<a class="${kl}" href="${h(p.etsyUrl)}" target="_blank" rel="noopener">${U.etsy}</a>` : "";
// Etsy levert elke foto in meerdere maten: vraag voor de stukpagina een grotere op.
const groot = (u) => /^https:\/\/i\.etsystatic\.com\//.test(u) ? u.replace(/il_(?:\d+x\w+|fullxfull)\./, "il_1140xN.") : u;
const fotoNr = (u) => /il_[^./]+\.(\d+)_/.exec(u || "")?.[1] || u;
const nieuw = (p) => p.toegevoegd && p.status === "beschikbaar" && Date.now() - new Date(p.toegevoegd) < 21 * 864e5;
const LEEG = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400"><rect width="500" height="400" fill="#eceef5"/><circle cx="250" cy="200" r="120" fill="#fff" stroke="#c7a24a" stroke-width="3"/><circle cx="250" cy="200" r="78" fill="none" stroke="#dde1ee" stroke-width="2"/></svg>');
// Laadt een foto niet (bijvoorbeeld omdat hij bij Etsy is vervangen), toon dan een andere maat of een leeg bord.
document.addEventListener("error", (e) => {
  const i = e.target; if (i.tagName !== "IMG" || i.dataset.op) return;
  if (i.dataset.terug) { const t = i.dataset.terug; delete i.dataset.terug; i.src = t; return; }
  const vol = i.src.replace(/il_(?:\d+x\w+)\./, "il_fullxfull.");
  if (/i\.etsystatic\.com/.test(i.src) && vol !== i.src && !i.dataset.vol) { i.dataset.vol = 1; i.src = vol; return; }
  i.dataset.op = 1; i.src = LEEG;
}, true);

function kaart(p) {
  return `<article class="stuk">
    <a class="beeld" href="${L("/stuk/" + h(p.slug))}" tabindex="-1" aria-hidden="true"><img loading="lazy" src="${h(p.foto)}" alt=""></a>
    ${p.status === "verkocht" ? `<span class="verkocht">${U.verkocht}</span>` : nieuw(p) ? `<span class="verkocht nieuw">${U.nieuw}</span>` : ""}
    ${p.merk ? `<p class="merk">${h(p.merk)}</p>` : ""}
    <h3><a href="${L("/stuk/" + h(p.slug))}">${h(p.titel)}</a></h3>
    <p class="regel">${etsyKnop(p, "etsy")}<span class="prijs">${prijs(p)}</span></p>
  </article>`;
}
function rooster(lijst) {
  let i = 0, uit = "";
  lijst.forEach((p, n) => { uit += kaart(p); const s = S.sfeer[i]; if ((n + 1) % 12 === 0 && n + 1 < lijst.length && s) { i++; uit += `<figure class="sfeerbreed"><img loading="lazy" src="${h(s.foto)}" alt="${h(s.alt || "")}"></figure>`; } });
  return uit;
}
const voet = () => `<footer class="voet"><p>${h(S.teksten.bedrijf)}</p><p><a href="mailto:${h(S.teksten.email)}">${h(S.teksten.email)}</a>${S.teksten.instagram ? `\n<a href="${h(S.teksten.instagram)}" target="_blank" rel="noopener">Instagram</a>` : ""}\n<a href="${h(S.teksten.etsy)}" target="_blank" rel="noopener">${U.winkelEtsy}</a></p>${VB ? "" : `<a class="beheerknop" href="/beheer">⚙ ${U.beheer}</a>`}</footer>`;
function zet(html, titel) { main.innerHTML = html + voet(); document.title = titel ? titel + " | " + NAAM : U.titel; }

function home() {
  const t = S.teksten, vrij = S.producten.filter((p) => p.status === "beschikbaar");
  // Staan er te weinig stukken op 'uitgelicht', vul dan aan met de rest van de collectie.
  const uit = [...vrij.filter((p) => p.uitgelicht), ...vrij.filter((p) => !p.uitgelicht)];
  const borden = uit.slice(0, 5).map((p, i) => `<a class="bord b${i + 1}" href="${L("/stuk/" + h(p.slug))}" aria-label="${h(fotoAlt(p))}"><img src="${h(p.foto)}" alt=""></a>`).join("");
  const rest = uit.slice(5, 5 + Math.max(8, Math.min(16, vrij.filter((p) => p.uitgelicht).length - 5)));
  zet(`<section class="hero"><div class="borden">${borden}</div><h1>${h(t.heroTitel)}</h1><p>${h(t.heroTekst)}</p><div><a class="knop" href="${L("/collectie")}">${h(t.heroKnop)}</a></div></section>
  <section class="sectie"><div class="kop"><h2>${U.nuWinkel}</h2></div><div class="rooster">${rest.map(kaart).join("")}</div><p style="margin-top:44px"><a class="knop blauw" href="${L("/collectie")}">${U.alle(S.producten.length)}</a></p></section>`);
}
function collectie(cat) {
  const t = S.teksten, c = S.categorieen.find((x) => x.id === cat);
  if (cat && !c) return nietGevonden();
  const basis = c ? S.producten.filter((p) => p.categorie === c.id) : S.producten;
  const merken = [...new Set(basis.map((p) => p.merk).filter(Boolean))].sort((a, b) => a.localeCompare(b, TAAL));
  if (!merken.includes(merkKeuze)) merkKeuze = "";
  const metPrijs = basis.some((p) => p.prijs != null);
  zet(`<section class="sectie"><div class="kop"><h1>${h(c ? c.naam : t.collectieTitel)}</h1>${c ? "" : `<p>${h(t.collectieTekst)}</p>`}</div>
  <div class="filters"><input id="zoek" type="search" placeholder="${h(U.zoekPh)}" aria-label="${U.zoeken}" value="${h(zoek)}">
  <select id="merk" aria-label="${U.merk}"><option value="">${U.alleMerken}</option>${merken.map((m) => `<option ${m === merkKeuze ? "selected" : ""}>${h(m)}</option>`).join("")}</select>
  <select id="sort" aria-label="${U.volgorde}"><option value="">${U.aanbevolen}</option><option value="merk">${U.merkAZ}</option>${metPrijs ? `<option value="laag">${U.laag}</option><option value="hoog">${U.hoog}</option>` : ""}</select></div>
  <p class="aantal" id="aantal" role="status"></p><div class="rooster" id="rooster"></div></section>`, c ? c.naam : t.collectieTitel);
  if (!metPrijs && (sorteer === "laag" || sorteer === "hoog")) sorteer = "";
  $("#sort").value = sorteer;
  const teken = () => {
    const q = zoek.toLowerCase().trim();
    const l = basis.filter((p) => (!merkKeuze || p.merk === merkKeuze) && (!q || (p.merk + " " + p.titel + " " + (p.omschrijving || "")).toLowerCase().includes(q)));
    if (sorteer === "merk") l.sort((a, b) => (a.merk || "~").localeCompare(b.merk || "~", TAAL) || a.titel.localeCompare(b.titel, TAAL));
    if (sorteer === "laag" || sorteer === "hoog") l.sort((a, b) => ((a.prijs ?? Infinity) - (b.prijs ?? Infinity)) * (sorteer === "laag" ? 1 : -1));
    $("#rooster").innerHTML = l.length ? rooster(l) : `<p>${U.geen} <a href="${L("/contact")}">${U.vraag}</a>.</p>`;
    $("#aantal").textContent = U.stuk(l.length);
  };
  $("#zoek").oninput = (e) => { zoek = e.target.value; teken(); };
  $("#merk").onchange = (e) => { merkKeuze = e.target.value; teken(); };
  $("#sort").onchange = (e) => { sorteer = e.target.value; teken(); };
  teken();
}
function nietGevonden() { zet(`<section class="sectie"><div class="kop"><h1>${U.nietTitel}</h1></div><p class="tekst">${U.nietTekst}</p><p><a class="knop blauw" href="${L("/collectie")}">${U.bekijk}</a></p></section>`, U.nietTitel); }
function stuk(slug) {
  const p = S.producten.find((x) => x.slug === slug);
  if (!p) return nietGevonden();
  const c = S.categorieen.find((x) => x.id === p.categorie);
  const verwant = S.producten.filter((x) => x.id !== p.id && x.status === "beschikbaar" && ((p.merk && x.merk === p.merk) || x.categorie === p.categorie))
    .sort((a, b) => ((b.merk === p.merk) + (b.categorie === p.categorie)) - ((a.merk === p.merk) + (a.categorie === p.categorie))).slice(0, 4);
  const alle = [p.foto, ...(p.fotos || [])].filter((u, i, a) => u && a.findIndex((x) => fotoNr(x) === fotoNr(u)) === i).slice(0, 10);
  const beeld = (u) => `src="${h(groot(u))}"${groot(u) !== u ? ` data-terug="${h(u)}"` : ""}`;
  zet(`<section class="sectie"><a class="terug" href="${L("/collectie/" + h(p.categorie))}">${h(U.terug(c?.naam || S.teksten.collectieTitel))}</a>
  <div class="pagina"><div><div class="foto"><img id="hoofdfoto" ${beeld(alle[0])} alt="${h(fotoAlt(p))}"></div>
  ${alle.length > 1 ? `<div class="duimen">${alle.map((u, i) => `<button type="button" data-i="${i}" aria-label="${U.foto(i + 1, alle.length)}" ${i ? "" : 'aria-current="true"'}><img loading="lazy" src="${h(u)}" alt=""></button>`).join("")}</div>` : ""}</div>
  <div>${p.merk ? `<p class="merk">${h(p.merk)}</p>` : ""}<h1>${h(p.titel)}</h1>
  ${prijs(p) ? `<p class="prijs">${prijs(p)}</p>` : ""}
  ${p.status === "verkocht" ? `<p><strong>${U.isVerkocht}</strong> ${U.vergelijkbaar}</p>` : etsyKnop(p, "knop blauw")}
  <p class="tekst">${h(p.omschrijving || U.geenOmschr)}</p>
  <p class="klein">${U.afrekenen} <a href="mailto:${h(S.teksten.email)}?subject=${encodeURIComponent(fotoAlt(p))}">${U.mailMe}</a>.</p></div></div>
  ${verwant.length ? `<div class="kop" style="margin-top:64px"><h2>${U.past}</h2></div><div class="rooster">${verwant.map(kaart).join("")}</div>` : ""}</section>`, fotoAlt(p));
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
  zet(`<section class="sectie"><div class="kop"><h1>${h(t.overTitel)}</h1></div><p class="tekst">${h(t.overTekst)}</p><div class="twee"><div><h2>${h(t.koopTitel)}</h2><p class="tekst">${h(t.koopTekst)}</p><p><a class="knop blauw" href="${h(t.etsy)}" target="_blank" rel="noopener">${U.naarEtsy}</a></p></div></div></section>`, t.overTitel);
}
function contact() {
  const t = S.teksten;
  zet(`<section class="sectie"><div class="kop"><h1>${h(t.contactTitel)}</h1></div><p class="tekst">${h(t.contactTekst)}</p><p><a class="knop blauw" href="mailto:${h(t.email)}">${U.mailNaar}${h(t.email)}</a></p>${t.instagram ? `<p class="tekst">${U.insta}<a href="${h(t.instagram)}" target="_blank" rel="noopener">Instagram</a>.</p>` : ""}</section>`, t.contactTitel);
}
function menu() {
  $("#menu").innerHTML = `<a class="hoofd" href="${L("/")}">${U.home}</a><a class="hoofd" href="${L("/collectie")}">${h(S.teksten.collectieTitel)}</a><hr>
  ${S.categorieen.filter((c) => S.producten.some((p) => p.categorie === c.id)).map((c) => `<a href="${L("/collectie/" + c.id)}">${h(c.naam)}</a>`).join("")}
  <hr><a class="hoofd" href="${L("/over")}">${U.over}</a><a class="hoofd" href="${L("/contact")}">${U.contact}</a><a class="hoofd" href="${h(S.teksten.etsy)}" target="_blank" rel="noopener">${U.etsyWinkel}</a>`;
  $("#menu").setAttribute("aria-label", U.menu); $("#menuknop").textContent = U.menu;
  $("#stempel").setAttribute("href", L("/")); document.querySelector(".skip").textContent = U.skip;
  const k = $("#taalkeuze"); k.setAttribute("aria-label", U.taal);
  k.innerHTML = Object.entries(TALEN).map(([c, n]) => `<option value="${c}" ${c === TAAL ? "selected" : ""}>${n}</option>`).join("");
}
let beurt = 0;
async function route() {
  const mijn = ++beurt, { taal, rest } = splits(pad());
  if (taal !== TAAL) {
    let d;
    try { d = await laad(taal); } catch { main.innerHTML = `<section class="sectie"><h1>${UI[taal].laadFout}</h1><p><a href="https://www.etsy.com/shop/RientsPorselein">${UI[taal].winkelEtsy}</a></p></section>`; return; }
    if (mijn !== beurt) return;
    S = d; TAAL = taal; U = UI[taal]; document.documentElement.lang = taal; menu();
  }
  const d = rest.split("/").filter(Boolean).map(decodeURIComponent);
  if (!d[0]) home(); else if (d[0] === "collectie" && d.length < 3) collectie(d[1]); else if (d[0] === "stuk" && d.length === 2) stuk(d[1]); else if (d[0] === "over" && d.length === 1) over(); else if (d[0] === "contact" && d.length === 1) contact();
  else nietGevonden();
  document.querySelectorAll("#menu a").forEach((a) => a.getAttribute("href") === pad() ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"));
  $("#menu").classList.remove("open"); $("#menuknop").setAttribute("aria-expanded", "false");
  if (!eerste) main.focus({ preventScroll: true });
  eerste = false;
}
document.addEventListener("click", (e) => {
  const a = e.target.closest("a[href^='/']"); if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button || a.target === "_blank" || a.classList.contains("beheerknop")) return;
  e.preventDefault(); zetPad(a.getAttribute("href")); route(); scrollTo(0, 0);
});
if (!VB) addEventListener("popstate", route);
$("#taalkeuze").onchange = (e) => { onthoud(e.target.value); zetPad(inTaal(splits(pad()).rest, e.target.value)); route(); };
$("#stempel").innerHTML = stempelSvg();
$("#menuknop").onclick = () => { const o = $("#menu").classList.toggle("open"); $("#menuknop").setAttribute("aria-expanded", o); };
// Eerste bezoek zonder taal in het adres: kies de taal van de bezoeker.
const begin = splits(pad());
if (begin.taal === "nl") { const v = voorkeur(); if (v && v !== "nl") zetPad(inTaal(begin.rest, v), true); }
route();
})();
