import React, { useState } from 'react';
import useInterviewStore from '../../store/interviewStore';
import { StressScorer } from './engines/StressScorer';

let scorerInstance = null;
try {
  scorerInstance = new StressScorer();
} catch (e) {
  console.warn('[SidePanel] StressScorer init:', e);
}

// ── Monochrome formatting helpers ────────────────────────────────────────────
const BLACK  = '#111111';
const GREY   = '#6B7280';
const BORDER = '#E5E7EB';
const BG     = '#FAFAFA';

export default function SidePanel({
  faceTelemetry = {},
  audioMetrics = {},
  vocalAnalysis = null,
  userAnswerText = '',
  interimText = '',
  onSendAnswer = () => {},
  aiStatus = 'listening',
  elapsedSeconds = 0,
}) {
  // Default to Focus Mode (Clean, non-distracting screen for candidate confidence)
  const [focusMode, setFocusMode] = useState(true);

  const config      = useInterviewStore((s) => s.config);
  const stressIndex = useInterviewStore((s) => s.stressIndex) || 0;
  const transcript  = useInterviewStore((s) => s.transcript) || [];
  const lastRubric  = useInterviewStore((s) => s.lastRubric);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const {
    faceDetected  = false,
    stressScore   = 0,
    headPose      = 'forward',
    isLookingDown = false,
    eyeContact    = 90,
  } = faceTelemetry || {};

  const { volume = 0, wpm = 0, isVoice = false } = audioMetrics || {};

  // Update scorer with live face and audio streams
  let fusedResult = null;
  if (scorerInstance) {
    scorerInstance.updateFace({
      faceDetected,
      stressScore,
      headPose,
      isLookingDown: isLookingDown || faceTelemetry?.isLookingDown || headPose === 'down',
      eyeContact,
      blinkRate: faceTelemetry?.blinkRate ?? 15,
      actionUnits: faceTelemetry?.actionUnits ?? null,
    });
    fusedResult = scorerInstance.updateAudio({
      volume,
      wpm,
      silenceDuration: audioMetrics?.silenceDuration ?? 0,
      isVoice,
    });
  }

  // Determine effective fused score and label
  const effectiveScore = faceDetected && fusedResult?.score !== undefined
    ? fusedResult.score
    : (Number(stressIndex) || 0);

  const details = scorerInstance?.getLabel(
    effectiveScore,
    fusedResult?.phoneReadingDetected,
    fusedResult?.downwardFocusDetected
  ) || {
    label: 'Calm',
    cognitiveLoad: 'Low',
    color: '#111827',
    bg: '#F3F4F6',
  };

  const isHighLoad = details.cognitiveLoad === 'High';
  const isAnomaly  = fusedResult?.phoneReadingDetected;
  const loadPct    = Math.min(100, Math.max(8, effectiveScore));

  // Live text stream from candidate
  const currentLive = (userAnswerText || interimText || '').trim();
  const userLines = Array.isArray(transcript) ? transcript.filter(t => t && t.role === 'user') : [];
  const lastUserText = userLines.length > 0 ? userLines[userLines.length - 1]?.text : '';
  const liveText = currentLive || lastUserText || '';

  const isHrTrack = String(config?.trackId || '').toLowerCase() === 'hr';
  const lowerText = liveText.toLowerCase();
  const starAnalysis = {
    hasSituation: /\b(when|in my|during|at my|previous|project was|client|scenario|situation|context|background)\b/i.test(lowerText),
    hasTask:      /\b(my role|my task|responsibility|responsible for|objective|goal|needed to|assigned to|duty)\b/i.test(lowerText),
    hasAction:    /\b(i developed|i implemented|i led|i created|i resolved|i analyzed|i proposed|i coordinated|i decided|i communicated|i designed|i took|i stepped)\b/i.test(lowerText),
    hasResult:    /\b(result|outcome|increased|reduced|improved|percent|%|saved|delivered|achieved|learned|launched|impact)\b/i.test(lowerText),
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'linear-gradient(168deg, rgba(254, 252, 250, 0.96) 0%, rgba(246, 240, 234, 0.92) 100%)', borderLeft: `1px solid ${BORDER}`,
      fontFamily: 'var(--font-body)', overflow: 'hidden',
    }}>

      {/* ── HEADER WITH FOCUS MODE / PROCTOR TOGGLE ─────────────────────── */}
      <div style={{
        padding: '14px 18px',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
      }}>
        <div>
          <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block' }}>
            {config?.trackName || 'Interview Track'}
          </span>
          <span style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--main-heading)' }}>
            Session Monitor
          </span>
        </div>

        {/* Toggle between Candidate Focus Mode and Proctor View */}
        <button
          type="button"
          onClick={() => setFocusMode(!focusMode)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: focusMode ? '#F0FDF4' : '#F3F4F6',
            color: focusMode ? '#166534' : '#374151',
            border: `1px solid ${focusMode ? '#BBF7D0' : '#D1D5DB'}`,
            transition: 'all 0.15s ease',
          }}
          title={focusMode ? 'Switch to Proctor Telemetry View' : 'Switch to Clean Focus Mode'}
        >
          <span>{focusMode ? '🛡️ Focus Mode' : '⚙️ Proctor View'}</span>
        </button>
      </div>

      {focusMode ? (
        /* ─────────────────────────────────────────────────────────────
           1. CLEAN CANDIDATE FOCUS VIEW (Default: Zero Score Anxiety)
           ───────────────────────────────────────────────────────────── */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Minimalist Audio Activity & Status Banner */}
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${BORDER}`, backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: GREY, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Microphone Activity
              </span>
              <span style={{ fontSize: '11px', color: GREY, fontWeight: 600 }}>
                {formatTime(elapsedSeconds)}
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: BG,
              border: `1px solid ${BORDER}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* 4-Bar Audio Dynamic Level Equalizer */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '18px' }}>
                  {[12, 16, 10, 14].map((h, i) => {
                    const isBouncing = isVoice && volume > 10;
                    return (
                      <div
                        key={i}
                        style={{
                          width: '3.5px',
                          height: isBouncing ? `${Math.min(18, Math.max(5, (volume / 100) * h * 1.6))}px` : '4px',
                          backgroundColor: isBouncing ? 'var(--btn-sage)' : '#D1D5DB',
                          borderRadius: '2px',
                          transition: 'height 0.12s ease, background-color 0.2s ease'
                        }}
                      />
                    );
                  })}
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--main-heading)' }}>
                    {aiStatus === 'speaking' ? 'Interviewer Speaking' : isVoice ? 'Candidate Speaking' : 'Listening...'}
                  </div>
                  <div style={{ fontSize: '10.5px', color: GREY }}>
                    {isVoice ? `${wpm > 0 ? wpm : 140} WPM · Speech Stream Active` : 'Speak into mic to answer'}
                  </div>
                </div>
              </div>

              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: aiStatus === 'speaking' ? '#F59E0B' : isVoice ? '#10B981' : '#9CA3AF',
                boxShadow: isVoice ? '0 0 8px rgba(16, 185, 129, 0.6)' : 'none'
              }} />
            </div>
          </div>

          {/* Clean Full-Height Live Audio Transcript Stream */}
          <div style={{ flex: 1, padding: '16px 18px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: GREY, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Live Speech Transcript
              </span>
              {isVoice && (
                <span style={{
                  fontSize: '9.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                  backgroundColor: '#111827', color: '#FFFFFF',
                }}>
                  Live
                </span>
              )}
            </div>

            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '14px',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              border: `1px solid ${BORDER}`,
              fontSize: '13px',
              lineHeight: 1.65,
              color: 'var(--main-heading)',
              fontFamily: 'var(--font-body)',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)'
            }}>
              {liveText ? (
                <p style={{ margin: 0 }}>{liveText}</p>
              ) : (
                <p style={{ margin: 0, color: GREY, fontStyle: 'italic', fontSize: '12.5px', lineHeight: 1.5 }}>
                  Speak clearly into your microphone. Your response will appear here in real time to verify technical terms.
                </p>
              )}
            </div>

            {/* Non-Distracting Reassurance Notice at Bottom */}
            <div style={{
              marginTop: '12px',
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '11px',
              color: '#475569',
              lineHeight: 1.4
            }}>
              <span style={{ fontSize: '13px', flexShrink: 0 }}>🔒</span>
              <span>
                <strong>Evaluation Secured:</strong> Turn rubrics, STAR breakdown, and biometric composure heatmaps are silently compiled for your <strong>Post-Interview Report</strong>.
              </span>
            </div>
          </div>

        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────
           2. PROCTOR / MENTOR TELEMETRY VIEW (Accessible on Demand)
           ───────────────────────────────────────────────────────────── */
        <div style={{ flex: 1, overflowY: 'auto' }}>

          {/* ── COGNITIVE LOAD PANEL ── */}
          <div style={{ padding: '16px 18px', borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', fontFamily: 'var(--font-body)' }}>
                Cognitive Load (Proctor)
              </span>
              <span style={{
                fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
                backgroundColor: isAnomaly ? '#111827' : isHighLoad ? '#111827' : BLACK,
                color: '#FFFFFF',
                transition: 'background-color 0.3s ease',
              }}>
                {isAnomaly ? 'Proctor Alert (Reading)' : `${details.cognitiveLoad} Load — ${details.label}`}
              </span>
            </div>

            {/* Load Meter Bar */}
            <div style={{ position: 'relative', margin: '12px 0 6px 0' }}>
              <div style={{ backgroundColor: '#E5E7EB', height: '6px', borderRadius: '3px', width: '100%' }}>
                <div style={{
                  width: `${loadPct}%`, height: '100%', borderRadius: '3px',
                  backgroundColor: isAnomaly ? '#111827' : isHighLoad ? '#111827' : BLACK,
                  transition: 'width 0.4s ease, background-color 0.3s ease',
                }} />
              </div>
              <div style={{
                position: 'absolute', top: '-4px', left: `calc(${loadPct}% - 7px)`,
                width: '14px', height: '14px', borderRadius: '50%',
                backgroundColor: isAnomaly ? '#111827' : isHighLoad ? '#111827' : BLACK,
                border: '2px solid #FFFFFF',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)', transition: 'left 0.4s ease, background-color 0.3s ease',
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: GREY, fontWeight: 600 }}>
              <span>Calm</span>
              <span>Focused</span>
              <span style={{ color: isHighLoad ? '#111827' : GREY }}>High Load</span>
            </div>

            {/* Masked Panic Alert (Only in Proctor View) */}
            {faceTelemetry?.maskedPanicDetected && (
              <div style={{
                marginTop: '10px',
                padding: '8px 10px',
                borderRadius: '6px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #F87171',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '14px' }}>⚠️</span>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#991B1B', display: 'block' }}>
                    Masked Panic Detected
                  </span>
                  <span style={{ fontSize: '10px', color: '#B91C1C', lineHeight: 1.3, display: 'block' }}>
                    Non-Duchenne smile masking autonomic surge (Safety Floor 75% active)
                  </span>
                </div>
              </div>
            )}

            {/* Telemetry Grid */}
            <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ padding: '8px 10px', backgroundColor: BG, borderRadius: '6px', border: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: '10px', color: GREY, display: 'block', fontWeight: 600 }}>Facial Emotion</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: (faceTelemetry?.fearScore || 0) >= 50 ? 'var(--accent-terracotta)' : 'var(--main-heading)' }}>
                  {faceTelemetry?.primaryEmotion || (faceDetected ? 'Calm' : '—')}
                </span>
              </div>
              <div style={{ padding: '8px 10px', backgroundColor: BG, borderRadius: '6px', border: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: '10px', color: GREY, display: 'block', fontWeight: 600 }}>Fear &amp; Stress</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: (faceTelemetry?.fearScore || 0) >= 50 ? 'var(--accent-terracotta)' : 'var(--main-heading)' }}>
                  {faceDetected ? `${faceTelemetry?.fearScore || 0}% Fear · ${faceTelemetry?.facialStressScore || 0}% Stress` : '—'}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ padding: '8px 10px', backgroundColor: BG, borderRadius: '6px', border: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: '10px', color: GREY, display: 'block', fontWeight: 600 }}>Heart Rate &amp; HRV</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: faceTelemetry?.hrBpm && faceTelemetry.hrBpm > 95 ? '#B91C1C' : BLACK }}>
                  {faceTelemetry?.hrBpm ? `${faceTelemetry.hrBpm} BPM · ${faceTelemetry?.hrvMs ?? '—'}ms` : (faceDetected ? 'Stabilizing...' : '—')}
                </span>
              </div>
              <div style={{ padding: '8px 10px', backgroundColor: BG, borderRadius: '6px', border: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: '10px', color: GREY, display: 'block', fontWeight: 600 }}>45s Baseline</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: faceTelemetry?.baselineCalibration?.isCalibrated ? '#15803D' : GREY }}>
                  {faceTelemetry?.baselineCalibration?.isCalibrated
                    ? `${faceTelemetry.baselineCalibration.baseline.hr} BPM`
                    : 'Calibrating...'}
                </span>
              </div>
            </div>
          </div>

          {/* ── INTERVIEW INTELLIGENCE & STAR (PROCTOR) ── */}
          <div style={{ padding: '16px 18px', borderBottom: `1px solid ${BORDER}` }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: GREY, textTransform: 'uppercase', letterSpacing: '0.6px', margin: '0 0 10px 0' }}>
              {isHrTrack ? 'HR & STAR Behavioral Tracker' : 'Technical Intelligence'}
            </p>

            {isHrTrack && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginBottom: '12px' }}>
                {[
                  { key: 'S', label: 'Situation', covered: starAnalysis.hasSituation },
                  { key: 'T', label: 'Task',      covered: starAnalysis.hasTask },
                  { key: 'A', label: 'Action',    covered: starAnalysis.hasAction },
                  { key: 'R', label: 'Result',    covered: starAnalysis.hasResult },
                ].map(({ key, label, covered }) => (
                  <div key={key} style={{
                    padding: '6px 4px', borderRadius: '4px', textAlign: 'center',
                    backgroundColor: covered ? BLACK : '#F3F4F6',
                    color: covered ? '#FFFFFF' : GREY,
                    border: `1px solid ${covered ? BLACK : BORDER}`,
                    transition: 'all 0.2s ease',
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, display: 'block' }}>{key}</span>
                    <span style={{ fontSize: '9px', fontWeight: 600 }}>{covered ? 'Ready' : label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Live Answer Evaluation Card (Only in Proctor View) */}
            {lastRubric && (
              <div style={{
                padding: '8px 10px', borderRadius: '6px',
                backgroundColor: '#F9FAFB', border: `1px solid #E5E7EB`, fontSize: '11px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 700, color: '#111827' }}>
                    {lastRubric.verdict || 'Answer Evaluated'}
                  </span>
                  <span style={{ fontWeight: 800, color: '#111827' }}>{lastRubric.overall}/100</span>
                </div>
                {lastRubric.feedback && (
                  <p style={{ margin: 0, color: '#374151', lineHeight: 1.3 }}>{lastRubric.feedback}</p>
                )}
              </div>
            )}
          </div>

          {/* Transcript in Proctor View */}
          <div style={{ padding: '16px 18px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: GREY, textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: '8px' }}>
              Live Transcript (Proctor)
            </span>
            <div style={{ padding: '10px', borderRadius: '6px', backgroundColor: BG, border: `1px solid ${BORDER}`, fontSize: '12px', maxHeight: '160px', overflowY: 'auto' }}>
              {liveText || 'Waiting for candidate audio...'}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
