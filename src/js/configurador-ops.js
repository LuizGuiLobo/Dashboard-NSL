// ══════════════════════════════════════════════════
// MÓDULO: CONFIGURADOR-OPS
// Configurador de operadores por setor
// Claude Code: claude src/js/configurador-ops.js
// ══════════════════════════════════════════════════

// ══════════════════════════════════════════
// CONFIGURADOR DE OPERADORES
// ══════════════════════════════════════════
let operadoresTemp = [];

function abrirConfigOperadores(){
  operadoresTemp = operadoresDB.map(o=>({...o}));
  renderOperadoresConfig();
}

function renderOperadoresConfig(){
  const lista = document.getElementById('lista-operadores-config');
  if(!lista) return;
  if(!operadoresTemp.length){
    lista.innerHTML='<div style="color:var(--muted);font-size:13px;text-align:center;padding:16px">Nenhum operador. Clique em "+ Adicionar operador".</div>';
    return;
  }
  lista.innerHTML = operadoresTemp.map((op,i)=>`
    <div class="campo-config" style="flex-wrap:wrap;align-items:flex-start;gap:8px;padding:10px">
      <div style="display:flex;align-items:center;gap:8px;width:100%">
        <input value="${op.nome}" placeholder="Nome do operador" onchange="operadoresTemp[${i}].nome=this.value" style="flex:2;min-width:120px">
        <span class="req-badge ${op.ativo!==false?'req-on':'req-off'}" onclick="operadoresTemp[${i}].ativo=!(operadoresTemp[${i}].ativo!==false);renderOperadoresConfig()" style="cursor:pointer">
          ${op.ativo!==false?'✓ Ativo':'✗ Inativo'}
        </span>
        <button class="btn btn-danger btn-sm" onclick="operadoresTemp.splice(${i},1);renderOperadoresConfig()">✕</button>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:5px;padding-left:2px">
        ${SETORES.map(s=>{
          const ativo=(op.setores||[]).includes(s);
          return `<span class="chip-setor${ativo?' chip-setor-on':''}" onclick="toggleSetorOp(${i},'${s}')">${s}</span>`;
        }).join('')}
      </div>
    </div>`).join('');
}

function toggleSetorOp(i, setor){
  const arr = operadoresTemp[i].setores || [];
  if(arr.includes(setor)){
    operadoresTemp[i].setores = arr.filter(s=>s!==setor);
  } else {
    operadoresTemp[i].setores = [...arr, setor];
  }
  renderOperadoresConfig();
}

function adicionarOperadorTemp(){
  operadoresTemp.push({ nome:'Novo Operador', setores:[SETORES[0]], ativo:true });
  renderOperadoresConfig();
}

async function salvarOperadoresConfig(){
  setBtnLoading('btn-salvar-operadores',true);
  // Apaga todos e recria
  const { error:del } = await sb.from('operadores').delete().neq('id','00000000-0000-0000-0000-000000000000');
  if(del){ toast('Erro ao salvar operadores','err'); setBtnLoading('btn-salvar-operadores',false,'💾 Salvar Operadores'); return; }
  if(operadoresTemp.length){
    const rows = operadoresTemp.map(o=>({ nome:o.nome, setores:o.setores||[], ativo:o.ativo!==false }));
    const { error:ins } = await sb.from('operadores').insert(rows);
    if(ins){ toast('Erro ao inserir operadores','err'); setBtnLoading('btn-salvar-operadores',false,'💾 Salvar Operadores'); return; }
  }
  await carregarOperadores();
  setBtnLoading('btn-salvar-operadores',false,'💾 Salvar Operadores');
  fecharConfig();
  toast('✓ Operadores salvos!');
}

// Ao abrir config, inicializar operadoresTemp
const _abrirConfigOrig = abrirConfig;
