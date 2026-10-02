/* 45-calendario.js
   grafica calendario, con icone casa e trasferta */

function tracciaSagoma(punti, cx, cy, s, specchia){
  ctx.beginPath();
  punti.forEach(function(q, i){
    const x = cx + q[0] * s, y = cy + q[1] * s;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  });
  if(specchia){
    for(let i = punti.length - 2; i >= 0; i--)
      ctx.lineTo(cx + punti[i][0] * s, cy - punti[i][1] * s);
  }
  ctx.closePath();
}

function iconaCasa(cx, cy, s, col){
  const sagoma = [[-0.50,0.08],[0,-0.44],[0.50,0.08],[0.34,0.08],[0.34,0.44],
                  [-0.34,0.44],[-0.34,0.08]];
  ctx.save();
  ctx.translate(cx, cy);

  if(s >= 26){
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.55)";
    ctx.shadowBlur = s * 0.16;
    ctx.shadowOffsetX = s * 0.05; ctx.shadowOffsetY = s * 0.10;
    tracciaSagoma(sagoma, 0, 0, s, false);
    ctx.fillStyle = ORO_SCURO; ctx.fill();
    ctx.restore();
  }

  // tetto chiaro e muro più in ombra: lo stacco dà volume
  const g = ctx.createLinearGradient(0, -0.44 * s, 0, 0.44 * s);
  g.addColorStop(0.00, ORO_CHIARO);
  g.addColorStop(0.55, ORO_CHIARO);
  g.addColorStop(0.60, ORO);
  g.addColorStop(1.00, ORO_SCURO);
  tracciaSagoma(sagoma, 0, 0, s, false);
  ctx.fillStyle = s >= 22 ? g : col; ctx.fill();

  if(s >= 26){
    ctx.lineWidth = Math.max(1, s * 0.028);
    ctx.strokeStyle = "rgba(13,13,13,0.5)";
    ctx.stroke();
  }
  ctx.fillStyle = T.fondo;                       // la porta, per definire la sagoma
  ctx.fillRect(-0.11 * s, 0.14 * s, 0.22 * s, 0.30 * s);
  ctx.restore();
}

function iconaAereo(cx, cy, s, col){
  const sagoma = [[0.50,0.00],[0.33,0.065],[0.14,0.09],[0.06,0.095],
                  [-0.08,0.46],[-0.24,0.46],[-0.22,0.10],[-0.34,0.08],
                  [-0.37,0.30],[-0.47,0.30],[-0.48,0.06],[-0.50,0.00]];
  const ang = -40 * Math.PI / 180;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(ang);                                   // in diagonale, muso in alto a destra

  if(s >= 26){
    // ombra portata: l'offset è calcolato per cadere in basso a destra sullo schermo
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.55)";
    ctx.shadowBlur = s * 0.16;
    ctx.shadowOffsetX = -0.02 * s; ctx.shadowOffsetY = 0.10 * s;
    tracciaSagoma(sagoma, 0, 0, s, true);
    ctx.fillStyle = ORO_SCURO; ctx.fill();
    ctx.restore();
  }

  // sfumatura metallica trasversale: dà volume alla fusoliera
  const g = ctx.createLinearGradient(0, -0.46 * s, 0, 0.46 * s);
  g.addColorStop(0.00, ORO);
  g.addColorStop(0.30, ORO_CHIARO);
  g.addColorStop(0.52, ORO_CHIARO);
  g.addColorStop(0.74, ORO);
  g.addColorStop(1.00, ORO_SCURO);
  tracciaSagoma(sagoma, 0, 0, s, true);
  ctx.fillStyle = s >= 22 ? g : col; ctx.fill();

  if(s >= 26){
    ctx.lineWidth = Math.max(1, s * 0.028);
    ctx.strokeStyle = "rgba(13,13,13,0.5)";
    ctx.stroke();
    // riflesso sulla schiena della fusoliera
    ctx.beginPath();
    ctx.moveTo(0.42 * s, -0.012 * s);
    ctx.lineTo(-0.30 * s, -0.030 * s);
    ctx.lineTo(-0.30 * s, -0.055 * s);
    ctx.lineTo(0.40 * s, -0.040 * s);
    ctx.closePath();
    ctx.fillStyle = "rgba(255,240,190,0.55)"; ctx.fill();
  }
  ctx.restore();
}

function quanteCal(){
  return Math.max(1, Math.min(30, parseInt($("cal-quante").value, 10) || 1));
}

function disegnaCal(){
  T = TEMI.scuro;
  mutoAtt = T.muto;
  sfondo();

  // il campo resta in vista: aggiungiamo metà campo e cerchio
  ctx.strokeStyle = T.righe; ctx.lineWidth = 3;
  const my = L.H / 2;
  ctx.beginPath(); ctx.moveTo(L.bordo, my); ctx.lineTo(L.W - L.bordo, my); ctx.stroke();
  ctx.beginPath(); ctx.arc(540, my, L.W * 0.135, 0, Math.PI * 2); ctx.stroke();

  if(logoCasa) logoSopraCerchio(logoCasa, 540, L.convLogo, L.convLogoR);
  else {
    ctx.strokeStyle = "rgba(200,155,60,0.45)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(540, L.convLogo, L.convLogoR, 0, Math.PI * 2); ctx.stroke();
  }
  scriviLimitato(val("cal-top").toUpperCase(), 540, L.convTipo, L.tipoS, 16, 820,
                 T.inch, SERIF, L.tipoLS);
  const tit = (val("cal-titolo") || "CALENDARIO").toUpperCase();
  testoOro(tit, 540, L.convT, adattaTesto(tit, L.convTS, 860, "Anton", 2), 2);

  const storia = L.H === 1920;
  // guerriero in basso a destra, come nel post libero
  const G = posaGuerriero(storia ? 900 : 640, storia ? 90 : 40);
  const xL = L.bordo + 70, xR = L.W - L.bordo - 60, gapG = storia ? 28 : 22;

  const n = quanteCal();
  const unaColonna = n <= 8;                 // fino a 8 sta comoda una colonna sola
  const colonne = unaColonna ? 1 : 2;
  const nRighe = Math.ceil(n / colonne);
  const lh = Math.min(L.calH * (unaColonna ? 0.108 : 0.080), (L.calH * 0.94) / nRighe);
  const fs = Math.max(15, Math.round(lh * (unaColonna ? 0.50 : 0.58)));
  // col guerriero la lista sale un po', per lasciargli spazio in basso
  const y0 = L.calY + (L.calH - nRighe * lh) * (sinistraG ? 0.3 : 0.5) + lh * 0.5;
  const colDi = i => Math.floor(i / nRighe), yDi = i => y0 + (i % nRighe) * lh;
  const destra = y => Math.min(xR, G.limite(y - lh * 0.45, y + lh * 0.45, gapG));

  // un solo corpo per tutti i nomi: quello che fa entrare il più lungo
  const largNome = unaColonna ? 600 : 265;
  const nomi = [];
  let fsNomi = fs;
  for(let i = 0; i < n; i++){
    const nm = val("cal-sq" + (i + 1)).toUpperCase();
    nomi.push(nm);
    if(nm) fsNomi = Math.min(fsNomi, adattaTesto(nm, fs, largNome, "Anton", 0));
  }

  // icone incolonnate e nomi allineati: ogni colonna è centrata sul nome più lungo;
  // se una riga finisce sul guerriero la colonna scorre a sinistra, e se non basta
  // i nomi si rimpiccioliscono (tutti insieme)
  const largIcona = fs * 1.35, spazio = fs * 0.55;
  const centri = unaColonna ? [540] : [315, 765];
  let sx;
  for(;; fsNomi--){
    const larg = nomi.map(nm => nm ? larghezzaTesto(nm, fsNomi, "Anton", 0) : 0);
    const maxNome = Math.max(0, ...larg);
    const maxSin = Math.max(0, ...larg.slice(0, nRighe));
    sx = centri.map(cx => cx - (largIcona + spazio + maxNome) / 2);
    larg.forEach(function(w, i){
      sx[colDi(i)] = Math.min(sx[colDi(i)], destra(yDi(i)) - largIcona - spazio - w);
    });
    if(colonne === 2) sx[0] = Math.min(sx[0], sx[1] - fs * 0.8 - largIcona - spazio - maxSin);
    if(sx[0] >= xL || fsNomi <= 14) break;
  }

  for(let i = 0; i < n; i++){
    const y = yDi(i), x = sx[colDi(i)];
    const casa = $("cal-dove" + (i + 1)).value === "c";
    if(casa) iconaCasa(x + largIcona / 2, y, fs * 1.02, ORO_CHIARO);
    else     iconaAereo(x + largIcona / 2, y, fs * 1.18, ORO);
    if(nomi[i])
      scrivi(nomi[i], x + largIcona + spazio, y + centroInk(nomi[i], fsNomi, "Anton", 0),
             fsNomi, ORO_CHIARO, "Anton", 0, "left");
  }
  // in basso il piede finirebbe dietro la spada: col guerriero sale sotto il titolo
  piede(sinistraG ? L.convT + L.piedeS * 1.9 : 0);

  // per ultimo, con un alone dorato che lo stacca dal nero
  G.disegna("rgba(241,196,25,0.55)", storia ? 46 : 36, 0, 0);
}
