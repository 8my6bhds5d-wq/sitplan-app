import React from 'react';
import { Phone, Header, ScrollArea, SectionTitle, BottomNav, Card } from '../components/Layout';
import { STATUS_CONFIG } from '../data';

export default function Hoje({ leads, setTela, setLeadSelecionado }) {
  const leadsHoje = leads.filter(l => ['agendado', 'tentativa', 'fechamento'].includes(l.status));
  const contadores = Object.fromEntries(
    Object.keys(STATUS_CONFIG).map(k => [k, leads.filter(l => l.status === k).length])
  );

  function abrirLead(lead) {
    setLeadSelecionado(lead);
    setTela('detalhe');
  }

  return (
    <Phone>
      <Header title="Olá, Rodrigo 👋" subtitle={`${leadsHoje.length} ações para hoje`} />
      <ScrollArea>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
          {[
            { label: 'Total',     val: leads.length,        color: '#1E293B' },
            { label: 'Agendados', val: contadores.agendado, color: '#10B981' },
            { label: 'Clientes',  val: contadores.cliente,  color: '#D97706' },
          ].map(k => (
            <div key={k.label} style={{ background: '#fff', borderRadius: 12, padding: '12px 8px', textAlign: 'center', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: k.color }}>{k.val}</div>
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{k.label}</div>
            </div>
          ))}
        </div>

        <SectionTitle>Ações pendentes hoje</SectionTitle>
        {leadsHoje.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94A3B8', padding: '32px 0', fontSize: 14 }}>Nenhuma ação para hoje 🎉</div>
        ) : leadsHoje.map(lead => {
          const s = STATUS_CONFIG[lead.status];
          return (
            <Card key={lead.id} onClick={() => abrirLead(lead)} border={s.border} bg={s.bg}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, border: `1.5px solid ${s.border}` }}>{s.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#1E293B' }}>{lead.nome}</div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.proximoPasso || lead.segmento}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: s.color, background: '#fff', padding: '2px 8px', borderRadius: 20, border: `1px solid ${s.border}` }}>{s.label}</span>
                  <a href={`tel:${lead.telefone}`} onClick={e => e.stopPropagation()} style={{ fontSize: 12, color: '#2563EB', textDecoration: 'none', fontWeight: 700 }}>📞 Ligar</a>
                </div>
              </div>
            </Card>
          );
        })}

        <SectionTitle style={{ marginTop: 12 }}>Funil de prospecção</SectionTitle>
        <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1.5px solid #E2E8F0' }}>
          {['novo', 'tentativa', 'agendado', 'apresentado', 'fechamento'].map(sk => {
            const cfg = STATUS_CONFIG[sk];
            const count = contadores[sk] || 0;
            const pct = leads.length ? Math.round(count / leads.length * 100) : 0;
            return (
              <div key={sk} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 80, fontSize: 11, color: '#64748B', flexShrink: 0 }}>{cfg.emoji} {cfg.label}</div>
                <div style={{ flex: 1, background: '#F1F5F9', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.max(pct, 2)}%`, height: '100%', background: cfg.color, borderRadius: 99 }} />
                </div>
                <div style={{ width: 24, fontSize: 12, fontWeight: 700, color: '#1E293B', textAlign: 'right' }}>{count}</div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <BottomNav tela="hoje" setTela={setTela} />
    </Phone>
  );
}
  