import React, { useState } from 'react';
import { BookOpen, CheckCircle, ChevronDown, ChevronUp, Sparkles, ShieldAlert } from 'lucide-react';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const isSafety = message.response_mode === 'safety' || message.category === 'urgent_safety';
  const [showEvidence, setShowEvidence] = useState(false);

  // Format paragraphs safely without injecting unparsed HTML
  const paragraphs = (message.content || '')
    .split('\n\n')
    .filter(p => p.trim().length > 0);

  return (
    <div className={`pivot-message ${isUser ? 'user' : 'assistant'} ${isSafety ? 'safety-alert' : ''}`}>
      <div className="pivot-message-header">
        <span className="pivot-sender-name">
          {isUser ? 'You' : isSafety ? 'Pivot • Urgent Safety Support' : 'Pivot'}
        </span>
        {message.category && !isUser && !isSafety && (
          <span className="pivot-category-pill">
            {message.category.replace(/_/g, ' ')}
          </span>
        )}
      </div>

      <div className="pivot-message-body">
        {paragraphs.map((p, idx) => (
          <p key={idx} className="pivot-paragraph">{p}</p>
        ))}
      </div>


      {/* Grounded Evidence Sources */}
      {message.evidence && message.evidence.length > 0 && (
        <div className="pivot-evidence-container">
          <button
            type="button"
            className="pivot-evidence-toggle"
            onClick={() => setShowEvidence(!showEvidence)}
            aria-expanded={showEvidence}
          >
            <BookOpen size={14} />
            <span>{message.evidence.length} Grounded reference{message.evidence.length > 1 ? 's' : ''} retrieved</span>
            {showEvidence ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showEvidence && (
            <div className="pivot-evidence-list">
              {message.evidence.map((ref, idx) => (
                <div key={ref.id || idx} className="pivot-evidence-item">
                  <div className="pivot-evidence-header">
                    <span className="pivot-evidence-title">{ref.title}</span>
                    <span className="pivot-evidence-badge">{ref.support_type.replace(/_/g, ' ')}</span>
                  </div>
                  {ref.snippet && (
                    <p className="pivot-evidence-snippet">{ref.snippet}</p>
                  )}
                  <div className="pivot-evidence-source">
                    Source: {ref.source_title}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
