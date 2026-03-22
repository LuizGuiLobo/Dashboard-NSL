// ══════════════════════════════════════════════════
// MÓDULO: HELPERS
// Funções utilitárias: toast, calcDias, setSyncBadge
// Claude Code: claude src/js/helpers.js
// ══════════════════════════════════════════════════

// HELPERS
// ══════════════════════════════════════════
function calcDias(d){ if(!d) return 0; return Math.floor((new Date()-new Date(d))/86400000); }
function diasColor(d){ return d>=7?'var(--accent4)':d>=4?'var(--accent)':'var(--muted)'; }

function toast(msg, tipo='ok'){
  const t=document.getElementById('toast');
  t.textContent=msg;
  t.className=`toast toast-${tipo} show`;
  setTimeout(()=>t.classList.remove('show'),3000);
}

function setSyncBadge(estado){
  const b=document.getElementById('syncBadge');
  if(estado==='ok'){ b.textContent='✓ Supabase'; b.className='sync-badge sync-ok'; }
  else if(estado==='err'){ b.textContent='✗ Offline'; b.className='sync-badge sync-err'; }
  else { b.textContent='⟳ Sincronizando...'; b.className='sync-badge sync-load'; }
}

function setBtnLoading(btnId, loading, label=''){
  const b=document.getElementById(btnId);
  if(!b) return;
  b.disabled=loading;
  b.innerHTML=loading?`<span class="spinner"></span>Salvando...`:label||b.dataset.label||b.textContent;
  if(!loading && label) b.dataset.label=label;
}