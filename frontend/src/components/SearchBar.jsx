import React, { useState, useRef, useEffect } from 'react';

export default function SearchBar({ onSubmit, isLoading }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  const SUGGESTIONS = [
    'Why is PaymentService returning 503?',
    'What caused the connection pool exhaustion?',
    'How do I troubleshoot HikariPool errors?',
    'What changed in deployment 827?',
  ];

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

  const handleSuggestion = (text) => {
    setQuery(text);
    inputRef.current?.focus();
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
            background: '#161B22', borderRadius: focused ? '9px' : '9px',
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

      {/* Suggestions */}
      {!isLoading && !query && (
        <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#484F58', alignSelf: 'center', marginRight: '4px' }}>Try:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSuggestion(s)}
              style={{
                background: '#161B22', border: '1px solid #30363D', borderRadius: '20px',
                padding: '4px 12px', fontSize: '12px', color: '#8B949E',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={e => { e.target.style.borderColor = '#2F81F7'; e.target.style.color = '#2F81F7'; }}
              onMouseLeave={e => { e.target.style.borderColor = '#30363D'; e.target.style.color = '#8B949E'; }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
