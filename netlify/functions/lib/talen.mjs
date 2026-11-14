// Alles wat met de talen van de site te maken heeft. Nederlands is de hoofdtaal (zonder voorvoegsel),
// de andere talen staan onder /en, /de, /fr, /it en /es.
export const TALEN = ["nl", "en", "de", "fr", "it", "es"];
export const VERTAAL_TALEN = TALEN.slice(1);
export const TAALNAAM = { en: "Brits Engels", de: "Duits (Sie-vorm)", fr: "Frans (vous-vorm)", it: "Italiaans (beleefde voi-vorm)", es: "Spaans (usted-vorm)" };
export const TAAL_VELDEN = ["heroTitel", "heroTekst", "heroKnop", "collectieTitel", "collectieTekst", "overTitel", "overTekst", "koopTitel", "koopTekst", "contactTitel", "contactTekst"];
export const pre = (taal) => (taal === "nl" ? "" : "/" + taal);
export function taalVanPad(pad) {
  const m = /^\/(en|de|fr|it|es)(?=\/|$)/.exec(pad);
  return { taal: m ? m[1] : "nl", rest: (m ? pad.slice(3) : pad) || "/" };
}
export const padInTaal = (rest, taal) => pre(taal) + (rest === "/" && taal !== "nl" ? "" : rest);

export const CAT_NAMEN = {
  en: { servies: "Coffee and tea sets", los: "Individual pieces", borden: "Plates", potten: "Pots and cream sets", ontbijt: "Trios and breakfast", taart: "Cake and pastry", eierdopjes: "Egg cups", vazen: "Vases", sier: "Decorative pieces", keramiek: "Ceramics", koopjes: "Bargain corner" },
  fr: { servies: "Services à café et à thé", los: "Pièces à l'unité", borden: "Assiettes", potten: "Théières, pots à lait et sucriers", ontbijt: "Trios et petit-déjeuner", taart: "Gâteaux et pâtisserie", eierdopjes: "Coquetiers", vazen: "Vases", sier: "Objets décoratifs", keramiek: "Céramique", koopjes: "Bonnes affaires" },
  it: { servies: "Servizi da caffè e da tè", los: "Pezzi singoli", borden: "Piatti", potten: "Teiere, lattiere e zuccheriere", ontbijt: "Tris e colazione", taart: "Torte e dolci", eierdopjes: "Portauova", vazen: "Vasi", sier: "Oggetti decorativi", keramiek: "Ceramica", koopjes: "Angolo delle occasioni" },
  es: { servies: "Juegos de café y té", los: "Piezas sueltas", borden: "Platos", potten: "Teteras, lecheras y azucareros", ontbijt: "Tríos y desayuno", taart: "Tartas y repostería", eierdopjes: "Hueveras", vazen: "Jarrones", sier: "Objetos decorativos", keramiek: "Cerámica", koopjes: "Rincón de gangas" },
  de: { servies: "Kaffee- und Teeservice", los: "Einzelteile", borden: "Teller", potten: "Kannen, Milch und Zucker", ontbijt: "Gedecke und Frühstück", taart: "Kuchen und Gebäck", eierdopjes: "Eierbecher", vazen: "Vasen", sier: "Dekoration", keramiek: "Keramik", koopjes: "Schnäppchenecke" },
};

export const STANDAARD_VERTALING = {
  en: {
    heroTitel: "For a sensationally laid table",
    heroTekst: "Vintage porcelain and tableware by Villeroy & Boch, Wedgwood, Rosenthal and others. Browse at your leisure here and buy safely through my shop on Etsy.",
    heroKnop: "View the collection",
    collectieTitel: "Collection",
    collectieTekst: "Complete sets and individual pieces to add to your own service. You will find the price, dimensions and availability of each piece on Etsy.",
    overTitel: "About Van Wijngaarden Antiques",
    overTekst: "I am Rients van Wijngaarden and I sell vintage porcelain and tableware from Groningen in the Netherlands.\n\nYou will find complete coffee and tea sets here, as well as individual plates, cups and pots. Useful when something breaks at home or when you want to extend a service.",
    koopTitel: "How to buy a piece",
    koopTekst: "Every piece on this site is for sale in my shop on Etsy. Choose ‘View on Etsy’ and check out there. Shipping costs, the returns policy and the delivery time are on the Etsy page of the piece.",
    contactTitel: "Contact",
    contactTekst: "Looking for a particular service or a missing piece? Feel free to email me.",
  },
  de: {
    heroTitel: "Für einen sensationell gedeckten Tisch",
    heroTekst: "Vintage-Porzellan und Geschirr unter anderem von Villeroy & Boch, Wedgwood und Rosenthal. Stöbern Sie hier in Ruhe und kaufen Sie sicher über meinen Shop auf Etsy.",
    heroKnop: "Zur Kollektion",
    collectieTitel: "Kollektion",
    collectieTekst: "Komplette Service und Einzelteile, um Ihr eigenes Service zu ergänzen. Preis, Maße und Verfügbarkeit finden Sie bei jedem Stück auf Etsy.",
    overTitel: "Über Van Wijngaarden Antiques",
    overTekst: "Ich bin Rients van Wijngaarden und verkaufe von Groningen in den Niederlanden aus Vintage-Porzellan und Geschirr.\n\nSie finden hier komplette Kaffee- und Teeservice, aber auch einzelne Teller, Tassen und Kannen. Praktisch, wenn zu Hause einmal etwas zu Bruch geht oder wenn Sie ein Service erweitern möchten.",
    koopTitel: "So kaufen Sie ein Stück",
    koopTekst: "Jedes Stück auf dieser Website steht in meinem Shop auf Etsy zum Verkauf. Wählen Sie bei einem Stück „Auf Etsy ansehen“ und bezahlen Sie dort. Versandkosten, Rückgabebedingungen und Lieferzeit stehen auf der Etsy-Seite des Stücks.",
    contactTitel: "Kontakt",
    contactTekst: "Suchen Sie ein bestimmtes Service oder ein fehlendes Teil? Schreiben Sie mir gern.",
  },
  fr: {
    heroTitel: "Pour une table sensationnelle",
    heroTekst: "Porcelaine et vaisselle vintage de Villeroy & Boch, Wedgwood, Rosenthal et d'autres. Flânez ici à votre aise et achetez en toute sécurité dans ma boutique Etsy.",
    heroKnop: "Voir la collection",
    collectieTitel: "Collection",
    collectieTekst: "Des services complets et des pièces à l'unité pour compléter votre propre service. Le prix, les dimensions et la disponibilité de chaque pièce figurent sur Etsy.",
    overTitel: "À propos de Van Wijngaarden Antiques",
    overTekst: "Je m'appelle Rients van Wijngaarden et je vends de la porcelaine et de la vaisselle vintage depuis Groningue, aux Pays-Bas.\n\nVous trouverez ici des services à café et à thé complets, mais aussi des assiettes, des tasses et des théières à l'unité. Pratique quand une pièce se casse à la maison ou quand vous souhaitez agrandir un service.",
    koopTitel: "Comment acheter une pièce",
    koopTekst: "Chaque pièce de ce site est en vente dans ma boutique Etsy. Cliquez sur « Voir sur Etsy » et réglez votre achat là-bas. Les frais de port, les conditions de retour et le délai de livraison figurent sur la page Etsy de la pièce.",
    contactTitel: "Contact",
    contactTekst: "Vous cherchez un service précis ou une pièce manquante ? Écrivez-moi.",
  },
  it: {
    heroTitel: "Per una tavola sensazionale",
    heroTekst: "Porcellane e servizi vintage di Villeroy & Boch, Wedgwood, Rosenthal e altri. Curiosate con calma e acquistate in sicurezza nel mio negozio su Etsy.",
    heroKnop: "Scopri la collezione",
    collectieTitel: "Collezione",
    collectieTekst: "Servizi completi e pezzi singoli per completare il vostro servizio. Prezzo, misure e disponibilità di ogni pezzo si trovano su Etsy.",
    overTitel: "Informazioni su Van Wijngaarden Antiques",
    overTekst: "Mi chiamo Rients van Wijngaarden e vendo porcellane e servizi vintage da Groninga, nei Paesi Bassi.\n\nQui trovate servizi da caffè e da tè completi, ma anche piatti, tazze e teiere singoli. Utile quando in casa si rompe qualcosa o quando volete ampliare un servizio.",
    koopTitel: "Come acquistare un pezzo",
    koopTekst: "Ogni pezzo di questo sito è in vendita nel mio negozio su Etsy. Scegliete «Vedi su Etsy» e completate l'acquisto lì. Le spese di spedizione, le condizioni di reso e i tempi di consegna sono indicati nella pagina Etsy del pezzo.",
    contactTitel: "Contatti",
    contactTekst: "Cercate un servizio particolare o un pezzo mancante? Scrivetemi pure.",
  },
  es: {
    heroTitel: "Para una mesa sensacional",
    heroTekst: "Porcelana y vajilla vintage de Villeroy & Boch, Wedgwood, Rosenthal y otras marcas. Mire con calma y compre con seguridad en mi tienda de Etsy.",
    heroKnop: "Ver la colección",
    collectieTitel: "Colección",
    collectieTekst: "Vajillas completas y piezas sueltas para completar su propia vajilla. El precio, las medidas y la disponibilidad de cada pieza están en Etsy.",
    overTitel: "Sobre Van Wijngaarden Antiques",
    overTekst: "Soy Rients van Wijngaarden y vendo porcelana y vajilla vintage desde Groninga, en los Países Bajos.\n\nAquí encontrará juegos de café y de té completos, pero también platos, tazas y teteras sueltos. Práctico cuando algo se rompe en casa o cuando quiere ampliar una vajilla.",
    koopTitel: "Cómo comprar una pieza",
    koopTekst: "Todas las piezas de este sitio están a la venta en mi tienda de Etsy. Elija «Ver en Etsy» y pague allí. Los gastos de envío, las condiciones de devolución y el plazo de entrega figuran en la página de Etsy de la pieza.",
    contactTitel: "Contacto",
    contactTekst: "¿Busca una vajilla concreta o una pieza que le falta? Escríbame.",
  },
};

// Teksten voor de titel en omschrijving die Google en WhatsApp tonen.
export const META = {
  nl: { home: "Van Wijngaarden Antiques: vintage servies en porselein", niet: "Niet gevonden", stuk: (n) => n + ". Vintage porselein, te koop via de Etsy-winkel van Van Wijngaarden Antiques.", cat: (n) => n + " van vintage porselein. " },
  en: { home: "Van Wijngaarden Antiques: vintage tableware and porcelain", niet: "Not found", stuk: (n) => n + ". Vintage porcelain, for sale through the Etsy shop of Van Wijngaarden Antiques.", cat: (n) => n + " in vintage porcelain. " },
  fr: { home: "Van Wijngaarden Antiques : vaisselle et porcelaine vintage", niet: "Page introuvable", stuk: (n) => n + ". Porcelaine vintage, en vente dans la boutique Etsy de Van Wijngaarden Antiques.", cat: (n) => n + " en porcelaine vintage. " },
  it: { home: "Van Wijngaarden Antiques: servizi e porcellane vintage", niet: "Pagina non trovata", stuk: (n) => n + ". Porcellana vintage, in vendita nel negozio Etsy di Van Wijngaarden Antiques.", cat: (n) => n + " in porcellana vintage. " },
  es: { home: "Van Wijngaarden Antiques: vajilla y porcelana vintage", niet: "Página no encontrada", stuk: (n) => n + ". Porcelana vintage, a la venta en la tienda de Etsy de Van Wijngaarden Antiques.", cat: (n) => n + " de porcelana vintage. " },
  de: { home: "Van Wijngaarden Antiques: Vintage-Geschirr und Porzellan", niet: "Nicht gefunden", stuk: (n) => n + ". Vintage-Porzellan, erhältlich im Etsy-Shop von Van Wijngaarden Antiques.", cat: (n) => n + " aus Vintage-Porzellan. " },
};

// Etsy Share & Save: alleen links in de vorm winkelnaam.etsy.com tellen mee voor de 4% teruggave.
export function shareSave(url, shopUrl) {
  const naam = /etsy\.com\/shop\/([A-Za-z0-9]+)/.exec(shopUrl || "")?.[1];
  if (!naam || !url) return url;
  const sub = "https://" + naam.toLowerCase() + ".etsy.com";
  const m = /^https:\/\/(?:www\.)?etsy\.com\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?listing\/(\d+)/i.exec(url);
  if (m) return sub + "/listing/" + m[1];
  if (new RegExp("^https://(?:www\\.)?etsy\\.com/shop/" + naam + "/?$", "i").test(url)) return sub;
  return url;
}

/** V en Ven: de vertalingen (per stuk-id) in de gevraagde taal en in het Engels, dat als terugval dient. */
export function productInTaal(p, taal, V, Ven) {
  const { etsyTitel, bewerkt, autoVerkocht, verkochtOp, i18n, ...rest } = p;
  if (taal === "nl") return rest;
  const kies = (veld) => V?.[p.id]?.[veld] || Ven?.[p.id]?.[veld] || rest[veld];
  return { ...rest, titel: kies("titel"), omschrijving: kies("omschrijving") };
}
export function tekstenInTaal(teksten, taal) {
  const { i18n, ...nl } = teksten;
  if (taal === "nl") return nl;
  const uit = { ...nl };
  for (const k of TAAL_VELDEN) uit[k] = i18n?.[taal]?.[k] || STANDAARD_VERTALING[taal][k];
  return uit;
}
export const categorieenInTaal = (cats, taal) => cats.map((c) => ({ id: c.id, naam: taal === "nl" ? c.naam : CAT_NAMEN[taal][c.id] || c.naam }));
