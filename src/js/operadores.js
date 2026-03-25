// ══════════════════════════════════════════════════
// MÓDULO: OPERADORES
// Operadores, vínculos entre OS, carregarOperadores
// Claude Code: claude src/js/operadores.js
// ══════════════════════════════════════════════════

// OPERADORES
// ══════════════════════════════════════════
async function carregarOperadores(){
  const { data, error } = await sb.from('operadores').select('*').eq('ativo',true).order('nome');
  if(error){ console.warn('Operadores:', error.message); return; }
  operadoresDB = data||[];
}

function atualizarOperadores(selectId, setor){
  const sel = document.getElementById(selectId);
  if(!sel) return;
  const val = sel.value;
  const ops = operadoresDB.filter(o=>o.setor===setor);
  sel.innerHTML = '<option value="">— Selecionar —</option>' +
    ops.map(o=>`<option value="${o.nome}" ${val===o.nome?'selected':''}>${o.nome}</option>`).join('');
}

function mostrarVinculo(setor){
  const row = document.getElementById('m-vinculo-row');
  if(!row) return;
  const mostra = ['Veículo Diesel','Turbinas'].includes(setor);
  row.style.display = mostra ? 'block' : 'none';
  if(mostra) popularSelectVinculo('m-vinculo');
}

function mostrarVinculoEditar(setor){
  const row = document.getElementById('e-vinculo-row');
  if(!row) return;
  row.style.display = ['Veículo Diesel','Turbinas'].includes(setor) ? 'block' : 'none';
}

function popularSelectVinculo(selectId){
  const sel = document.getElementById(selectId);
  if(!sel) return;
  sel.innerHTML = '<option value="">Sem vínculo</option>' +
    osData.map(o=>`<option value="${o.id}">${o.numero} — ${o.cliente} (${o.setor})</option>`).join('');
}

async function salvarVinculo(osOrigemId, osDestinoId){
  if(!osDestinoId) return;
  await sb.from('os_vinculos').insert({ os_origem:osOrigemId, os_destino:osDestinoId, tipo_vinculo:'relacionada' });
}

async function carregarVinculos(osId){
  const { data } = await sb.from('os_vinculos')
    .select('os_destino, os_origem, tipo_vinculo')
    .or(`os_origem.eq.${osId},os_destino.eq.${osId}`);
  if(!data||!data.length) return [];
  const outrosIds = data.map(v=> v.os_origem===osId ? v.os_destino : v.os_origem);
  const { data:oss } = await sb.from('ordens_servico').select('id,numero,cliente,setor,status').in('id', outrosIds);
  return (oss||[]);
}

async function init(){
  setSyncBadge('load');
  try {
    await Promise.all([carregarCampos(), carregarOS(), carregarEtapas(), carregarOperadores()]);
    setSyncBadge('ok');
    renderDashboard();
  } catch(e){
    setSyncBadge('err');
    const msg = e?.message || (typeof e === 'string' ? e : JSON.stringify(e));
    toast('Erro ao conectar: '+msg,'err');
    console.error('Init error:', msg);
  }
}

async function carregarCampos(){
  const { data, error } = await sb.from('campos_config').select('*').order('ordem');
  if(error) throw new Error(error?.message || String(error));
  camposConfig = (data||[]).map(r=>({
    id: r.campo_id,
    label: r.label,
    tipo: r.tipo,
    opcoes: r.opcoes||[],
    obrigatorio: r.obrigatorio||false,
    dbId: r.id
  }));
}

async function carregarOS(){
  const { data, error } = await sb.from('ordens_servico').select('*').order('criado_em', {ascending:false});
  if(error) throw new Error(error?.message || String(error));
  // Batch load dos setores adicionais
  const ids = (data||[]).map(r=>r.id);
  let setoresMap = {};
  if(ids.length){
    const { data: setoresData } = await sb.from('os_setores').select('*').in('os_id', ids);
    (setoresData||[]).forEach(s=>{
      if(!setoresMap[s.os_id]) setoresMap[s.os_id]=[];
      setoresMap[s.os_id].push(s);
    });
  }
  osData = (data||[]).map(r=>mapRow(r, setoresMap[r.id]||[]));
}

function mapRow(r, setoresAdicionais=[]){
  return {
    id: r.id,
    numero: r.numero,
    tipo: r.tipo,
    placa: r.placa,
    cliente: r.cliente,
    modelo: r.modelo||'',
    setor: r.setor,
    status: r.status,
    dataEntrada: r.data_entrada,
    obs: r.observacoes||'',
    operador: r.operador||'',
    extras: r.extras||{},
    setoresAdicionais: (setoresAdicionais||[]).map(s=>({
      id: s.id,
      setor: s.setor,
      status: s.status,
      operador: s.operador||'',
      ordem: s.ordem||1,
      obs: s.observacoes||''
    }))
  };
}

async function carregarEtapas(){
  const { data, error } = await sb.from('etapas_kanban').select('*').order('ordem');
  if(error) throw new Error(error?.message || String(error));
  etapasKanban = {};
  SETORES.forEach(s => { etapasKanban[s] = []; });
  (data||[]).forEach(r => {
    if(r.setor && etapasKanban[r.setor] !== undefined){
      etapasKanban[r.setor].push({ id:r.etapa_id, label:r.label, cor:r.cor||'#64748b', dbId:r.id });
    }
  });
  atualizarSelectsStatus();
}

// Atualiza select de status para um setor específico
function atualizarStatusPorSetor(selectId, setor){
  const el = document.getElementById(selectId);
  if(!el) return;
  const val = el.value;
  const opts = (etapasKanban[setor]||[]).map(e=>`<option>${e.label}</option>`).join('');
  el.innerHTML = opts || '<option>Diagnóstico</option>';
  if(val) el.value = val;
}

function atualizarSelectsStatus(){
  const mSetor = document.getElementById('m-setor')?.value || setorAtivo;
  atualizarStatusPorSetor('m-status', mSetor);
  const eSetor = document.getElementById('e-setor')?.value || setorAtivo;
  atualizarStatusPorSetor('e-status', eSetor);
  const allLabels = [...new Set(Object.values(etapasKanban).flat().map(e=>e.label))];
  const filtro = document.getElementById('dash-filtro');
  if(filtro){
    const val=filtro.value;
    filtro.innerHTML=`<option value="">Todos os status</option>`+allLabels.map(l=>`<option>${l}</option>`).join('');
    if(val) filtro.value=val;
  }
}


function showTab(id,el){
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  el.classList.add('active');
  if(id==='kanban') renderKanban();
  if(id==='dashboard') renderDashboard();
}
