// ══════════════════════════════════════════════════
// MÓDULO: CAMPOS-EXTRAS
// renderCamposExtrasForm, getCamposExtrasValores
// Claude Code: claude src/js/campos-extras.js
// ══════════════════════════════════════════════════

// ══════════════════════════════════════════
// CAMPOS EXTRAS
// ══════════════════════════════════════════
function renderCamposExtrasForm(prefix, dados){
  const container=document.getElementById(`campos-extras-${prefix}`);
  if(!container||!camposConfig.length){ if(container) container.innerHTML=''; return; }
  let html='<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:0">';
  camposConfig.forEach(c=>{
    const val=dados&&dados[c.id]?dados[c.id]:'';
    const req=c.obrigatorio?`<span style="color:var(--accent4)">*</span>`:'';
    let input='';
    if(c.tipo==='select'&&c.opcoes?.length){
      input=`<select class="inp" id="${prefix}-extra-${c.id}"><option value="">Selecionar...</option>${c.opcoes.map(o=>`<option ${val===o?'selected':''}>${o}</option>`).join('')}</select>`;
    } else if(c.tipo==='number'){
      input=`<input class="inp" type="number" id="${prefix}-extra-${c.id}" value="${val}" placeholder="0">`;
    } else if(c.tipo==='date'){
      input=`<input class="inp" type="date" id="${prefix}-extra-${c.id}" value="${val}">`;
    } else {
      input=`<input class="inp" type="text" id="${prefix}-extra-${c.id}" value="${val}" placeholder="${c.label}">`;
    }
    html+=`<div class="form-group"><div class="lbl">${c.label} ${req}</div>${input}</div>`;
  });
  html+='</div>';
  container.innerHTML=html;
}

function getCamposExtrasValores(prefix){
  const vals={};
  camposConfig.forEach(c=>{ const el=document.getElementById(`${prefix}-extra-${c.id}`); if(el) vals[c.id]=el.value.trim(); });
  return vals;
}

function validarCamposExtras(prefix){
  for(const c of camposConfig){
    if(c.obrigatorio){
      const el=document.getElementById(`${prefix}-extra-${c.id}`);
      if(el&&!el.value.trim()){ alert(`Campo "${c.label}" é obrigatório.`); el.focus(); return false; }
    }
  }
  return true;
}