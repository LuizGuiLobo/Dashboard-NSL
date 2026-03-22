// ══════════════════════════════════════════════════
// MÓDULO: CONFIGURADOR-CAMPOS
// Configurador de campos do formulário
// Claude Code: claude src/js/configurador-campos.js
// ══════════════════════════════════════════════════

// ══════════════════════════════════════════
// CONFIGURADOR — ABAS
// ══════════════════════════════════════════
function abrirConfig(aba='campos'){
  camposTemp=JSON.parse(JSON.stringify(camposConfig));
  etapasTemp=JSON.parse(JSON.stringify(etapasKanban));
  renderCamposConfig();
  renderEtapasConfig();
  mostrarCfgAba(aba);
  document.getElementById('modalConfig').style.display='flex';
}
function fecharConfig(){ document.getElementById('modalConfig').style.display='none'; }

function mostrarCfgAba(aba){
  ['campos','etapas','operadores'].forEach(a=>{
    const el=document.getElementById(`cfg-aba-${a}`);
    const tab=document.getElementById(`cfg-tab-${a}`);
    if(el) el.style.display=aba===a?'block':'none';
    if(tab){ tab.style.borderBottomColor=aba===a?'var(--accent)':'transparent'; tab.style.color=aba===a?'var(--accent)':'var(--muted)'; }
  });
  if(aba==='operadores') renderOperadoresConfig();
}