import React, { useState, useEffect } from 'react';
import { LEADS_INICIAIS } from './data';
import Hoje from './screens/Hoje';
import Leads from './screens/Leads';
import NovoLead from './screens/NovoLead';
import Detalhe from './screens/Detalhe';

const STORAGE_KEY = 'sitplan_leads';

export default function App() {
  const [tela, setTela] = useState('hoje');
  const [leadSelecionado, setLeadSelecionado] = useState(null);

  const [leads, setLeads] = useState(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY);
      return salvo ? JSON.parse(salvo) : LEADS_INICIAIS;
    } catch {
      return LEADS_INICIAIS;
    }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(leads)); } catch {}
  }, [leads]);

  function adicionarLead(form) {
    const hoje = new Date().toISOString().split('T')[0];
    const novo = { ...form, id: Date.now(), status: 'novo', proximoPasso: '', dataContato: hoje };
    setLeads(prev => [novo, ...prev]);
  }

  function atualizarStatus(id, novoStatus) {
    const hoje = new Date().toISOString().split('T')[0];
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: novoStatus, dataContato: hoje } : l));
    setLeadSelecionado(prev => prev?.id === id ? { ...prev, status: novoStatus, dataContato: hoje } : prev);
  }

  function atualizarPasso(id, passo) {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, proximoPasso: passo } : l));
    setLeadSelecionado(prev => prev?.id === id ? { ...prev, proximoPasso: passo } : prev);
  }

  const leadAtual = leads.find(l => l.id === leadSelecionado?.id) || leadSelecionado;

  if (tela === 'hoje') return <Hoje leads={leads} setTela={setTela} setLeadSelecionado={setLeadSelecionado} />;
  if (tela === 'leads') return <Leads leads={leads} setTela={setTela} setLeadSelecionado={setLeadSelecionado} />;
  if (tela === 'novo') return <NovoLead setTela={setTela} onSalvar={adicionarLead} />;
  if (tela === 'detalhe' && leadAtual) return <Detalhe lead={leadAtual} setTela={setTela} onAtualizarStatus={atualizarStatus} onAtualizarPasso={atualizarPasso} />;

  return null;
}
