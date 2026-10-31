import React, { useState } from 'react';

function Chip({ label, color = 'accent' }) {
  const styles = {
    accent: { background: 'rgba(47,129,247,0.12)', color: '#2F81F7', border: '1px solid rgba(47,129,247,0.25)' },
    success: { background: 'rgba(63,185,80,0.12)', color: '#3FB950', border: '1px solid rgba(63,185,80,0.25)' },
    warning: { background: 'rgba(210,153,34,0.12)', color: '#D29922', border: '1px solid rgba(210,153,34,0.25)' },
    neutral: { background: '#21262D', color: '#8B949E', border: '1px solid #30363D' },
  };
  const s = styles[color] || styles.accent;
  return (
    <span style={{
      ...s, borderRadius: '5px', padding: '3px 10px',
      fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: '500',
    }}>
      {label}
    </span>
  );
}

function SectionHeader({ icon, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
      {icon && <span style={{ fontSize: '14px' }}>{icon}</span>}
      <span style={{ fontSize: '11px', fontWeight: '700', color: '#8B949E', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {title}
      </span>
      <div style={{ flex: 1, height: '1px', background: '#21262D' }} />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ padding: '24px', borderRadius: '10px', border: '1px solid #30363D', background: '#161B22', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {[70, 90, 55, 80, 40].map((w, i) => (
        <div key={i} className="shimmer" style={{ height: '13px', borderRadius: '4px', width: `${w}%` }} />
      ))}
    </div>
  );
}

const SUGGESTED_QUERIES = [
  'Why is PaymentService returning 503?',
  'What caused the connection pool exhaustion?',
  'How do I troubleshoot HikariPool errors?',
  'What changed in deployment 827?',
  'How do I resolve auth token expiry issues?',
];

export default function ResultsDisplay({ response, isLoading, query, onQueryClick }) {
  const [contextOpen, setContextOpen] = useState(false);

  if (isLoading) {
    return (
      <div style={{ marginTop: '32px' }} className="fade-in-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', padding: '12px 16px', background: 'rgba(47,129,247,0.05)', border: '1px solid rgba(47,129,247,0.15)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[0,1,2].map(i => (
              <span key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2F81F7', animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite`, display: 'inline-block' }} />
            ))}
          </div>
          <span style={{ fontSize: '13px', color: '#8B949E' }}>Searching knowledge base and synthesizing response via llama3.2...</span>
        </div>
        <SkeletonCard />
      </div>
    );
  }

  if (!response) return null;

  // ─── NOT GROUNDED ────────────────────────────────────────────────────────────
  if (!response.grounded) {
    return (
      <div className="fade-in-up" style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Main no-match card */}
        <div style={{
          borderRadius: '10px', border: '1px solid rgba(210,153,34,0.35)',
          background: 'rgba(210,153,34,0.06)', overflow: 'hidden',
        }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(210,153,34,0.15)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>🔍</span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#D29922' }}>No confident match in knowledge base</span>
          </div>

          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div>
              <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#C9D1D9', lineHeight: '1.7' }}>
                The AI was unable to find a document chunk in the knowledge base that meets the minimum cosine similarity threshold for the query:
              </p>
              <div style={{ background: '#0D1117', border: '1px solid #30363D', borderRadius: '6px', padding: '10px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: '#8B949E' }}>
                "{query}"
              </div>
            </div>

            <div>
              <SectionHeader icon="💡" title="What this means" />
              <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  'The query topic is outside the scope of the indexed documentation.',
                  'The phrasing may be too generic or doesn\'t match any document closely enough.',
                  'The cosine similarity threshold (default: 0.50) was not met by any chunk.',
                  'This is expected and correct behavior — the system is preventing hallucination.',
                ].map((item, i) => (
                  <li key={i} style={{ fontSize: '13px', color: '#8B949E', lineHeight: '1.65' }}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <SectionHeader icon="🛠️" title="What you can do" />
              <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  'Rephrase with more technical detail — use service names, error codes, or symptom descriptions.',
                  'Upload and ingest a document that covers this topic via the Runbooks or Incidents page.',
                  'Lower the grounding threshold in Settings if you want broader matches.',
                ].map((item, i) => (
                  <li key={i} style={{ fontSize: '13px', color: '#8B949E', lineHeight: '1.65' }}>{item}</li>
                ))}
              </ul>
            </div>

            <div style={{ paddingTop: '16px', borderTop: '1px solid #21262D' }}>
              <SectionHeader icon="⚡" title="Try a known query instead" />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {SUGGESTED_QUERIES.map(q => (
                  <button key={q} onClick={() => onQueryClick && onQueryClick(q)} style={{
                    background: '#161B22', border: '1px solid #30363D', borderRadius: '20px',
                    padding: '5px 13px', fontSize: '12px', color: '#8B949E',
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    transition: 'border-color 0.15s, color 0.15s',
                  }}
                    onMouseEnter={e => { e.target.style.borderColor = '#2F81F7'; e.target.style.color = '#2F81F7'; }}
                    onMouseLeave={e => { e.target.style.borderColor = '#30363D'; e.target.style.color = '#8B949E'; }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── GROUNDED ────────────────────────────────────────────────────────────────
  const { synthesis, results } = response;
  const truncate = (text, max = 280) => text && text.length > max ? text.slice(0, max) + '...' : text;

  return (
    <div className="fade-in-up" style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Answer Card */}
      <div style={{ borderRadius: '10px', border: '1px solid #30363D', background: '#161B22', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #21262D', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(47,129,247,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3FB950', display: 'inline-block' }} className="pulse-dot" />
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#E6EDF3' }}>AI Root-Cause Analysis</span>
          </div>
          <span style={{ fontSize: '11px', color: '#484F58', fontFamily: 'JetBrains Mono, monospace' }}>
            grounded · {results?.length ?? 0} chunks · pgvector + llama3.2
          </span>
        </div>

        <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Likely Causes */}
          {synthesis?.likelyCauses?.length > 0 && (
            <div>
              <SectionHeader icon="🔴" title="Likely Root Causes" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {synthesis.likelyCauses.map((cause, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: '14px', alignItems: 'flex-start',
                    padding: '14px 16px', background: '#0D1117',
                    border: '1px solid #21262D', borderRadius: '8px',
                  }}>
                    <span style={{
                      minWidth: '22px', height: '22px', borderRadius: '50%', background: 'rgba(248,81,73,0.12)',
                      border: '1px solid rgba(248,81,73,0.3)', color: '#F85149',
                      fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {i + 1}
                    </span>
                    <p style={{ margin: 0, fontSize: '14px', color: '#C9D1D9', lineHeight: '1.7', flex: 1 }}>{cause}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Incident */}
          {synthesis?.relatedIncident && synthesis.relatedIncident.toLowerCase() !== 'null' && (
            <div>
              <SectionHeader icon="🚨" title="Related Incident" />
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: 'rgba(47,129,247,0.05)', border: '1px solid rgba(47,129,247,0.15)', borderRadius: '8px' }}>
                <div style={{
                  background: 'rgba(47,129,247,0.12)', border: '1px solid rgba(47,129,247,0.3)',
                  borderRadius: '6px', padding: '6px 14px',
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', fontWeight: '600', color: '#2F81F7',
                }}>
                  {synthesis.relatedIncident}
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#8B949E' }}>
                  Incident with highest cosine similarity to your query. Check the Incidents page for the full post-mortem.
                </p>
              </div>
            </div>
          )}

          {/* Suggested Investigation */}
          {synthesis?.suggestedInvestigation && (
            <div>
              <SectionHeader icon="🔬" title="Suggested Investigation Steps" />
              <div style={{ padding: '16px 18px', background: '#0D1117', border: '1px solid #21262D', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#C9D1D9', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                  {synthesis.suggestedInvestigation}
                </p>
              </div>
            </div>
          )}

          {/* Sources */}
          {synthesis?.sources?.length > 0 && (
            <div style={{ paddingTop: '20px', borderTop: '1px solid #21262D' }}>
              <SectionHeader icon="📚" title="Knowledge Sources Used" />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[...new Set(synthesis.sources)].map((src, i) => (
                  <Chip key={i} label={src} color="success" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Retrieved Context Accordion */}
      {results?.length > 0 && (
        <div style={{ borderRadius: '10px', border: '1px solid #30363D', background: '#161B22', overflow: 'hidden' }}>
          <button
            onClick={() => setContextOpen(!contextOpen)}
            style={{
              width: '100%', padding: '14px 20px', background: 'none', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer', color: '#8B949E', fontSize: '13px', fontWeight: '500',
              fontFamily: 'Inter, sans-serif',
              borderBottom: contextOpen ? '1px solid #21262D' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📄</span>
              <span>View retrieved context chunks</span>
              <span style={{ background: '#21262D', color: '#8B949E', borderRadius: '20px', padding: '1px 8px', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace' }}>
                {results.length}
              </span>
            </div>
            <span style={{ fontSize: '12px', display: 'inline-block', transform: contextOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
          </button>

          {contextOpen && (
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {results.map((res, idx) => (
                <div key={idx} style={{ borderRadius: '8px', border: '1px solid #21262D', background: '#0D1117', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Chip label={res.sourceFile} color="accent" />
                      <span style={{ fontSize: '11px', color: '#484F58', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' }}>{res.docType}</span>
                      <span style={{ fontSize: '11px', color: '#484F58' }}>chunk #{res.chunkIndex}</span>
                    </div>
                    <div style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#3FB950',
                      background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.2)',
                      borderRadius: '4px', padding: '2px 8px',
                    }}>
                      {res.similarityScore != null ? `${(res.similarityScore * 100).toFixed(1)}% match` : 'N/A'}
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#8B949E', lineHeight: '1.7', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'pre-wrap' }}>
                    {truncate(res.content)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
