import React from 'react';
import { MessageSquare, Heart, Compass, CheckSquare } from 'lucide-react';

export default function SupportSuggestions({ onSelectPrompt, preferredSupport, onSelectPreferredSupport }) {
  const samplePrompts = [
    "I got rejected in the second technical round. My friends have offers and I feel like I'm falling behind.",
    "I knew the basic approach, but I panicked when the interviewer changed the problem.",
    "I've failed multiple online tests and don't know what to fix.",
    "I don't need advice right now. I just want to talk and vent."
  ];

  return (
    <div className="pivot-suggestions-wrap">
      {/* Mode Controls */}
      <div className="pivot-mode-selector">
        <span className="pivot-mode-label">How can Pivot support you?</span>
        <div className="pivot-mode-buttons">
          <button
            type="button"
            className={`pivot-mode-btn ${preferredSupport === 'listen' ? 'active' : ''}`}
            onClick={() => onSelectPreferredSupport(preferredSupport === 'listen' ? null : 'listen')}
            title="Listen without suggesting checklists or study plans"
          >
            <Heart size={13} /> Just Listen
          </button>
          <button
            type="button"
            className={`pivot-mode-btn ${preferredSupport === 'reassure' ? 'active' : ''}`}
            onClick={() => onSelectPreferredSupport(preferredSupport === 'reassure' ? null : 'reassure')}
            title="Help me separate facts from feelings"
          >
            <Compass size={13} /> Reframe Perspective
          </button>
          <button
            type="button"
            className={`pivot-mode-btn ${preferredSupport === 'give_advice' ? 'active' : ''}`}
            onClick={() => onSelectPreferredSupport(preferredSupport === 'give_advice' ? null : 'give_advice')}
            title="Offer concrete technical placement exercises"
          >
            <CheckSquare size={13} /> Practical Advice
          </button>
        </div>
      </div>

      {/* Starter Prompts */}
      <div className="pivot-prompt-chips">
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            className="pivot-prompt-chip"
            onClick={() => onSelectPrompt(prompt)}
          >
            <MessageSquare size={12} className="pivot-chip-icon" />
            <span>"{prompt}"</span>
          </button>
        ))}
      </div>
    </div>
  );
}
