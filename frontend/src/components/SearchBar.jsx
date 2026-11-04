import React, { useState, useRef, useEffect } from 'react';

const EXAMPLE_QUESTIONS = [
  'Why is PaymentService returning 503?',
  'People keep complaining they can’t get into their accounts.',
  'How do I troubleshoot HikariPool connection errors?',
];

export default function SearchBar({ onSubmit, isLoading, initialValue, hasResponse }) {
  const [query, setQuery] = useState(initialValue || '');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (initialValue !== undefined && initialValue !== null && initialValue !== '') {
      setQuery(initialValue);
    }
  }, [initialValue]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (query.trim() && !isLoading) {
      onSubmit(query.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleExampleClick = (text) => {
    if (isLoading) return;
    setQuery(text);
    onSubmit(text);
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Search wrapper with animated gradient border */}
      <div
        className={focused ? 'gradient-border glow-accent' : ''}
        style={{
          borderRadius: '10px',
          border: focused ? 'none' : '1px solid #30363D',
          transition: 'box-shadow 0.3s',
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            background: '#161B22', borderRadius: '9px',
            padding: '14px 16px',
          }}
        >
          {/* Search icon */}
          <svg width="18" height="18" fill="none" stroke="#484F58" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Describe the incident or ask a question..."
            disabled={isLoading}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontSize: '15px', color: '#E6EDF3', fontFamily: 'Inter, sans-serif',
            }}
          />

          {/* Loading indicator */}
          {isLoading && (
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: '5px', height: '5px', borderRadius: '50%',
                  background: '#2F81F7', display: 'inline-block',
                  animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite`
                }} />
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            style={{
              background: isLoading || !query.trim() ? '#21262D' : 'linear-gradient(135deg, #2F81F7, #1F6FEB)',
              color: isLoading || !query.trim() ? '#484F58' : 'white',
              border: 'none', borderRadius: '6px', padding: '8px 18px',
              fontSize: '14px', fontWeight: '500', cursor: isLoading || !query.trim() ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif', flexShrink: 0,
              transition: 'all 0.2s', boxShadow: isLoading || !query.trim() ? 'none' : '0 1px 6px rgba(47,129,247,0.4)',
            }}
          >
            {isLoading ? 'Analyzing...' : 'Ask AI →'}
          </button>
        </form>
      </div>

      {/* Example questions */}
      {!hasResponse && (
        <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {EXAMPLE_QUESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleExampleClick(s)}
              disabled={isLoading}
              style={{
                background: '#161B22',
                border: '1px solid #21262D',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '12px',
                fontFamily: 'JetBrains Mono, monospace',
                color: '#8B949E',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'border-color 0.15s, color 0.15s, background-color 0.15s',
              }}
              onMouseEnter={e => {
                if (!isLoading) {
                  e.currentTarget.style.borderColor = '#30363D';
                  e.currentTarget.style.color = '#E6EDF3';
                  e.currentTarget.style.background = '#21262D';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#21262D';
                e.currentTarget.style.color = '#8B949E';
                e.currentTarget.style.background = '#161B22';
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
