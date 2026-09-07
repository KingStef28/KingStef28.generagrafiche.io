# Grafiche Polisportiva Val di Loreto

Strumento per generare le grafiche social della società: match day, convocati,
gol e rigore parato, risultato, riconferme e nuovi acquisti, calendario, MVP.
Gira interamente nel browser, senza server e senza inviare nulla in rete.

## Come è fatto

```
index.html          pagina da pubblicare
css/stile.css       aspetto dell'interfaccia
js/                 il codice, diviso per area (vedi sotto)
assets/             font Anton e cascata per il riconoscimento dei volti
sw.js               service worker: fa funzionare tutto anche senza rete
build.py            ricompone tutto in un unico file offline
```

I file JavaScript si caricano **nell'ordine numerico** e condividono le stesse
variabili: non sono moduli. Se ne aggiungi uno, inseriscilo sia in `index.html`
sia nell'elenco dentro `sw.js`.

| file | contenuto |
|---|---|
| `00-pico.js` | libreria di riconoscimento volti (pico.js, licenza MIT) |
| `10-base.js` | impostazioni, palette, misure delle due dimensioni, utilità di testo |
| `20-volti.js` | ricerca del volto e inquadratura delle immagini |
| `25-loghi.js` | ritaglio e pareggio degli stemmi |
| `30-stile.js` | temi, cornice, fregi, fasce, pannelli, oro metallico |
| `40-gol.js` … `46-mvp.js` | una grafica per file |
| `50-schede.js` | passaggio da una scheda all'altra |
| `60-file.js` | caricamento di foto, GIF e video |
| `70-video.js` | animazione del gol e registrazione |
| `90-avvio.js` | esportazione PNG e avvio |

## Impostare la repository

1. Crea una repository **pubblica** (GitHub Pages è gratuito solo così).
2. Carica il contenuto di questa cartella nella radice, non dentro una sottocartella.
3. Vai in **Settings → Pages**, alla voce *Source* scegli **Deploy from a branch**,
   poi branch `main` e cartella `/ (root)`. Salva.
4. Dopo un minuto il sito è su `https://TUONOME.github.io/NOMEREPO/`.
5. Apri quell'indirizzo in Safari sull'iPhone, poi **Condividi → Aggiungi a Home**.
   Da lì funziona come un'app, anche senza rete.

### Dopo ogni modifica

Cambia il numero di `VERSIONE` in cima a `sw.js` (per esempio da `vdl-1` a `vdl-2`).
Senza questo passaggio il telefono continua a usare la versione in cache.

## Versione a file unico

```
python3 build.py
```

Produce `grafiche_partita.html`: tutto incorporato, si apre con doppio clic da
computer e funziona senza rete. Serve perché aprendo `index.html` da `file://`
il browser blocca il caricamento della cascata dei volti.

Non modificare `grafiche_partita.html` a mano: si rigenera dai sorgenti.

## Personalizzazione

In cima a `js/10-base.js` c'è il blocco `CFG` con handle, hashtag e il giallo
della società. La palette completa è all'inizio di `js/30-stile.js`.
