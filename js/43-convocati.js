/* 43-convocati.js
   grafica convocati */

const RUOLI_CONV = [["c-por", "Portieri"], ["c-dif", "Difensori"],
                    ["c-cen", "Centrocampisti"], ["c-att", "Attaccanti"]];

/* Restituisce l'elenco in ordine di ruolo, con un'intestazione prima di ogni
   gruppo; dentro il gruppo i nomi sono in ordine alfabetico. */
function gruppiConvocati(){
  const out = [];
  RUOLI_CONV.forEach(function(r){
    const voci = ($(r[0]).value || "").split("\n")
      .map(function(x){ return x.trim(); }).filter(Boolean)
      .map(function(x){
        const m = x.match(/^(\d{1,2})\s*[.\-)\s]\s*(.+)$/);
        return m ? {num: m[1], nome: m[2].trim()} : {num: "", nome: x};
      });
    voci.sort(function(a, b){
      return a.nome.localeCompare(b.nome, "it", {sensitivity: "base"});
    });
    if(voci.length) out.push({ruolo: r[1], voci: voci});
  });
  return out;
}

/* Elenco appiattito, comodo per i controlli. */
function elencoConvocati(){
  const out = [];
  gruppiConvocati().forEach(function(g){
    out.push({ruolo: g.ruolo});
    g.voci.forEach(function(v){ out.push(v); });
  });
  return out;
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
  // orario di convocazione, scritto a mano
  scriviLimitato(val("c-orario").toUpperCase(), 540, L.convOrario, L.convOrarioS, 20, 820,
                 ORO_CHIARO, "Anton", 2);

  const px = 110, pw = 860, cw = pw / 2;
  const gruppi = gruppiConvocati();
  const centro = L.listaY + L.listaH / 2;

  if(!gruppi.length){
    pannello(px, L.listaY, pw, L.listaH);
    piede(); return;
  }

  // le colonne si riempiono a gruppi interi: un ruolo non si spezza mai a metà
  const totale = gruppi.reduce(function(s, g){ return s + 1 + g.voci.length; }, 0);
  const meta = Math.ceil(totale / 2);
  const colonne = [[], []];
  let acc = 0, inSeconda = false;
  gruppi.forEach(function(g){
    const h = 1 + g.voci.length;
    if(!inSeconda && colonne[0].length > 0 && acc + h > meta) inSeconda = true;
    const c = inSeconda ? 1 : 0;
    if(!inSeconda) acc += h;
    colonne[c].push({ruolo: g.ruolo});
    g.voci.forEach(function(v){ colonne[c].push(v); });
  });
  const nRighe = Math.max(colonne[0].length, colonne[1].length);
  const lh = Math.min(L.listaH * 0.082, (L.listaH * 0.85) / nRighe);
  const pad = Math.max(34, lh * 0.62);
  const ph = Math.min(L.listaH, nRighe * lh + 2 * pad);
  const py = centro - ph / 2;
  pannello(px, py, pw, ph);

  const fs = Math.max(17, Math.round(lh * 0.66));
  const conNum = gruppi.some(function(g){
    return g.voci.some(function(v){ return v.num; });
  });
  const y0 = py + (ph - nRighe * lh) / 2 + lh * 0.5;
  const colx = [px + cw * 0.5, px + cw * 1.5];

  colonne.forEach(function(col, c){
    col.forEach(function(v, i){
      const y = y0 + i * lh;
      if(v.ruolo){
        const s = Math.max(13, Math.round(fs * 0.60));
        scrivi(v.ruolo.toUpperCase(), colx[c], y + centroInk(v.ruolo, s, ARIAL, 3),
               s, ORO, ARIAL, 3);
        ctx.strokeStyle = "rgba(200,155,60,0.5)"; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(colx[c] - cw * 0.34, y + lh * 0.36);
        ctx.lineTo(colx[c] + cw * 0.34, y + lh * 0.36);
        ctx.stroke();
        return;
      }
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
  });
  piede();
}


/* Cornice circolare a fasce concentriche, oro e nero, con la foto al centro. */
