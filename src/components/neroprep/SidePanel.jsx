import React from 'react';
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
  const config      = useInterviewStore((s) => s.config);
  const stressIndex = useInterviewStore((s) => s.stressIndex) || 0;
  const transcript  = useInterviewStore((s) => s.transcript) || [];
  const lastRubric  = useInterviewStore((s) => s.lastRubric);

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
      backgroundColor: '#FFFFFF', borderLeft: `1px solid ${BORDER}`,
      fontFamily: 'var(--font-inter)', overflow: 'hidden',
    }}>

      {/* ── 1. COGNITIVE LOAD PANEL ───────────────────────────────────────── */}
      <div style={{ padding: '16px 18px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: GREY, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Cognitive Load
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

        {/* Load Meter Bar: Calm --- ● --- High */}
        <div style={{ position: 'relative', margin: '12px 0 6px 0' }}>
          <div style={{ backgroundColor: '#E5E7EB', height: '6px', borderRadius: '3px', width: '100%' }}>
            <div style={{
              width: `${loadPct}%`, height: '100%', borderRadius: '3px',
              backgroundColor: isAnomaly ? '#111827' : isHighLoad ? '#111827' : BLACK,
              transition: 'width 0.4s ease, background-color 0.3s ease',
            }} />
          </div>
          {/* Active Marker Dot */}
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

        {/* Telemetry rows */}
        <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ padding: '8px 10px', backgroundColor: BG, borderRadius: '6px', border: `1px solid ${BORDER}` }}>
            <span style={{ fontSize: '10px', color: GREY, display: 'block', fontWeight: 600 }}>Speech Pace</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: wpm > 180 ? '#111827' : BLACK }}>
              {wpm > 180 ? `${wpm} WPM (Fast)` : wpm > 0 && wpm < 80 ? `${wpm} WPM (Slow)` : wpm > 0 ? `${wpm} WPM (Normal)` : '—'}
            </span>
          </div>
          <div style={{ padding: '8px 10px', backgroundColor: BG, borderRadius: '6px', border: `1px solid ${BORDER}` }}>
            <span style={{ fontSize: '10px', color: GREY, display: 'block', fontWeight: 600 }}>Eye Contact</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: eyeContact < 55 ? '#111827' : BLACK }}>
              {eyeContact < 55 ? `${Math.round(eyeContact)}% (Gaze Away)` : `${Math.round(eyeContact)}%`}
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. INTERVIEW INTELLIGENCE PANEL ───────────────────────────────── */}
      <div style={{ padding: '16px 18px', borderBottom: `1px solid ${BORDER}` }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: GREY, textTransform: 'uppercase', letterSpacing: '0.6px', margin: '0 0 10px 0' }}>
          {isHrTrack ? 'HR & STAR Behavioral Tracker' : 'Interview Intelligence'}
        </p>

        {isHrTrack ? (
          <div>
            {/* STAR Coverage Chips */}
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: GREY }}>Interviewer</span>
                <span style={{ fontWeight: 600, color: BLACK }}>Maya (Senior HR Lead)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: GREY }}>STAR Completeness</span>
                <span style={{ fontWeight: 700, color: Object.values(starAnalysis).filter(Boolean).length >= 3 ? '#111827' : BLACK }}>
                  {Object.values(starAnalysis).filter(Boolean).length} / 4 Components
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: GREY }}>Speech Pacing</span>
                <span style={{ fontWeight: 600, color: wpm >= 120 && wpm <= 160 ? '#111827' : BLACK }}>
                  {wpm > 0 ? `${wpm} WPM (${wpm >= 120 && wpm <= 160 ? 'Optimal' : wpm < 120 ? 'Slow' : 'Fast'})` : '—'}
                </span>
              </div>
            </div>

            {/* Live Answer Evaluation Card */}
            {lastRubric && (
              <div style={{
                marginTop: '10px', padding: '8px 10px', borderRadius: '6px',
                backgroundColor: '#F9FAFB',
                border: `1px solid #E5E7EB`,
                fontSize: '11px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 700, color: (lastRubric.overall >= 80) ? '#111827' : (lastRubric.overall >= 55) ? '#374151' : '#6B7280' }}>
                    {lastRubric.verdict || (lastRubric.overall >= 80 ? 'Strong' : lastRubric.overall >= 55 ? 'Partially Correct' : 'Needs Improvement')}
                  </span>
                  <span style={{ fontWeight: 800, color: '#111827' }}>{lastRubric.overall}/100</span>
                </div>
                {lastRubric.feedback && (
                  <p style={{ margin: 0, color: '#374151', lineHeight: 1.3 }}>{lastRubric.feedback}</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'Voice Status',  value: isVoice ? 'Speaking' : 'Listening' },
              { label: 'Speech WPM',    value: wpm > 0 ? `${wpm} wpm` : '—' },
              { label: 'Difficulty',    value: 'Adaptive' },
              { label: 'Mode',          value: aiStatus === 'speaking' ? 'AI Turn' : 'Candidate Turn' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: GREY }}>{label}</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: BLACK }}>{value}</span>
              </div>
            ))}
            {lastRubric && (
              <div style={{
                marginTop: '6px', padding: '8px 10px', borderRadius: '6px',
                backgroundColor: (lastRubric.overall >= 80) ? '#F3F4F6' : '#F3F4F6',
                border: `1px solid ${(lastRubric.overall >= 80) ? '#E5E7EB' : '#E5E7EB'}`,
                fontSize: '11px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: (lastRubric.overall >= 80) ? '#111827' : '#111827' }}>
                  <span>{lastRubric.verdict || 'Answer Evaluated'}</span>
                  <span>{lastRubric.overall}/100</span>
                </div>
                {lastRubric.feedback && <p style={{ margin: '2px 0 0 0', color: '#374151' }}>{lastRubric.feedback}</p>}
              </div>
            )}
          </div>
        )}
      </div>


      {/* ── 4. LIVE TRANSCRIPT (NO CHAT UI) ───────────────────────────────── */}
      <div style={{ flex: 1, padding: '16px 18px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: GREY, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Live Transcript
          </span>
          {isVoice && (
            <span style={{
              fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
              backgroundColor: BLACK, color: '#FFFFFF',
            }}>
              Live
            </span>
          )}
        </div>

        <div style={{
          flex: 1, overflowY: 'auto', padding: '12px', borderRadius: '6px',
          backgroundColor: BG, border: `1px solid ${BORDER}`,
          fontSize: '12.5px', lineHeight: 1.6, color: BLACK,
          fontFamily: 'var(--font-inter)',
        }}>
          {liveText ? (
            <p style={{ margin: 0 }}>{liveText}</p>
          ) : (
            <p style={{ margin: 0, color: GREY, fontStyle: 'italic', fontSize: '12px' }}>
              Speak into your microphone. Your live spoken response will be transcribed here.
            </p>
          )}
        </div>
      </div>

    </div>
  );
}
