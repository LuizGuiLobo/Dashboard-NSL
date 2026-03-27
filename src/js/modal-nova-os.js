// ══════════════════════════════════════════════════
// MÓDULO: MODAL-NOVA-OS
// abrirModal, fecharModal, salvarOS, setores conectados
// Claude Code: claude src/js/modal-nova-os.js
// ══════════════════════════════════════════════════

// ══════════════════════════════════════════
// MODAL NOVA OS
// ══════════════════════════════════════════
function abrirModal(){
  document.getElementById('modalBg').style.display='flex';
  document.getElementById('m-num').value='';
  document.getElementById('m-data').value=new Date().toISOString().split('T')[0];
  const setor=setorAtivo||SETORES[0];
  document.getElementById('m-setor').value=setor;
  setTipo('veiculo');
  atualizarOperadores('m-operador', setor);
  atualizarStatusPorSetor('m-status', setor);
  mostrarVinculo(setor);
  renderCamposExtrasForm('form',null);
  // Reset setores conectados
  document.getElementById('setores-conectados-nova').style.display='none';
  document.getElementById('btn-add-setor-nova').textContent='+ Adicionar';
  renderSetoresConectadosNova();
}

function fecharModal(){
  document.getElementById('modalBg').style.display='none';
  ['m-placa','m-cliente','m-modelo','m-obs','m-peca','m-num','m-operador'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  setTipo('veiculo');
}

function setTipo(tipo){
  tipoEntrada=tipo;
  const isV=tipo==='veiculo';
  document.getElementById('campo-veiculo').style.display=isV?'grid':'none';
  document.getElementById('campo-peca').style.display=isV?'none':'block';
  const bV=document.getElementById('tipo-btn-veiculo'), bP=document.getElementById('tipo-btn-peca');
  bV.style.cssText=`flex:1;padding:8px;border-radius:5px;cursor:pointer;font-size:12px;font-weight:700;background:${isV?'var(--accent)':'var(--surface2)'};color:${isV?'#000':'var(--muted)'};border:${isV?'none':'1px solid var(--border)'}`;
  bP.style.cssText=`flex:1;padding:8px;border-radius:5px;cursor:pointer;font-size:12px;font-weight:600;background:${isV?'var(--surface2)':'var(--accent5)'};color:${isV?'var(--muted)':'#fff'};border:${isV?'1px solid var(--border)':'none'}`;
}

// ══════════════════════════════════════════
// SETORES CONECTADOS — NOVA OS
// ══════════════════════════════════════════
function toggleSetoresConectadosNova(){
  const wrap=document.getElementById('setores-conectados-nova');
  const btn=document.getElementById('btn-add-setor-nova');
  const visible=wrap.style.display!=='none';
  wrap.style.display=visible?'none':'block';
  btn.textContent=visible?'+ Adicionar':'− Fechar';
  if(!visible) renderSetoresConectadosNova();
}

function renderSetoresConectadosNova(){
  const setorPrincipal=document.getElementById('m-setor')?.value||'';
  const disponiveis=SETORES.filter(s=>s!==setorPrincipal);
  const lista=document.getElementById('setores-conectados-lista-nova');
  if(!lista) return;
  const selecionados=getSetoresConectadosSelecionados('nova');
  lista.innerHTML=disponiveis.map(s=>{
    const cor=SETOR_COLORS[s]||'#64748b';
    const ativo=selecionados.includes(s);
    return `<div onclick="toggleSetorConectado('${s}','nova')"
      style="display:flex;align-items:center;gap:5px;padding:4px 10px;border-radius:4px;border:1px solid ${ativo?cor:'var(--border)'};background:${ativo?cor+'22':'var(--surface2)'};cursor:pointer;font-size:11px;font-weight:600;color:${ativo?cor:'var(--muted)'};transition:all .15s"
      data-setor-pill="${s}">
      <span style="width:7px;height:7px;border-radius:50%;background:${cor};display:inline-block"></span>${s}
    </div>`;
  }).join('');
  renderSetoresConectadosForms('nova', selecionados);
}

function getSetoresConectadosSelecionados(ctx){
  const forms=document.getElementById(`setores-conectados-forms-${ctx}`);
  if(!forms) return [];
  return Array.from(forms.querySelectorAll('[data-setor-form]')).map(el=>el.dataset.setorForm);
}

function toggleSetorConectado(setor, ctx){
  const selecionados=getSetoresConectadosSelecionados(ctx);
  if(selecionados.includes(setor)){
    // Remover
    const novosSelecionados=selecionados.filter(s=>s!==setor);
    renderSetoresConectadosForms(ctx, novosSelecionados);
  } else {
    // Adicionar
    renderSetoresConectadosForms(ctx, [...selecionados, setor]);
  }
  // Atualizar pills
  if(ctx==='nova') renderSetoresConectadosNova();
  else renderSetoresConectadosEditar();
}

function renderSetoresConectadosForms(ctx, selecionados){
  const forms=document.getElementById(`setores-conectados-forms-${ctx}`);
  if(!forms) return;
  const existingData={};
  forms.querySelectorAll('[data-setor-form]').forEach(el=>{
    const s=el.dataset.setorForm;
    const status=el.querySelector(`[data-sc-status="${s}"]`)?.value||'';
    const op=el.querySelector(`[data-sc-op="${s}"]`)?.value||'';
    existingData[s]={status, op};
  });
  forms.innerHTML=selecionados.map(s=>{
    const cor=SETOR_COLORS[s]||'#64748b';
    const prev=existingData[s]||{};
    const etapasOpts=(etapasKanban[s]||[]).map(e=>`<option ${prev.status===e.label?'selected':''}>${e.label}</option>`).join('')||'<option>Diagnóstico</option>';
    const opsOpts='<option value="">— Selecionar —</option>'+operadoresDB.filter(o=>o.setor===s).map(o=>`<option ${prev.op===o.nome?'selected':''}>${o.nome}</option>`).join('');
    return `<div data-setor-form="${s}" style="background:var(--surface2);border:1px solid ${cor}44;border-radius:6px;padding:10px 12px;margin-bottom:6px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <span style="width:8px;height:8px;border-radius:50%;background:${cor};display:inline-block"></span>
        <span style="font-size:11px;font-weight:700;color:${cor}">${s}</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div><div class="lbl" style="font-size:9px">Status Inicial</div>
          <select class="inp" style="font-size:12px;padding:5px 8px" data-sc-status="${s}">${etapasOpts}</select>
        </div>
        <div><div class="lbl" style="font-size:9px">Operador</div>
          <select class="inp" style="font-size:12px;padding:5px 8px" data-sc-op="${s}">${opsOpts}</select>
        </div>
      </div>
    </div>`;
  }).join('');
}

function getSetoresConectados(ctx){
  const forms=document.getElementById(`setores-conectados-forms-${ctx}`);
  if(!forms) return [];
  return Array.from(forms.querySelectorAll('[data-setor-form]')).map(el=>{
    const s=el.dataset.setorForm;
    return {
      setor: s,
      status: el.querySelector(`[data-sc-status="${s}"]`)?.value||'Diagnóstico',
      operador: el.querySelector(`[data-sc-op="${s}"]`)?.value||''
    };
  });
}

async function salvarOS(){
  const numOS=document.getElementById('m-num').value.trim();
  if(!numOS){ alert('Nº OS é obrigatório.'); document.getElementById('m-num').focus(); return; }
  if(osData.find(o=>o.numero===numOS)){ alert(`OS "${numOS}" já existe.`); return; }
  const cliente=document.getElementById('m-cliente').value.trim();
  if(!cliente){ alert('Nome do cliente é obrigatório.'); return; }
  if(!validarCamposExtras('form')) return;
  let placa='', modelo='';
  if(tipoEntrada==='veiculo'){
    placa=document.getElementById('m-placa').value.trim().toUpperCase();
    if(!placa){ alert('Placa é obrigatória.'); return; }
    modelo=document.getElementById('m-modelo').value.trim();
  } else {
    const peca=document.getElementById('m-peca').value.trim();
    if(!peca){ alert('Descrição da peça é obrigatória.'); return; }
    placa='PEÇA'; modelo=peca;
  }
  const extras=getCamposExtrasValores('form');
  const operador=(document.getElementById('m-operador')?.value||'').trim();
  const vinculoId=document.getElementById('m-vinculo')?.value||'';
  const setoresConectados=getSetoresConectados('nova');
  const payload={
    numero:numOS, tipo:tipoEntrada, placa, cliente, modelo,
    setor:document.getElementById('m-setor').value,
    status:document.getElementById('m-status').value,
    data_entrada:document.getElementById('m-data').value,
    observacoes:document.getElementById('m-obs').value.trim(),
    operador, extras
  };
  setBtnLoading('btn-salvar-os',true);
  const { data, error } = await sb.from('ordens_servico').insert([payload]).select().single();
  setBtnLoading('btn-salvar-os',false,'Salvar OS');
  if(error){ toast('Erro ao salvar OS: '+error.message,'err'); return; }
  // Salvar setores conectados
  if(setoresConectados.length){
    const { error: erS } = await sb.from('os_setores').insert(
      setoresConectados.map((s,i)=>({os_id:data.id, setor:s.setor, status:s.status, operador:s.operador, ordem:i+1}))
    );
    if(erS) console.warn('Setores conectados:', erS.message);
  }
  if(vinculoId) await salvarVinculo(data.id, vinculoId);
  osData.unshift(mapRow(data, setoresConectados.map((s,i)=>({
    id:'temp-'+i, os_id:data.id, setor:s.setor, status:s.status,
    operador:s.operador, ordem:i+1, observacoes:''
  }))));
  fecharModal();
  renderKanban(); renderDashboard();
  toast(`✓ OS ${numOS} criada!`);
}
