// ══════════════════════════════════════════════════
// MÓDULO: DASHBOARD
// renderDashboard, renderDashTable, KPIs
// Claude Code: claude src/js/dashboard.js
// ══════════════════════════════════════════════════

// ══════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════
function renderDashboard(){
  // Considera as 2 últimas etapas do setor de cada OS como "concluídas"
  const ultimasDuasDoSetor = (setor) => (etapasKanban[setor]||[]).slice(-2).map(e=>e.label);
  const isOSDone = (os) => ultimasDuasDoSetor(os.setor).includes(os.status);
  // "Aprovação" — busca em qualquer setor
  const allStages = Object.values(etapasKanban).flat();
  const etapaAprovacao = allStages.find(e=>e.label.toLowerCase().includes('aprovação')||e.label.toLowerCase().includes('aprovacao'))?.label||'';

  document.getElementById('kpi-abertas').textContent=osData.filter(o=>!isOSDone(o)).length;
  document.getElementById('kpi-aprovacao').textContent=etapaAprovacao?osData.filter(o=>o.status===etapaAprovacao).length:'—';
  document.getElementById('kpi-prontas').textContent=osData.filter(o=>isOSDone(o)).length;
  document.getElementById('kpi-total').textContent=osData.length;

  document.getElementById('dash-setores').innerHTML=SETORES.map(s=>{
    const n=osData.filter(o=>o.setor===s).length;
    const pct=osData.length?Math.round(n/osData.length*100):0;
    return `<div class="prog-wrap"><div class="prog-label"><span style="color:${SETOR_COLORS[s]}">${s}</span><span>${n} OS</span></div><div class="prog-track"><div class="prog-fill" style="width:${pct}%;background:${SETOR_COLORS[s]}"></div></div></div>`;
  }).join('');

  const al=document.getElementById('dash-alertas');
  const atrasadas=osData.filter(o=>calcDias(o.dataEntrada)>=5&&!ultimasDuas.includes(o.status));
  const aprvPend=etapaAprovacao?osData.filter(o=>o.status===etapaAprovacao):[];
  let html='';
  atrasadas.forEach(o=>{ html+=`<div class="alert alert-d"><div>🔴</div><div><strong>${o.placa} — ${o.cliente}</strong><br>${calcDias(o.dataEntrada)} dias sem conclusão.</div></div>`; });
  if(aprvPend.length>3) html+=`<div class="alert alert-w"><div>⚠️</div><div><strong>${aprvPend.length} OS aguardando aprovação</strong> — meta máxima é 3.</div></div>`;
  if(!html) html='<div style="color:var(--muted);font-size:13px">✅ Sem alertas no momento.</div>';
  al.innerHTML=html;
  renderDashTable();
}

function renderDashTable(){
  const q=(document.getElementById('dash-search')?.value||'').toLowerCase();
  const f=document.getElementById('dash-filtro')?.value||'';
  const thead=document.getElementById('dash-thead');
  const extraThs=camposConfig.map(c=>`<th>${c.label}</th>`).join('');
  thead.innerHTML=`<tr><th>Nº OS</th><th>Placa</th><th>Cliente</th><th>Veículo/Peça</th><th>Setor</th><th>Operador</th><th>Status</th><th>Dias</th>${extraThs}<th></th></tr>`;
  const lista=osData.filter(o=>{
    const vals=Object.values(o.extras||{}).join(' ').toLowerCase();
    const m=(o.placa+o.cliente+o.numero+(o.modelo||'')+vals).toLowerCase().includes(q);
    return m&&(!f||o.status===f);
  });
  const tb=document.getElementById('dash-tbody');
  if(!lista.length){tb.innerHTML=`<tr><td colspan="20" style="text-align:center;color:var(--muted);padding:28px">Nenhuma OS encontrada.</td></tr>`;return;}
  tb.innerHTML=lista.map(os=>{
    const d=calcDias(os.dataEntrada);
    const extraTds=camposConfig.map(c=>`<td style="color:var(--muted);font-size:12px">${os.extras?.[c.id]||'—'}</td>`).join('');
    return `<tr>
      <td style="font-family:var(--fm);color:var(--accent);font-weight:700">${os.numero}</td>
      <td style="font-family:var(--fm);letter-spacing:2px;font-weight:700">${os.placa}</td>
      <td>${os.cliente}</td>
      <td style="color:var(--muted);font-size:12px">${os.modelo||'—'}</td>
      <td style="font-size:11px;color:${SETOR_COLORS[os.setor]||'var(--muted)'}">${os.setor}</td>
      <td style="font-size:12px;color:var(--accent2)">${os.operador||'—'}</td>
      <td><span style="display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;padding:2px 9px;border-radius:20px;background:${((etapasKanban[os.setor]||[]).find(e=>e.label===os.status)?.cor||'#64748b')}22;color:${(etapasKanban[os.setor]||[]).find(e=>e.label===os.status)?.cor||'var(--muted)'}">●&nbsp;${os.status}</span></td>
      <td style="font-family:var(--fm);color:${diasColor(d)};font-weight:700">${d}d</td>
      ${extraTds}
      <td style="white-space:nowrap">
        <button onclick="abrirEditar('${os.id}')" class="btn btn-ghost btn-sm">✏️</button>
        <button onclick="deletarOS('${os.id}')" class="btn btn-danger btn-sm" style="margin-left:4px">✕</button>
      </td>
    </tr>`;
  }).join('');
}