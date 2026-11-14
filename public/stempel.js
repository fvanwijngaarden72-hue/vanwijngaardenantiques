// Het merkteken, getekend als de stempel op de onderkant van een bord.
window.stempelSvg = (kleur = "currentColor") => `<svg viewBox="0 0 200 200" role="img" aria-hidden="true" fill="none" stroke="${kleur}">
<circle cx="100" cy="100" r="96" stroke-width="2.5"/><circle cx="100" cy="100" r="90" stroke-width=".8"/>
<defs><path id="boog" d="M100 100m-72 0a72 72 0 1 1 144 0a72 72 0 1 1-144 0"/></defs>
<text fill="${kleur}" stroke="none" font-family="'Bodoni Moda',serif" font-size="15.5" letter-spacing="2.1"><textPath href="#boog" startOffset="50%" text-anchor="middle" side="left">VAN WIJNGAARDEN ANTIQUES  ✦  GRONINGEN  ✦</textPath></text>
<text x="100" y="124" text-anchor="middle" fill="${kleur}" stroke="none" font-family="'Bodoni Moda',serif" font-style="italic" font-size="70">W</text>
<path d="M62 142c12 7 64 7 76 0" stroke-width="1.6" stroke-linecap="round"/></svg>`;
