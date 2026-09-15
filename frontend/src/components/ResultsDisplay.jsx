import React, { useState } from 'react';

export default function ResultsDisplay({ response }) {
  if (!response) return null;

  const [isContextOpen, setIsContextOpen] = useState(false);

  // State B - Not Grounded
  if (!response.grounded) {
    return (
      <div className="mt-10 pt-8 border-t border-divider">
        <div className="bg-warning/10 text-warning px-5 py-4 rounded-md">
          <p className="text-[15px] font-medium">No confident match found in the knowledge base for this question.</p>
        </div>
      </div>
    );
  }

  // State A - Grounded
  const { synthesis, results } = response;

  const truncate = (text, maxLength = 150) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    <div className="mt-10 pt-8 border-t border-divider flex flex-col gap-10">
      
      {/* Answer Card */}
      <div className="flex flex-col gap-8">
        
        {/* Likely Causes */}
        {synthesis?.likelyCauses && synthesis.likelyCauses.length > 0 && (
          <div>
            <h3 className="text-primary font-medium mb-3">Likely Causes</h3>
            <ul className="list-disc pl-5 text-[15px] space-y-2 text-primary/90">
              {synthesis.likelyCauses.map((cause, i) => (
                <li key={i} className="leading-relaxed">{cause}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Related Incident */}
        {synthesis?.relatedIncident && synthesis.relatedIncident.toLowerCase() !== "null" && (
          <div>
            <h3 className="text-primary font-medium mb-3">Related Incident</h3>
            <span className="inline-block bg-accent/10 text-accent font-mono text-sm px-3 py-1.5 rounded-md">
              {synthesis.relatedIncident}
            </span>
          </div>
        )}

        {/* Suggested Investigation */}
        {synthesis?.suggestedInvestigation && (
          <div>
            <h3 className="text-primary font-medium mb-3">Suggested Investigation</h3>
            <p className="text-[15px] leading-relaxed text-primary/90">
              {synthesis.suggestedInvestigation}
            </p>
          </div>
        )}

        {/* Sources */}
        {synthesis?.sources && synthesis.sources.length > 0 && (
          <div>
            <h3 className="text-muted text-sm font-medium mb-3">Synthesized from</h3>
            <div className="flex flex-wrap gap-2">
              {synthesis.sources.map((source, i) => (
                <span key={i} className="bg-accent/10 text-accent font-mono text-sm px-3 py-1.5 rounded-md">
                  {source}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Retrieved Context Toggle */}
      <div className="pt-8 border-t border-divider">
        <button 
          onClick={() => setIsContextOpen(!isContextOpen)}
          className="text-[15px] text-muted hover:text-primary transition-colors flex items-center gap-2 font-medium"
        >
          <span>{isContextOpen ? 'Hide' : 'View'} retrieved context</span>
          <span className="text-[10px]">{isContextOpen ? '▲' : '▼'}</span>
        </button>

        {isContextOpen && results && (
          <div className="mt-6 flex flex-col gap-4">
            {results.map((res, idx) => (
              <div key={idx} className="p-5 bg-white/50 rounded-lg border border-divider text-[14px]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-primary font-medium bg-divider/30 px-2 py-0.5 rounded text-[13px]">
                      {res.sourceFile}
                    </span>
                    <span className="text-xs text-muted uppercase tracking-wider font-semibold">
                      {res.docType}
                    </span>
                  </div>
                  <span className="text-muted text-xs font-mono bg-background px-2 py-1 rounded-md border border-divider/50">
                    Score: {res.similarityScore ? res.similarityScore.toFixed(2) : 'N/A'}
                  </span>
                </div>
                <p className="text-muted whitespace-pre-wrap leading-relaxed">
                  {truncate(res.content)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
