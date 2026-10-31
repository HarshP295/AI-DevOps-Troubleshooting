import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import SearchBar from './components/SearchBar';
import ResultsDisplay from './components/ResultsDisplay';
import { IncidentsPage, RunbooksPage, EvalPage, SettingsPage } from './components/Pages';

const PAGE_TITLES = {
  Query: { title: 'AI Query', subtitle: 'Root-Cause Analysis' },
  Incidents: { title: 'Incidents', subtitle: 'Indexed Reports' },
  Runbooks: { title: 'Runbooks', subtitle: 'Operational Playbooks' },
  Eval: { title: 'Evaluation', subtitle: 'Retrieval Accuracy' },
  Settings: { title: 'Settings', subtitle: 'Pipeline Configuration' },
};

function App() {
  const [activePage, setActivePage] = useState('Query');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [queryCount, setQueryCount] = useState(0);
  const [pendingQuery, setPendingQuery] = useState('');

  const handleSearch = async (searchQuery) => {
    setCurrentQuery(searchQuery);
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('http://localhost:8081/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: searchQuery }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setResponse(data);
      setQueryCount(c => c + 1);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend.');
    } finally {
      setIsLoading(false);
    }
  };

  // When user clicks a suggestion from the no-match state
  const handleSuggestionClick = (q) => {
    setPendingQuery(q);
    handleSearch(q);
  };

  const pt = PAGE_TITLES[activePage] || PAGE_TITLES.Query;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0D1117' }}>
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>

        {/* Top Bar */}
        <header style={{
          height: '56px', borderBottom: '1px solid #21262D', background: '#0D1117',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px', flexShrink: 0, position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: '#8B949E' }}>{pt.title}</span>
            <span style={{ fontSize: '14px', color: '#30363D' }}>/</span>
            <span style={{ fontSize: '14px', color: '#E6EDF3', fontWeight: '500' }}>{pt.subtitle}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {queryCount > 0 && activePage === 'Query' && (
              <span style={{ fontSize: '12px', color: '#484F58', fontFamily: 'JetBrains Mono, monospace' }}>
                {queryCount} {queryCount === 1 ? 'query' : 'queries'} this session
              </span>
            )}
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #6639BA, #2F81F7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: '600', color: 'white', cursor: 'pointer',
            }}>U</div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '40px 48px', maxWidth: '960px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>

          {/* ── QUERY PAGE ── */}
          {activePage === 'Query' && (
            <>
              {!response && !isLoading && (
                <div style={{ marginBottom: '40px' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(47,129,247,0.1)', border: '1px solid rgba(47,129,247,0.2)',
                    borderRadius: '20px', padding: '4px 12px', marginBottom: '20px',
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2F81F7', display: 'inline-block' }} className="pulse-dot" />
                    <span style={{ fontSize: '12px', color: '#2F81F7', fontWeight: '500' }}>AI-Powered · Local · Private</span>
                  </div>
                  <h1 style={{
                    fontSize: '32px', fontWeight: '700', color: '#E6EDF3',
                    lineHeight: '1.25', margin: '0 0 12px',
                    background: 'linear-gradient(135deg, #E6EDF3 60%, #8B949E)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>
                    Ask your infrastructure<br />why it's broken.
                  </h1>
                  <p style={{ fontSize: '15px', color: '#8B949E', margin: 0, lineHeight: '1.6' }}>
                    Query your incident history, runbooks, and deployment logs using natural language.
                    Powered by pgvector retrieval and local LLM synthesis.
                  </p>
                </div>
              )}

              {(response || isLoading) && currentQuery && (
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '12px', color: '#484F58', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Query</p>
                  <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#E6EDF3', margin: 0, lineHeight: '1.4' }}>
                    "{currentQuery}"
                  </h2>
                </div>
              )}

              <SearchBar onSubmit={handleSearch} isLoading={isLoading} initialValue={pendingQuery} />

              {error && (
                <div style={{
                  marginTop: '24px', padding: '16px 20px', borderRadius: '10px',
                  background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.25)',
                  display: 'flex', gap: '12px', alignItems: 'flex-start',
                }} className="fade-in-up">
                  <span style={{ fontSize: '18px' }}>⚠️</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#F85149', marginBottom: '2px' }}>Connection Error</div>
                    <div style={{ fontSize: '13px', color: '#8B949E' }}>{error}</div>
                  </div>
                </div>
              )}

              <ResultsDisplay
                response={response}
                isLoading={isLoading}
                query={currentQuery}
                onQueryClick={handleSuggestionClick}
              />
            </>
          )}

          {/* ── OTHER PAGES ── */}
          {activePage === 'Incidents' && <IncidentsPage />}
          {activePage === 'Runbooks' && <RunbooksPage />}
          {activePage === 'Eval' && <EvalPage />}
          {activePage === 'Settings' && <SettingsPage />}
        </main>

        {/* Footer */}
        <footer style={{ padding: '16px 48px', borderTop: '1px solid #21262D', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#484F58' }}>OpsCore AI · RAG Pipeline · pgvector + llama3.2</span>
          <span style={{ fontSize: '12px', color: '#484F58', fontFamily: 'JetBrains Mono, monospace' }}>v1.0.0</span>
        </footer>
      </div>
    </div>
  );
}

export default App;
