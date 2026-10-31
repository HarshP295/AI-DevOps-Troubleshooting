import React, { useState, useRef } from 'react';

const SEVERITY_COLORS = {
  'P1': { bg: 'rgba(248,81,73,0.12)', color: '#F85149', border: 'rgba(248,81,73,0.3)' },
  'P2': { bg: 'rgba(210,153,34,0.12)', color: '#D29922', border: 'rgba(210,153,34,0.3)' },
  'P3': { bg: 'rgba(47,129,247,0.12)', color: '#2F81F7', border: 'rgba(47,129,247,0.3)' },
};

const STATUS_COLORS = {
  'Resolved': { bg: 'rgba(63,185,80,0.12)', color: '#3FB950', border: 'rgba(63,185,80,0.3)' },
  'Open': { bg: 'rgba(248,81,73,0.12)', color: '#F85149', border: 'rgba(248,81,73,0.3)' },
  'Investigating': { bg: 'rgba(210,153,34,0.12)', color: '#D29922', border: 'rgba(210,153,34,0.3)' },
};

const INCIDENTS = [
  { id: 'INC-4801', title: 'Auth Token Expiry Failures', service: 'AuthService', severity: 'P2', status: 'Resolved', date: '2026-08-02', file: 'INC-4801.md' },
  { id: 'INC-4805', title: 'OrderService Duplicate Transactions', service: 'OrderService', severity: 'P1', status: 'Resolved', date: '2026-08-04', file: 'INC-4805.md' },
  { id: 'INC-4810', title: 'InventoryService Race Condition', service: 'InventoryService', severity: 'P2', status: 'Resolved', date: '2026-08-06', file: 'INC-4810.md' },
  { id: 'INC-4812', title: 'NotificationService Email Failures', service: 'NotificationService', severity: 'P3', status: 'Resolved', date: '2026-08-07', file: 'INC-4812.md' },
  { id: 'INC-4815', title: 'ShippingService API Timeout', service: 'ShippingService', severity: 'P2', status: 'Resolved', date: '2026-08-10', file: 'INC-4815.md' },
  { id: 'INC-4818', title: 'RecommendationService Memory Leak', service: 'RecommendationService', severity: 'P1', status: 'Resolved', date: '2026-08-12', file: 'INC-4818.md' },
  { id: 'INC-4821', title: 'PaymentService Connection Pool Exhaustion', service: 'PaymentService', severity: 'P1', status: 'Resolved', date: '2026-08-14', file: 'INC-4821.md' },
  { id: 'INC-4825', title: 'CheckoutService Cart Corruption', service: 'CheckoutService', severity: 'P2', status: 'Investigating', date: '2026-08-16', file: 'INC-4825.md' },
];

function Badge({ label, colorMap }) {
  const s = colorMap[label] || { bg: '#21262D', color: '#8B949E', border: '#30363D' };
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: '5px', padding: '2px 9px', fontSize: '11px', fontWeight: '600',
    }}>
      {label}
    </span>
  );
}

function UploadButton({ label = 'Upload File', onFile }) {
  const ref = useRef();
  const [uploaded, setUploaded] = useState(null);

  const handleChange = (e) => {
    const f = e.target.files[0];
    if (f) { setUploaded(f.name); onFile && onFile(f); }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <input ref={ref} type="file" style={{ display: 'none' }} onChange={handleChange} />
      <button
        onClick={() => ref.current.click()}
        style={{
          background: 'linear-gradient(135deg, #2F81F7, #1F6FEB)', color: 'white',
          border: 'none', borderRadius: '6px', padding: '8px 18px', fontSize: '13px',
          fontWeight: '500', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          display: 'flex', alignItems: 'center', gap: '6px',
          boxShadow: '0 1px 6px rgba(47,129,247,0.35)',
        }}
      >
        <span>↑</span> {label}
      </button>
      {uploaded && (
        <span style={{ fontSize: '12px', color: '#3FB950', fontFamily: 'JetBrains Mono, monospace' }}>
          ✓ {uploaded}
        </span>
      )}
    </div>
  );
}

export function IncidentsPage() {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#E6EDF3', margin: '0 0 6px' }}>Incident Reports</h2>
          <p style={{ fontSize: '14px', color: '#8B949E', margin: 0 }}>
            {INCIDENTS.length} incidents indexed · Semantic search enabled
          </p>
        </div>
        <UploadButton label="Upload Incident" onFile={(f) => setUploadedFiles(p => [...p, f.name])} />
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { label: 'Total', value: INCIDENTS.length, color: '#8B949E' },
          { label: 'P1', value: INCIDENTS.filter(i => i.severity === 'P1').length, color: '#F85149' },
          { label: 'P2', value: INCIDENTS.filter(i => i.severity === 'P2').length, color: '#D29922' },
          { label: 'Resolved', value: INCIDENTS.filter(i => i.status === 'Resolved').length, color: '#3FB950' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: '#161B22', border: '1px solid #30363D', borderRadius: '8px',
            padding: '12px 18px', minWidth: '90px',
          }}>
            <div style={{ fontSize: '22px', fontWeight: '700', color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '12px', color: '#484F58', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ borderRadius: '10px', border: '1px solid #30363D', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Inter, sans-serif' }}>
          <thead>
            <tr style={{ background: '#161B22', borderBottom: '1px solid #30363D' }}>
              {['Incident ID', 'Title', 'Service', 'Severity', 'Status', 'Date'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: '#484F58', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {INCIDENTS.map((inc, i) => (
              <tr key={inc.id} style={{ borderBottom: i < INCIDENTS.length - 1 ? '1px solid #21262D' : 'none', background: i % 2 === 0 ? '#0D1117' : 'transparent', transition: 'background 0.15s', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#161B22'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#0D1117' : 'transparent'}
              >
                <td style={{ padding: '14px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: '#2F81F7', fontWeight: '500' }}>{inc.id}</td>
                <td style={{ padding: '14px 16px', fontSize: '14px', color: '#E6EDF3' }}>{inc.title}</td>
                <td style={{ padding: '14px 16px', fontSize: '13px', color: '#8B949E', fontFamily: 'JetBrains Mono, monospace' }}>{inc.service}</td>
                <td style={{ padding: '14px 16px' }}><Badge label={inc.severity} colorMap={SEVERITY_COLORS} /></td>
                <td style={{ padding: '14px 16px' }}><Badge label={inc.status} colorMap={STATUS_COLORS} /></td>
                <td style={{ padding: '14px 16px', fontSize: '13px', color: '#484F58', fontFamily: 'JetBrains Mono, monospace' }}>{inc.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {uploadedFiles.length > 0 && (
        <div style={{ marginTop: '16px', padding: '14px 18px', borderRadius: '8px', background: 'rgba(63,185,80,0.08)', border: '1px solid rgba(63,185,80,0.2)' }}>
          <p style={{ fontSize: '12px', color: '#3FB950', margin: '0 0 6px', fontWeight: '600' }}>Uploaded (pending ingestion)</p>
          {uploadedFiles.map(f => <p key={f} style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: '#8B949E', margin: '2px 0' }}>· {f}</p>)}
        </div>
      )}
    </div>
  );
}

const RUNBOOKS = [
  { name: 'payment-runbook.md', title: 'Payment Service Runbook', tags: ['HikariPool', 'Connection Pool', 'PostgreSQL'], updated: '2026-08-14' },
  { name: 'auth-runbook.md', title: 'Auth Service Runbook', tags: ['JWT', 'Token Expiry', 'Redis'], updated: '2026-08-02' },
  { name: 'inventory-runbook.md', title: 'Inventory Service Runbook', tags: ['Race Condition', 'Locking', 'Stock'], updated: '2026-08-06' },
  { name: 'order-runbook.md', title: 'Order Service Runbook', tags: ['Idempotency', 'Duplicate Orders'], updated: '2026-08-04' },
  { name: 'notification-runbook.md', title: 'Notification Service Runbook', tags: ['SMTP', 'Email', 'Queuing'], updated: '2026-08-07' },
  { name: 'shipping-runbook.md', title: 'Shipping Service Runbook', tags: ['API Timeout', 'Third-party'], updated: '2026-08-10' },
  { name: 'general-incident-response.md', title: 'General Incident Response', tags: ['On-Call', 'SLA', 'Escalation'], updated: '2026-07-01' },
  { name: 'on-call-escalation.md', title: 'On-Call Escalation Playbook', tags: ['Paging', 'War Room', 'Escalation'], updated: '2026-07-01' },
];

export function RunbooksPage() {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#E6EDF3', margin: '0 0 6px' }}>Runbooks</h2>
          <p style={{ fontSize: '14px', color: '#8B949E', margin: 0 }}>{RUNBOOKS.length} runbooks indexed · Searchable via AI Query</p>
        </div>
        <UploadButton label="Upload Runbook" onFile={(f) => setUploadedFiles(p => [...p, f.name])} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
        {RUNBOOKS.map((rb) => (
          <div key={rb.name} style={{
            background: '#161B22', border: '1px solid #30363D', borderRadius: '10px', padding: '18px',
            cursor: 'pointer', transition: 'border-color 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#2F81F7'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#30363D'}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '22px', lineHeight: 1 }}>📋</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#E6EDF3', marginBottom: '2px' }}>{rb.title}</div>
                <div style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: '#484F58' }}>{rb.name}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
              {rb.tags.map(t => (
                <span key={t} style={{ background: '#21262D', color: '#8B949E', border: '1px solid #30363D', borderRadius: '4px', padding: '2px 8px', fontSize: '11px' }}>
                  {t}
                </span>
              ))}
            </div>
            <div style={{ fontSize: '11px', color: '#484F58' }}>Updated: {rb.updated}</div>
          </div>
        ))}
      </div>

      {uploadedFiles.length > 0 && (
        <div style={{ marginTop: '16px', padding: '14px 18px', borderRadius: '8px', background: 'rgba(63,185,80,0.08)', border: '1px solid rgba(63,185,80,0.2)' }}>
          <p style={{ fontSize: '12px', color: '#3FB950', margin: '0 0 6px', fontWeight: '600' }}>Uploaded (pending ingestion)</p>
          {uploadedFiles.map(f => <p key={f} style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: '#8B949E', margin: '2px 0' }}>· {f}</p>)}
        </div>
      )}
    </div>
  );
}

export function EvalPage() {
  const EVAL_DETAILS = [
    { query: 'Why is PaymentService returning 503?', expected: 'INC-4821.md', passed: true },
    { query: 'What caused the connection pool exhaustion?', expected: 'INC-4821.md', passed: true },
    { query: 'How do I troubleshoot HikariPool connection errors?', expected: 'payment-runbook.md', passed: true },
    { query: 'We are seeing optimistic locking failure for SKU-992', expected: 'INC-4810.md', passed: false },
    { query: 'Bro the checkout button is making folks buy the same thing twice!', expected: 'INC-4805.md', passed: true },
    { query: 'What exact property do I change to fix HikariPool starvation?', expected: 'payment-runbook.md', passed: true },
    { query: 'People keep complaining they can\'t get into their accounts.', expected: 'INC-4801.md', passed: true },
  ];

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#E6EDF3', margin: '0 0 6px' }}>Evaluation Suite</h2>
        <p style={{ fontSize: '14px', color: '#8B949E', margin: 0 }}>Top-3 retrieval accuracy against 23 hand-labeled queries</p>
      </div>

      {/* Score card */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '28px', flexWrap: 'wrap' }}>
        {[
          { label: 'Accuracy', value: '95.65%', color: '#3FB950', sub: 'Top-3 match' },
          { label: 'Total Queries', value: '23', color: '#2F81F7', sub: 'eval-set.json' },
          { label: 'Passed', value: '22', color: '#3FB950', sub: 'correct retrieval' },
          { label: 'Failed', value: '1', color: '#F85149', sub: 'SKU-992 edge case' },
        ].map(s => (
          <div key={s.label} style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: '10px', padding: '16px 24px', minWidth: '140px' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: s.color, fontFamily: 'JetBrains Mono, monospace' }}>{s.value}</div>
            <div style={{ fontSize: '13px', color: '#E6EDF3', fontWeight: '600', marginTop: '2px' }}>{s.label}</div>
            <div style={{ fontSize: '11px', color: '#484F58', marginTop: '2px' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Results table */}
      <div style={{ borderRadius: '10px', border: '1px solid #30363D', overflow: 'hidden', marginBottom: '16px' }}>
        <div style={{ padding: '12px 18px', background: '#161B22', borderBottom: '1px solid #30363D', fontSize: '12px', color: '#484F58', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Sample Results
        </div>
        {EVAL_DETAILS.map((d, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px',
            borderBottom: i < EVAL_DETAILS.length - 1 ? '1px solid #21262D' : 'none',
            background: i % 2 === 0 ? '#0D1117' : 'transparent',
          }}>
            <span style={{ fontSize: '16px', flexShrink: 0 }}>{d.passed ? '✅' : '❌'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', color: '#E6EDF3', marginBottom: '2px' }}>{d.query}</div>
              <div style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#484F58' }}>Expected: {d.expected}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '14px 18px', borderRadius: '8px', background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.2)' }}>
        <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '600', color: '#F85149' }}>Known Failure: SKU-992 Query</p>
        <p style={{ margin: 0, fontSize: '13px', color: '#8B949E', lineHeight: '1.6' }}>
          The raw log file <code style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#C9D1D9' }}>log-20260806-0915.md</code> had higher cosine similarity than <code style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#C9D1D9' }}>INC-4810.md</code> due to literal text overlap. Mitigable with doc-type re-ranking.
        </p>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const [threshold, setThreshold] = useState('0.50');
  const [topK, setTopK] = useState('5');
  const [saved, setSaved] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const Field = ({ label, value, onChange, hint }) => (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#E6EDF3', marginBottom: '6px' }}>{label}</label>
      <input
        value={value} onChange={e => onChange(e.target.value)}
        style={{
          width: '200px', background: '#0D1117', border: '1px solid #30363D', borderRadius: '6px',
          padding: '8px 12px', fontSize: '14px', color: '#E6EDF3', fontFamily: 'JetBrains Mono, monospace', outline: 'none',
        }}
        onFocus={e => e.target.style.borderColor = '#2F81F7'}
        onBlur={e => e.target.style.borderColor = '#30363D'}
      />
      <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#484F58' }}>{hint}</p>
    </div>
  );

  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#E6EDF3', margin: '0 0 6px' }}>Settings</h2>
      <p style={{ fontSize: '14px', color: '#8B949E', margin: '0 0 32px' }}>Configure the retrieval pipeline and AI synthesis behavior.</p>

      <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: '10px', padding: '24px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#E6EDF3', margin: '0 0 20px', paddingBottom: '12px', borderBottom: '1px solid #21262D' }}>Retrieval Settings</h3>
        <Field label="Grounding Threshold" value={threshold} onChange={setThreshold} hint="Minimum cosine similarity score (0.0–1.0) required to consider a query grounded. Below this, the AI will return 'no match'." />
        <Field label="Top-K Results" value={topK} onChange={setTopK} hint="Number of document chunks retrieved per query. Higher values increase recall but may slow synthesis." />
      </div>

      <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: '10px', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#E6EDF3', margin: '0 0 20px', paddingBottom: '12px', borderBottom: '1px solid #21262D' }}>Stack Info</h3>
        {[
          { key: 'Embedding Model', val: 'nomic-embed-text (768-dim)' },
          { key: 'Synthesis Model', val: 'llama3.2 via Ollama' },
          { key: 'Vector Store', val: 'PostgreSQL + pgvector' },
          { key: 'Backend', val: 'Spring Boot 3.3.4, Java 17' },
          { key: 'Chunks Indexed', val: '76' },
        ].map(r => (
          <div key={r.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #21262D' }}>
            <span style={{ fontSize: '13px', color: '#8B949E' }}>{r.key}</span>
            <span style={{ fontSize: '13px', fontFamily: 'JetBrains Mono, monospace', color: '#C9D1D9' }}>{r.val}</span>
          </div>
        ))}
      </div>

      <button onClick={handleSave} style={{
        background: saved ? 'rgba(63,185,80,0.15)' : 'linear-gradient(135deg, #2F81F7, #1F6FEB)',
        color: saved ? '#3FB950' : 'white', border: saved ? '1px solid rgba(63,185,80,0.3)' : 'none',
        borderRadius: '6px', padding: '10px 24px', fontSize: '14px', fontWeight: '500',
        cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
      }}>
        {saved ? '✓ Saved' : 'Save Changes'}
      </button>
    </div>
  );
}
