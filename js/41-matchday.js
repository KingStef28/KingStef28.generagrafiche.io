/* 41-matchday.js
   grafica match day */

function disegnaMd(){
  T = $("m-invert").checked ? TEMI.scuro : TEMI.giallo;
  mutoAtt = T.muto;
  sfondo();

  scriviLimitato(val("m-tipo").toUpperCase(), 540, L.tipo, L.tipoS, 18, 820, T.inch, SERIF, L.tipoLS);
  scrivi("MATCH", 540, L.mdT1, L.mdTS, T.inch, "Anton", 3);
  testoOro("DAY", 540, L.mdT2, L.mdTS, 3);

  fascia(L.fasciaY, L.fasciaH);
  const cy = L.cy;
  ctx.strokeStyle = ORO; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(540, cy, L.rCentro, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(L.bordo, cy); ctx.lineTo(540 - L.rCentro, cy);
  ctx.moveTo(540 + L.rCentro, cy); ctx.lineTo(L.W - L.bordo, cy); ctx.stroke();

  [[250, logoCasa], [830, logoOsp]].forEach(function(p){
    if(p[1]) logoSopraCerchio(p[1], p[0], cy, L.rC, 2 * L.rC * 1.45);
    else {
      ctx.strokeStyle = "rgba(200,155,60,0.55)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(p[0], cy, L.rC, 0, Math.PI * 2); ctx.stroke();
    }
  });
  scriviCentratoV("VS", 540, cy, Math.round(L.rCentro * 0.46), T.accFascia);

  scriviLimitato(val("m-casa").toUpperCase(), 250, L.nomi, L.nomiS, 30, L.nomiW, T.inch, "Anton", 1);
  scriviLimitato(val("m-osp").toUpperCase(),  830, L.nomi, L.nomiS, 30, L.nomiW, T.inch, "Anton", 1);

  const by = L.box, bh = L.boxH;
  pannello(140, by, 800, bh);
  ctx.strokeStyle = "rgba(200,155,60,0.55)"; ctx.lineWidth = 1.5;
  [406, 674].forEach(function(x){
    ctx.beginPath();
    ctx.moveTo(x, by + bh * 0.20); ctx.lineTo(x, by + bh * 0.80); ctx.stroke();
  });
  const col = [[273, "DATA", val("m-data")], [540, "CALCIO D'INIZIO", val("m-ora")],
               [807, "STADIO", val("m-stadio")]];
  col.forEach(function(c){
    scriviLimitato(c[1], c[0], by + bh * 0.36, L.labS, L.labS, 230, ORO, SERIF, 3);
    scriviLimitato(c[2].toUpperCase(), c[0], by + bh * 0.70, L.infoS, 24, 230, CREMA, "Anton", 0);
  });
  piede();
}
