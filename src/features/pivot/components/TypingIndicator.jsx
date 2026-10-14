import React from 'react';

export default function TypingIndicator() {
  return (
    <div className="pivot-message assistant typing-bubble" aria-live="polite">
      <div className="pivot-typing-dots">
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>
      <span className="typing-text">Pivot is thinking through your message...</span>
    </div>
  );
}
