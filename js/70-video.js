/* 70-video.js
   animazione del gol e registrazione video */

const CICLO = 2400, DURATA = 7200;          // millisecondi
const BUCO = {cx: 540, cy: 930, r: 225};

function disegnaGolAnimato(tt){              // tt va da 0 a 1 dentro il ciclo
  T = TEMI.scuro; mutoAtt = T.muto;
  sfondo();

  const dx  = 8 * Math.sin(2*Math.PI*7*tt) + 5 * Math.sin(2*Math.PI*11*tt + 1.3);
  const dy  = 6 * Math.sin(2*Math.PI*9*tt + 0.7) + 4 * Math.sin(2*Math.PI*13*tt + 2.1);
  const rot = (1.8 * Math.sin(2*Math.PI*5*tt + 0.4) + Math.sin(2*Math.PI*8*tt + 1.9)) * Math.PI / 180;
  const sca = 1 + 0.025 * Math.sin(2*Math.PI*3*tt);
  ctx.save();
  ctx.translate(540 + dx, 470 + dy); ctx.rotate(rot); ctx.scale(sca, sca);
  const rigore = $("g-tipo").value === "rig";
  const testoT = (val("g-titolo") || (rigore ? "Parataaa!" : "Goooool!")).toUpperCase();
  ctx.font = "200px Anton";
  const largh = ctx.measureText(testoT).width || 1;
  testoOro(testoT, 0, 0, Math.min(212, 200 * 880 / largh), 4);
  ctx.restore();

  const RX = 300, RY = 606, RW = 480, RH = 580, RR = 46;
  rett(RX, RY, RW, RH, RR); ctx.fillStyle = "rgba(250,215,102,0.07)"; ctx.fill();
  if(foto) rettImmagine(foto, RX, RY, RW, RH, RR, regolazioneGol());
  else scriviCentratoV("CLIP", RX + RW / 2, RY + RH / 2, 26, "rgba(250,215,102,0.55)", ARIAL, 4);
  // onda d'urto: ora segue la stessa forma del riquadro
  const e = 150 * tt;
  ctx.strokeStyle = "rgba(250,215,102," + (0.85 * (1 - tt) + 0.15).toFixed(3) + ")";
  ctx.lineWidth = 4;
  rett(RX - e, RY - e, RW + 2 * e, RH + 2 * e, RR + e * 0.6); ctx.stroke();
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

/* Le stringhe dei codec cambiano da browser a browser: Safari vuole hvc1,
   Chrome pretende hev1 con il profilo completo. Le proviamo tutte. */
const CODEC = {
  h264: ["video/mp4;codecs=avc1.42E01E", "video/mp4;codecs=avc1.64003E",
         "video/mp4;codecs=avc1", "video/mp4;codecs=h264", "video/mp4",
         "video/webm;codecs=h264"],
  hevc: ["video/mp4;codecs=hvc1.1.6.L93.B0", "video/mp4;codecs=hvc1.1.6.L120.90",
         "video/mp4;codecs=hev1.1.6.L120.90", "video/mp4;codecs=hev1.1.6.L93.B0",
         "video/mp4;codecs=hvc1", "video/mp4;codecs=hev1"],
  webm: ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"]
};

function primoSupportato(lista){
  if(!window.MediaRecorder || !MediaRecorder.isTypeSupported) return null;
  for(let i = 0; i < lista.length; i++){
    try { if(MediaRecorder.isTypeSupported(lista[i])) return lista[i]; } catch(e){}
  }
  return null;
}

function formatoVideo(){
  const scelta = ($("codec") && $("codec").value) || "auto";
  if(scelta !== "auto" && CODEC[scelta]) return primoSupportato(CODEC[scelta]);
  return primoSupportato(CODEC.h264) || primoSupportato(CODEC.hevc) || primoSupportato(CODEC.webm);
}

function nomeCodec(t){
  if(!t) return "nessuno";
  if(t.indexOf("hvc1") >= 0 || t.indexOf("hev1") >= 0) return "HEVC/H.265";
  if(t.indexOf("webm") >= 0 && t.indexOf("h264") < 0) return "WebM";
  return "H.264";
}

/* che cosa sa DECODIFICARE questo browser, cioè quali clip puoi caricare */
function decodifica(){
  let v;
  try { v = document.createElement("video"); } catch(e){ return "sconosciuto"; }
  if(!v.canPlayType) return "sconosciuto";
  const meglio = function(lista){
    let esito = "no";
    for(let i = 0; i < lista.length; i++){
      const r = v.canPlayType(lista[i]);
      if(r === "probably") return "sì";
      if(r && esito === "no") esito = "forse";
    }
    return esito;
  };
  return "H.264 " + meglio(['video/mp4; codecs="avc1.42E01E"', "video/mp4"]) +
         " · HEVC/H.265 " + meglio(['video/mp4; codecs="hvc1"',
                                    'video/mp4; codecs="hev1.1.6.L120.90"',
                                    "video/quicktime"]);
}

function errore(testo){
  registrando = false;
  $("stato").innerHTML = '<span style="color:#FF6B6B">' + testo + '</span>';
  $("gen").disabled = false; $("genvid").disabled = false;
}

function diagnostica(){
  const f = formatoVideo();
  return "Registra in: " + nomeCodec(f) + (f ? "" : " (registrazione non disponibile qui)") +
         " · Clip accettate: " + decodifica();
}

$("genvid").onclick = function(){
  let rec;
  try {
    if(!window.MediaRecorder) throw new Error("MediaRecorder assente");
    if(!cv.captureStream)     throw new Error("captureStream assente");
    const tipo = formatoVideo();
    if(!tipo){
      const s = ($("codec") && $("codec").value) || "auto";
      throw new Error(s === "auto" || !CODEC[s]
        ? "nessun formato supportato"
        : nomeCodec(CODEC[s][0]) + " non disponibile su questo browser");
    }
    const flusso = cv.captureStream(30);
    if(!flusso || !flusso.getVideoTracks().length) throw new Error("flusso canvas vuoto");
    rec = new MediaRecorder(flusso, {mimeType: tipo, videoBitsPerSecond: 8000000});
    rec.tipoScelto = tipo;
  } catch(err){
    const m = err.message || "";
    if(m.indexOf("non disponibile") >= 0)
      errore(m.charAt(0).toUpperCase() + m.slice(1) + ". Scegli “Automatica” oppure H.264.");
    else
      errore("Qui la registrazione è bloccata (" + m + "). Scarica il file e aprilo " +
             "direttamente in Safari o Chrome, fuori dall'anteprima.");
    return;
  }

  const pezzi = [];
  rec.ondataavailable = function(e){ if(e.data && e.data.size) pezzi.push(e.data); };
  rec.onerror = function(e){
    errore("Errore durante la registrazione: " + ((e.error && e.error.name) || "sconosciuto"));
  };
  rec.onstop = function(){
    if(!pezzi.length){
      errore("Il browser non ha prodotto alcun dato video. Prova ad aprire il file in Safari o Chrome.");
      disegna(); return;
    }
    const est = rec.tipoScelto.indexOf("mp4") >= 0 ? "mp4" : "webm";
    const u = URL.createObjectURL(new Blob(pezzi, {type: rec.tipoScelto}));
    const o = $("out");
    o.innerHTML = '<video src="' + u + '" controls loop muted playsinline ' +
      'style="width:60%;max-width:220px;border-radius:8px"></video>' +
      '<br><a href="' + u + '" download="gol.' + est + '">Scarica il video (' +
      nomeCodec(rec.tipoScelto) + ', .' + est + ')</a>' +
      '<p>Su iPhone il file finisce nell\'app File: aprilo, tocca Condividi e scegli' +
      ' “Salva video” per portarlo nelle Foto, poi caricalo nelle storie.</p>';
    o.classList.remove("nascosto");
    registrando = false;
    $("gen").disabled = false; $("genvid").disabled = false;
    mostraDiagnostica();
    disegna();
    o.scrollIntoView({behavior: "smooth", block: "nearest"});
  };

  $("gen").disabled = true; $("genvid").disabled = true;
  registrando = true;
  $("out").classList.add("nascosto");
  try { rec.start(200); }                     // pezzi ogni 200 ms: più affidabile su Safari
  catch(err){ errore("Avvio registrazione fallito: " + err.message); return; }

  const inizio = performance.now();
  (function passo(){
    const trascorso = performance.now() - inizio;
    if(trascorso >= DURATA){
      try { rec.requestData(); } catch(e){}
      try { rec.stop(); } catch(e){ errore("Stop fallito: " + e.message); }
      return;
    }
    disegnaGolAnimato((trascorso % CICLO) / CICLO);
    $("stato").textContent = "Registrazione… " + Math.ceil((DURATA - trascorso) / 1000) + " s";
    requestAnimationFrame(passo);
  })();
};
