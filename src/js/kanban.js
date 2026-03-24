// ══════════════════════════════════════════════════
// MÓDULO: KANBAN
// renderKanban, kanbanCard, moverStatus, drag&drop
// Claude Code: claude src/js/kanban.js
// ══════════════════════════════════════════════════

// ══════════════════════════════════════════
// KANBAN
// ══════════════════════════════════════════
function renderSetorTabs(){
  document.getElementById('setorTabs').innerHTML=SETORES.map(s=>`
    <div class="setor-tab ${s===setorAtivo?'active':''}"
      style="${s===setorAtivo?`background:${SETOR_COLORS[s]};color:#000;border-color:${SETOR_COLORS[s]}`:''}"
      onclick="setSetor('${s}')">
      ${s} <span style="font-family:var(--fm);font-size:10px;margin-left:4px">${osData.filter(o=>o.setor===s).length}</span>
    </div>`).join('');
}

function setSetor(s){ setorAtivo=s; renderSetorTabs(); renderKanban(); }

function renderKanban(){
  renderSetorTabs();
  const board=document.getElementById('kanbanBoard');
  const osDoSetor=osData.filter(o=>o.setor===setorAtivo);
  const corSetor=SETOR_COLORS[setorAtivo];
  const etapas=(etapasKanban[setorAtivo]||[]).length?etapasKanban[setorAtivo]:[{id:'diagnostico',label:'Diagnóstico',cor:'#3b82f6'}];
  board.innerHTML=etapas.map(etapa=>{
    const cards=osDoSetor.filter(o=>o.status===etapa.label);
    return `<div class="kanban-col" data-status="${etapa.label}">
      <div class="kanban-col-header" style="border-top:3px solid ${etapa.cor};border-radius:8px 8px 0 0">
        <div class="kanban-col-title" style="color:${etapa.cor}">${etapa.label}</div>
        <div class="kanban-count">${cards.length}</div>
      </div>
      <div class="kanban-body">
        <div class="kanban-drop-zone" data-status="${etapa.label}"
          ondragover="dragOver(event,this)" ondragleave="dragLeave(this)" ondrop="dropCard(event,'${etapa.label}')">
          ${cards.map(os=>kanbanCard(os,corSetor)).join('')}
          ${!cards.length?`<div style="text-align:center;color:var(--muted);font-size:11px;padding:16px 0">vazio</div>`:''}
        </div>
      </div>
    </div>`;
  }).join('');
  board.querySelectorAll('.kanban-card').forEach(card=>{
    card.addEventListener('dragstart',e=>{ dragId=card.dataset.id; setTimeout(()=>card.classList.add('dragging'),0); });
    card.addEventListener('dragend',()=>card.classList.remove('dragging'));
  });
}

function kanbanCard(os, cor){
  const d=calcDias(os.dataEntrada);
  const dc=diasColor(d);
  const isPeca=os.tipo==='peca'||os.placa==='PEÇA';
  const etapas=(etapasKanban[os.setor]||[]).length?etapasKanban[os.setor]:[{label:'Diagnóstico'}];
  const idx=etapas.findIndex(e=>e.label===os.status);
  const podePrev=idx>0, podeNext=idx<etapas.length-1;
  let extrasHtml='';
  if(os.extras && camposConfig.length){
    const linhas=camposConfig.filter(c=>os.extras[c.id]).map(c=>`<span style="color:var(--muted)">${c.label}:</span> ${os.extras[c.id]}`);
    if(linhas.length) extrasHtml=`<div class="kc-extras">${linhas.join(' · ')}</div>`;
  }
  return `<div class="kanban-card" draggable="true" data-id="${os.id}">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:6px;margin-bottom:4px">
      <div class="kc-num">${os.numero}</div>
      <div style="display:flex;gap:4px;flex-shrink:0">
        <button title="Editar" onclick="abrirEditar('${os.id}')" style="background:var(--surface2);border:1px solid var(--border);color:var(--muted);border-radius:3px;cursor:pointer;font-size:11px;padding:2px 6px">✏️</button>
        <button title="Excluir" onclick="deletarOS('${os.id}')" style="background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);color:var(--accent4);border-radius:3px;cursor:pointer;font-size:11px;padding:2px 6px">✕</button>
      </div>
    </div>
    ${isPeca?`<div style="font-size:10px;font-weight:700;color:var(--accent5);margin-bottom:2px">🔩 PEÇA AVULSA</div><div class="kc-placa" style="font-size:12px;letter-spacing:0">${os.modelo}</div>`:`<div class="kc-placa">${os.placa}</div><div class="kc-modelo">${os.modelo||'—'}</div>`}
    <div class="kc-cliente">${os.cliente}</div>
    ${os.operador?`<div style="font-size:10px;color:var(--accent2);margin-bottom:3px">👤 ${os.operador}</div>`:''}
    <div class="kc-dias" style="color:${dc};margin-bottom:6px">⏱ ${d} dia${d!==1?'s':''}</div>
    ${extrasHtml}
    ${os.obs?`<div style="font-size:10px;color:var(--muted);margin:5px 0;border-top:1px solid var(--border);padding-top:5px">${os.obs.substring(0,60)}${os.obs.length>60?'…':''}</div>`:''}
    <div style="display:flex;gap:4px;margin-top:6px">
      <button onclick="moverStatus('${os.id}',-1)" ${!podePrev?'disabled':''} style="flex:1;background:${podePrev?'var(--surface2)':'rgba(51,51,51,.3)'};border:1px solid var(--border);color:${podePrev?'var(--text)':'var(--muted)'};border-radius:4px;cursor:${podePrev?'pointer':'default'};font-size:11px;padding:4px 0">◀ Voltar</button>
      <button onclick="moverStatus('${os.id}',1)" ${!podeNext?'disabled':''} style="flex:1;background:${podeNext?'rgba(16,185,129,.12)':'rgba(51,51,51,.3)'};border:1px solid ${podeNext?'rgba(16,185,129,.25)':'var(--border)'};color:${podeNext?'var(--accent3)':'var(--muted)'};border-radius:4px;cursor:${podeNext?'pointer':'default'};font-size:11px;padding:4px 0">Avançar ▶</button>
    </div>
  </div>`;
}

async function moverStatus(id,dir){
  const os=osData.find(o=>o.id===id);
  if(!os) return;
  const etapas=(etapasKanban[os.setor]||[]).length?etapasKanban[os.setor]:[{label:'Diagnóstico'}];
  const idx=etapas.findIndex(e=>e.label===os.status)+dir;
  if(idx<0||idx>=etapas.length) return;
  const novoStatus=etapas[idx].label;
  os.status=novoStatus;
  renderKanban(); renderDashboard();
  const { error } = await sb.from('ordens_servico').update({status:novoStatus}).eq('id',id);
  if(error){ toast('Erro ao atualizar status','err'); console.error(error?.message || String(error)); }
  else toast(`✓ ${os.numero} → ${novoStatus}`);
}

function dragOver(e,el){ e.preventDefault(); el.classList.add('drag-active'); }
function dragLeave(el){ el.classList.remove('drag-active'); }
async function dropCard(e,novoStatus){
  e.preventDefault();
  document.querySelectorAll('.kanban-drop-zone').forEach(z=>z.classList.remove('drag-active'));
  if(!dragId) return;
  const os=osData.find(o=>o.id===dragId);
  if(os && os.status!==novoStatus){
    os.status=novoStatus;
    renderKanban(); renderDashboard();
    const { error } = await sb.from('ordens_servico').update({status:novoStatus}).eq('id',dragId);
    if(error){ toast('Erro ao mover OS','err'); console.error(error?.message || String(error)); }
    else toast(`✓ ${os.numero} → ${novoStatus}`);
  }
  dragId=null;
}