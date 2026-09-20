/* 90-avvio.js
   esportazione e avvio */

function rendiFormato(nome){
  L = FORMATI[nome];
  cv.width = L.W; cv.height = L.H;      // ridimensionare azzera il canvas
  disegna();
  return cv.toDataURL("image/png");
}

$("gen").onclick = function(){
  const base = scheda === "gol" ? ($("g-tipo").value === "rig" ? "rigore-parato" : "gol")
               : (scheda === "md" ? "match-day"
               : (scheda === "ris" ? "risultato"
               : (scheda === "conv" ? "convocati"
               : (scheda === "mvp" ? "mvp"
               : (scheda === "cal" ? "calendario"
               : ($("s-tipo").value === "new" ? "nuovo-acquisto" : "riconferma"))))));
  const doppio = scheda !== "gol" && $("c-post").checked;
  const uscite = [];
  try {
    uscite.push({et: "Storia · 1080×1920",
                 nome: base + (doppio ? "-storia" : "") + ".png",
                 dati: cv.toDataURL("image/png")});
    if(doppio){
      uscite.push({et: "Post · 1080×1350", nome: base + "-post.png", dati: rendiFormato("post")});
      rendiFormato("storia");           // ripristina l'anteprima
    }
  } catch(err){
    L = FORMATI.storia; cv.width = L.W; cv.height = L.H; disegna();
    errore("Esportazione bloccata (" + (err.name || err.message) + "): questa anteprima non lascia " +
           "salvare le immagini caricate. Apri la versione online e riprova.");
    return;
  }
  let html = "";
  uscite.forEach(function(u){
    html += '<div class="uscita"><p class="et">' + u.et + '</p>' +
            '<img src="' + u.dati + '" alt="Grafica ' + u.et + '">' +
            '<br><a href="' + u.dati + '" download="' + u.nome + '">Scarica</a></div>';
  });
  html += '<p>Se il download non parte, tieni premuta l\'immagine e scegli “Aggiungi a Foto”.</p>';
  const o = $("out");
  o.innerHTML = html;
  o.classList.remove("nascosto");
  mostraDiagnostica();
  o.scrollIntoView({behavior: "smooth", block: "nearest"});
};

function mostraDiagnostica(){
  $("stato").innerHTML = '<span style="color:#8F8F88;font-size:12px">' + diagnostica() + '</span>';
}
$("codec").onchange = mostraDiagnostica;
$("r-momento").onchange = disegna;
$("m-invert").onchange = disegna;
$("s-tipo").onchange = disegna;
$("s-chi").onchange = function(){ aggiornaCampiRosa(); disegna(); };
$("g-tipo").onchange = disegna;
$("c-volto").onchange = disegna;
$("v-opaco").onchange = disegna;
for(let k = 1; k <= 8; k++){
  (function(i){
    ["s-zoom", "s-ox", "s-oy"].forEach(function(pre){
      $(pre + i).oninput = function(){
        if(pre === "s-zoom") $("s-zoom" + i + "-v").textContent = $(pre + i).value + "%";
        disegna();
      };
    });
  })(k);
}
["s-zoom","s-ox","s-oy"].forEach(function(id){
  $(id).oninput = function(){
    if(id === "s-zoom") $("s-zoom-v").textContent = $(id).value + "%";
    disegna();
  };
});
["g-zoom","g-ox","g-oy","v-zoom","v-ox","v-oy"].forEach(function(id){
  $(id).oninput = function(){
    if(id === "g-zoom") $("g-zoom-v").textContent = $(id).value + "%";
    if(id === "v-zoom") $("v-zoom-v").textContent = $(id).value + "%";
    disegna();
  };
});
["c-por", "c-dif", "c-cen", "c-att"].forEach(function(id){ $(id).oninput = disegna; });

$("c-handle").value = CFG.handle;
$("c-tag").value = CFG.hashtag;
mostraDiagnostica();
aggiornaCampiRosa();
aggiornaCampiCal();
apri("md");

if(document.fonts && document.fonts.load){
  document.fonts.load("100px Anton").then(disegna).catch(disegna);
  document.fonts.ready.then(disegna);
}
disegna();
