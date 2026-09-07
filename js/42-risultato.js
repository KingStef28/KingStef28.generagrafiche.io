/* 42-risultato.js
   grafica risultato */

function punteggioGrande(gc, go, x, y, colCifre, colTratto){
  const pezzi = [];
  if(gc) pezzi.push({t: gc, s: L.punt, c: colCifre || T.suFascia, cifra: true});
  if(gc && go) pezzi.push({barra: true, s: Math.round(L.punt * 0.69), c: colTratto || T.accFascia});
  if(go) pezzi.push({t: go, s: L.punt, c: colCifre || T.suFascia, cifra: true});
  if(!pezzi.length) return;
  const MAXW = Math.round(L.rCentro * 1.82);
  let f = 1, tot = 0;
  for(let g = 0; g < 20; g++){
    tot = 0;
    pezzi.forEach(function(p){
      p.sf = Math.round(p.s * f);
      p.w = p.barra ? Math.round(p.sf * 0.52) : larghezzaTesto(p.t, p.sf, "Anton", 0);
      tot += p.w;
    });
    tot += Math.round(18 * f) * (pezzi.length - 1);
    if(tot <= MAXW || f <= 0.5) break;
    f -= 0.05;
  }
  const rifP = pezzi.filter(function(p){ return p.cifra; })[0];
  const rif = rifP ? centroInk(rifP.t, rifP.sf, "Anton", 0) : 0;
  let cx = x - tot / 2;
  const sp = Math.round(18 * f);
  pezzi.forEach(function(p){
    if(p.barra) barraPunteggio(cx, y - rif, p.w, p.sf, p.c);
    else scrivi(p.t, cx, y, p.sf, p.c, "Anton", 0, "left");
    cx += p.w + sp;
  });
}

function disegnaRis(){
  T = TEMI.scuro;                    // questa grafica è sempre nera
  mutoAtt = T.muto;
  sfondo();

  scriviLimitato(val("m-tipo").toUpperCase(), 540, L.tipo, L.tipoS, 18, 820, T.inch, SERIF, L.tipoLS);
  const predefinito = $("r-momento").value === "primo" ? "INTERVALLO" : "FINALE";
  const titolo = (val("r-titolo") || predefinito).toUpperCase();
  testoOro(titolo, 540, L.risT, adattaTesto(titolo, L.risTS, 860, "Anton", 2), 2);

  const cy = L.cy;
  ctx.strokeStyle = ORO; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(540, cy, L.rCentro, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(L.bordo, cy); ctx.lineTo(540 - L.rCentro, cy);
  ctx.moveTo(540 + L.rCentro, cy); ctx.lineTo(L.W - L.bordo, cy); ctx.stroke();

  [[250, logoCasa], [830, logoOsp]].forEach(function(p){
    if(p[1]) logoSopraCerchio(p[1], p[0], cy, L.rC, 2 * L.rC * 1.16);
    else {
      ctx.strokeStyle = "rgba(200,155,60,0.55)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(p[0], cy, L.rC, 0, Math.PI * 2); ctx.stroke();
    }
  });
  punteggioGrande(val("r-gc"), val("r-go"), 540, cy + Math.round(L.punt * 0.35),
                  T.inch, T.acc);

  scriviLimitato(val("m-casa").toUpperCase(), 250, L.nomi, L.nomiS, 30, L.nomiW, T.inch, "Anton", 1);
  scriviLimitato(val("m-osp").toUpperCase(),  830, L.nomi, L.nomiS, 30, L.nomiW, T.inch, "Anton", 1);

  const by = L.box, bh = L.boxH;
  pannello(140, by, 800, bh);
  const marc = val("r-marcatori");
  if(marc){
    scrivi("MARCATORI", 540, by + bh * 0.36, L.labS, ORO, SERIF, 3);
    scriviLimitato(marc.toUpperCase(), 540, by + bh * 0.70, L.marcS, 22, 700, CREMA, "Anton", 0);
  }
  piede();
}


/* Elenco convocati: una riga per giocatore, numero facoltativo davanti. */
