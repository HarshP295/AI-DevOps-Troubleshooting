import React, { useState } from 'react';

export default function SearchBar({ onSubmit, isLoading }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSubmit(query);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask why something broke..."
        disabled={isLoading}
        className="flex-1 bg-transparent border-b border-divider focus:border-accent focus:outline-none py-3 px-2 text-primary placeholder-muted transition-colors disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={isLoading || !query.trim()}
        className="bg-accent text-white px-6 py-3 rounded-md hover:brightness-95 active:brightness-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shrink-0 flex items-center justify-center min-w-[120px]"
      >
        {isLoading ? (
          <span className="animate-pulse opacity-80">Searching...</span>
        ) : (
          "Ask"
        )}
      </button>
    </form>
  );
}
