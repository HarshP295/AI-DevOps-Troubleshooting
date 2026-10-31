import React from 'react';

const NAV_ITEMS = [
  { label: 'Query', icon: '⚡' },
  { label: 'Incidents', icon: '🚨' },
  { label: 'Runbooks', icon: '📋' },
  { label: 'Eval', icon: '📊' },
  { label: 'Settings', icon: '⚙️' },
];

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside
      style={{ background: '#161B22', borderRight: '1px solid #30363D', width: '220px', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0', flexShrink: 0 }}
    >
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #21262D' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #2F81F7, #6639BA)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: '700', color: 'white', flexShrink: 0
          }}>
            O
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#E6EDF3', lineHeight: '1.2' }}>OpsCore AI</div>
            <div style={{ fontSize: '11px', color: '#484F58', lineHeight: '1.2' }}>DevOps Copilot</div>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav style={{ padding: '12px 10px', flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = activePage === item.label;
          return (
            <div
              key={item.label}
              onClick={() => onNavigate(item.label)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', borderRadius: '6px', marginBottom: '2px',
                background: isActive ? 'rgba(47,129,247,0.12)' : 'transparent',
                color: isActive ? '#2F81F7' : '#8B949E',
                cursor: 'pointer', fontSize: '14px', fontWeight: isActive ? '500' : '400',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#21262D'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: '15px' }}>{item.icon}</span>
              {item.label}
            </div>
          );
        })}
      </nav>

      {/* System Status */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid #21262D' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#3FB950' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3FB950', display: 'inline-block' }} className="pulse-dot" />
          All systems operational
        </div>
        <div style={{ marginTop: '4px', fontSize: '11px', color: '#484F58' }}>
          backend:8080 · pgvector · ollama
        </div>
      </div>
    </aside>
  );
}
