import React from 'react';

export function Phone({ children }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#1B3A6B',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'DM Sans', sans-serif",
      maxWidth: 480,
      margin: '0 auto',
    }}>
      {children}
    </div>
  );
}

export function Header({ title, subtitle, onBack }) {
  return (
    <div style={{ background: '#1B3A6B', padding: '48px 20px 18px', flexShrink: 0 }}>
      {onBack && (
        <button onClick={onBack} style={{
          background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8,
          color: '#fff', fontSize: 13, fontWeight: 700, padding: '6px 12px',
          cursor: 'pointer', marginBottom: 10, fontFamily: 'inherit'
        }}>← Voltar</button>
      )}
      <div style={{ fontWeight: 800, fontSize: 22, color: '#fff', letterSpacing: -0.5 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, color: '#93C5FD', marginTop: 3 }}>{subtitle}</div>}
    </div>
  );
}

export function ScrollArea({ children }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 90px', background: '#F8FAFC' }}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, style }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 800, color: '#94A3B8',
      textTransform: 'uppercase', letterSpacing: 1,
      marginBottom: 10, marginTop: 4, ...style
    }}>
      {children}
    </div>
  );
}

export function BottomNav({ tela, setTela }) {
  const items = [
    { id: 'hoje',  icon: '🏠', label: 'Hoje' },
    { id: 'leads', icon: '👥', label: 'Leads' },
    { id: 'novo',  icon: '➕', label: 'Novo' },
  ];
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 480,
      background: '#fff', borderTop: '1px solid #E2E8F0',
      display: 'flex', boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
      zIndex: 100,
    }}>
      {items.map(item => {
        const ativo = tela === item.id;
        return (
          <button key={item.id} onClick={() => setTela(item.id)} style={{
            flex: 1, padding: '10px 0 14px', background: 'none', border: 'none',
            cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3
          }}>
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <span style={{ fontSize: 10, fontWeight: ativo ? 800 : 500, color: ativo ? '#1B3A6B' : '#94A3B8' }}>
              {item.label}
            </span>
            {ativo && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#1B3A6B' }} />}
          </button>
        );
      })}
    </div>
  );
}

export function Card({ children, onClick, border = '#E2E8F0', bg = '#fff' }) {
  return (
    <div onClick={onClick} style={{
      background: bg, borderRadius: 14, padding: '13px 14px',
      marginBottom: 10, border: `1.5px solid ${border}`,
      cursor: onClick ? 'pointer' : 'default',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
    }}>
      {children}
    </div>
  );
}

export function Btn({ children, onClick, variant = 'primary', style = {} }) {
  const styles = {
    primary:   { background: '#1B3A6B', color: '#fff', border: 'none' },
    secondary: { background: '#F1F5F9', color: '#1E293B', border: '1.5px solid #E2E8F0' },
    success:   { background: '#F0FDF4', color: '#16A34A', border: '1.5px solid #BBF7D0' },
    info:      { background: '#EFF6FF', color: '#2563EB', border: '1.5px solid #BFDBFE' },
  };
  return (
    <button onClick={onClick} style={{
      padding: '12px 16px', borderRadius: 12, fontSize: 13, fontWeight: 700,
      cursor: 'pointer', fontFamily: 'inherit', width: '100%',
      ...styles[variant], ...style
    }}>
      {children}
    </button>
  );
}
