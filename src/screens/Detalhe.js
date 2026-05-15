import React, { useState } from 'react';
import { Phone, Header, ScrollArea, SectionTitle, BottomNav, Btn } from '../components/Layout';
import { STATUS_CONFIG, FUNIL_ORDER } from '../data';

export default function Detalhe({ lead, setTela, onAtualizarStatus, onAtualizarPasso }) {
  const [editandoStatus, setEditandoStatus] = useState(false);
  const [passo, setPasso] = useState(lead.proximoPasso || '');
  const s = STATUS_CONFIG[lead.status];

  return (
    <Phone>
      <Header title="Detalhe do Lead" onBack={() => setTela('leads')} />
      <ScrollArea>
        <div style={{ background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 16, padding: '20px 16px', marginBottom: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 42, marginBottom: 8 }}>{s.emoji}</div>
          <div style={{ fontWeight: 800, fontSize: 22, color: '#1E293B' }}>{lead.nome}</div>
          <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>via <strong>{lead.indicadoPor}</strong>{lead.segmento ? ` · ${lead.segmento}` : ''}</div>
          <span style={{ display: 'inline-block', marginTop: 12, fontSize: 13, fontWeight: 700, color: s.color, background: '#fff', padding: '5px 16px', borderRadius: 20, border: `1.5px solid ${s.border}` }}>{s.label}</span>
          {lead.dataContato && <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 10 }}>Último contato: {lead.dataContato}</div>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          <a href={`tel:${lead.telefone}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 12, background: '#EFF6FF', color: '#2563EB', textDecoration: 'none', fontSize: 14, fontWeight: 700, border: '1.5px solid #BFDBFE' }}>📞 Ligar</a>
          <a href={`https://wa.me/55${lead.telefone}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 12, background: '#F0FDF4', color: '#16A34A', textDecoration: 'none', fontSize: 14, fontWeight: 700, border: '1.5px solid #BBF7D0' }}>💬 WhatsApp</a>
        </div>

        <SectionTitle>Atualizar Status</SectionTitle>
        {!editandoStatus ? (
          <button onClick={() => setEditandoStatus(true)} style={{ width: '100%', padding: '13px', borderRadius: 12, border: `2px dashed ${s.border}`, background: s.bg, color: s.color, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 16 }}>
            {s.emoji} {s.label} -- Toque para alterar
          </button>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {FUNIL_ORDER.map(sk => {
              const cfg = STATUS_CONFIG[sk];
              const ativo = lead.status === sk;
              return (
                <button key={sk} onClick={() => { onAtualizarStatus(lead.id, sk); setEditandoStatus(false); }} style={{ padding: '11px 8px', borderRadius: 12, border: `1.5px solid ${ativo ? cfg.color : cfg.border}`, background: ativo ? cfg.bg : '#fff', color: cfg.color, fontSize: 12, fontWeight: ativo ? 800 : 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: ativo ? `0 0 0 2px ${cfg.color}33` : 'none' }}>
                  {cfg.emoji} {cfg.label}
                </button>
              );
            })}
          </div>
        )}

        <SectionTitle>Próximo Passo</SectionTitle>
        <textarea value={passo} onChange={e => setPasso(e.target.value)} placeholder="Ex: Ligar quinta às 14h..."
          style={{ width: '100%', padding: '13px', borderRadius: 12, border: '1.5px solid #E2E8F0', fontSize: 13, outline: 'none', fontFamily: 'inherit', resize: 'none', height: 80, boxSizing: 'border-box', background: '#fff', marginBottom: 10 }} />
        <Btn onClick={() => onAtualizarPasso(lead.id, passo)} variant="secondary">💾 Salvar próximo passo</Btn>
      </ScrollArea>
      <BottomNav tela="leads" setTela={setTela} />
    </Phone>
  );
}
