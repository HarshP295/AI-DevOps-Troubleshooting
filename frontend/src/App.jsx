import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import ResultsDisplay from './components/ResultsDisplay';

function App() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (searchQuery) => {
    setQuery(searchQuery);
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('http://localhost:8080/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: searchQuery }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      console.log('API Response:', data);
      setResponse(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'An error occurred while connecting to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-primary py-16 px-4 sm:px-6">
      <main className="max-w-[680px] mx-auto flex flex-col gap-10">
        
        {/* Header Section */}
        <header className="text-center sm:text-left pb-6 border-b border-divider">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            DevOps Copilot
          </h1>
          <p className="text-[15px] text-muted">
            Ask your infrastructure why it's broken.
          </p>
        </header>

        {/* Content Section */}
        <section className="flex flex-col">
          <SearchBar onSubmit={handleSearch} isLoading={isLoading} />
          
          {error && (
            <div className="mt-10 text-warning text-sm p-4 rounded-md border border-warning/20 bg-warning/5">
              {error}
            </div>
          )}

          <ResultsDisplay response={response} />
        </section>

      </main>
    </div>
  );
}

export default App;
