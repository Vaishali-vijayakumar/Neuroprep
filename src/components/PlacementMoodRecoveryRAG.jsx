import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Send, ShieldCheck, Sparkles, RefreshCw, 
  Brain, TrendingUp, Target, CheckCircle2, AlertCircle, 
  Clock, Trash2, ChevronRight, Activity, ArrowUpRight
} from 'lucide-react';
import { 
  submitTextVentRAG, 
  submitAudioVentRAG, 
  fetchVentStages 
} from '../services/placementMoodRecoveryRAG';

const LOCAL_VAULT_KEY = 'neuroprep_recovery_vault_v1';

export default function PlacementMoodRecoveryRAG() {
  const [inputText, setInputText] = useState('');
  const [selectedStage, setSelectedStage] = useState('technical_round_2');
  const [stages, setStages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  // Local On-Device Persistence
  const [vaultHistory, setVaultHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Quick Scenario Chips
  const QUICK_SCENARIO_CHIPS = [
    { label: "Round 2 Technical DP Freeze", prompt: "I got dropped in Round 2 Technical today. Froze on Dynamic Programming state transition and felt humiliated." },
    { label: "Failed 4 Online Assessments", prompt: "Failed 4 campus online assessments this week. Hidden test cases timed out. I feel like quitting." },
    { label: "Uninterested Interviewer Blankout", prompt: "The interviewer seemed distracted. I went completely blank on a binary tree BFS traversal." },
    { label: "Friends Placed, Left Behind", prompt: "My whole friend group got placed this week and I have zero offers. I feel left behind and terrified." }
  ];

  // Load stages & local vault on mount
  useEffect(() => {
    fetchVentStages().then(data => {
      if (data && data.length) setStages(data);
    });

    try {
      const stored = localStorage.getItem(LOCAL_VAULT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setVaultHistory(parsed);
        if (parsed.length > 0 && !currentResult) {
          setCurrentResult(parsed[0]);
        }
      }
    } catch (e) {
      console.warn('Failed to load local vault:', e);
    }
  }, []);

  // Safety timer: guarantees the spinner can never get stuck for more than 4.5s
  useEffect(() => {
    let timer;
    if (isLoading) {
      timer = setTimeout(() => {
        setIsLoading(false);
      }, 4500);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Save to local on-device vault
  const saveToLocalVault = (result) => {
    try {
      const updated = [result, ...vaultHistory.filter(h => h.id !== result.id)].slice(0, 15);
      setVaultHistory(updated);
      localStorage.setItem(LOCAL_VAULT_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Local vault write failed:', e);
    }
  };

  const clearLocalVault = () => {
    localStorage.removeItem(LOCAL_VAULT_KEY);
    setVaultHistory([]);
  };

  // ── AUDIO RECORDING HANDLERS ───────────────────────────────────────────────
  const startRecording = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        await handleAudioSubmit(audioBlob);
      };

      mediaRecorderRef.current.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => {
          if (prev >= 29) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Audio capture permission error:', err);
      setErrorMsg('Microphone permission required for 30-second voice vent.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleAudioSubmit = async (audioBlob) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await submitAudioVentRAG({
        audioBlob,
        stage: selectedStage,
        filename: `vent_${Date.now()}.webm`
      });

      const entry = {
        id: `vault_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...response
      };

      setCurrentResult(entry);
      saveToLocalVault(entry);
    } catch (err) {
      console.error('Audio vent submission failed:', err);
      setErrorMsg('Audio transcription pipeline failed. Try typing your vent.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── TEXT VENT HANDLER ──────────────────────────────────────────────────────
  const handleTextSubmit = async (textToSend) => {
    const ventText = (textToSend || inputText).trim();
    if (!ventText || isLoading) return;

    setIsLoading(true);
    setErrorMsg(null);
    setInputText('');

    try {
      const response = await submitTextVentRAG({
        text: ventText,
        stage: selectedStage
      });

      const entry = {
        id: `vault_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...response
      };

      setCurrentResult(entry);
      saveToLocalVault(entry);
    } catch (err) {
      console.error('Vent submission failed:', err);
      setErrorMsg('Recovery analysis failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="saas-card-spec"
      style={{
        padding: 0,
        marginBottom: '36px',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-card-solid)',
        boxShadow: 'var(--shadow-3d-card)',
        fontFamily: 'var(--font-body)',
        borderRadius: '18px'
      }}
    >
      
      {/* ── 1. HEADER (Sage Theme & Fraunces Typography) ────────────────────── */}
      <div style={{
        padding: '16px 24px',
        backgroundColor: 'var(--btn-sage)',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.18)',
            border: '1px solid rgba(255, 255, 255, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            flexShrink: 0
          }}>
            <Brain size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 600,
                color: '#FFFFFF',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-0.015em'
              }}>
                Placement Vent Recovery Engine
              </h3>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 9px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.22)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                fontFamily: 'var(--font-btn)',
                letterSpacing: '0.04em'
              }}>
                QDRANT + BGE RAG
              </span>
            </div>
            <p style={{
              margin: '3px 0 0 0',
              fontSize: '12.5px',
              color: 'rgba(255, 255, 255, 0.88)',
              fontFamily: 'var(--font-body)'
            }}>
              Clinical CBT Reasoning • Stage Attrition Funnel Math • Verified Alumni Rebound Precedents
            </p>
          </div>
        </div>

        {/* Stage Selector & Vault History Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              borderRadius: '10px',
              padding: '7px 12px',
              fontSize: '12.5px',
              fontWeight: 600,
              fontFamily: 'var(--font-btn)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="technical_round_2" style={{ color: '#34343A', backgroundColor: '#FCF9F6' }}>
              Round 2 Technical (Live Coding)
            </option>
            <option value="technical_round_1" style={{ color: '#34343A', backgroundColor: '#FCF9F6' }}>
              Round 1 Technical (Screening)
            </option>
            <option value="oa_screening" style={{ color: '#34343A', backgroundColor: '#FCF9F6' }}>
              Online Assessment (OA)
            </option>
            <option value="final_round" style={{ color: '#34343A', backgroundColor: '#FCF9F6' }}>
              Final / Managerial Round
            </option>
          </select>

          {vaultHistory.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              style={{
                backgroundColor: showHistory ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.18)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                borderRadius: '10px',
                padding: '7px 12px',
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'var(--font-btn)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Clock size={13} />
              Vault Log ({vaultHistory.length})
            </button>
          )}
        </div>
      </div>

      {/* ── 2. PII SECURITY NOTICE ──────────────────────────────────────────── */}
      <div style={{
        padding: '10px 24px',
        backgroundColor: 'rgba(82, 98, 87, 0.07)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        fontSize: '12px',
        color: 'var(--body-text)',
        fontFamily: 'var(--font-body)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={16} color="var(--btn-sage)" />
          <span>
            <strong style={{ color: 'var(--main-heading)' }}>Regex PII Stripper:</strong> Names, roll numbers, CGPA, and recruiters are automatically scrubbed before AI reasoning.
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--secondary-heading)' }}>
          <Activity size={13} color="var(--accent-terracotta)" />
          <span style={{ fontWeight: 600 }}>Strictly On-Device Persistence (Total Privacy)</span>
        </div>
      </div>

      {/* ── 3. MAIN WORKSPACE ───────────────────────────────────────────────── */}
      <div style={{ padding: '24px' }}>

        {/* Quick Scenario Chips */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            fontSize: '11.5px',
            fontWeight: 700,
            color: 'var(--secondary-heading)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '8px',
            fontFamily: 'var(--font-body)'
          }}>
            Quick Placement Vent Scenarios:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {QUICK_SCENARIO_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleTextSubmit(chip.prompt)}
                disabled={isLoading || isRecording}
                style={{
                  backgroundColor: 'rgba(82, 98, 87, 0.06)',
                  color: 'var(--secondary-heading)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '20px',
                  padding: '7px 14px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-body)',
                  cursor: 'pointer',
                  transition: 'all 0.18s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'var(--btn-sage)';
                  e.currentTarget.style.color = 'var(--main-heading)';
                  e.currentTarget.style.backgroundColor = 'rgba(82, 98, 87, 0.12)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.color = 'var(--secondary-heading)';
                  e.currentTarget.style.backgroundColor = 'rgba(82, 98, 87, 0.06)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>{chip.label}</span>
                <ArrowUpRight size={13} color="var(--accent-terracotta)" />
              </button>
            ))}
          </div>
        </div>

        {/* ── 4. VOICE VENT RECORDER WITH LIVE MIC PULSE ─────────────────────── */}
        {isRecording && (
          <div style={{
            marginBottom: '22px',
            padding: '24px 20px',
            borderRadius: '16px',
            backgroundColor: 'rgba(154, 104, 84, 0.08)',
            border: '1.5px solid var(--accent-terracotta)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Animated Mic Pulse Glow */}
            <div style={{
              width: '74px',
              height: '74px',
              borderRadius: '50%',
              backgroundColor: 'rgba(154, 104, 84, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              boxShadow: '0 0 26px rgba(154, 104, 84, 0.45)',
              animation: 'pulse 1.2s infinite'
            }}>
              <Mic size={34} color="var(--accent-terracotta)" />
            </div>

            <div style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--main-heading)',
              fontFamily: 'var(--font-heading)',
              marginBottom: '4px'
            }}>
              Recording 30-Second Emotional Vent...
            </div>
            <div style={{
              fontSize: '13px',
              color: 'var(--accent-terracotta)',
              fontWeight: 700,
              fontFamily: 'var(--font-code)',
              marginBottom: '14px'
            }}>
              00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds} / 00:30
            </div>

            {/* Audio Wave Visualizer Simulation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', height: '24px', marginBottom: '16px' }}>
              {[18, 24, 12, 28, 16, 22, 30, 14, 26, 20, 32, 18, 24].map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: '3.5px',
                    height: `${h}px`,
                    backgroundColor: 'var(--accent-terracotta)',
                    borderRadius: '2px',
                    animation: `pulse ${0.6 + (i % 5) * 0.1}s ease-in-out infinite alternate`
                  }}
                />
              ))}
            </div>

            <button
              onClick={stopRecording}
              style={{
                backgroundColor: 'var(--accent-terracotta)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '9px 24px',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'var(--font-btn)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 3px 0 #7A4F3D, 0 6px 14px rgba(154, 104, 84, 0.3)'
              }}
            >
              <MicOff size={16} />
              Stop & Transcribe (&lt;400ms Whisper)
            </button>
          </div>
        )}

        {/* ── 5. TEXT INPUT & AUDIO TRIGGER BAR ──────────────────────────────── */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          alignItems: 'center'
        }}>
          {/* 30s Mic Trigger */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
            title={isRecording ? 'Stop Recording' : 'Record 30s Voice Vent'}
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              backgroundColor: isRecording ? 'var(--accent-terracotta)' : 'var(--btn-sage)',
              color: '#FFFFFF',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: isRecording 
                ? '0 0 16px rgba(154, 104, 84, 0.5)' 
                : 'var(--shadow-3d-btn)',
              transition: 'all 0.18s ease'
            }}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Text Vent Input Box */}
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTextSubmit();
              }}
              placeholder={isRecording ? "Listening to your voice..." : "Vent what happened in your interview (e.g. Dropped in Round 2 on DP)..."}
              disabled={isLoading || isRecording}
              style={{
                width: '100%',
                padding: '13px 52px 13px 18px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-input)',
                borderRadius: '12px',
                color: 'var(--main-heading)',
                fontSize: '14px',
                fontFamily: 'var(--font-body)',
                outline: 'none',
                boxSizing: 'border-box',
                boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.04)',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--btn-sage)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-input)'}
            />
            <button
              onClick={() => handleTextSubmit()}
              disabled={isLoading || isRecording || !inputText.trim()}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: inputText.trim() ? 'var(--btn-sage)' : 'transparent',
                color: inputText.trim() ? '#FFFFFF' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '8px',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputText.trim() ? 'pointer' : 'default',
                transition: 'all 0.18s'
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div style={{
            padding: '12px 18px',
            marginBottom: '18px',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '10px',
            color: '#B91C1C',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-body)'
          }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Loading State Spinner */}
        {isLoading && (
          <div style={{
            padding: '36px 20px',
            borderRadius: '16px',
            backgroundColor: 'rgba(82, 98, 87, 0.04)',
            border: '1px solid var(--border-color)',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '38px',
              height: '38px',
              border: '3px solid rgba(82, 98, 87, 0.2)',
              borderTopColor: 'var(--btn-sage)',
              borderRadius: '50%',
              margin: '0 auto 16px auto',
              animation: 'spin 0.8s linear infinite'
            }} />
            <div style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--main-heading)',
              fontFamily: 'var(--font-heading)',
              marginBottom: '6px'
            }}>
              Vectorizing Vent with BGE & Querying Qdrant...
            </div>
            <div style={{ fontSize: '13px', color: 'var(--body-text)', fontFamily: 'var(--font-body)' }}>
              Scrubbing PII • Applying Cross-Encoder Reranker • Generating Grounded Recovery Card
            </div>
          </div>
        )}

        {/* ── 6. VAULT HISTORY DRAWER ────────────────────────────────────────── */}
        {showHistory && vaultHistory.length > 0 && (
          <div style={{
            marginBottom: '22px',
            padding: '16px',
            borderRadius: '14px',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-3d-card)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{
                fontSize: '12.5px',
                fontWeight: 700,
                color: 'var(--main-heading)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontFamily: 'var(--font-body)'
              }}>
                On-Device Vault Log ({vaultHistory.length} Sessions)
              </div>
              <button
                onClick={clearLocalVault}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-terracotta)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Trash2 size={13} /> Clear Vault
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
              {vaultHistory.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentResult(item)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: currentResult?.id === item.id ? 'rgba(82, 98, 87, 0.1)' : 'var(--bg-card-solid)',
                    border: `1px solid ${currentResult?.id === item.id ? 'var(--btn-sage)' : 'var(--border-color)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>
                    <span style={{ color: 'var(--btn-sage)', fontSize: '11.5px', fontWeight: 700, marginRight: '8px' }}>
                      {item.detected_stage || item.recovery_card?.math_market_check?.stage}
                    </span>
                    <span style={{ color: 'var(--main-heading)', fontSize: '13px' }}>
                      {item.sanitized_query || item.raw_transcript}
                    </span>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '11.5px', fontFamily: 'var(--font-code)' }}>{item.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 7. ACTIONABLE RECOVERY CARD (Earthy Theme & Fraunces Typography) ── */}
        {currentResult && currentResult.recovery_card && !isLoading && (
          <div style={{
            borderRadius: '16px',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-color)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-3d-card)'
          }}>
            
            {/* Card Top Banner */}
            <div style={{
              padding: '16px 22px',
              backgroundColor: 'rgba(82, 98, 87, 0.08)',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div>
                <div style={{
                  fontSize: '11.5px',
                  fontWeight: 800,
                  color: 'var(--btn-sage)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontFamily: 'var(--font-body)'
                }}>
                  Grounded Recovery Breakdown
                </div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: 'var(--main-heading)',
                  fontFamily: 'var(--font-heading)',
                  marginTop: '2px'
                }}>
                  {currentResult.recovery_card.math_market_check.stage}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {currentResult.latency_ms && (
                  <span style={{
                    fontSize: '11.5px',
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(82, 98, 87, 0.12)',
                    color: 'var(--btn-sage)',
                    border: '1px solid rgba(82, 98, 87, 0.25)',
                    fontFamily: 'var(--font-code)'
                  }}>
                    ⚡ {currentResult.latency_ms}ms
                  </span>
                )}
                <span style={{
                  fontSize: '11.5px',
                  fontWeight: 600,
                  padding: '3px 9px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(154, 104, 84, 0.12)',
                  color: 'var(--accent-terracotta)',
                  border: '1px solid rgba(154, 104, 84, 0.25)',
                  fontFamily: 'var(--font-btn)'
                }}>
                  {currentResult.input_type === 'audio' ? 'Voice Vent (Whisper)' : 'Text Vent'}
                </span>
              </div>
            </div>

            {/* Sanitized Vent Bar */}
            {currentResult.sanitized_query && (
              <div style={{
                padding: '11px 22px',
                backgroundColor: 'var(--bg-card-solid)',
                borderBottom: '1px solid var(--border-color)',
                fontSize: '13px',
                color: 'var(--body-text)',
                fontStyle: 'italic',
                fontFamily: 'var(--font-body)'
              }}>
                <strong style={{ color: 'var(--main-heading)', fontStyle: 'normal' }}>Sanitized Query: </strong>
                "{currentResult.sanitized_query}"
              </div>
            )}

            {/* 4 Pillars Grid */}
            <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Pillar 1: Cognitive Diagnosis */}
              <div style={{
                padding: '16px 18px',
                borderRadius: '12px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-color)',
                borderLeft: '4px solid var(--accent-terracotta)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Brain size={16} color="var(--accent-terracotta)" />
                  <span style={{
                    fontSize: '11.5px',
                    fontWeight: 800,
                    color: 'var(--accent-terracotta)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontFamily: 'var(--font-body)'
                  }}>
                    1. Cognitive Diagnosis (Thinking Trap)
                  </span>
                </div>
                <div style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--main-heading)',
                  fontFamily: 'var(--font-heading)',
                  marginBottom: '6px'
                }}>
                  {currentResult.recovery_card.cognitive_diagnosis.thinking_trap}
                </div>
                <p style={{ margin: 0, fontSize: '13.5px', lineHeight: 1.6, color: 'var(--body-text)' }}>
                  {currentResult.recovery_card.cognitive_diagnosis.clinical_explanation}
                </p>
              </div>

              {/* Pillar 2: Hiring Math & Market Reality */}
              <div style={{
                padding: '16px 18px',
                borderRadius: '12px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-color)',
                borderLeft: '4px solid var(--btn-sage)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <TrendingUp size={16} color="var(--btn-sage)" />
                  <span style={{
                    fontSize: '11.5px',
                    fontWeight: 800,
                    color: 'var(--btn-sage)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontFamily: 'var(--font-body)'
                  }}>
                    2. Hiring Math & Market Reality Check
                  </span>
                </div>
                <div style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--main-heading)',
                  fontFamily: 'var(--font-heading)',
                  marginBottom: '6px'
                }}>
                  {currentResult.recovery_card.math_market_check.funnel_attrition}
                </div>
                <p style={{ margin: 0, fontSize: '13.5px', lineHeight: 1.6, color: 'var(--body-text)' }}>
                  {currentResult.recovery_card.math_market_check.headcount_reality}
                </p>
              </div>

              {/* Pillar 3: Isolated Skill Variable */}
              <div style={{
                padding: '16px 18px',
                borderRadius: '12px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-color)',
                borderLeft: '4px solid var(--secondary-olive)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Target size={16} color="var(--secondary-olive)" />
                  <span style={{
                    fontSize: '11.5px',
                    fontWeight: 800,
                    color: 'var(--secondary-olive)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontFamily: 'var(--font-body)'
                  }}>
                    3. Isolated Skill Variable (The Isolated Topic to Patch)
                  </span>
                </div>
                <div style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--main-heading)',
                  fontFamily: 'var(--font-heading)',
                  marginBottom: '6px'
                }}>
                  {currentResult.recovery_card.skill_variable.isolated_gap}
                </div>
                <p style={{ margin: 0, fontSize: '13.5px', lineHeight: 1.6, color: 'var(--body-text)' }}>
                  {currentResult.recovery_card.skill_variable.precision_fix}
                </p>
              </div>

              {/* Pillar 4: Alumni Precedent */}
              <div style={{
                padding: '16px 18px',
                borderRadius: '12px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-color)',
                borderLeft: '4px solid var(--accent-terracotta)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <CheckCircle2 size={16} color="var(--accent-terracotta)" />
                  <span style={{
                    fontSize: '11.5px',
                    fontWeight: 800,
                    color: 'var(--accent-terracotta)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontFamily: 'var(--font-body)'
                  }}>
                    4. Verified Senior Rebound Precedent
                  </span>
                </div>
                <div style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--main-heading)',
                  fontFamily: 'var(--font-heading)',
                  marginBottom: '4px'
                }}>
                  {currentResult.recovery_card.alumni_precedent.senior_case}
                </div>
                <div style={{
                  display: 'inline-block',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--accent-terracotta)',
                  backgroundColor: 'rgba(154, 104, 84, 0.1)',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  fontFamily: 'var(--font-code)'
                }}>
                  ⏱️ {currentResult.recovery_card.alumni_precedent.rebound_timeline}
                </div>
                <p style={{ margin: 0, fontSize: '13.5px', lineHeight: 1.6, color: 'var(--body-text)' }}>
                  <strong style={{ color: 'var(--main-heading)' }}>Strategic Takeaway: </strong>
                  {currentResult.recovery_card.alumni_precedent.strategic_takeaway}
                </p>
              </div>

              {/* Tactical Next Moves Checklist */}
              {currentResult.recovery_card.actionable_recovery_steps?.length > 0 && (
                <div style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(82, 98, 87, 0.05)',
                  border: '1px dashed var(--border-color)'
                }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    color: 'var(--secondary-heading)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '10px',
                    fontFamily: 'var(--font-body)'
                  }}>
                    Tactical Next Moves (24h - 72h Recovery Plan):
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--main-heading)', fontSize: '13.5px', lineHeight: 1.6 }}>
                    {currentResult.recovery_card.actionable_recovery_steps.map((step, idx) => (
                      <li key={idx} style={{ marginBottom: '6px' }}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Grounded Perspective Closing */}
              <div style={{
                padding: '14px 20px',
                borderRadius: '12px',
                backgroundColor: 'rgba(82, 98, 87, 0.08)',
                border: '1px solid rgba(82, 98, 87, 0.22)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Sparkles size={20} color="var(--btn-sage)" style={{ flexShrink: 0 }} />
                <p style={{
                  margin: 0,
                  fontSize: '13.5px',
                  color: 'var(--main-heading)',
                  fontStyle: 'italic',
                  lineHeight: 1.5,
                  fontFamily: 'var(--font-body)'
                }}>
                  {currentResult.recovery_card.grounded_summary}
                </p>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
