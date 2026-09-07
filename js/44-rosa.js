/* 44-rosa.js
   grafica riconferme e nuovi acquisti */

function corniceFoto(cx, cy, rEst, media){
  const g = ctx.createLinearGradient(cx - rEst, cy - rEst, cx + rEst, cy + rEst);
  g.addColorStop(0, ORO_CHIARO); g.addColorStop(0.34, ORO);
  g.addColorStop(0.62, ORO_CHIARO); g.addColorStop(1, ORO_SCURO);
  const disco = function(r, col){
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
  };
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = rEst * 0.10; ctx.shadowOffsetY = rEst * 0.04;
  disco(rEst, g);
  ctx.restore();
  if(rEst >= 130){
    disco(rEst * 0.955, NERO); disco(rEst * 0.905, g);
    disco(rEst * 0.850, NERO); disco(rEst * 0.805, g);
    disco(rEst * 0.760, NERO);
  } else {                                  // poche fasce: restano leggibili
    disco(rEst * 0.93, NERO); disco(rEst * 0.87, g); disco(rEst * 0.80, NERO);
  }
  const rF = rEst * 0.735;
  if(media) cerchioImmagine(media, cx, cy, rF);
  else scriviCentratoV("FOTO", cx, cy, Math.round(rEst * 0.115),
                       "rgba(250,215,102,0.55)", ARIAL, 4);
  ctx.beginPath(); ctx.arc(cx, cy, rF, 0, Math.PI * 2);
  ctx.strokeStyle = ORO_SCURO; ctx.lineWidth = 3; ctx.stroke();
}

const fotoRosa = [];

function quantiRosa(){
  return Math.max(1, Math.min(8, parseInt($("s-quanti").value, 10) || 1));
}

function disegnaRosa(){
  T = TEMI.giallo;
  mutoAtt = T.muto;
  sfondo();

  const nuovoAcq = $("s-tipo").value === "new";
  const n = quantiRosa();
  if(logoCasa) logoSopraCerchio(logoCasa, 540, L.rosaLogo, L.rosaLogoR);
  else {
    ctx.strokeStyle = "rgba(200,155,60,0.45)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(540, L.rosaLogo, L.rosaLogoR, 0, Math.PI * 2); ctx.stroke();
  }
  scriviLimitato(val("s-stagione").toUpperCase(), 540, L.rosaTipo, L.tipoS, 16, 820,
                 T.inch, SERIF, L.tipoLS);

  const chi = $("s-chi").value;
  const t1 = nuovoAcq ? (n > 1 ? "NUOVI" : "NUOVO") : "RICONFERMA";
  let t2;
  if(nuovoAcq){
    if(chi === "all")      t2 = n > 1 ? "allenatori" : "allenatore";
    else if(chi === "mix") t2 = n > 1 ? "innesti" : "innesto";
    else                   t2 = n > 1 ? "acquisti" : "acquisto";
  } else {
    if(chi === "all")      t2 = n > 1 ? "degli allenatori" : "dell'allenatore";
    else if(chi === "mix") t2 = "della rosa";
    else                   t2 = n > 1 ? "dei giocatori" : "del giocatore";
  }
  scrivi(t1, 540, L.rosaT1, adattaTesto(t1, L.rosaT1S, 880, "Anton", 3), T.inch, "Anton", 3);
  const fontCorsivo = function(v){ return "italic bold " + v + "px " + SERIF; };
  testoOro(t2, 540, L.rosaT2, adattaConFont(t2, L.rosaT2S, 800, fontCorsivo), 1,
           "italic bold SIZEpx " + SERIF);

  // griglia: una riga fino a 3 giocatori, due righe da 4 in su
  const righe = n <= 3 ? 1 : 2;
  const colonne = Math.ceil(n / righe);
  const marg = 54;
  const cellW = (L.W - 2 * marg) / colonne;
  const cellH = L.rosaGridH / righe;
  const nomeS = Math.min(L.rosaNomeS, Math.round(cellW * 0.16));
  const ruoloS = Math.max(15, Math.round(nomeS * 0.62));
  const r = Math.min(cellW * 0.42, (cellH - nomeS - ruoloS - 46) / 2, L.rosaFotoR);
  const contenuto = 2 * r + 18 + nomeS * 0.73 + ruoloS * 1.35;

  for(let i = 0; i < n; i++){
    const f = Math.floor(i / colonne), c = i % colonne;
    const inRiga = Math.min(colonne, n - f * colonne);
    const scarto = (colonne - inRiga) * cellW / 2;      // ultima riga centrata
    const cx = marg + scarto + cellW * (c + 0.5);
    const cyTop = L.rosaGridY + cellH * f + (cellH - contenuto) / 2;
    corniceFoto(cx, cyTop + r, r, fotoRosa[i]);
    const yn = cyTop + 2 * r + 18 + nomeS * 0.73;
    scriviLimitato(val("s-nome" + (i + 1)).toUpperCase(), cx, yn, nomeS, 18,
                   cellW * 0.92, T.inch, "Anton", 1);
    scriviLimitato(val("s-ruolo" + (i + 1)).toUpperCase(), cx, yn + ruoloS * 1.35, ruoloS, 13,
                   cellW * 0.9, mutoAtt, "Anton", 3);
  }

  const by = L.box, bh = L.boxH;
  pannello(140, by, 800, bh);
  let pre;
  if(nuovoAcq)
    pre = chi === "all" ? (n > 1 ? "Nuovi incarichi tecnici ufficiali" : "Nuovo incarico tecnico ufficiale")
                        : (n > 1 ? "Nuovi tesseramenti ufficiali" : "Nuovo tesseramento ufficiale");
  else
    pre = chi === "all" ? (n > 1 ? "Conferma ufficiale dello staff tecnico" : "Conferma ufficiale dell'allenatore")
        : chi === "mix" ? "Lista ufficiale dei confermati"
        : (n > 1 ? "Lista ufficiale giocatori confermati" : "Lista ufficiale giocatore confermato");
  const r1 = val("s-riga1") || pre;
  const r2 = val("s-riga2") || "Società e dirigenza";
  scriviLimitato(r1.toUpperCase(), 540, by + bh * 0.35, Math.round(L.infoS * 0.92), 20, 700,
                 ORO_CHIARO, "Anton", 0);
  ctx.beginPath();
  ctx.moveTo(440, by + bh * 0.50); ctx.lineTo(640, by + bh * 0.50);
  ctx.strokeStyle = "rgba(200,155,60,0.7)"; ctx.lineWidth = 2; ctx.stroke();
  scriviLimitato(r2.toUpperCase(), 540, by + bh * 0.74, Math.round(L.infoS * 0.80), 18, 700,
                 ORO, "Anton", 0);
  piede();
}


/* ---------- icone casa / trasferta ---------- */
