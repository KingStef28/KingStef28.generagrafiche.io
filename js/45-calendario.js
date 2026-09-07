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

  const n = quanteCal();
  const nRighe = Math.ceil(n / 2);
  const lh = Math.min(L.calH * 0.080, (L.calH * 0.94) / nRighe);
  const fs = Math.max(15, Math.round(lh * 0.58));
  const y0 = L.calY + (L.calH - nRighe * lh) / 2 + lh * 0.5;
  const cw = 450, colx = [315, 765];

  for(let i = 0; i < n; i++){
    const c = i < nRighe ? 0 : 1;
    const y = y0 + (i < nRighe ? i : i - nRighe) * lh;
    const casa = $("cal-dove" + (i + 1)).value === "c";
    if(casa) iconaCasa(colx[c] - cw * 0.33, y, fs * 1.02, ORO_CHIARO);
    else     iconaAereo(colx[c] - cw * 0.33, y, fs * 1.10, ORO);
    const nome = val("cal-sq" + (i + 1)).toUpperCase();
    const sn = adattaTesto(nome, fs, cw * 0.60, "Anton", 0);
    scrivi(nome, colx[c] - cw * 0.24, y + centroInk(nome, sn, "Anton", 0),
           sn, ORO_CHIARO, "Anton", 0, "left");
  }
  piede();
}
