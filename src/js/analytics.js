// ══════════════════════════════════════════════════
// MÓDULO: ANALYTICS
// analyticsLoad, analyticsLoadTimeline, SLA, Ranking
// Claude Code: claude src/js/analytics.js
// ══════════════════════════════════════════════════

async function analyticsLoad(){
  await Promise.all([analyticsKPIs(), analyticsAtrasadas(), analyticsRanking(), analyticsSLA()]);
  analyticsPopulateOSSelect();
}

function _isUltimasEtapas(status, setor){
  return (etapasKanban[setor]||[]).slice(-2).map(e=>e.label).includes(status);
}

async function analyticsKPIs(){
  const {data}=await sb.from('v_os_sla').select('dias_totais,total_movimentacoes,status,setor');
  if(!data) return;
  const abertas=data.filter(o=>!_isUltimasEtapas(o.status,o.setor));
  const mediaDias=abertas.length?Math.round(abertas.reduce((s,o)=>s+(o.dias_totais||0),0)/abertas.length):0;
  const atrasadas=data.filter(o=>(o.dias_totais||0)>=5&&!_isUltimasEtapas(o.status,o.setor));
  const totalMov=data.reduce((s,o)=>s+(o.total_movimentacoes||0),0);
  document.getElementById('analytics-kpis').innerHTML=`
    <div class="card kpi-y"><div class="card-label">Média de Dias (em aberto)</div><div class="card-value">${mediaDias}d</div></div>
    <div class="card kpi-r"><div class="card-label">OS Atrasadas</div><div class="card-value">${atrasadas.length}</div></div>
    <div class="card kpi-b"><div class="card-label">Total Movimentações</div><div class="card-value">${totalMov}</div></div>
    <div class="card kpi-g"><div class="card-label">OS no Sistema</div><div class="card-value">${data.length}</div></div>
  `;
}

async function analyticsAtrasadas(){
  const el=document.getElementById('analytics-atrasadas');
  const {data,error}=await sb.from('v_os_atrasadas').select('*');
  if(error||!data?.length){
    el.innerHTML='<div style="color:var(--accent3);font-size:13px;padding:12px 0">✅ Nenhuma OS atrasada!</div>';
    return;
  }
  el.innerHTML=`<table style="width:100%;border-collapse:collapse;font-size:12px">
    <thead><tr style="color:var(--muted);font-size:10px;text-transform:uppercase">
      <th style="padding:6px 8px;text-align:left">OS</th>
      <th style="padding:6px 8px;text-align:left">Cliente</th>
      <th style="padding:6px 8px;text-align:left">Setor</th>
      <th style="padding:6px 8px;text-align:left">Operador</th>
      <th style="padding:6px 8px;text-align:right;color:var(--accent4)">Dias</th>
    </tr></thead><tbody>
    ${data.map(o=>`<tr style="border-top:1px solid var(--border)">
      <td style="padding:6px 8px;font-family:var(--fm);color:var(--accent);font-weight:700">${o.numero}</td>
      <td style="padding:6px 8px">${o.cliente}</td>
      <td style="padding:6px 8px;color:${SETOR_COLORS[o.setor]||'var(--muted)'};font-size:11px">${o.setor}</td>
      <td style="padding:6px 8px;color:var(--accent2);font-size:11px">${o.operador||'—'}</td>
      <td style="padding:6px 8px;text-align:right;font-family:var(--fm);color:var(--accent4);font-weight:700">${o.dias_aguardando}d</td>
    </tr>`).join('')}
    </tbody></table>`;
}

async function analyticsRanking(){
  const el=document.getElementById('analytics-ranking');
  const {data,error}=await sb.from('v_operador_ranking').select('*');
  if(error||!data?.length){
    el.innerHTML='<div style="color:var(--muted);font-size:13px;padding:12px 0">Nenhum dado de gamificação ainda.</div>';
    return;
  }
  const medals=['🥇','🥈','🥉'];
  el.innerHTML=data.map((op,i)=>`
    <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
      <div style="font-size:18px;min-width:28px;text-align:center">${medals[i]||'#'+(i+1)}</div>
      <div style="flex:1">
        <div style="font-weight:700;font-size:13px">${op.nome}</div>
        <div style="font-size:10px;color:var(--muted)">Nível ${op.level} · 🔥 ${op.streak_count} dias · ${op.total_os_completed} OS concluídas</div>
      </div>
      <div style="text-align:right">
        <div style="font-family:var(--fm);font-size:14px;font-weight:700;color:var(--accent)">${op.xp} XP</div>
        <div style="font-size:10px;color:var(--muted)">${op.total_kanban_moves} mov.</div>
      </div>
    </div>`).join('');
}

async function analyticsSLA(){
  const el=document.getElementById('analytics-sla');
  const {data,error}=await sb.from('v_os_sla').select('*').order('dias_totais',{ascending:false});
  if(error||!data?.length){
    el.innerHTML='<div style="color:var(--muted);font-size:13px;padding:12px 0">Nenhuma OS encontrada.</div>';
    return;
  }
  el.innerHTML=`<table style="width:100%;border-collapse:collapse;font-size:12px;white-space:nowrap">
    <thead><tr style="color:var(--muted);font-size:10px;text-transform:uppercase">
      <th style="padding:6px 8px;text-align:left">OS</th>
      <th style="padding:6px 8px;text-align:left">Placa</th>
      <th style="padding:6px 8px;text-align:left">Cliente</th>
      <th style="padding:6px 8px;text-align:left">Setor</th>
      <th style="padding:6px 8px;text-align:left">Operador</th>
      <th style="padding:6px 8px;text-align:left">Status</th>
      <th style="padding:6px 8px;text-align:right">Dias</th>
      <th style="padding:6px 8px;text-align:right">Movim.</th>
      <th style="padding:6px 8px;text-align:right">Últ. Mov.</th>
    </tr></thead><tbody>
    ${data.map(o=>{
      const atrasada=(o.dias_totais||0)>=5&&!_isUltimasEtapas(o.status,o.setor);
      const cor=atrasada?'var(--accent4)':(o.dias_totais>=2?'var(--accent)":'var(--accent3)');
      const ultMov=o.ultima_movimentacao?new Date(o.ultima_movimentacao).toLocaleDateString('pt-BR'):'—';
      return `<tr style="border-top:1px solid var(--border);${atrasada?'background:rgba(239,68,68,.04)':''} ">
        <td style="padding:6px 8px;font-family:var(--fm);color:var(--accent);font-weight:700">${o.numero}</td>
        <td style="padding:6px 8px;font-family:var(--fm);letter-spacing:1px;font-size:11px">${o.placa}</td>
        <td style="padding:6px 8px">${o.cliente}</td>
        <td style="padding:6px 8px;color:${SETOR_COLORS[o.setor]||'var(--muted)'};font-size:11px">${o.setor}</td>
        <td style="padding:6px 8px;color:var(--accent2);font-size:11px">${o.operador||'—'}</td>
        <td style="padding:6px 8px;font-size:11px;color:var(--muted)">${o.status}</td>
        <td style="padding:6px 8px;text-align:right;font-family:var(--fm);color:${cor};font-weight:700">${o.dias_totais||0}d</td>
        <td style="padding:6px 8px;text-align:right;font-family:var(--fm);color:var(--muted)">${o.total_movimentacoes||0}</td>
        <td style="padding:6px 8px;text-align:right;font-size:11px;color:var(--muted)">${ultMov}</td>
      </tr>`;
    }).join('')}
    </tbody></table>`;
}

function analyticsPopulateOSSelect(){
  const sel=document.getElementById('analytics-os-select');
  if(!sel) return;
  sel.innerHTML='<option value="">— Selecionar uma OS —</option>'+
    osData.map(o=>`<option value="${o.id}">${o.numero} — ${o.cliente} (${o.setor})</option>`).join('');
}

async function analyticsLoadTimeline(osId){
  const el=document.getElementById('analytics-timeline');
  if(!osId){el.innerHTML='';return;}
  el.innerHTML='<div style="color:var(--muted);font-size:12px">Carregando histórico…</div>';
  const {data,error}=await sb.from('v_os_timeline').select('*').eq('os_id',osId).order('criado_em');
  if(error||!data?.length){
    el.innerHTML='<div style="color:var(--muted);font-size:13px;padding:12px 0">Nenhuma movimentação registrada ainda para esta OS.</div>';
    return;
  }
  el.innerHTML=`<div style="position:relative;padding-left:24px">
    ${data.map((ev,i)=>{
      const dt=new Date(ev.criado_em).toLocaleString('pt-BR');
      const horas=ev.horas_no_status_anterior!=null?` · <span style="color:var(--accent2)">${Math.round(ev.horas_no_status_anterior)}h no status anterior</span>`:'';
      const cor=SETOR_COLORS[ev.setor]||'#64748b';
      return `<div style="position:relative;margin-bottom:16px">
        <div style="position:absolute;left:-20px;top:4px;width:10px;height:10px;border-radius:50%;background:${cor};border:2px solid var(--bg)"></div>
        ${i<data.length-1?`<div style="position:absolute;left:-16px;top:14px;width:2px;height:calc(100% + 4px);background:var(--border)"></div>`:''}
        <div style="font-size:10px;color:var(--muted);margin-bottom:2px">${dt}${horas}</div>
        <div style="font-size:12px">
          <span style="color:${cor};font-size:10px;font-weight:700">${ev.setor}</span>&nbsp;
          <span style="color:var(--muted);text-decoration:line-through">${ev.status_anterior||'—'}</span>&nbsp;→&nbsp;
          <span style="font-weight:700;color:var(--text)">${ev.status_novo}</span>
          ${ev.operador?`&nbsp;<span style="font-size:10px;color:var(--accent2)">por ${ev.operador}</span>`:''}
        </div>
      </div>`;
    }).join('')}
  </div>`;
}
