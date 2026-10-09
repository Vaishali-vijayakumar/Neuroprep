import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, ShieldCheck, CheckCheck, Sparkles, 
  RefreshCw, Bot, User, Brain, TrendingUp, 
  Target, CheckCircle2, Database, AlertCircle,
  HelpCircle
} from 'lucide-react';
import { generateMoodRecoveryRAG } from '../services/placementMoodRecoveryRAG';

export default function PlacementMoodRecoveryRAG() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome_1',
      sender: 'bot',
      timestamp: 'Just now',
      text: "Hey friend. I'm PivotAI, your placement reality guide. If you just faced a rejection, froze in a live interview, or feel like giving up, talk to me.\n\nI won't give you empty cheerleading like 'Don't worry, you'll do great!'. Instead, I'll give you actual hiring pipeline numbers, CBT reality checks, and verified alumni recovery stories. What happened?",
      groundingData: null
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showRAGCorpusModal, setShowRAGCorpusModal] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const QUICK_PROMPTS = [
    "I was eliminated in Round 2 of Fintech drive. Everyone else got through.",
    "I completely froze on a live Graph question in front of the interviewer.",
    "Failed 4 campus OAs this week; feel like my prep was useless.",
    "My 3 close friends got placed today and I'm left unplaced."
  ];

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    const userMsgId = `user_${Date.now()}`;
    const currentTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Append user message
    setMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        timestamp: currentTimeStr,
        text
      }
    ]);

    setInputText('');
    setIsTyping(true);

    try {
      // Simulate realistic retrieval & synthesis delay (800ms)
      await new Promise(r => setTimeout(r, 750));

      const ragResult = await generateMoodRecoveryRAG({
        userVent: text,
        stage: 'technical_2',
        companyType: 'Campus Drive'
      });

      const botMsgId = `bot_${Date.now()}`;
      setMessages(prev => [
        ...prev,
        {
          id: botMsgId,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: "I hear you, and it hurts to get dropped. But let's look at the actual facts before you write off your engineering ability:",
          groundingData: ragResult
        }
      ]);
    } catch (err) {
      console.error("RAG pipeline error", err);
      setMessages(prev => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: "I encountered an error retrieving pipeline chunks. But remember: 60-70% of Round 2 drops are purely capacity-driven, not capability-driven.",
          groundingData: null
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="saas-card-spec" style={{ 
      padding: 0, 
      marginBottom: '36px', 
      overflow: 'hidden', 
      border: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-card-solid)',
      boxShadow: 'var(--shadow-3d-card)'
    }}>
      
      {/* ── 1. WHATSAPP STYLE CHAT HEADER ─────────────────────────────────── */}
      <div style={{
        padding: '14px 20px',
        backgroundColor: 'var(--btn-sage)',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Avatar with verified shield badge */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '16px',
              color: '#ffffff'
            }}>
              PA
            </div>
            <div style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              border: '2px solid #ffffff'
            }} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
                PivotAI • Placement Recovery Mentor
              </h3>
              <ShieldCheck style={{ width: '16px', height: '16px', color: '#A7F3D0' }} />
            </div>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Online</span>
              <span>•</span>
              <span>CBT Grounding & Placement Reality Check</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowRAGCorpusModal(!showRAGCorpusModal)}
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            padding: '6px 12px',
            color: '#ffffff',
            fontSize: '11.5px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Database style={{ width: '13px', height: '13px' }} />
          <span>{showRAGCorpusModal ? 'Hide Corpus' : 'Inspect RAG Corpus'}</span>
        </button>
      </div>

      {/* RAG Corpus Inspector Dropdown */}
      {showRAGCorpusModal && (
        <div style={{
          padding: '14px 20px',
          backgroundColor: '#F3F4F1',
          borderBottom: '1px solid var(--border-color)',
          fontSize: '12px',
          color: 'var(--body-text)'
        }}>
          <strong style={{ color: 'var(--main-heading)', display: 'block', marginBottom: '6px' }}>
            RAG Grounding Corpus Active:
          </strong>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
            <div style={{ padding: '8px 10px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #D8D2CE' }}>
              <span style={{ color: 'var(--btn-sage)', fontWeight: 700 }}>1. CBT Distortion Corpus:</span> All-or-Nothing & Overgeneralization reframing templates.
            </div>
            <div style={{ padding: '8px 10px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #D8D2CE' }}>
              <span style={{ color: 'var(--accent-terracotta)', fontWeight: 700 }}>2. Funnel Math:</span> 60-75% Round 2 attrition statistics & capacity filters.
            </div>
            <div style={{ padding: '8px 10px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #D8D2CE' }}>
              <span style={{ color: 'var(--secondary-olive)', fontWeight: 700 }}>3. Alumni Precedents:</span> Verified timelines of 48h fixes converting to offers.
            </div>
          </div>
        </div>
      )}

      {/* ── 2. WHATSAPP CHAT WALLPAPER & CONVERSATION BODY ─────────────────── */}
      <div style={{
        height: '420px',
        overflowY: 'auto',
        padding: '20px',
        backgroundColor: '#F9F8F6',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                width: '100%'
              }}
            >
              <div style={{
                maxWidth: isUser ? '75%' : '88%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start'
              }}>
                
                {/* Bubble Container */}
                <div style={{
                  padding: '12px 16px',
                  borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  backgroundColor: isUser ? '#E8EFE9' : '#FFFFFF',
                  border: isUser ? '1px solid rgba(82, 98, 87, 0.25)' : '1px solid var(--border-color)',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  color: 'var(--main-heading)',
                  fontSize: '13.5px',
                  lineHeight: 1.5,
                  position: 'relative'
                }}>
                  
                  {/* Message Main Text */}
                  <div style={{ whiteSpace: 'pre-line', marginBottom: msg.groundingData ? '12px' : '4px' }}>
                    {msg.text}
                  </div>

                  {/* Grounded Deconstruction Card (If Bot Provided Evidence) */}
                  {msg.groundingData && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      marginTop: '10px',
                      padding: '14px',
                      backgroundColor: '#FBFDF9',
                      borderRadius: '10px',
                      border: '1px solid rgba(82, 98, 87, 0.2)'
                    }}>
                      
                      {/* Pillar 1: Cognitive Trap */}
                      <div style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <Brain style={{ width: '14px', height: '14px', color: 'var(--btn-sage)' }} />
                          <strong style={{ fontSize: '12px', color: 'var(--btn-sage)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                            1. Brain Trap Diagnosed
                          </strong>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--main-heading)' }}>
                          {msg.groundingData.diagnosis.distortionType}
                        </div>
                        <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: 'var(--body-text)' }}>
                          {msg.groundingData.diagnosis.mechanism}
                        </p>
                      </div>

                      {/* Pillar 2: The Hiring Math Reality */}
                      <div style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <TrendingUp style={{ width: '14px', height: '14px', color: 'var(--accent-terracotta)' }} />
                          <strong style={{ fontSize: '12px', color: 'var(--accent-terracotta)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                            2. Placement Math & Funnel Reality
                          </strong>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--main-heading)' }}>
                          {msg.groundingData.realityCheck.pipelineMetric}
                        </div>
                        <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: 'var(--body-text)' }}>
                          {msg.groundingData.realityCheck.factualContext}
                        </p>
                      </div>

                      {/* Pillar 3: What Failed vs Who You Are */}
                      <div style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <Target style={{ width: '14px', height: '14px', color: 'var(--btn-sage)' }} />
                          <strong style={{ fontSize: '12px', color: 'var(--btn-sage)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                            3. Specific Gap vs Your Self-Worth
                          </strong>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--main-heading)' }}>
                          Isolated Factor: {msg.groundingData.gapSeparation.isolatedVariable}
                        </div>
                        <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: 'var(--body-text)' }}>
                          {msg.groundingData.gapSeparation.competenceVsWorth}
                        </p>
                      </div>

                      {/* Pillar 4: Real Alumni Turnaround */}
                      <div style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <CheckCircle2 style={{ width: '14px', height: '14px', color: 'var(--btn-sage)' }} />
                          <strong style={{ fontSize: '12px', color: 'var(--btn-sage)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                            4. Alumni Turnaround Precedent
                          </strong>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--main-heading)' }}>
                          {msg.groundingData.precedentAnchor.caseTitle}
                        </div>
                        <p style={{ margin: '3px 0 6px 0', fontSize: '12px', color: 'var(--body-text)' }}>
                          {msg.groundingData.precedentAnchor.alumniTrajectory}
                        </p>
                        <div style={{ borderTop: '1px dashed #D8D2CE', paddingTop: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--secondary-heading)' }}>Immediate 48-Hour Plan:</span>
                          <ul style={{ margin: '4px 0 0 16px', padding: 0, fontSize: '11.5px', color: 'var(--body-text)' }}>
                            {msg.groundingData.precedentAnchor.actionableReboundPlan.map((step, idx) => (
                              <li key={idx} style={{ marginBottom: '2px' }}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Timestamp & Read Receipt */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '4px',
                    fontSize: '10.5px',
                    color: 'var(--text-muted)',
                    marginTop: '4px'
                  }}>
                    <span>{msg.timestamp}</span>
                    {isUser && <CheckCheck style={{ width: '13px', height: '13px', color: '#10B981' }} />}
                  </div>

                </div>

              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '10px 16px',
              borderRadius: '16px 16px 16px 2px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-color)',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12.5px',
              color: 'var(--text-muted)'
            }}>
              <RefreshCw style={{ width: '13px', height: '13px', animation: 'spin 1s infinite linear', color: 'var(--btn-sage)' }} />
              <span>PivotAI is retrieving placement data & typing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── 3. QUICK CHIP PROMPTS ────────────────────────────────────────── */}
      <div style={{
        padding: '10px 16px',
        backgroundColor: '#F3F2EF',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', flexShrink: 0 }}>
          Tap to vent:
        </span>
        {QUICK_PROMPTS.map((prompt, pIdx) => (
          <button
            key={pIdx}
            type="button"
            onClick={() => handleSend(prompt)}
            style={{
              padding: '5px 12px',
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              backgroundColor: '#FFFFFF',
              fontSize: '11.5px',
              fontWeight: 600,
              color: 'var(--main-heading)',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--btn-sage)';
              e.currentTarget.style.backgroundColor = '#EAEFE9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* ── 4. CHAT INPUT BAR ────────────────────────────────────────────── */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <input
          type="text"
          placeholder="Message PivotAI about your rejection or interview stress..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isTyping}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '20px',
            border: '1px solid var(--border-color)',
            fontSize: '13px',
            fontFamily: 'inherit',
            backgroundColor: '#F9F8F6',
            color: 'var(--main-heading)',
            outline: 'none'
          }}
        />

        <button
          type="button"
          onClick={() => handleSend()}
          disabled={!inputText.trim() || isTyping}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--btn-sage)',
            border: 'none',
            cursor: !inputText.trim() || isTyping ? 'not-allowed' : 'pointer',
            opacity: !inputText.trim() || isTyping ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.15s ease',
            boxShadow: '0 2px 5px rgba(82, 98, 87, 0.3)'
          }}
          title="Send message"
        >
          <Send style={{ width: '16px', height: '16px', color: '#ffffff', marginLeft: '2px' }} />
        </button>
      </div>

    </div>
  );
}
