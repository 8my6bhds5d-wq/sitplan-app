import React, { useState } from 'react';
import { Phone, Header, ScrollArea, BottomNav, Btn } from '../components/Layout';

export default function NovoLead({ setTela, onSalvar }) {
  const [form, setForm] = useState({ nome: '', indicadoPor: '', segmento: '', telefone: '' });
  const [erro, setErro] = useState('');

  function salvar() {
    if (!form.nome.trim()) { setErro('O nome é obrigatório'); return; }
    onSalvar(form);
    setForm({ nome: '', indicadoPor: '', segmento: '', telefone: '' });
    setErro('');
    setTela('leads');
  }

  const campos = [
    { label: 'Nome *',             key: 'nome',        placeholder: 'Nome completo',             type: 'text' },
    { label: 'Indicado por',       key: 'indicadoPor', placeholder: 'Quem indicou este lead?',   type: 'text' },
    { label: 'Segmento / Negócio', key: 'segmento',    placeholder: 'Ex: Mecânico, Dentista...', type: 'text' },
    { label: 'Telefone',           key: 'telefone',    placeholder: 'DDD + número',              type: 'tel'  },
  ];

  return (
    <Phone>
      <Header title="Novo Lead" subtitle="Preencha o essencial agora" />
      <ScrollArea>
        <div style={{ background: '#EFF6FF', borderRadius: 12, padding: '12px 14px', marginBottom: 20, fontSize: 13, color: '#2563EB', lineHeight: 1.6, border: '1.5px solid #BFDBFE' }}>
          💡 Cadastre rápido e complete o resto depois!
        </div>
        {campos.map(f => (
          <div key={f.key} style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>{f.label}</label>
            <input type={f.type} value={form[f.key]}
              onChange={e => { setForm(p => ({ ...p, [f.key]: e.target.value })); setErro(''); }}
              placeholder={f.placeholder}
              style={{ width: '100%', padding: '13px 14px', borderRadius: 12, border: `1.5px solid ${f.key === 'nome' && erro ? '#EF4444' : '#E2E8F0'}`, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', background: '#fff' }} />
          </div>
        ))}
        {erro && <div style={{ color: '#EF4444', fontSize: 13, marginBottom: 12, fontWeight: 600 }}>⚠️ {erro}</div>}
        <Btn onClick={salvar}>✅ Salvar Lead</Btn>
        <Btn onClick={() => setTela('leads')} variant="secondary" style={{ marginTop: 10 }}>Cancelar</Btn>
      </ScrollArea>
      <BottomNav tela="novo" setTela={setTela} />
    </Phone>
  );
}
