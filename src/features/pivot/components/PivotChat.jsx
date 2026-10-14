import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2, ShieldCheck, Sparkles, AlertCircle, RefreshCw, Heart } from 'lucide-react';
import { sendPivotMessage, clearPivotConversation } from '../services/pivotApi';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import SupportSuggestions from './SupportSuggestions';
import RecoveryCard from './RecoveryCard';
import '../styles/pivot.css';

export default function PivotChat({ onNavigateBack = null }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [preferredSupport, setPreferredSupport] = useState(null);
  const [lastSupportInfo, setLastSupportInfo] = useState({ category: null, nextAction: null });
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Handle sending message
  async function handleSend(e) {
    if (e) e.preventDefault();

    const textToSend = input.trim();
    if (!textToSend || loading) return;

    const userMessage = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      content: textToSend,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const response = await sendPivotMessage({
        message: textToSend,
        conversation_id: conversationId,
        history: messages.slice(-10),
        preferred_support: preferredSupport,
      });

      if (response.conversation_id) {
        setConversationId(response.conversation_id);
      }

      setLastSupportInfo({
        category: response.category,
        nextAction: response.next_action,
        supportNeed: response.support_need,
      });

      const assistantMessage = {
        id: `msg_${Date.now()}_a`,
        role: 'assistant',
        content: response.reply,
        category: response.category,
        nextAction: response.next_action,
        evidence: response.evidence || [],
        response_mode: response.response_mode,
        confidence: response.confidence,
      };

      setMessages([...nextMessages, assistantMessage]);
    } catch (err) {
      console.error('[PivotChat] Error:', err);
      setError(err.message || 'Unable to connect to Pivot. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Handle clearing conversation
  async function handleClear() {
    if (conversationId) {
      await clearPivotConversation(conversationId);
    }
    setMessages([]);
    setConversationId(null);
    setLastSupportInfo({ category: null, nextAction: null });
    setError('');
  }

  // Handle clicking sample starter prompt
  function handleSelectPrompt(promptText) {
    setInput(promptText);
  }

  // Keyboard shortcut: Shift+Enter for new line, Enter to submit
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="pivot-container">
      {/* Top Header Card */}
      <div className="pivot-header-card">
        <div className="pivot-title-area">
          <h2>
            <Sparkles size={24} style={{ color: 'var(--accent-terracotta, #9A6854)' }} />
            Pivot • Placement Recovery Companion
          </h2>
          <p>Evidence-grounded conversational support for placement setbacks, anxiety, and re-centering.</p>
        </div>

        <div className="pivot-header-controls">
          {messages.length > 0 && (
            <button
              type="button"
              className="pivot-btn-secondary"
              onClick={handleClear}
              title="Clear active conversation from session memory"
            >
              <Trash2 size={14} /> Clear Session
            </button>
          )}
        </div>
      </div>

      {/* Main Chat Screen */}
      <div className="pivot-chat-box">
        {/* Messages Stream */}
        <div className="pivot-messages-area" role="log" aria-live="polite">
          {messages.length === 0 && (
            <div className="pivot-welcome-banner">
              <h3>What's on your mind today?</h3>
              <p>
                You can talk freely about what happened: failing a coding round, getting rejected,
                freezing under time pressure, or feeling behind your peers.
              </p>
              <p>
                No questionnaires required. Pivot is here to listen, give real perspective, and suggest small,
                grounded next steps.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {loading && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>

        {/* Error notification with retry */}
        {error && (
          <div style={{
            padding: '12px 24px',
            background: '#FFF5F5',
            borderTop: '1px solid #FFD0D0',
            color: '#C53030',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => handleSend()}
              style={{
                background: 'none',
                border: '1px solid #C53030',
                borderRadius: '6px',
                padding: '4px 10px',
                color: '#C53030',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        )}

        {/* Suggestion Chips & Mode Toggles */}
        <SupportSuggestions
          onSelectPrompt={handleSelectPrompt}
          preferredSupport={preferredSupport}
          onSelectPreferredSupport={setPreferredSupport}
        />

        {/* Composer Form */}
        <form className="pivot-composer-form" onSubmit={handleSend}>
          <textarea
            className="pivot-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              preferredSupport === 'listen'
                ? "Tell Pivot what happened... (Pivot will listen without forcing advice)"
                : "Tell Pivot what's on your mind... (Press Enter to send)"
            }
            rows={2}
            maxLength={5000}
            disabled={loading}
            aria-label="Your message to Pivot"
          />

          <button
            type="submit"
            className="pivot-send-btn"
            disabled={loading || !input.trim()}
            title="Send your message"
          >
            <Send size={16} />
            <span>{loading ? 'Thinking...' : 'Send'}</span>
          </button>
        </form>

        {/* Privacy Note Footer */}
        <div className="pivot-privacy-footer">
          <div className="pivot-privacy-note">
            <ShieldCheck size={14} style={{ color: 'var(--btn-sage, #526257)' }} />
            <span>
              Text-only, privacy-preserving. Personal identifying details (IDs, emails, CGPA) are automatically scrubbed.
            </span>
          </div>
          <span>Memory is session-scoped.</span>
        </div>
      </div>

      {/* Recovery Card (if active next action is present) */}
      {lastSupportInfo.nextAction && (
        <div style={{ marginTop: '20px' }}>
          <RecoveryCard
            category={lastSupportInfo.category}
            nextAction={lastSupportInfo.nextAction}
            supportNeed={lastSupportInfo.supportNeed}
          />
        </div>
      )}
    </div>
  );
}
