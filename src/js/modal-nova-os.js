// ══════════════════════════════════════════════════
// MÓDULO: MODAL-NOVA-OS
// abrirModal, fecharModal, salvarOS
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
}

function fecharModal(){
  document.getElementById('modalBg').style.display='none';
  ['m-placa','m-cliente','m-modelo','m-obs','m-peca','m-num'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
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
  if(vinculoId) await salvarVinculo(data.id, vinculoId);
  osData.unshift(mapRow(data));
  fecharModal();
  renderKanban(); renderDashboard();
  toast(`✓ OS ${numOS} criada!`);
}