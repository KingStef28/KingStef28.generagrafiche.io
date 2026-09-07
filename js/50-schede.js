/* 50-schede.js
   passaggio da una scheda all'altra */

function disegna(){
  if(scheda === "gol") disegnaGol();
  else if(scheda === "md") disegnaMd();
  else if(scheda === "ris") disegnaRis();
  else if(scheda === "conv") disegnaConv();
  else if(scheda === "rosa") disegnaRosa();
  else if(scheda === "cal") disegnaCal();
  else disegnaMvp();
}

/* ---------- interazione ---------- */
function apri(nome){
  scheda = nome;
  $("t-gol").classList.toggle("on", nome === "gol");
  $("t-md").classList.toggle("on", nome === "md");
  $("t-ris").classList.toggle("on", nome === "ris");
  $("t-conv").classList.toggle("on", nome === "conv");
  $("t-rosa").classList.toggle("on", nome === "rosa");
  $("t-cal").classList.toggle("on", nome === "cal");
  $("t-mvp").classList.toggle("on", nome === "mvp");
  $("p-gol").classList.toggle("nascosto", nome !== "gol");
  $("p-md").classList.toggle("nascosto", nome !== "md");
  $("p-ris").classList.toggle("nascosto", nome !== "ris");
  $("p-conv").classList.toggle("nascosto", nome !== "conv");
  $("p-rosa").classList.toggle("nascosto", nome !== "rosa");
  $("p-cal").classList.toggle("nascosto", nome !== "cal");
  $("p-mvp").classList.toggle("nascosto", nome !== "mvp");
  $("genvid").classList.toggle("nascosto", nome !== "gol");
  $("codecbox").classList.toggle("nascosto", nome !== "gol");
  $("postbox").classList.toggle("nascosto", nome === "gol");
  $("voltobox").classList.toggle("nascosto", nome !== "gol" && nome !== "rosa" && nome !== "mvp");
  disegna();
}
$("t-gol").onclick = () => apri("gol");
$("t-md").onclick  = () => apri("md");
$("t-ris").onclick = () => apri("ris");
$("t-conv").onclick = () => apri("conv");
$("t-rosa").onclick = () => apri("rosa");
$("t-cal").onclick = () => apri("cal");
$("t-mvp").onclick = () => apri("mvp");

document.querySelectorAll("input[type=text]").forEach(function(i){ i.oninput = disegna; });

/* ---------- caricamento file senza blob URL (bloccati nelle anteprime protette) ---------- */
