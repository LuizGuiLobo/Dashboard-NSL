// ══════════════════════════════════════════════════
// MÓDULO: MODAL-EDITAR-OS
// abrirEditar, fecharEditar, salvarEdicao, deletar
// Claude Code: claude src/js/modal-editar-os.js
// ══════════════════════════════════════════════════

// ══════════════════════════════════════════
// MODAL EDITAR OS
// ══════════════════════════════════════════
function abrirEditar(id){
  const os=osData.find(o=>o.id===id);
  if(!os) return;
  const isPeca=os.tipo==='peca'||os.placa==='PEÇA';
  document.getElementById('e-id').value=os.id;
  document.getElementById('e-num').value=os.numero;
  document.getElementById('e-data').value=os.dataEntrada||'';
  document.getElementById('e-cliente').value=os.cliente;
  document.getElementById('e-modelo').value=os.modelo||'';
  document.getElementById('e-setor').value=os.setor;
  atualizarStatusPorSetor('e-status', os.setor);
  document.getElementById('e-status').value=os.status;
  document.getElementById('e-obs').value=os.obs||'';
  document.getElementById('e-placa-row').style.display=isPeca?'none':'grid';
  if(!isPeca) document.getElementById('e-placa').value=os.placa;
  renderCamposExtrasForm('editar',os.extras||{});
  atualizarOperadores('e-operador', os.setor);
  const selOp=document.getElementById('e-operador');
  if(selOp && os.operador) selOp.value=os.operador;
  mostrarVinculoEditar(os.setor);
  // Carregar vinculos existentes
  carregarVinculos(os.id).then(vinculos=>{
    const lista=document.getElementById('e-vinculos-lista');
    if(!lista) return;
    if(!vinculos.length){ lista.textContent='Nenhuma OS vinculada'; return; }
    lista.innerHTML=vinculos.map(v=>{
      const outra = v.os_origem===os.id ? v['ordens_servico!os_vinculos_os_destino_fkey'] : v['ordens_servico!os_vinculos_os_origem_fkey'];
      if(!outra) return '';
      return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
        <span style="font-family:var(--fm);color:var(--accent);font-size:11px">${outra.numero}</span>
        <span>${outra.cliente}</span>
        <span style="font-size:10px;color:var(--muted)">(${outra.setor})</span>
        <span class="pill pill-gz" style="font-size:9px">${outra.status}</span>
      </div>`;
    }).join('');
  });
  // Setores conectados
  const temAdicionais=(os.setoresAdicionais||[]).length>0;
  const wrap=document.getElementById('setores-conectados-editar');
  const btn=document.getElementById('btn-add-setor-editar');
  wrap.style.display=temAdicionais?'block':'none';
  btn.textContent=temAdicionais?'− Fechar':'+ Adicionar';
  renderSetoresConectadosEditar(os.setoresAdicionais||[]);
  document.getElementById('modalEditar').style.display='flex';
}

function fecharEditar(){ document.getElementById('modalEditar').style.display='none'; }

// ══════════════════════════════════════════
// SETORES CONECTADOS — EDITAR OS
// ══════════════════════════════════════════
function toggleSetoresConectadosEditar(){
  const wrap=document.getElementById('setores-conectados-editar');
  const btn=document.getElementById('btn-add-setor-editar');
  const visible=wrap.style.display!=='none';
  wrap.style.display=visible?'none':'block';
  btn.textContent=visible?'+ Adicionar':'− Fechar';
  if(!visible) renderSetoresConectadosEditar();
}

function renderSetoresConectadosEditar(preload){
  const setorPrincipal=document.getElementById('e-setor')?.value||'';
  const disponiveis=SETORES.filter(s=>s!==setorPrincipal);
  const lista=document.getElementById('setores-conectados-lista-editar');
  if(!lista) return;
  // Se preload fornecido, usar para inicializar os forms
  if(preload!==undefined){
    const forms=document.getElementById('setores-conectados-forms-editar');
    if(forms && preload.length){
      const selecionados=preload.map(s=>s.setor);
      const existingData={};
      preload.forEach(s=>{ existingData[s.setor]={status:s.status, op:s.operador}; });
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
            <div><div class="lbl" style="font-size:9px">Status</div>
              <select class="inp" style="font-size:12px;padding:5px 8px" data-sc-status="${s}">${etapasOpts}</select>
            </div>
            <div><div class="lbl" style="font-size:9px">Operador</div>
              <select class="inp" style="font-size:12px;padding:5px 8px" data-sc-op="${s}">${opsOpts}</select>
            </div>
          </div>
        </div>`;
      }).join('');
    }
  }
  const selecionados=getSetoresConectadosSelecionados('editar');
  lista.innerHTML=disponiveis.map(s=>{
    const cor=SETOR_COLORS[s]||'#64748b';
    const ativo=selecionados.includes(s);
    return `<div onclick="toggleSetorConectado('${s}','editar')"
      style="display:flex;align-items:center;gap:5px;padding:4px 10px;border-radius:4px;border:1px solid ${ativo?cor:'var(--border)'};background:${ativo?cor+'22':'var(--surface2)'};cursor:pointer;font-size:11px;font-weight:600;color:${ativo?cor:'var(--muted)'};transition:all .15s"
      data-setor-pill="${s}">
      <span style="width:7px;height:7px;border-radius:50%;background:${cor};display:inline-block"></span>${s}
    </div>`;
  }).join('');
}

async function salvarEdicao(){
  const id=document.getElementById('e-id').value;
  const os=osData.find(o=>o.id===id);
  if(!os) return;
  const novoNumero=document.getElementById('e-num').value.trim();
  if(!novoNumero){ alert('Nº OS é obrigatório.'); document.getElementById('e-num').focus(); return; }
  if(osData.find(o=>o.numero===novoNumero && o.id!==id)){
    alert(`Nº OS "${novoNumero}" já existe em outra OS.`); document.getElementById('e-num').focus(); return;
  }
  const cliente=document.getElementById('e-cliente').value.trim();
  if(!cliente){ alert('Cliente é obrigatório.'); return; }
  if(!validarCamposExtras('editar')) return;
  const isPeca=os.tipo==='peca'||os.placa==='PEÇA';
  if(!isPeca){
    const placa=document.getElementById('e-placa').value.trim().toUpperCase();
    if(!placa){ alert('Placa é obrigatória.'); return; }
    os.placa=placa;
  }
  os.numero=novoNumero;
  os.cliente=cliente;
  os.modelo=document.getElementById('e-modelo').value.trim();
  os.setor=document.getElementById('e-setor').value;
  os.status=document.getElementById('e-status').value;
  os.dataEntrada=document.getElementById('e-data').value;
  os.obs=document.getElementById('e-obs').value.trim();
  os.extras=getCamposExtrasValores('editar');
  os.operador=(document.getElementById('e-operador')?.value||'').trim();
  const setoresConectados=getSetoresConectados('editar');
  const payload={
    numero:os.numero, placa:os.placa, cliente:os.cliente, modelo:os.modelo,
    setor:os.setor, status:os.status, data_entrada:os.dataEntrada,
    observacoes:os.obs, operador:os.operador, extras:os.extras
  };
  setBtnLoading('btn-salvar-edicao',true);
  const { error } = await sb.from('ordens_servico').update(payload).eq('id',id);
  if(error){ setBtnLoading('btn-salvar-edicao',false,'💾 Salvar'); toast('Erro ao salvar: '+error.message,'err'); return; }
  // Reescrever setores conectados: delete + insert
  await sb.from('os_setores').delete().eq('os_id',id);
  if(setoresConectados.length){
    const { error: erS } = await sb.from('os_setores').insert(
      setoresConectados.map((s,i)=>({os_id:id, setor:s.setor, status:s.status, operador:s.operador, ordem:i+1}))
    );
    if(erS) console.warn('Setores conectados:', erS.message);
  }
  os.setoresAdicionais=setoresConectados.map((s,i)=>({
    id:'', setor:s.setor, status:s.status, operador:s.operador, ordem:i+1, obs:''
  }));
  setBtnLoading('btn-salvar-edicao',false,'💾 Salvar');
  fecharEditar();
  renderKanban(); renderDashboard();
  toast(`✓ OS ${os.numero} atualizada!`);
}

async function deletarOSdoModal(){
  const id=document.getElementById('e-id').value;
  const os=osData.find(o=>o.id===id);
  if(!os||!confirm(`Excluir ${os.numero} — ${os.cliente}?`)) return;
  const { error } = await sb.from('ordens_servico').delete().eq('id',id);
  if(error){ toast('Erro ao excluir','err'); return; }
  osData=osData.filter(o=>o.id!==id);
  fecharEditar(); renderKanban(); renderDashboard();
  toast(`🗑 OS ${os.numero} excluída`);
}

async function deletarOS(id){
  const os=osData.find(o=>o.id===id);
  if(!os||!confirm(`Remover ${os.numero} — ${os.cliente}?`)) return;
  const { error } = await sb.from('ordens_servico').delete().eq('id',id);
  if(error){ toast('Erro ao excluir','err'); return; }
  osData=osData.filter(o=>o.id!==id);
  renderKanban(); renderDashboard();
  toast(`🗑 OS ${os.numero} excluída`);
}
