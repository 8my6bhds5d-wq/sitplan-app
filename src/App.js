import React, { useState, useMemo, useRef, useEffect } from "react";
import { LEADS_INICIAIS, STATUS_CONFIG as STATUS_CONFIG_DATA, FUNIL_ORDER as FUNIL_ORDER_DATA } from "./data";

// ── EXPORT / IMPORT ────────────────────────────────────────────────────────
function exportarCSV(leads) {
  const hoje = new Date();
  const data = hoje.toLocaleDateString('pt-BR').replace(/\//g,'-');
  const headers = ['Nome','Telefone','Indicado por','Segmento','Status','Potencial (★)','Tem Seguro','Seguradora','Próximo Passo','Último Contato','Tentativas','Histórico'];
  const rows = leads.map(l => {
    const hist = (l.historico||[]).map(h=>`${h.data} ${h.hora}: ${h.obs}`).join(' | ');
    return [
      l.nome, l.telefone||'', l.indicadoPor||'', l.segmento||'',
      STATUS_CONFIG[l.status]?.label||l.status,
      '★'.repeat(l.potencial||0),
      l.temSeguro||'', l.seguradora||'',
      l.proximoPasso||'', l.dataContato||'',
      (l.historico||[]).length, hist
    ].map(v => `"${String(v).replace(/"/g,'""')}"`).join(',');
  });
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF'+csv], { type:'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `Sitplan_Backup_${data}.csv`; a.click();
  URL.revokeObjectURL(url);
}

function exportarJSON(leads) {
  const hoje = new Date();
  const data = hoje.toLocaleDateString('pt-BR').replace(/\//g,'-');
  const blob = new Blob([JSON.stringify({ exportadoEm: hoje.toISOString(), totalLeads: leads.length, leads }, null, 2)], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `Sitplan_Backup_${data}.json`; a.click();
  URL.revokeObjectURL(url);
}

const C = {
  navy:'#0F2744', navyMid:'#1B3A6B', navyLight:'#2D5A9E',
  silver:'#8A9BB0', silverLight:'#C8D4E0', silverBg:'#F0F4F8',
  white:'#FFFFFF', gold:'#C4A832', goldLight:'#FFF8E0',
  text:'#1A2A3A', textMid:'#4A5A6A', textLight:'#8A9BB0',
  border:'#D8E4F0', success:'#0D6B3A', successBg:'#E8F8F0',
  danger:'#8B1A1A', dangerBg:'#FFF0F0', warn:'#7C6200', warnBg:'#FFF8E6',
};

const STATUS_CONFIG = STATUS_CONFIG_DATA;

const FUNIL_ORDER = FUNIL_ORDER_DATA;



const DIAS_ALERTA = 5;
const META_SEMANAL_AGENDAMENTOS = 10;
const META_SEMANAL_CLIENTES = 3;

function diasSemContato(dataContato) {
  if (!dataContato) return 999;
  const d = new Date(dataContato);
  const hoje = new Date();
  return Math.floor((hoje - d) / (1000 * 60 * 60 * 24));
}

function Stars({ value, onChange }) {
  return (
    <div style={{ display:'flex', gap:3 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n} onClick={() => onChange && onChange(n)}
          style={{ fontSize:18, cursor:onChange?'pointer':'default', opacity: n <= value ? 1 : 0.25, filter: n <= value ? 'none' : 'grayscale(1)' }}>⭐</span>
      ))}
    </div>
  );
}

function Badge({ status }) {
  const s = STATUS_CONFIG[status]; if (!s) return null;
  return <span style={{ fontSize:11, fontWeight:700, color:s.color, background:s.bg, padding:'3px 10px', borderRadius:99, border:`1px solid ${s.border}`, whiteSpace:'nowrap' }}>{s.label}</span>;
}

function SectionTitle({ children, style={} }) {
  return <div style={{ fontSize:11, fontWeight:800, color:C.textLight, textTransform:'uppercase', letterSpacing:1, marginBottom:10, ...style }}>{children}</div>;
}

function Card({ children, style={} }) {
  return <div style={{ background:C.white, borderRadius:14, border:`1px solid ${C.border}`, boxShadow:'0 1px 4px rgba(0,0,0,0.05)', ...style }}>{children}</div>;
}

// ── SIDEBAR ────────────────────────────────────────────────────────────────
function Sidebar({ tela, setTela, leads }) {
  const contadores = Object.fromEntries(Object.keys(STATUS_CONFIG).map(k=>[k,leads.filter(l=>l.status===k).length]));
  const alertas = leads.filter(l => !['cliente','semInteresse'].includes(l.status) && diasSemContato(l.dataContato) >= DIAS_ALERTA).length;
  const items = [
    { id:'hoje', icon:'🏠', label:'Dashboard' },
    { id:'leads', icon:'👥', label:'Leads' },
    { id:'alertas', icon:'🔔', label:'Alertas', badge: alertas },
    { id:'recomendantes', icon:'🏆', label:'Recomendantes' },
    { id:'metas', icon:'🎯', label:'Metas' },
    { id:'backup', icon:'💾', label:'Backup' },
    { id:'novo', icon:'➕', label:'Novo Lead' },
  ];
  return (
    <div style={{ width:220, background:C.navy, borderRight:'1px solid rgba(255,255,255,0.08)', display:'flex', flexDirection:'column', flexShrink:0 }}>
      <div style={{ padding:'28px 20px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:38, height:38, background:C.gold, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🛡️</div>
          <div>
            <div style={{ color:C.white, fontWeight:800, fontSize:16, letterSpacing:-0.5 }}>SITPLAN</div>
            <div style={{ color:C.silver, fontSize:11 }}>Prospecção</div>
          </div>
        </div>
      </div>
      <div style={{ padding:'0 10px', flex:1 }}>
        {items.map(item => {
          const ativo = tela === item.id;
          return (
            <button key={item.id} onClick={() => setTela(item.id)} style={{
              width:'100%', padding:'11px 14px', borderRadius:10, border:'none',
              background: ativo ? 'rgba(196,168,50,0.15)' : 'transparent',
              color: ativo ? C.gold : C.silverLight,
              display:'flex', alignItems:'center', gap:10, cursor:'pointer',
              fontSize:13, fontWeight: ativo ? 700 : 400, fontFamily:'inherit',
              marginBottom:3, textAlign:'left',
              borderLeft: ativo ? `3px solid ${C.gold}` : '3px solid transparent',
            }}>
              <span style={{ fontSize:17 }}>{item.icon}</span>
              <span style={{ flex:1 }}>{item.label}</span>
              {item.badge > 0 && (
                <span style={{ background:'#EF4444', color:C.white, fontSize:10, fontWeight:800, padding:'2px 7px', borderRadius:99, minWidth:18, textAlign:'center' }}>{item.badge}</span>
              )}
            </button>
          );
        })}
        <div style={{ marginTop:16, padding:'0 4px' }}>
          <div style={{ color:C.silver, fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>Resumo</div>
          {['agendado','tentativa','fechamento','cliente'].map(sk => {
            const cfg = STATUS_CONFIG[sk];
            return (
              <div key={sk} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7 }}>
                <span style={{ fontSize:13 }}>{cfg.emoji}</span>
                <span style={{ color:C.silverLight, fontSize:12, flex:1 }}>{cfg.label}</span>
                <span style={{ color:C.white, fontSize:13, fontWeight:700 }}>{contadores[sk]||0}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ padding:'16px 20px', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:'50%', background:C.navyLight, display:'flex', alignItems:'center', justifyContent:'center', color:C.white, fontSize:14, fontWeight:700 }}>R</div>
          <div>
            <div style={{ color:C.white, fontSize:13, fontWeight:600 }}>Rodrigo</div>
            <div style={{ color:C.silver, fontSize:11 }}>Consultor</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD ──────────────────────────────────────────────────────────────
function Hoje({ leads, setTela, setLeadSel }) {
  const contadores = Object.fromEntries(Object.keys(STATUS_CONFIG).map(k=>[k,leads.filter(l=>l.status===k).length]));
  const pendentes = leads.filter(l=>['agendado','tentativa','fechamento'].includes(l.status));
  const alertas = leads.filter(l => !['cliente','semInteresse'].includes(l.status) && diasSemContato(l.dataContato) >= DIAS_ALERTA);
  const agendSemana = contadores.agendado || 0;
  const clientesSemana = contadores.cliente || 0;

  return (
    <div style={{ flex:1, background:C.silverBg, overflow:'auto' }}>
      <div style={{ background:C.navyMid, padding:'28px 28px 24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:C.gold }} />
          <span style={{ color:C.silverLight, fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:1 }}>Dashboard</span>
        </div>
        <div style={{ color:C.white, fontSize:24, fontWeight:800, letterSpacing:-0.5 }}>Olá, Rodrigo 👋</div>
        <div style={{ color:C.silverLight, fontSize:13, marginTop:2 }}>{pendentes.length} ações pendentes · {alertas.length} alertas de follow-up</div>
      </div>

      <div style={{ padding:'20px 24px' }}>
        {/* Alerta banner */}
        {alertas.length > 0 && (
          <div onClick={() => setTela('alertas')} style={{ background:'#FFF3CD', border:'1px solid #F0C878', borderRadius:12, padding:'12px 16px', marginBottom:16, cursor:'pointer', display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:20 }}>⚠️</span>
            <div>
              <div style={{ fontWeight:700, color:'#7C4A00', fontSize:13 }}>{alertas.length} leads sem contato há mais de {DIAS_ALERTA} dias</div>
              <div style={{ color:'#7C6200', fontSize:12 }}>Toque para ver quem precisa de atenção</div>
            </div>
            <span style={{ marginLeft:'auto', color:'#7C4A00', fontSize:18 }}>→</span>
          </div>
        )}

        {/* KPIs */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
          {[
            { label:'Total Leads', val:leads.length, icon:'👥', color:C.navyMid },
            { label:'Agendados', val:contadores.agendado||0, icon:'📅', color:'#0D5C3A' },
            { label:'Fechamento', val:contadores.fechamento||0, icon:'🤝', color:'#5B1FAD' },
            { label:'Clientes', val:contadores.cliente||0, icon:'⭐', color:C.gold },
          ].map(k=>(
            <Card key={k.label} style={{ padding:'16px' }}>
              <div style={{ fontSize:20, marginBottom:8 }}>{k.icon}</div>
              <div style={{ fontSize:26, fontWeight:800, color:k.color, letterSpacing:-1 }}>{k.val}</div>
              <div style={{ fontSize:11, color:C.textLight, marginTop:2, fontWeight:500 }}>{k.label}</div>
            </Card>
          ))}
        </div>

        {/* Metas semanais inline */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
          {[
            { label:'Meta Agendamentos', atual:agendSemana, meta:META_SEMANAL_AGENDAMENTOS, color:'#0D5C3A' },
            { label:'Meta Clientes', atual:clientesSemana, meta:META_SEMANAL_CLIENTES, color:C.gold },
          ].map(m => {
            const pct = Math.min(Math.round(m.atual/m.meta*100), 100);
            return (
              <Card key={m.label} style={{ padding:'14px 16px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <span style={{ fontSize:12, color:C.textMid, fontWeight:600 }}>🎯 {m.label}</span>
                  <span style={{ fontSize:13, fontWeight:800, color:m.color }}>{m.atual}/{m.meta}</span>
                </div>
                <div style={{ background:C.silverBg, borderRadius:99, height:8, overflow:'hidden' }}>
                  <div style={{ width:`${pct}%`, height:'100%', background:m.color, borderRadius:99, transition:'width .5s' }} />
                </div>
                <div style={{ fontSize:11, color:C.textLight, marginTop:5 }}>{pct}% da meta semanal</div>
              </Card>
            );
          })}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          {/* Pendentes */}
          <div>
            <SectionTitle>Ações Pendentes</SectionTitle>
            {pendentes.map(lead => {
              const s = STATUS_CONFIG[lead.status];
              return (
                <div key={lead.id} onClick={()=>{setLeadSel(lead);setTela('detalhe');}} style={{
                  background:C.white, borderRadius:12, padding:'12px 14px', marginBottom:8,
                  border:`1px solid ${C.border}`, cursor:'pointer', display:'flex', alignItems:'center', gap:10,
                }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0, border:`1px solid ${s.border}` }}>{s.emoji}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontWeight:700, fontSize:13, color:C.text }}>{lead.nome}</span>
                      <Stars value={lead.potencial||0} />
                    </div>
                    <div style={{ fontSize:11, color:C.textLight, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{lead.proximoPasso||lead.segmento}</div>
                  </div>
                  <Badge status={lead.status} />
                </div>
              );
            })}
          </div>

          {/* Funil */}
          <div>
            <SectionTitle>Funil de Prospecção</SectionTitle>
            <Card style={{ padding:'18px' }}>
              {['novo','tentativa','agendado','apresentado','fechamento','cliente'].map(sk=>{
                const cfg=STATUS_CONFIG[sk];
                const count=contadores[sk]||0;
                const pct=leads.length?Math.round(count/leads.length*100):0;
                return (
                  <div key={sk} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                    <div style={{ width:85, fontSize:11, color:C.textMid, flexShrink:0, display:'flex', alignItems:'center', gap:5 }}>
                      <span>{cfg.emoji}</span><span>{cfg.label}</span>
                    </div>
                    <div style={{ flex:1, background:C.silverBg, borderRadius:99, height:6, overflow:'hidden' }}>
                      <div style={{ width:`${Math.max(pct,1)}%`, height:'100%', background:C.navyMid, borderRadius:99 }} />
                    </div>
                    <div style={{ width:28, fontSize:12, fontWeight:700, color:C.text, textAlign:'right' }}>{count}</div>
                  </div>
                );
              })}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ALERTAS ────────────────────────────────────────────────────────────────
function Alertas({ leads, setTela, setLeadSel }) {
  const alertas = leads.filter(l => !['cliente','semInteresse'].includes(l.status) && diasSemContato(l.dataContato) >= DIAS_ALERTA)
    .sort((a,b) => diasSemContato(b.dataContato) - diasSemContato(a.dataContato));

  return (
    <div style={{ flex:1, background:C.silverBg, overflow:'auto' }}>
      <div style={{ background:C.navyMid, padding:'28px 28px 24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:'#EF4444' }} />
          <span style={{ color:C.silverLight, fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:1 }}>Follow-up</span>
        </div>
        <div style={{ color:C.white, fontSize:24, fontWeight:800 }}>Alertas</div>
        <div style={{ color:C.silverLight, fontSize:13, marginTop:2 }}>{alertas.length} leads precisam de atenção</div>
      </div>

      <div style={{ padding:'20px 24px' }}>
        {alertas.length === 0 ? (
          <Card style={{ padding:'40px', textAlign:'center' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
            <div style={{ fontWeight:700, color:C.text, fontSize:16 }}>Tudo em dia!</div>
            <div style={{ color:C.textLight, fontSize:13, marginTop:4 }}>Nenhum lead sem contato há mais de {DIAS_ALERTA} dias</div>
          </Card>
        ) : alertas.map(lead => {
          const dias = diasSemContato(lead.dataContato);
          const urgente = dias >= 10;
          const s = STATUS_CONFIG[lead.status];
          return (
            <div key={lead.id} onClick={()=>{setLeadSel(lead);setTela('detalhe');}} style={{
              background:C.white, borderRadius:12, padding:'14px 16px', marginBottom:10,
              border:`1.5px solid ${urgente?'#FFBABA':C.border}`, cursor:'pointer',
              display:'flex', alignItems:'center', gap:12,
            }}>
              <div style={{ width:40, height:40, borderRadius:10, background:urgente?'#FFF0F0':'#FFF8E6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                {urgente?'🔴':'🟡'}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontWeight:700, fontSize:14, color:C.text }}>{lead.nome}</span>
                  <Stars value={lead.potencial||0} />
                </div>
                <div style={{ fontSize:12, color:C.textLight }}>via {lead.indicadoPor||'--'} · {lead.segmento||'--'}</div>
                <div style={{ fontSize:12, fontWeight:700, color:urgente?'#8B1A1A':'#7C6200', marginTop:3 }}>
                  ⏰ {dias === 999 ? 'Nunca contactado' : `${dias} dias sem contato`}
                </div>
              </div>
              <Badge status={lead.status} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── RECOMENDANTES ──────────────────────────────────────────────────────────
function Recomendantes({ leads, setTela, setLeadSel }) {
  const ranking = useMemo(() => {
    const mapa = {};
    leads.forEach(l => {
      const rec = l.indicadoPor?.trim() || 'Sem indicador';
      if (!mapa[rec]) mapa[rec] = { nome:rec, total:0, clientes:0, agendados:0, leads:[] };
      mapa[rec].total++;
      if (l.status === 'cliente') mapa[rec].clientes++;
      if (l.status === 'agendado') mapa[rec].agendados++;
      mapa[rec].leads.push(l);
    });
    return Object.values(mapa).sort((a,b) => b.total - a.total);
  }, [leads]);

  const medalhas = ['🥇','🥈','🥉'];

  return (
    <div style={{ flex:1, background:C.silverBg, overflow:'auto' }}>
      <div style={{ background:C.navyMid, padding:'28px 28px 24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:C.gold }} />
          <span style={{ color:C.silverLight, fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:1 }}>Ranking</span>
        </div>
        <div style={{ color:C.white, fontSize:24, fontWeight:800 }}>Recomendantes</div>
        <div style={{ color:C.silverLight, fontSize:13, marginTop:2 }}>Quem mais indica e converte</div>
      </div>

      <div style={{ padding:'20px 24px' }}>
        {/* Top 3 */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:20 }}>
          {ranking.slice(0,3).map((rec,i) => (
            <Card key={rec.nome} style={{ padding:'16px', textAlign:'center', border: i===0?`2px solid ${C.gold}`:undefined }}>
              <div style={{ fontSize:28, marginBottom:6 }}>{medalhas[i]}</div>
              <div style={{ fontWeight:800, fontSize:14, color:C.text, marginBottom:4 }}>{rec.nome}</div>
              <div style={{ fontSize:22, fontWeight:800, color:C.navyMid }}>{rec.total}</div>
              <div style={{ fontSize:11, color:C.textLight }}>leads indicados</div>
              <div style={{ display:'flex', justifyContent:'center', gap:12, marginTop:8 }}>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:14, fontWeight:800, color:'#0D5C3A' }}>{rec.clientes}</div>
                  <div style={{ fontSize:10, color:C.textLight }}>clientes</div>
                </div>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:14, fontWeight:800, color:'#1E3A5F' }}>{rec.agendados}</div>
                  <div style={{ fontSize:10, color:C.textLight }}>agendados</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Tabela completa */}
        <SectionTitle>Todos os Recomendantes</SectionTitle>
        <Card style={{ overflow:'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr', padding:'10px 16px', background:C.silverBg, borderBottom:`1px solid ${C.border}` }}>
            {['Nome','Total','Clientes','Agendados','Conversão'].map(h=>(
              <div key={h} style={{ fontSize:10, fontWeight:800, color:C.textLight, textTransform:'uppercase', letterSpacing:0.5 }}>{h}</div>
            ))}
          </div>
          {ranking.map((rec,i) => {
            const conv = rec.total ? Math.round(rec.clientes/rec.total*100) : 0;
            return (
              <div key={rec.nome} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr', padding:'11px 16px', background:i%2===0?C.white:'#FAFBFC', borderBottom:`1px solid ${C.border}`, alignItems:'center' }}>
                <div style={{ fontWeight:600, fontSize:13, color:C.text, display:'flex', alignItems:'center', gap:6 }}>
                  {i < 3 && <span>{medalhas[i]}</span>}{rec.nome}
                </div>
                <div style={{ fontSize:13, fontWeight:700, color:C.navyMid }}>{rec.total}</div>
                <div style={{ fontSize:13, fontWeight:700, color:'#0D5C3A' }}>{rec.clientes}</div>
                <div style={{ fontSize:13, fontWeight:700, color:'#1E3A5F' }}>{rec.agendados}</div>
                <div style={{ fontSize:12, fontWeight:700, color: conv>0?'#0D5C3A':C.textLight }}>{conv}%</div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}

// ── METAS ──────────────────────────────────────────────────────────────────
function Metas({ leads }) {
  const [metaAgend, setMetaAgend] = useState(META_SEMANAL_AGENDAMENTOS);
  const [metaClientes, setMetaClientes] = useState(META_SEMANAL_CLIENTES);
  const contadores = Object.fromEntries(Object.keys(STATUS_CONFIG).map(k=>[k,leads.filter(l=>l.status===k).length]));

  const metas = [
    { label:'Agendamentos', icon:'📅', atual:contadores.agendado||0, meta:metaAgend, setMeta:setMetaAgend, color:'#0D5C3A' },
    { label:'Novos Clientes', icon:'⭐', atual:contadores.cliente||0, meta:metaClientes, setMeta:setMetaClientes, color:C.gold },
    { label:'Em Fechamento', icon:'🤝', atual:contadores.fechamento||0, meta:5, setMeta:null, color:'#5B1FAD' },
    { label:'Total Ativo', icon:'👥', atual:leads.filter(l=>!['semInteresse'].includes(l.status)).length, meta:leads.length, setMeta:null, color:C.navyMid },
  ];

  return (
    <div style={{ flex:1, background:C.silverBg, overflow:'auto' }}>
      <div style={{ background:C.navyMid, padding:'28px 28px 24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:C.gold }} />
          <span style={{ color:C.silverLight, fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:1 }}>Performance</span>
        </div>
        <div style={{ color:C.white, fontSize:24, fontWeight:800 }}>Metas Semanais</div>
        <div style={{ color:C.silverLight, fontSize:13, marginTop:2 }}>Acompanhe seu progresso</div>
      </div>

      <div style={{ padding:'20px 24px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
          {metas.map(m => {
            const pct = Math.min(Math.round(m.atual/m.meta*100),100);
            const atingiu = m.atual >= m.meta;
            return (
              <Card key={m.label} style={{ padding:'20px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:22 }}>{m.icon}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:C.textMid }}>{m.label}</span>
                  </div>
                  {atingiu && <span style={{ fontSize:18 }}>✅</span>}
                </div>
                <div style={{ fontSize:36, fontWeight:800, color:m.color, letterSpacing:-1, marginBottom:4 }}>
                  {m.atual}<span style={{ fontSize:16, color:C.textLight, fontWeight:400 }}>/{m.meta}</span>
                </div>
                <div style={{ background:C.silverBg, borderRadius:99, height:10, overflow:'hidden', marginBottom:8 }}>
                  <div style={{ width:`${pct}%`, height:'100%', background: atingiu?'#0D5C3A':m.color, borderRadius:99, transition:'width .5s' }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:12, color:C.textLight }}>{pct}% concluído</span>
                  {m.setMeta && (
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontSize:11, color:C.textLight }}>Meta:</span>
                      <input type="number" value={m.meta} onChange={e=>m.setMeta(Number(e.target.value))}
                        style={{ width:50, padding:'3px 6px', borderRadius:6, border:`1px solid ${C.border}`, fontSize:12, fontFamily:'inherit', textAlign:'center', outline:'none' }} />
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Dica */}
        <Card style={{ padding:'16px', background:C.goldLight, border:`1px solid ${C.gold}` }}>
          <div style={{ fontWeight:700, color:'#7C4A00', fontSize:13, marginBottom:4 }}>💡 Dica de prospecção</div>
          <div style={{ color:'#7C6200', fontSize:13, lineHeight:1.6 }}>
            Para {metaClientes} clientes novos por semana, você precisa de pelo menos {metaClientes * 5} tentativas de contato,
            {' '}{metaClientes * 3} apresentações e {metaClientes * 2} em fechamento. Foque nos leads ⭐⭐⭐⭐⭐ primeiro!
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── LEADS LIST ─────────────────────────────────────────────────────────────
function LeadsList({ leads, setTela, setLeadSel }) {
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [ordenar, setOrdenar] = useState('nome');
  const contadores = Object.fromEntries(Object.keys(STATUS_CONFIG).map(k=>[k,leads.filter(l=>l.status===k).length]));

  const filtrados = useMemo(() => {
    let r = leads.filter(l => {
      const q = busca.toLowerCase();
      return (l.nome.toLowerCase().includes(q)||(l.indicadoPor||'').toLowerCase().includes(q)||(l.segmento||'').toLowerCase().includes(q))
        && (filtro==='todos'||l.status===filtro);
    });
    if (ordenar==='potencial') r = [...r].sort((a,b)=>(b.potencial||0)-(a.potencial||0));
    if (ordenar==='nome') r = [...r].sort((a,b)=>a.nome.localeCompare(b.nome));
    if (ordenar==='alerta') r = [...r].sort((a,b)=>diasSemContato(b.dataContato)-diasSemContato(a.dataContato));
    return r;
  }, [leads, busca, filtro, ordenar]);

  return (
    <div style={{ flex:1, background:C.silverBg, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ background:C.navyMid, padding:'28px 28px 20px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:C.gold }} />
          <span style={{ color:C.silverLight, fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:1 }}>Carteira</span>
        </div>
        <div style={{ color:C.white, fontSize:24, fontWeight:800 }}>Leads</div>
        <div style={{ color:C.silverLight, fontSize:13, marginTop:2 }}>{filtrados.length} de {leads.length} contatos</div>
        <div style={{ display:'flex', gap:10, marginTop:14 }}>
          <div style={{ position:'relative', flex:1 }}>
            <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:C.silverLight }}>🔍</span>
            <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar..."
              style={{ width:'100%', padding:'10px 14px 10px 38px', borderRadius:10, border:'none', fontSize:13, fontFamily:'inherit', background:'rgba(255,255,255,0.12)', color:C.white, outline:'none', boxSizing:'border-box' }} />
          </div>
          <select value={ordenar} onChange={e=>setOrdenar(e.target.value)}
            style={{ padding:'10px 12px', borderRadius:10, border:'none', background:'rgba(255,255,255,0.12)', color:C.white, fontSize:12, fontFamily:'inherit', outline:'none' }}>
            <option value="nome" style={{ color:C.text }}>A-Z</option>
            <option value="potencial" style={{ color:C.text }}>⭐ Potencial</option>
            <option value="alerta" style={{ color:C.text }}>⚠️ Sem contato</option>
          </select>
        </div>
      </div>

      <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, padding:'10px 16px', display:'flex', gap:8, overflowX:'auto', flexShrink:0, scrollbarWidth:'none' }}>
        {[{k:'todos',label:`Todos (${leads.length})`,color:C.navyMid,bg:C.silverBg},...Object.entries(STATUS_CONFIG).map(([k,v])=>({k,label:`${v.emoji} ${v.label} (${contadores[k]||0})`,color:v.color,bg:v.bg}))].map(f=>(
          <button key={f.k} onClick={()=>setFiltro(f.k)} style={{
            whiteSpace:'nowrap', padding:'5px 12px', borderRadius:20,
            border:`1.5px solid ${filtro===f.k?f.color:C.border}`,
            background:filtro===f.k?f.bg:C.white, color:filtro===f.k?f.color:C.textLight,
            fontSize:11, fontWeight:filtro===f.k?700:400, cursor:'pointer', fontFamily:'inherit', flexShrink:0
          }}>{f.label}</button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'16px 24px' }}>
        <Card style={{ overflow:'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1.2fr 1.2fr 80px 1fr 80px', padding:'10px 16px', background:C.silverBg, borderBottom:`1px solid ${C.border}` }}>
            {['Nome','Indicado por','Segmento','Potencial','Status','Ação'].map(h=>(
              <div key={h} style={{ fontSize:10, fontWeight:800, color:C.textLight, textTransform:'uppercase', letterSpacing:0.5 }}>{h}</div>
            ))}
          </div>
          {filtrados.map((lead,i) => {
            const dias = diasSemContato(lead.dataContato);
            const temAlerta = !['cliente','semInteresse'].includes(lead.status) && dias >= DIAS_ALERTA;
            return (
              <div key={lead.id} onClick={()=>{setLeadSel(lead);setTela('detalhe');}} style={{
                display:'grid', gridTemplateColumns:'2fr 1.2fr 1.2fr 80px 1fr 80px',
                padding:'11px 16px', cursor:'pointer', alignItems:'center',
                background: temAlerta ? '#FFFBF0' : i%2===0?C.white:'#FAFBFC',
                borderBottom:`1px solid ${C.border}`,
                borderLeft: temAlerta ? '3px solid #F0C878' : '3px solid transparent',
              }}>
                <div style={{ fontWeight:600, fontSize:13, color:C.text }}>
                  {lead.nome}
                  {temAlerta && <span style={{ marginLeft:6, fontSize:11 }}>⚠️</span>}
                </div>
                <div style={{ fontSize:12, color:C.textMid }}>{lead.indicadoPor||'--'}</div>
                <div style={{ fontSize:12, color:C.textMid }}>{lead.segmento||'--'}</div>
                <div><Stars value={lead.potencial||0} /></div>
                <div><Badge status={lead.status} /></div>
                <div style={{ display:'flex', gap:8 }}>
                  <span style={{ fontSize:16 }}>📞</span>
                  <span style={{ fontSize:16 }}>💬</span>
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}

// ── NOVO LEAD ──────────────────────────────────────────────────────────────
function NovoLead({ setTela, onSave }) {
  const [form, setForm] = useState({ nome:'', indicadoPor:'', segmento:'', telefone:'', potencial:3, temSeguro:'Não sei', seguradora:'' });
  const [erro, setErro] = useState('');

  function salvar() {
    if (!form.nome.trim()) { setErro('O nome é obrigatório'); return; }
    onSave(form); setTela('leads');
  }

  return (
    <div style={{ flex:1, background:C.silverBg, overflow:'auto' }}>
      <div style={{ background:C.navyMid, padding:'28px 28px 24px' }}>
        <button onClick={()=>setTela('leads')} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:8, color:C.white, fontSize:13, fontWeight:700, padding:'6px 12px', cursor:'pointer', marginBottom:12, fontFamily:'inherit' }}>← Voltar</button>
        <div style={{ color:C.white, fontSize:24, fontWeight:800 }}>Novo Lead</div>
      </div>
      <div style={{ padding:'20px 24px', maxWidth:560 }}>
        <div style={{ background:C.goldLight, borderRadius:12, padding:'12px 16px', marginBottom:20, fontSize:13, color:'#7C4A00', border:`1px solid ${C.gold}` }}>
          💡 Preencha o essencial agora -- complete depois!
        </div>
        {[
          {label:'Nome *',key:'nome',placeholder:'Nome completo',type:'text'},
          {label:'Indicado por',key:'indicadoPor',placeholder:'Quem indicou?',type:'text'},
          {label:'Segmento / Negócio',key:'segmento',placeholder:'Ex: Mecânico, Dentista...',type:'text'},
          {label:'Telefone',key:'telefone',placeholder:'DDD + número',type:'tel'},
        ].map(f=>(
          <div key={f.key} style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:700, color:C.textMid, marginBottom:5 }}>{f.label}</label>
            <input type={f.type} value={form[f.key]} onChange={e=>{setForm(p=>({...p,[f.key]:e.target.value}));setErro('');}}
              placeholder={f.placeholder}
              style={{ width:'100%', padding:'11px 13px', borderRadius:10, border:`1.5px solid ${f.key==='nome'&&erro?'#EF4444':C.border}`, fontSize:14, outline:'none', fontFamily:'inherit', boxSizing:'border-box', background:C.white, color:C.text }} />
          </div>
        ))}

        <div style={{ marginBottom:14 }}>
          <label style={{ display:'block', fontSize:12, fontWeight:700, color:C.textMid, marginBottom:5 }}>Potencial</label>
          <Stars value={form.potencial} onChange={v=>setForm(p=>({...p,potencial:v}))} />
        </div>

        <div style={{ marginBottom:14 }}>
          <label style={{ display:'block', fontSize:12, fontWeight:700, color:C.textMid, marginBottom:5 }}>Já tem seguro de vida?</label>
          <div style={{ display:'flex', gap:8 }}>
            {['Sim','Não','Não sei'].map(op=>(
              <button key={op} onClick={()=>setForm(p=>({...p,temSeguro:op}))} style={{
                padding:'8px 16px', borderRadius:20, border:`1.5px solid ${form.temSeguro===op?C.navyMid:C.border}`,
                background:form.temSeguro===op?C.navyMid:C.white, color:form.temSeguro===op?C.white:C.textMid,
                fontSize:13, fontWeight:form.temSeguro===op?700:400, cursor:'pointer', fontFamily:'inherit'
              }}>{op}</button>
            ))}
          </div>
        </div>

        {form.temSeguro === 'Sim' && (
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:700, color:C.textMid, marginBottom:5 }}>Qual seguradora?</label>
            <input value={form.seguradora} onChange={e=>setForm(p=>({...p,seguradora:e.target.value}))}
              placeholder="Ex: Porto Seguro, SulAmérica..."
              style={{ width:'100%', padding:'11px 13px', borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:14, outline:'none', fontFamily:'inherit', boxSizing:'border-box', background:C.white }} />
          </div>
        )}

        {erro && <div style={{ color:'#EF4444', fontSize:13, marginBottom:12, fontWeight:600 }}>⚠️ {erro}</div>}
        <button onClick={salvar} style={{ width:'100%', padding:'14px', borderRadius:12, background:C.navyMid, color:C.white, border:'none', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Salvar Lead</button>
        <button onClick={()=>setTela('leads')} style={{ width:'100%', padding:'12px', borderRadius:12, background:'none', color:C.textMid, border:`1.5px solid ${C.border}`, fontSize:14, cursor:'pointer', fontFamily:'inherit', marginTop:10 }}>Cancelar</button>
      </div>
    </div>
  );
}

// ── DETALHE ────────────────────────────────────────────────────────────────
function Detalhe({ lead, setTela, leads, setLeads }) {
  const [editStatus, setEditStatus] = useState(false);
  const [novaObs, setNovaObs] = useState('');
  const currentLead = leads.find(l=>l.id===lead.id) || lead;
  const s = STATUS_CONFIG[currentLead.status] || STATUS_CONFIG.novo;
  const historico = currentLead.historico || [];
  const dias = diasSemContato(currentLead.dataContato);

  function updateField(field, val) {
    setLeads(p=>p.map(l=>l.id===lead.id?{...l,[field]:val}:l));
  }
  function updateStatus(sk) {
    const hoje = new Date().toISOString().split('T')[0];
    setLeads(p=>p.map(l=>l.id===lead.id?{...l,status:sk,dataContato:hoje}:l));
    setEditStatus(false);
  }
  function registrar() {
    if (!novaObs.trim()) return;
    const agora = new Date();
    const entry = { data:agora.toLocaleDateString('pt-BR'), hora:agora.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}), obs:novaObs, status:currentLead.status };
    setLeads(p=>p.map(l=>l.id===lead.id?{...l,historico:[...(l.historico||[]),entry],dataContato:new Date().toISOString().split('T')[0]}:l));
    setNovaObs('');
  }
  function outlookLink() {
    const t = encodeURIComponent(`Reunião Sitplan -- ${currentLead.nome}`);
    const d = new Date(); d.setDate(d.getDate()+1); d.setHours(10,0,0);
    const f = new Date(d); f.setHours(11,0,0);
    const fmt = x=>x.toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
    return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${t}&startdt=${fmt(d)}&enddt=${fmt(f)}&body=${encodeURIComponent(`Lead: ${currentLead.nome}\nTelefone: ${currentLead.telefone}\nSegmento: ${currentLead.segmento}`)}`;
  }

  return (
    <div style={{ flex:1, background:C.silverBg, overflow:'auto' }}>
      <div style={{ background:C.navyMid, padding:'28px 28px 24px' }}>
        <button onClick={()=>setTela('leads')} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:8, color:C.white, fontSize:13, fontWeight:700, padding:'6px 12px', cursor:'pointer', marginBottom:12, fontFamily:'inherit' }}>← Voltar</button>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:46, height:46, borderRadius:14, background:'rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{s.emoji}</div>
          <div style={{ flex:1 }}>
            <div style={{ color:C.white, fontSize:22, fontWeight:800 }}>{currentLead.nome}</div>
            <div style={{ color:C.silverLight, fontSize:13 }}>via {currentLead.indicadoPor||'--'} · {currentLead.segmento||'--'}</div>
            <Stars value={currentLead.potencial||0} onChange={v=>updateField('potencial',v)} />
          </div>
          <Badge status={currentLead.status} />
        </div>
        {dias >= DIAS_ALERTA && (
          <div style={{ marginTop:12, background:'rgba(255,200,0,0.15)', borderRadius:8, padding:'8px 12px', color:'#F0C878', fontSize:12, fontWeight:600 }}>
            ⚠️ {dias === 999 ? 'Nunca contactado' : `${dias} dias sem contato`} -- requer follow-up urgente!
          </div>
        )}
      </div>

      <div style={{ padding:'20px 24px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div>
          {/* Contato */}
          <SectionTitle>Contato Rápido</SectionTitle>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:16 }}>
            {[{icon:'📞',label:'Ligar',color:C.navyMid,href:`tel:${currentLead.telefone}`},
              {icon:'💬',label:'WhatsApp',color:'#16A34A',href:`https://wa.me/55${currentLead.telefone}`},
              {icon:'📆',label:'Outlook',color:'#0078D4',href:outlookLink()}].map(btn=>(
              <a key={btn.label} href={btn.href} target="_blank" rel="noreferrer" style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'12px 8px', borderRadius:12, background:C.white, color:btn.color, border:`1px solid ${C.border}`, gap:5, textDecoration:'none', fontWeight:700, fontSize:11 }}>
                <span style={{ fontSize:20 }}>{btn.icon}</span>{btn.label}
              </a>
            ))}
          </div>

          {/* Status */}
          <SectionTitle>Status</SectionTitle>
          {!editStatus ? (
            <button onClick={()=>setEditStatus(true)} style={{ width:'100%', padding:'12px', borderRadius:12, border:`2px dashed ${s.border}`, background:s.bg, color:s.color, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', marginBottom:14 }}>
              {s.emoji} {s.label} -- Toque para alterar
            </button>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
              {FUNIL_ORDER.map(sk=>{
                const cfg=STATUS_CONFIG[sk]; if(!cfg) return null;
                const ativo=currentLead.status===sk;
                return <button key={sk} onClick={()=>updateStatus(sk)} style={{ padding:'9px 8px', borderRadius:10, border:`1.5px solid ${ativo?cfg.color:cfg.border}`, background:ativo?cfg.bg:C.white, color:cfg.color, fontSize:11, fontWeight:ativo?800:600, cursor:'pointer', fontFamily:'inherit' }}>{cfg.emoji} {cfg.label}</button>;
              })}
            </div>
          )}

          {/* Info */}
          <SectionTitle>Informações</SectionTitle>
          <Card style={{ overflow:'hidden', marginBottom:14 }}>
            {[
              {label:'Telefone', val:currentLead.telefone||'--'},
              {label:'Seguradora atual', val:currentLead.temSeguro==='Sim'?(currentLead.seguradora||'Tem seguro'):'Não tem / Não sabe'},
              {label:'Último contato', val:currentLead.dataContato||'Nunca'},
            ].map((item,i)=>(
              <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'10px 14px', borderBottom:i<2?`1px solid ${C.border}`:'none', alignItems:'center' }}>
                <span style={{ fontSize:12, color:C.textLight, fontWeight:500 }}>{item.label}</span>
                <span style={{ fontSize:12, color:C.text, fontWeight:600 }}>{item.val}</span>
              </div>
            ))}
          </Card>

          {/* Seguro */}
          <SectionTitle>Seguro de Vida</SectionTitle>
          <Card style={{ padding:'14px' }}>
            <div style={{ fontSize:12, fontWeight:600, color:C.textMid, marginBottom:8 }}>Já possui seguro?</div>
            <div style={{ display:'flex', gap:8, marginBottom: currentLead.temSeguro==='Sim'?12:0 }}>
              {['Sim','Não','Não sei'].map(op=>(
                <button key={op} onClick={()=>updateField('temSeguro',op)} style={{
                  padding:'6px 14px', borderRadius:20, border:`1.5px solid ${currentLead.temSeguro===op?C.navyMid:C.border}`,
                  background:currentLead.temSeguro===op?C.navyMid:C.white, color:currentLead.temSeguro===op?C.white:C.textMid,
                  fontSize:12, fontWeight:currentLead.temSeguro===op?700:400, cursor:'pointer', fontFamily:'inherit'
                }}>{op}</button>
              ))}
            </div>
            {currentLead.temSeguro==='Sim' && (
              <input value={currentLead.seguradora||''} onChange={e=>updateField('seguradora',e.target.value)}
                placeholder="Qual seguradora?"
                style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:`1px solid ${C.border}`, fontSize:13, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }} />
            )}
          </Card>
        </div>

        <div>
          {/* Histórico */}
          <SectionTitle>Histórico de Contatos ({historico.length})</SectionTitle>
          <Card style={{ marginBottom:12, maxHeight:220, overflowY:'auto' }}>
            {historico.length===0 ? (
              <div style={{ padding:'24px', textAlign:'center', color:C.textLight, fontSize:13 }}>Nenhuma tentativa registrada</div>
            ) : [...historico].reverse().map((h,i)=>{
              const cfg=STATUS_CONFIG[h.status];
              return (
                <div key={i} style={{ padding:'10px 14px', borderBottom:i<historico.length-1?`1px solid ${C.border}`:'none' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
                    <span style={{ fontSize:13 }}>{cfg?.emoji}</span>
                    <span style={{ fontSize:11, color:C.textLight }}>{h.data} às {h.hora}</span>
                    {cfg && <span style={{ fontSize:10, color:cfg.color, background:cfg.bg, padding:'1px 7px', borderRadius:99, fontWeight:700 }}>{cfg.label}</span>}
                  </div>
                  <div style={{ fontSize:12, color:C.text, paddingLeft:20 }}>{h.obs}</div>
                </div>
              );
            })}
          </Card>

          <SectionTitle>Registrar Tentativa</SectionTitle>
          <textarea value={novaObs} onChange={e=>setNovaObs(e.target.value)} placeholder="Ex: Não atendeu, tentarei às 16h..."
            style={{ width:'100%', padding:'12px', borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:12, outline:'none', fontFamily:'inherit', resize:'none', height:68, boxSizing:'border-box', background:C.white, marginBottom:8 }} />
          <button onClick={registrar} style={{ width:'100%', padding:'11px', borderRadius:10, background:C.gold, color:C.navy, border:'none', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit', marginBottom:14 }}>
            📝 Registrar Contato
          </button>

          {/* Próximo passo */}
          <SectionTitle>Próximo Passo</SectionTitle>
          <textarea defaultValue={currentLead.proximoPasso||''} onBlur={e=>updateField('proximoPasso',e.target.value)}
            placeholder="Ex: Ligar quinta às 14h..."
            style={{ width:'100%', padding:'12px', borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:12, outline:'none', fontFamily:'inherit', resize:'none', height:68, boxSizing:'border-box', background:C.white, marginBottom:8 }} />
          <button onClick={e=>updateField('proximoPasso',e.target.previousElementSibling.value)} style={{ width:'100%', padding:'11px', borderRadius:10, background:C.navyMid, color:C.white, border:'none', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
            💾 Salvar próximo passo
          </button>
        </div>
      </div>
    </div>
  );
}

// ── BACKUP ────────────────────────────────────────────────────────────────
function Backup({ leads, setLeads }) {
  const [importando, setImportando] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef();

  function importarJSON(e) {
    const file = e.target.files[0]; if (!file) return;
    setImportando(true);
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        const importedLeads = data.leads || data;
        if (!Array.isArray(importedLeads)) throw new Error('Formato inválido');
        setLeads(importedLeads);
        setMsg(`✅ ${importedLeads.length} leads restaurados com sucesso!`);
      } catch {
        setMsg('❌ Arquivo inválido. Use um backup .json do Sitplan.');
      }
      setImportando(false);
    };
    reader.readAsText(file);
  }

  const ultimoBackup = null; // Could be stored in localStorage

  return (
    <div style={{ flex:1, background:C.silverBg, overflow:'auto' }}>
      <div style={{ background:C.navyMid, padding:'28px 28px 24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:C.gold }} />
          <span style={{ color:C.silverLight, fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:1 }}>Segurança</span>
        </div>
        <div style={{ color:C.white, fontSize:24, fontWeight:800 }}>Backup & Exportação</div>
        <div style={{ color:C.silverLight, fontSize:13, marginTop:2 }}>{leads.length} leads na sua carteira</div>
      </div>

      <div style={{ padding:'20px 24px', maxWidth:640 }}>

        {/* Aviso */}
        <div style={{ background:C.goldLight, border:`1px solid ${C.gold}`, borderRadius:12, padding:'14px 16px', marginBottom:20, display:'flex', gap:12, alignItems:'flex-start' }}>
          <span style={{ fontSize:22 }}>⚠️</span>
          <div>
            <div style={{ fontWeight:700, color:'#7C4A00', fontSize:13, marginBottom:2 }}>Faça backup regularmente</div>
            <div style={{ color:'#7C6200', fontSize:12, lineHeight:1.6 }}>Os dados ficam salvos no seu navegador. Se limpar o cache ou trocar de dispositivo, pode perder tudo. Exporte toda semana para garantir segurança.</div>
          </div>
        </div>

        {msg && (
          <div style={{ background: msg.startsWith('✅') ? C.successBg : C.dangerBg, border:`1px solid ${msg.startsWith('✅')?'#A8DFC5':'#FFBABA'}`, borderRadius:10, padding:'12px 16px', marginBottom:16, fontSize:13, fontWeight:600, color: msg.startsWith('✅') ? C.success : C.danger }}>
            {msg}
          </div>
        )}

        {/* Exportar CSV */}
        <SectionTitle>Exportar Planilha</SectionTitle>
        <Card style={{ padding:'20px', marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
            <div style={{ width:48, height:48, background:'#E8F8F0', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>📊</div>
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:C.text }}>Exportar CSV (Excel)</div>
              <div style={{ fontSize:12, color:C.textLight, marginTop:2 }}>Abre no Excel, Google Sheets, Numbers</div>
            </div>
          </div>
          <div style={{ fontSize:12, color:C.textMid, marginBottom:14, lineHeight:1.6 }}>
            Inclui: <strong>Nome, Telefone, Indicado por, Segmento, Status, Potencial, Seguro, Próximo Passo, Último Contato, Histórico de tentativas</strong>
          </div>
          <button onClick={() => exportarCSV(leads)} style={{ width:'100%', padding:'13px', borderRadius:10, background:C.success, color:C.white, border:'none', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
            ⬇️ Baixar Planilha CSV -- {leads.length} leads
          </button>
        </Card>

        {/* Exportar JSON */}
        <SectionTitle>Backup Completo</SectionTitle>
        <Card style={{ padding:'20px', marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
            <div style={{ width:48, height:48, background:'#EFF4FF', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>🔒</div>
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:C.text }}>Backup JSON (Completo)</div>
              <div style={{ fontSize:12, color:C.textLight, marginTop:2 }}>Inclui histórico completo -- pode ser restaurado</div>
            </div>
          </div>
          <div style={{ fontSize:12, color:C.textMid, marginBottom:14, lineHeight:1.6 }}>
            Salva <strong>100% dos dados</strong> incluindo todo o histórico de contatos. Use para restaurar o app em outro dispositivo.
          </div>
          <button onClick={() => exportarJSON(leads)} style={{ width:'100%', padding:'13px', borderRadius:10, background:C.navyMid, color:C.white, border:'none', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
            ⬇️ Baixar Backup Completo (.json)
          </button>
        </Card>

        {/* Importar */}
        <SectionTitle>Restaurar Backup</SectionTitle>
        <Card style={{ padding:'20px', marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
            <div style={{ width:48, height:48, background:'#FFF8E6', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>📂</div>
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:C.text }}>Importar Backup</div>
              <div style={{ fontSize:12, color:C.textLight, marginTop:2 }}>Restaure seus dados de um backup .json</div>
            </div>
          </div>
          <div style={{ background:'#FFF0F0', border:`1px solid #FFBABA`, borderRadius:8, padding:'10px 12px', marginBottom:14, fontSize:12, color:C.danger }}>
            ⚠️ Isso vai <strong>substituir todos os dados atuais</strong>. Faça um backup antes de importar.
          </div>
          <input ref={fileRef} type="file" accept=".json" onChange={importarJSON} style={{ display:'none' }} />
          <button onClick={() => fileRef.current.click()} disabled={importando} style={{ width:'100%', padding:'13px', borderRadius:10, background:C.gold, color:C.navy, border:'none', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', opacity:importando?0.7:1 }}>
            {importando ? '⏳ Importando...' : '📂 Selecionar arquivo .json'}
          </button>
        </Card>

        {/* Dicas */}
        <SectionTitle>Boas Práticas</SectionTitle>
        <Card style={{ padding:'16px' }}>
          {[
            { icon:'📅', texto:'Exporte toda segunda-feira antes de começar a semana' },
            { icon:'☁️', texto:'Salve o CSV no Google Drive para acesso de qualquer lugar' },
            { icon:'📱', texto:'Envie o backup por WhatsApp para você mesmo como segurança extra' },
            { icon:'🔄', texto:'Após atualizar muitos leads, faça um backup imediato' },
          ].map((d,i) => (
            <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom: i<3?12:0 }}>
              <span style={{ fontSize:18, flexShrink:0 }}>{d.icon}</span>
              <span style={{ fontSize:13, color:C.textMid, lineHeight:1.5 }}>{d.texto}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────
export default function App() {
  const [tela, setTela] = useState('hoje');
  const [leadSel, setLeadSel] = useState(null);
  const [leads, setLeads] = useState(() => { try { const s = localStorage.getItem("sitplan_v3"); return s ? JSON.parse(s) : LEADS_INICIAIS; } catch { return LEADS_INICIAIS; } });
  // Auto-save to localStorage
  useEffect(() => {
    try { localStorage.setItem("sitplan_v3", JSON.stringify(leads)); } catch {}
  }, [leads]);

  function addLead(form) {
    setLeads(p=>[{...form,id:Date.now(),status:'novo',proximoPasso:'',historico:[],dataContato:new Date().toISOString().split('T')[0]},...p]);
  }

  return (
    <div style={{ height:'100vh', display:'flex', fontFamily:"'DM Sans', sans-serif", overflow:'hidden', background:C.navy }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <Sidebar tela={tela} setTela={setTela} leads={leads} />
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {tela==='hoje'          && <Hoje leads={leads} setTela={setTela} setLeadSel={setLeadSel} />}
        {tela==='leads'         && <LeadsList leads={leads} setTela={setTela} setLeadSel={setLeadSel} />}
        {tela==='alertas'       && <Alertas leads={leads} setTela={setTela} setLeadSel={setLeadSel} />}
        {tela==='recomendantes' && <Recomendantes leads={leads} setTela={setTela} setLeadSel={setLeadSel} />}
        {tela==='metas'         && <Metas leads={leads} />}
        {tela==='backup'        && <Backup leads={leads} setLeads={setLeads} />}
        {tela==='novo'          && <NovoLead setTela={setTela} onSave={addLead} />}
        {tela==='detalhe' && leadSel && <Detalhe lead={leadSel} setTela={setTela} leads={leads} setLeads={setLeads} />}
      </div>
    </div>
  );
}
