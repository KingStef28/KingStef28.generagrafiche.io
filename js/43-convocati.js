/* 43-convocati.js
   grafica convocati */

function elencoConvocati(){
  const righe = ($("c-lista").value || "").split("\n")
    .map(function(r){ return r.trim(); }).filter(Boolean);
  const voci = righe.map(function(r){
    const m = r.match(/^(\d{1,2})\s*[.\-)\s]\s*(.+)$/);
    return m ? {num: m[1], nome: m[2].trim()} : {num: "", nome: r};
  });
  voci.sort(function(a, b){
    return a.nome.localeCompare(b.nome, "it", {sensitivity: "base"});
  });
  return voci;
}

function disegnaConv(){
  T = TEMI.scuro;                    // questa grafica è sempre nera
  mutoAtt = T.muto;
  sfondo();
  // stemma della società in cima
  if(logoCasa) logoSopraCerchio(logoCasa, 540, L.convLogo, L.convLogoR);
  else {
    ctx.strokeStyle = "rgba(200,155,60,0.45)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(540, L.convLogo, L.convLogoR, 0, Math.PI * 2); ctx.stroke();
  }
  scriviLimitato(val("m-tipo").toUpperCase(), 540, L.convTipo, L.tipoS, 18, 820, T.inch, SERIF, L.tipoLS);
  const tit = (val("c-titolo") || "CONVOCATI").toUpperCase();
  testoOro(tit, 540, L.convT, adattaTesto(tit, L.convTS, 860, "Anton", 2), 2);
  // giorno della partita, sotto al titolo
  scriviLimitato(val("m-data").toUpperCase(), 540, L.convT + L.convTS * 0.55,
                 L.tipoS, 16, 820, T.inch, SERIF, L.tipoLS);

  const px = 110, pw = 860, cw = pw / 2;
  const voci = elencoConvocati();
  const centro = L.listaY + L.listaH / 2;

  if(!voci.length){
    pannello(px, L.listaY, pw, L.listaH);
    piede(); return;
  }

  // il pannello si stringe sull'elenco: con pochi nomi niente vuoti enormi
  const nRighe = Math.ceil(voci.length / 2);
  const lh = Math.min(L.listaH * 0.082, (L.listaH * 0.85) / nRighe);
  const pad = Math.max(34, lh * 0.62);
  const ph = Math.min(L.listaH, nRighe * lh + 2 * pad);
  const py = centro - ph / 2;
  pannello(px, py, pw, ph);

  const fs = Math.max(17, Math.round(lh * 0.66));
  const conNum = voci.some(function(v){ return v.num; });
  const y0 = py + (ph - nRighe * lh) / 2 + lh * 0.5;
  const colx = [px + cw * 0.5, px + cw * 1.5];

  voci.forEach(function(v, i){
    const c = i < nRighe ? 0 : 1;
    const y = y0 + (i < nRighe ? i : i - nRighe) * lh;
    const nome = v.nome.toUpperCase();
    if(conNum){
      if(v.num) scrivi(v.num, colx[c] - cw * 0.25, y + centroInk(v.num, fs, "Anton", 0),
                       fs, ORO, "Anton", 0, "right");
      const s = adattaTesto(nome, fs, cw * 0.64, "Anton", 0);
      scrivi(nome, colx[c] - cw * 0.16, y + centroInk(nome, s, "Anton", 0),
             s, ORO_CHIARO, "Anton", 0, "left");
    } else {
      const s = adattaTesto(nome, fs, cw * 0.82, "Anton", 0);
      scriviCentratoV(nome, colx[c], y, s, ORO_CHIARO);
    }
  });
  piede();
}


/* Cornice circolare a fasce concentriche, oro e nero, con la foto al centro. */
