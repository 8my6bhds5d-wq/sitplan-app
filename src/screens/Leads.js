import React, { useState } from 'react';
import { Phone, Header, ScrollArea, BottomNav, Card } from '../components/Layout';
import { STATUS_CONFIG } from '../data';

export default function Leads({ leads, setTela, setLeadSelecionado }) {
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('todos');

  const contadores = Object.fromEntries(
    Object.keys(STATUS_CONFIG).map(k => [k, leads.filter(l => l.status === k).length])
  );

  const leadsFiltrados = leads.filter(l => {
    const matchBusca = l.nome.toLowerCase().includes(busca.toLowerCase()) ||
                       l.indicadoPor.toLowerCase().includes(busca.toLowerCase()) ||
                       (l.segmento || '').toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtro === 'todos' || l.status === filtro;
    return matchBusca && matchStatus;
  });

  function abrirLead(lead) {
    setLeadSelecionado(lead);
    setTela('detalhe');
  }

  return (
    <Phone>
      <Header title="Leads" subtitle={`${leadsFiltrados.length} de ${leads.length} contatos`} />
      <ScrollArea>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome, indicador..."
            style={{ width: '100%', padding: '11px 12px 11px 38px', borderRadius: 12, border: '1.5px solid #E2E8F0', fontSize: 14, outline: 'none', fontFamily: 'inherit', background: '#fff', boxSizing: 'border-box' }} />
        </div>

        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10, marginBottom: 14, scrollbarWidth: 'none' }}>
          {[
            { k: 'todos', label: 'Todos', color: '#1E293B', bg: '#F1F5F9', border: '#CBD5E1' },
            ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ k, label: `${v.emoji} ${v.label}`, color: v.color, bg: v.bg, border: v.border }))
          ].map(f => (
            <button key={f.k} onClick={() => setFiltro(f.k)} style={{
              whiteSpace: 'nowrap', padding: '6px 13px', borderRadius: 20,
              border: `1.5px solid ${filtro === f.k ? f.color : '#E2E8F0'}`,
              background: filtro === f.k ? f.bg : '#fff',
              color: filtro === f.k ? f.color : '#64748B',
              fontSize: 11, fontWeight: filtro === f.k ? 700 : 500,
              cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0
            }}>
              {f.label} {f.k !== 'todos' ? `(${contadores[f.k] || 0})` : `(${leads.length})`}
            </button>
          ))}
        </div>

        {leadsFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94A3B8', padding: '40px 0', fontSize: 14 }}>Nenhum lead encontrado</div>
        ) : leadsFiltrados.map(lead => {
          const s = STATUS_CONFIG[lead.status];
          return (
            <Card key={lead.id} onClick={() => abrirLead(lead)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, border: `1.5px solid ${s.border}` }}>{s.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1E293B' }}>{lead.nome}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>via <strong style={{ color: '#64748B' }}>{lead.indicadoPor}</strong>{lead.segmento ? ` · ${lead.segmento}` : ''}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: s.color, background: s.bg, padding: '3px 10px', borderRadius: 20, border: `1px solid ${s.border}`, flexShrink: 0 }}>{s.label}</span>
              </div>
            </Card>
          );
        })}
      </ScrollArea>
      <BottomNav tela="leads" setTela={setTela} />
    </Phone>
  );
}
