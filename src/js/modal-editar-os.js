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
  // Setar operador atual
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
  document.getElementById('modalEditar').style.display='flex';
}

function fecharEditar(){ document.getElementById('modalEditar').style.display='none'; }

async function salvarEdicao(){
  const id=document.getElementById('e-id').value;
  const os=osData.find(o=>o.id===id);
  if(!os) return;
  // Validar Nº OS
  const novoNumero=document.getElementById('e-num').value.trim();
  if(!novoNumero){ alert('Nº OS é obrigatório.'); document.getElementById('e-num').focus(); return; }
  // Verificar duplicata (ignorar a própria OS)
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
  const payload={
    numero:os.numero,
    placa:os.placa, cliente:os.cliente, modelo:os.modelo,
    setor:os.setor, status:os.status, data_entrada:os.dataEntrada,
    observacoes:os.obs, operador:os.operador, extras:os.extras
  };
  setBtnLoading('btn-salvar-edicao',true);
  const { error } = await sb.from('ordens_servico').update(payload).eq('id',id);
  setBtnLoading('btn-salvar-edicao',false,'💾 Salvar');
  if(error){ toast('Erro ao salvar: '+error.message,'err'); return; }
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