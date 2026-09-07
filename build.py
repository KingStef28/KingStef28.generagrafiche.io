#!/usr/bin/env python3
"""
Ricompone i sorgenti in un unico file HTML autonomo.

    python3 build.py

Produce grafiche_partita.html: tutto incorporato (font e cascata dei volti),
funziona offline e si apre con doppio clic da computer.
La versione a più file (index.html) resta quella da pubblicare su GitHub Pages.
"""
import base64, pathlib, re

QUI = pathlib.Path(__file__).parent
USCITA = QUI / "grafiche_partita.html"

html = (QUI / "index.html").read_text()
css = (QUI / "css" / "stile.css").read_text()

# font incorporato al posto del riferimento al file
font = base64.b64encode((QUI / "assets" / "Anton-sub.woff2").read_bytes()).decode()
css = css.replace('src:url("../assets/Anton-sub.woff2")',
                  'src:url(data:font/woff2;base64,%s) format("woff2")' % font)

# tutti gli script, nell'ordine in cui li carica index.html
nomi = re.findall(r'<script src="js/([^"]+)"></script>', html)
pezzi = [(QUI / "js" / n).read_text() for n in nomi]

# la cascata dei volti diventa una costante, così non serve nessuna richiesta
casc = base64.b64encode((QUI / "assets" / "facefinder").read_bytes()).decode()
pezzi.insert(1, 'const CASCATA_B64 = "%s";' % casc)

html = re.sub(r'<link rel="stylesheet" href="css/stile.css">',
              "<style>\n%s\n</style>" % css, html)
html = re.sub(r'<script src="js/[^"]+"></script>\n?', "", html)
html = re.sub(r'<script>\nif\("serviceWorker".*?</script>\n', "", html, flags=re.S)
html = html.replace("</body>", "<script>\n%s\n</script>\n</body>" % "\n".join(pezzi))

USCITA.write_text(html)
print("creato %s — %d KB" % (USCITA.name, len(html.encode()) // 1024))
