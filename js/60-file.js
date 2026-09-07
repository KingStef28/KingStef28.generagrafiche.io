/* 60-file.js
   caricamento di foto, GIF e video */

function leggiDataURL(file, ok, ko){
  const fr = new FileReader();
  fr.onload  = function(){ ok(fr.result); };
  fr.onerror = function(){ ko("lettura del file fallita"); };
  fr.readAsDataURL(file);
}

function caricaImmagine(file, ok, ko){
  function perDataURL(){
    leggiDataURL(file, function(d){
      const im = new Image();
      im.onload  = function(){ ok(im); };
      im.onerror = function(){ ko("immagine non leggibile"); };
      im.src = d;
    }, ko);
  }
  if(window.createImageBitmap){
    try { createImageBitmap(file).then(ok).catch(perDataURL); return; }
    catch(e){ /* si prosegue con il data URL */ }
  }
  perDataURL();
}

/* ---------- GIF animate ----------
   Un <video> non riproduce le GIF e drawImage() di una <img> GIF disegna solo
   il primo fotogramma: la decodifichiamo qui, blocco per blocco. */
function lzwDecodifica(dati, minCode, atteso){
  const CLEAR = 1 << minCode, EOI = CLEAR + 1;
  const pref = new Int32Array(4096), suff = new Uint8Array(4096), pila = new Uint8Array(4096);
  const out = new Uint8Array(atteso);
  for(let k = 0; k < CLEAR; k++) suff[k] = k;
  let dim = minCode + 1, prossimo = EOI + 1, prec = -1, primo = 0;
  let acc = 0, nbit = 0, i = 0, o = 0;

  while(o < atteso){
    while(nbit < dim && i < dati.length){ acc |= dati[i++] << nbit; nbit += 8; }
    if(nbit < dim) break;
    const codice = acc & ((1 << dim) - 1);
    acc >>>= dim; nbit -= dim;

    if(codice === CLEAR){ dim = minCode + 1; prossimo = EOI + 1; prec = -1; continue; }
    if(codice === EOI) break;

    let sp = 0, c = codice;
    if(c >= prossimo){
      if(prec === -1) break;
      pila[sp++] = primo; c = prec;
    }
    while(c >= CLEAR){ pila[sp++] = suff[c]; c = pref[c]; }
    primo = suff[c];
    pila[sp++] = primo;
    while(sp > 0 && o < atteso) out[o++] = pila[--sp];

    if(prec !== -1 && prossimo < 4096){
      pref[prossimo] = prec; suff[prossimo] = primo; prossimo++;
      if(prossimo === (1 << dim) && dim < 12) dim++;
    }
    prec = codice;
  }
  return out;
}

function ordineInterlacciato(h){
  const o = new Int32Array(h);
  let k = 0;
  [[0,8],[4,8],[2,4],[1,2]].forEach(function(pa){
    for(let y = pa[0]; y < h; y += pa[1]) o[k++] = y;
  });
  return o;
}

function analizzaGif(buffer){
  const d = new Uint8Array(buffer);
  let p = 0;
  if(!(d[0] === 71 && d[1] === 73 && d[2] === 70)) throw new Error("non è una GIF");
  const l16 = function(){ const v = d[p] | (d[p+1] << 8); p += 2; return v; };
  const tavola = function(n){ const t = d.subarray(p, p + n * 3); p += n * 3; return t; };
  const blocchi = function(){
    const parti = []; let len, tot = 0;
    while(p < d.length && (len = d[p++]) !== 0){ parti.push(d.subarray(p, p + len)); p += len; tot += len; }
    const out = new Uint8Array(tot); let o = 0;
    parti.forEach(function(x){ out.set(x, o); o += x.length; });
    return out;
  };

  p = 6;
  const W = l16(), H = l16(), pk = d[p++];
  p += 2;                                   // sfondo + aspect
  let gct = (pk & 0x80) ? tavola(1 << ((pk & 7) + 1)) : null;

  const frames = [];
  let gce = null, fine = false;
  while(!fine && p < d.length){
    const b = d[p++];
    if(b === 0x2C){
      const left = l16(), top = l16(), w = l16(), h = l16(), fpk = d[p++];
      const ct = (fpk & 0x80) ? tavola(1 << ((fpk & 7) + 1)) : gct;
      const interlacciata = !!(fpk & 0x40);
      const minCode = d[p++];
      const indici = lzwDecodifica(blocchi(), minCode, w * h);
      frames.push({left: left, top: top, w: w, h: h, ct: ct, interlacciata: interlacciata,
                   indici: indici,
                   ritardo: gce ? gce.ritardo : 100,
                   trasparente: (gce && gce.trasparente) ? gce.indice : -1,
                   disposal: gce ? gce.disposal : 0});
      gce = null;
    } else if(b === 0x21){
      const et = d[p++];
      if(et === 0xF9){
        p++;                                // lunghezza (4)
        const fl = d[p++], rit = l16(), idx = d[p++];
        p++;                                // terminatore
        gce = {disposal: (fl >> 2) & 7, trasparente: !!(fl & 1), indice: idx,
               ritardo: (rit || 10) * 10};
      } else blocchi();
    } else if(b === 0x3B) fine = true;
    else break;
  }
  if(!frames.length) throw new Error("GIF senza fotogrammi");
  return {larghezza: W, altezza: H, frames: frames};
}

/* Compone i fotogrammi (trasparenza e disposal) in tele pronte da disegnare. */
function componiGif(gif){
  const W = gif.larghezza, H = gif.altezza;
  const scala = Math.min(1, 600 / Math.max(W, H));      // limita la memoria
  const LW = Math.max(1, Math.round(W * scala)), LH = Math.max(1, Math.round(H * scala));
  const base = document.createElement("canvas"); base.width = W; base.height = H;
  const bctx = base.getContext("2d");
  const tmp = document.createElement("canvas");
  const risultato = [];
  let salvato = null;

  gif.frames.forEach(function(f){
    if(f.disposal === 3) salvato = bctx.getImageData(0, 0, W, H);
    tmp.width = f.w; tmp.height = f.h;
    const tctx = tmp.getContext("2d");
    const img = tctx.createImageData(f.w, f.h), dat = img.data;
    const ordine = f.interlacciata ? ordineInterlacciato(f.h) : null;
    for(let y = 0; y < f.h; y++){
      const dy = ordine ? ordine[y] : y;
      for(let x = 0; x < f.w; x++){
        const idx = f.indici[y * f.w + x];
        const o = (dy * f.w + x) * 4;
        if(idx === f.trasparente || !f.ct){ dat[o+3] = 0; continue; }
        dat[o]   = f.ct[idx*3];
        dat[o+1] = f.ct[idx*3+1];
        dat[o+2] = f.ct[idx*3+2];
        dat[o+3] = 255;
      }
    }
    tctx.putImageData(img, 0, 0);
    bctx.drawImage(tmp, f.left, f.top);

    const out = document.createElement("canvas");
    out.width = LW; out.height = LH;
    out.getContext("2d").drawImage(base, 0, 0, LW, LH);
    risultato.push({tela: out, ritardo: Math.max(20, f.ritardo)});

    if(f.disposal === 2) bctx.clearRect(f.left, f.top, f.w, f.h);
    else if(f.disposal === 3 && salvato) bctx.putImageData(salvato, 0, 0);
  });
  return risultato;
}

let gifTimer = null, registrando = false;
function riproduciGif(fotogrammi){
  if(gifTimer){ clearTimeout(gifTimer); gifTimer = null; }
  const vista = document.createElement("canvas");
  vista.width = fotogrammi[0].tela.width;
  vista.height = fotogrammi[0].tela.height;
  const vctx = vista.getContext("2d");
  let i = 0;
  function passo(){
    vctx.clearRect(0, 0, vista.width, vista.height);
    vctx.drawImage(fotogrammi[i].tela, 0, 0);
    if(!registrando) disegna();
    const rit = fotogrammi[i].ritardo;
    i = (i + 1) % fotogrammi.length;
    if(fotogrammi.length > 1) gifTimer = setTimeout(passo, rit);
  }
  passo();
  return vista;
}

/* Il tipo MIME non basta: da iPhone un .MOV arriva spesso senza tipo. */
function tipoFile(f){
  const n = (f.name || "").toLowerCase();
  if(f.type === "image/gif" || /\.gif$/.test(n)) return "gif";
  if(f.type.indexOf("video") === 0 ||
     /\.(mov|qt|mp4|m4v|hevc|webm|mkv|avi|3gp|3g2)$/.test(n)) return "video";
  if(f.type.indexOf("image") === 0) return "immagine";
  return "sconosciuto";
}

function caricaGif(file, ok, ko){
  const fr = new FileReader();
  fr.onload = function(){
    try {
      const fotogrammi = componiGif(analizzaGif(fr.result));
      ok(riproduciGif(fotogrammi), fotogrammi.length);
    } catch(e){ ko("GIF non leggibile (" + e.message + ")"); }
  };
  fr.onerror = function(){ ko("lettura del file fallita"); };
  fr.readAsArrayBuffer(file);
}

function caricaVideo(file, ok, ko){
  let giaRipiegato = false;
  function prova(src){
    const v = document.createElement("video");
    v.muted = true; v.loop = true; v.playsInline = true; v.defaultMuted = true;
    v.setAttribute("playsinline", ""); v.setAttribute("muted", "");
    v.style.cssText = "position:absolute;width:1px;height:1px;opacity:0;pointer-events:none";
    document.body.appendChild(v);      // iOS decodifica solo i video presenti nel DOM
    v.onloadeddata = function(){
      if(!v.videoWidth || !v.videoHeight){ v.onerror(); return; }
      const p = v.play();
      if(p && p.catch) p.catch(function(){});
      ok(v);
    };
    v.onerror = function(){
      if(v.parentNode) v.parentNode.removeChild(v);
      ripiego();
    };
    v.src = src;
  }
  const LIMITE = 40 * 1024 * 1024;
  function ripiego(){
    if(!giaRipiegato && file.size > LIMITE){
      ko("clip da " + Math.round(file.size / 1048576) + " MB: troppo pesante da convertire. " +
         "Accorciala o esportala a risoluzione più bassa.");
      return;
    }
    if(giaRipiegato){
      ko("questo browser non decodifica la clip. Se viene da iPhone è in HEVC/H.265: " +
         "aprila in Safari, oppure imposta Fotocamera › Formati › Massima compatibilità " +
         "per registrare in H.264.");
      return;
    }
    giaRipiegato = true;                // i blob URL sono bloccati in certe anteprime
    leggiDataURL(file, prova, ko);
  }
  // prima il blob URL: le clip iPhone sono grandi e il data URL le raddoppia in memoria
  try { prova(URL.createObjectURL(file)); }
  catch(e){ ripiego(); }
}

function canvasPulito(){               // false se il browser ha "contaminato" il canvas
  try { ctx.getImageData(0, 0, 1, 1); return true; } catch(e){ return false; }
}

function collegaFile(idInput, idEtichetta, testo, assegna){
  $(idInput).onchange = function(e){
    const f = e.target.files[0];
    if(!f) return;
    const et = $(idEtichetta);
    const fatto = function(m){
      assegna(m);
      if(f.type.indexOf("video") === 0)
        setTimeout(function(){ cacheVolto.delete(m); disegna(); }, 700);
      et.classList.add("pieno"); et.textContent = testo + " ✓";
      disegna();
      if(!canvasPulito())
        errore("Questa anteprima blocca le immagini caricate: usa la versione online per esportarle.");
      else mostraDiagnostica();
    };
    const fallito = function(msg){ errore(testo + ": " + msg); };
    const tipo = tipoFile(f);
    if(tipo === "gif")        caricaGif(f, fatto, fallito);
    else if(tipo === "video") caricaVideo(f, fatto, fallito);
    else caricaImmagine(f, fatto, function(msg){
      // tipo sconosciuto: prima di arrendersi si prova come video
      caricaVideo(f, fatto, function(){ fallito(msg); });
    });
  };
}
collegaFile("g-foto",  "g-foto-l",  "Foto o clip",    i => foto = i);
collegaFile("m-lcasa", "m-lcasa-l", "Stemma di casa", i => logoCasa = i);
collegaFile("m-losp",  "m-losp-l",  "Stemma ospite",  i => logoOsp = i);
for(let k = 1; k <= 8; k++){
  (function(i){
    collegaFile("v-foto", "v-foto-l", "Foto MVP", function(m){ fotoMvp = m; });
    collegaFile("s-foto" + i, "s-foto" + i + "-l", "Foto giocatore " + i,
                function(m){ fotoRosa[i - 1] = m; });
  })(k);
}

(function costruisciCalendario(){
  let opz = "";
  for(let k = 1; k <= 30; k++) opz += '<option value="' + k + '">' + k + '</option>';
  $("cal-quante").innerHTML = opz;
  $("cal-quante").value = "10";
  let righe = "";
  for(let k = 1; k <= 30; k++){
    righe += '<div class="row" id="cal-r' + k + '">' +
      '<label class="f mini"><span>' + k + '</span>' +
      '<select id="cal-dove' + k + '"><option value="c">Casa</option>' +
      '<option value="t">Trasferta</option></select></label>' +
      '<label class="f"><span>Avversario</span>' +
      '<input id="cal-sq' + k + '" type="text" autocomplete="off"></label></div>';
  }
  $("cal-righe").innerHTML = righe;
  for(let k = 1; k <= 30; k++){
    $("cal-dove" + k).onchange = disegna;
    $("cal-sq" + k).oninput = disegna;
  }
})();

function aggiornaCampiCal(){
  const n = quanteCal();
  for(let k = 1; k <= 30; k++) $("cal-r" + k).classList.toggle("nascosto", k > n);
}
$("cal-quante").onchange = function(){ aggiornaCampiCal(); disegna(); };

function aggiornaCampiRosa(){
  const n = quantiRosa();
  for(let k = 1; k <= 8; k++) $("g-blocco" + k).classList.toggle("nascosto", k > n);
}
$("s-quanti").onchange = function(){ aggiornaCampiRosa(); disegna(); };

/* ---------- animazione GOOOOL ---------- */
