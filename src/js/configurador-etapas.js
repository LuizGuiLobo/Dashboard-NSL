// ══════════════════════════════════════════════════
// MÓDULO: CONFIGURADOR-ETAPAS
// Configurador de etapas do Kanban (add/edit/reorder)
// Claude Code: claude src/js/configurador-etapas.js
// ══════════════════════════════════════════════════

// ══════════════════════════════════════════
// CONFIGURADOR DE ETAPAS DO KANBAN
// ══════════════════════════════════════════
const CORES_ETAPA = ['#3b82f6','#c8962a','#ef4444','#10b981','#8b5cf6','#64748b','#ec4899','#06b6d4','#f97316','#84cc16'];

function renderEtapasConfig(){
  const lista=document.getElementById('lista-etapas-config');
  if(!etapasTemp.length){
    lista.innerHTML=`<div style="color:var(--muted);font-size:13px;text-align:center;padding:16px">Nenhuma etapa. Clique em "+ Adicionar etapa".</div>`;
    return;
  }
  lista.innerHTML=etapasTemp.map((e,i)=>`
    <div class="campo-config" id="etapa-row-${i}">
      <div style="display:flex;flex-direction:column;gap:2px;align-items:center;cursor:pointer" onclick="moverEtapa(${i},-1)" title="Subir">
        <span style="font-size:10px;color:var(--muted);line-height:1">▲</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:2px;align-items:center;cursor:pointer" onclick="moverEtapa(${i},1)" title="Descer">
        <span style="font-size:10px;color:var(--muted);line-height:1">▼</span>
      </div>
      <input value="${e.label}" placeholder="Nome da etapa" onchange="etapasTemp[${i}].label=this.value" style="flex:2">
      <div style="display:flex;gap:4px;flex-wrap:wrap;align-items:center">
        ${CORES_ETAPA.map(c=>`<div onclick="etapasTemp[${i}].cor='${c}';renderEtapasConfig()" title="${c}"
          style="width:16px;height:16px;border-radius:50%;background:${c};cursor:pointer;border:2px solid ${e.cor===c?'#fff':'transparent'};flex-shrink:0"></div>`).join('')}
      </div>
      <button class="btn btn-danger btn-sm" onclick="etapasTemp.splice(${i},1);renderEtapasConfig()">✕</button>
    </div>`).join('');
}

function moverEtapa(i, dir){
  const j=i+dir;
  if(j<0||j>=etapasTemp.length) return;
  [etapasTemp[i],etapasTemp[j]]=[etapasTemp[j],etapasTemp[i]];
  renderEtapasConfig();
}

function adicionarEtapa(){
  etapasTemp.push({ id:'etapa_'+Date.now(), label:'Nova Etapa', cor:'#64748b', dbId:null });
  renderEtapasConfig();
}

async function salvarEtapas(){
  const setor = setorEtapasConfig;
  setBtnLoading('btn-salvar-etapas',true);
  // Deleta SOMENTE as etapas do setor atual
  const { error:del } = await sb.from('etapas_kanban').delete().eq('setor', setor);
  if(del){ toast('Erro ao salvar etapas: '+del.message,'err'); setBtnLoading('btn-salvar-etapas',false,`💾 Salvar Etapas — ${setor}`); return; }
  if(etapasTemp.length){
    const rows=etapasTemp.map((e,i)=>({
      etapa_id: e.id||(`${setor.toLowerCase().replace(/\s+/g,'_')}_${i}_${Date.now()}`),
      label: e.label,
      cor: e.cor||'#64748b',
      ordem: i+1,
      setor: setor  // CRÍTICO: incluir o setor em cada row
    }));
    const { error:ins } = await sb.from('etapas_kanban').insert(rows);
    if(ins){ toast('Erro ao inserir etapas: '+ins.message,'err'); setBtnLoading('btn-salvar-etapas',false,`💾 Salvar Etapas — ${setor}`); return; }
  }
  await carregarEtapas();
  setBtnLoading('btn-salvar-etapas',false,`💾 Salvar Etapas — ${setor}`);
  fecharConfig();
  renderKanban(); renderDashboard();
  toast(`✓ Etapas de ${setor} atualizadas!`);
}

function renderCamposConfig(){
  const lista=document.getElementById('lista-campos-config');
  if(!camposTemp.length){
    lista.innerHTML=`<div style="color:var(--muted);font-size:13px;text-align:center;padding:16px">Nenhum campo extra. Clique em "+ Adicionar campo".</div>`;
    return;
  }
  lista.innerHTML=camposTemp.map((c,i)=>`
    <div class="campo-config">
      <input value="${c.label}" placeholder="Nome do campo" onchange="camposTemp[${i}].label=this.value" style="flex:2">
      <select onchange="camposTemp[${i}].tipo=this.value;renderCamposConfig()">
        <option value="text" ${c.tipo==='text'?'selected':''}>Texto</option>
        <option value="number" ${c.tipo==='number'?'selected':''}>Número</option>
        <option value="date" ${c.tipo==='date'?'selected':''}>Data</option>
        <option value="select" ${c.tipo==='select'?'selected':''}>Lista</option>
      </select>
      ${c.tipo==='select'?`<input value="${(c.opcoes||[]).join(', ')}" placeholder="Op1, Op2, Op3..." onchange="camposTemp[${i}].opcoes=this.value.split(',').map(s=>s.trim()).filter(Boolean)" style="flex:2">`:''}
      <span class="req-badge ${c.obrigatorio?'req-on':'req-off'}" onclick="camposTemp[${i}].obrigatorio=!camposTemp[${i}].obrigatorio;renderCamposConfig()">
        ${c.obrigatorio?'★ Obrig.':'☆ Opc.'}
      </span>
      <button class="btn btn-danger btn-sm" onclick="camposTemp.splice(${i},1);renderCamposConfig()">✕</button>
    </div>`).join('');
}

function adicionarCampo(){
  camposTemp.push({ id:'campo_'+Date.now(), label:'Novo Campo', tipo:'text', obrigatorio:false, opcoes:[] });
  renderCamposConfig();
}

async function salvarConfig(){
  setBtnLoading('btn-salvar-config',true);
  // Apaga todos e reinsere na ordem certa
  const { error: delErr } = await sb.from('campos_config').delete().neq('id','00000000-0000-0000-0000-000000000000');
  if(delErr){ toast('Erro ao salvar config','err'); setBtnLoading('btn-salvar-config',false,'💾 Salvar no Banco'); return; }
  if(camposTemp.length){
    const rows=camposTemp.map((c,i)=>({
      campo_id: c.id||('campo_'+i+'_'+Date.now()),
      label: c.label,
      tipo: c.tipo,
      opcoes: c.opcoes||[],
      obrigatorio: c.obrigatorio||false,
      ordem: i
    }));
    const { error: insErr } = await sb.from('campos_config').insert(rows);
    if(insErr){ toast('Erro ao salvar campos','err'); setBtnLoading('btn-salvar-config',false,'💾 Salvar no Banco'); return; }
  }
  await carregarCampos();
  setBtnLoading('btn-salvar-config',false,'💾 Salvar no Banco');
  fecharConfig();
  renderDashboard();
  toast('✓ Configuração salva no banco!');
}