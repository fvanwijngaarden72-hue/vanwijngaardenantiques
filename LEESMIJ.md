# Van Wijngaarden Antiques: live zetten

De site gebruikt Netlify Functions en Blobs, dus hij moet via GitHub naar Netlify (slepen naar Netlify Drop werkt niet).

## De site bijwerken (als hij al live staat)
1. Open de repository op github.com en kies **Add file > Upload files**.
2. Sleep de mappen `public` en `netlify` en de losse bestanden erin (op een computer, zodat de mappen behouden blijven) en klik **Commit changes**. Bestaande bestanden worden overschreven.
3. Netlify bouwt de site binnen een minuut opnieuw. Stukken, teksten en foto's uit het beheer blijven bewaard.
4. Ga daarna naar `/beheer` > **Etsy en controle** en klik **Vertalingen bijwerken**.

## 1. Op GitHub zetten
1. Maak op github.com een nieuwe **privé** repository, bijvoorbeeld `vanwijngaardenantiques`.
2. Klik **uploading an existing file** en sleep de inhoud van deze map erin (`public`, `netlify`, `netlify.toml`, `package.json`, `LEESMIJ.md`). Doe dit op een computer, zodat de mappen behouden blijven.
3. Klik **Commit changes**.

## 2. Koppelen aan Netlify
Netlify > **Add new project > Import an existing project > GitHub** > kies de repository > **Deploy**.

## 3. Sleutels instellen
**Project configuration > Environment variables**:

| Naam | Nodig? | Waarde |
| --- | --- | --- |
| `BEHEER_WACHTWOORD` | ja | Een wachtwoord van minstens 12 tekens voor het beheer |
| `GEMINI_API_KEY` | ja | Sleutel van aistudio.google.com (Get API key). Voor Foto Studio moet facturering aanstaan: fotobewerking zit niet in het gratis deel |
| `ETSY_API_KEY` | optioneel | `keystring:shared_secret` van etsy.com/developers/your-apps. Hiermee werkt de site zichzelf elke nacht bij |
| `ETSY_SHOP_ID` | optioneel | Alleen als de controle zegt dat de winkel niet wordt gevonden |
| `GEMINI_BEELD_MODEL`, `GEMINI_TEKST_MODEL` | optioneel | Alleen om zelf een model te kiezen. Standaard zoekt de site zelf een werkend model |

Daarna **Deploys > Trigger deploy > Deploy project**. Sleutels werken pas na een nieuwe deploy.

## 4. Controleren
Ga naar `/beheer`, log in en open **Etsy en controle > Controle starten**. Je ziet per koppeling een vinkje of de reden waarom het niet werkt.

## 5. Domein koppelen
**Domain management > Add a domain** > `vanwijngaardenantiques.com` en volg de DNS-stappen bij de domeinhouder. `rientsporselein.com` blijft bij Etsy.

## 6. Collectie compleet maken
De site start met 114 stukken. De rest komt erbij op een van deze twee manieren:

- **Etsy-bestand** (direct mogelijk): Etsy > Shop Manager > Instellingen > Opties > Gegevens downloaden > ‘Currently for sale listings’. Lees het CSV-bestand in bij **Etsy en controle**.
- **Etsy-sleutel** (automatisch, elke nacht): vraag op etsy.com/developers/register een app aan (persoonlijk gebruik, alleen lezen). Na goedkeuring door Etsy zet je `ETSY_API_KEY` in Netlify. Nieuwe artikelen komen er dan vanzelf bij en verkochte krijgen het label Verkocht.

Teksten die je in het beheer zelf hebt aangepast, worden door geen van beide overschreven.

## Beheer
- **Stukken**: toevoegen, wijzigen, op verkocht zetten, kiezen wat op de homepage staat
- **Foto Studio**: achtergrond vervangen en tekst laten voorstellen
- **Instagram-maker**: afbeelding en bijschrift maken
- **Teksten**: alle vaste teksten, en prijzen aan of uit
- **Sfeerfoto's**: brede foto's tussen de collectie
- **Etsy en controle**: koppelingen testen, Etsy bijwerken, CSV inlezen, back-up maken en terugzetten

Bij stukken uit het CSV-bestand linkt de knop naar een zoekopdracht in de Etsy-winkel, want het bestand bevat geen artikellink. Plak zo nodig de directe link bij het stuk. Met de Etsy-sleutel gaat dat vanzelf goed.

## Talen
De site is er in het Nederlands, Engels, Duits, Frans, Italiaans en Spaans. Een bezoeker krijgt automatisch de taal van zijn browser; bij een andere taal is dat Engels. Bovenaan kan hij zelf wisselen, en die keuze wordt onthouden. Elke taal heeft een eigen adres, bijvoorbeeld `/fr/collectie`.

- **Vaste teksten**: bij **Teksten** kies je bovenaan de taal. Voor elke taal staat een standaardvertaling klaar. Pas je de Nederlandse tekst aan, klik dan per taal op **Vertalen vanuit het Nederlands**, lees na en sla op.
- **Stukken**: Gemini vertaalt titels en omschrijvingen via **Etsy en controle > Vertalingen bijwerken**. Verandert de Nederlandse tekst van een stuk, dan staat het daar opnieuw in de wachtrij. Met de Etsy-sleutel gebeurt het vertalen elke nacht vanzelf.
- **Verbeteren**: open een stuk en klap **Vertalingen nalezen of verbeteren** uit.
- Zolang een stuk nog niet vertaald is, zien bezoekers de Engelse of anders de Nederlandse titel.

## Etsy Share & Save
Alle knoppen naar Etsy gebruiken de vorm `rientsporselein.etsy.com/...`. Alleen links in die vorm tellen mee voor de teruggave van Etsy. Meld de winkel eenmalig aan: Etsy > Shop Manager > Marketing > Share & Save.

## Vindbaarheid
De site maakt zelf `/sitemap.xml` (met alle taalversies) en `/robots.txt`. Meld de sitemap na livegang aan in Google Search Console.
