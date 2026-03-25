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
  setorEtapasConfig=setorAtivo;
  etapasTemp=JSON.parse(JSON.stringify(etapasKanban[setorEtapasConfig]||[]));
  renderCamposConfig();
  renderEtapasConfig();
  // Sincronizar selector de setor na aba etapas
  const sel=document.getElementById('cfg-setor-etapas');
  if(sel) sel.value=setorEtapasConfig;
  const btn=document.getElementById('btn-salvar-etapas');
  if(btn) btn.textContent=`💾 Salvar Etapas — ${setorEtapasConfig}`;
  mostrarCfgAba(aba);
  document.getElementById('modalConfig').style.display='flex';
}

function selecionarSetorEtapas(setor){
  setorEtapasConfig=setor;
  etapasTemp=JSON.parse(JSON.stringify(etapasKanban[setor]||[]));
  renderEtapasConfig();
  const btn=document.getElementById('btn-salvar-etapas');
  if(btn) btn.textContent=`💾 Salvar Etapas — ${setor}`;
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