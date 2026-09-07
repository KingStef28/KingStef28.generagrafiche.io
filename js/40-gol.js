/* 40-gol.js
   grafica gol e rigore parato */

function disegnaGol(){
  T = TEMI.scuro; mutoAtt = T.muto;
  sfondo();
  const rigore = $("g-tipo").value === "rig";
  const titolo = (val("g-titolo") || (rigore ? "Rigore parato" : "Gol!")).toUpperCase();
  testoOro(titolo, 540, 520, adattaTesto(titolo, 212, 880, "Anton", 4), 4);

  const RX = 300, RY = 606, RW = 480, RH = 580, RR = 46;
  rett(RX, RY, RW, RH, RR); ctx.fillStyle = "rgba(250,215,102,0.07)"; ctx.fill();
  if(foto) rettImmagine(foto, RX, RY, RW, RH, RR, regolazioneGol());
  else scriviCentratoV("FOTO", RX + RW / 2, RY + RH / 2, 26, "rgba(250,215,102,0.55)", ARIAL, 4);
  rett(RX, RY, RW, RH, RR); ctx.strokeStyle = ORO; ctx.lineWidth = 3; ctx.stroke();

  ctx.fillStyle = ORO_CHIARO;
  ctx.beginPath(); ctx.arc(RX + RW - 12, RY + 18, 58, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = NERO; ctx.lineWidth = 3; ctx.stroke();
  scriviCentratoV(val("g-num"), RX + RW - 12, RY + 18, 58, NERO);

  scriviLimitato(val("g-nome").toUpperCase(), 540, 1318, 104, 60, 880, T.inch, "Anton", 1);

  const by = 1400, bh = 240;
  pannello(140, by, 800, bh);
  ctx.fillStyle = ORO_CHIARO; rett(478, by - 28, 124, 56, 28); ctx.fill();
  ctx.strokeStyle = NERO; ctx.lineWidth = 3; ctx.stroke();
  const m = val("g-min");
  scriviCentratoV(m ? m + "'" : "", 540, by, 40, NERO);
  rigaPunteggio(val("g-casa"), val("g-gc"), val("g-go"), val("g-osp"), by + bh * 0.66);
  piede();
}

function rigaPunteggio(casa, gc, go, osp, y){
  const pezzi = [];
  if(casa) pezzi.push({t: casa.toUpperCase(), s: 54, c: ORO});
  if(gc)   pezzi.push({t: gc, s: 58, c: ORO_CHIARO, cifra: true});
  if(gc && go) pezzi.push({barra: true, s: 46, c: ORO});
  if(go)   pezzi.push({t: go, s: 58, c: CREMA, cifra: true});
  if(osp)  pezzi.push({t: osp.toUpperCase(), s: 54, c: ORO});
  if(!pezzi.length) return;
  const MAXW = 680;                       // il riquadro è largo 740
  let spazio = 22, fattore = 1, tot;
  for(let g = 0; g < 24; g++){            // rimpicciolisce finché la riga entra
    tot = 0;
    pezzi.forEach(function(p){
      p.sf = Math.round(p.s * fattore);
      p.w = p.barra ? Math.round(p.sf * 0.52) : larghezzaTesto(p.t, p.sf, "Anton", 0);
      tot += p.w;
    });
    tot += Math.round(spazio * fattore) * (pezzi.length - 1);
    if(tot <= MAXW || fattore <= 0.45) break;
    fattore -= 0.04;
  }
  // il trattino va centrato sulle cifre, non appoggiato alla loro linea di base
  const rifP = pezzi.filter(function(p){ return p.cifra; })[0];
  const rif = rifP ? centroInk(rifP.t, rifP.sf, "Anton", 0) : 0;
  let x = 540 - tot / 2;
  const sp = Math.round(spazio * fattore);
  pezzi.forEach(function(p){
    if(p.barra) barraPunteggio(x, y - rif, p.w, p.sf, p.c);
    else scrivi(p.t, x, y, p.sf, p.c, "Anton", 0, "left");
    x += p.w + sp;
  });
}

/* ---------- grafica MATCH DAY ---------- */
