/* 46-mvp.js
   grafica MVP */

let fotoMvp = null;

function regolazioneMvp(){
  const z = $("v-zoom"), x = $("v-ox"), y = $("v-oy");
  if(!z) return null;
  return {zoom: (parseInt(z.value, 10) || 100) / 100,
          dx: (parseInt(x.value, 10) || 0) / 100,
          dy: (parseInt(y.value, 10) || 0) / 100};
}

/* Variante con il riquadro verticale del gol: pensata per il video. */
function disegnaMvpRiquadro(){
  T = TEMI.scuro; mutoAtt = T.muto;
  sfondo();
  scriviLimitato(val("m-tipo").toUpperCase(), 540, L.tipo, L.tipoS, 16, 820,
                 T.inch, SERIF, L.tipoLS);
  const tit = (val("v-titolo") || "MVP").toUpperCase();
  testoOro(tit, 540, L.mvT2, adattaTesto(tit, L.mvTS2, 860, "Anton", 4), 4);
  scriviLimitato(val("v-nome").toUpperCase(), 540, L.mvNome2, L.mvNomeS2, 34, 900,
                 ORO_CHIARO, "Anton", 2);

  const RX = L.mvRX, RY = L.mvRY, RW = L.mvRW, RH = L.mvRH, RR = 46;
  rett(RX, RY, RW, RH, RR); ctx.fillStyle = "rgba(250,215,102,0.07)"; ctx.fill();
  if(fotoMvp) rettImmagine(fotoMvp, RX, RY, RW, RH, RR, regolazioneMvp());
  else scriviCentratoV("FOTO O VIDEO", RX + RW / 2, RY + RH / 2, 26,
                       "rgba(250,215,102,0.55)", ARIAL, 4);
  rett(RX, RY, RW, RH, RR); ctx.strokeStyle = ORO; ctx.lineWidth = 3; ctx.stroke();

  const by = L.box, bh = L.boxH;
  pannello(140, by, 800, bh, $("v-opaco").checked ? NERO : null);
  rigaPunteggio(val("m-casa"), val("r-gc"), val("r-go"), val("m-osp"), by + bh * 0.60);
  piede();
}

function disegnaMvp(){
  if($("v-modo").value === "riquadro"){ disegnaMvpRiquadro(); return; }
  T = TEMI.scuro;
  mutoAtt = T.muto;
  const b = L.bordo, LW = L.W - 2 * b, LH = L.H - 2 * b;

  ctx.fillStyle = T.cornice; ctx.fillRect(0, 0, L.W, L.H);
  if(fotoMvp) rettImmagine(fotoMvp, b, b, LW, LH, 0, regolazioneMvp());
  else {
    ctx.fillStyle = "#151515"; ctx.fillRect(b, b, LW, LH);
    scriviCentratoV("FOTO DEL GIOCATORE", 540, L.H / 2, 32,
                    "rgba(250,215,102,0.45)", ARIAL, 5);
  }

  // velatura scura in alto e in basso: senza, i testi sulla foto non si leggono
  const g = ctx.createLinearGradient(0, b, 0, L.H - b);
  g.addColorStop(0.00, "rgba(13,13,13,0.94)");
  g.addColorStop(0.30, "rgba(13,13,13,0.42)");
  g.addColorStop(0.50, "rgba(13,13,13,0.12)");
  g.addColorStop(0.68, "rgba(13,13,13,0.55)");
  g.addColorStop(1.00, "rgba(13,13,13,0.96)");
  ctx.fillStyle = g; ctx.fillRect(b, b, LW, LH);

  corniceSola();

  scriviLimitato(val("m-tipo").toUpperCase(), 540, L.tipo, L.tipoS, 16, 820,
                 T.inch, SERIF, L.tipoLS);
  const tit = (val("v-titolo") || "MVP").toUpperCase();
  testoOro(tit, 540, L.mvpT, adattaTesto(tit, L.mvpTS, 860, "Anton", 4), 4);
  scriviLimitato(val("v-nome").toUpperCase(), 540, L.mvpNome, L.mvpNomeS, 40, 900,
                 ORO_CHIARO, "Anton", 2);

  const by = L.box, bh = L.boxH;
  pannello(140, by, 800, bh, $("v-opaco").checked ? NERO : null);
  rigaPunteggio(val("m-casa"), val("r-gc"), val("r-go"), val("m-osp"), by + bh * 0.60);
  piede();
}
