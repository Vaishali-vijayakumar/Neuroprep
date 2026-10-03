import React, { useEffect, useRef, useState } from 'react';
import { TalkingHeadEngine } from './engines/TalkingHeadEngine';

export default function TalkingHeadAvatar({
  isSpeaking = false,
  isListening = false,
  isEmpathyActive = false,
  spokenText = '',
  width = '100%',
  height = '100%'
}) {
  const containerRef = useRef(null);
  const engineRef = useRef(null);
  const [webGlFailed, setWebGlFailed] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      const engine = new TalkingHeadEngine(containerRef.current);
      engineRef.current = engine;
    } catch (err) {
      console.warn('[TalkingHeadAvatar] WebGL Avatar notice (using smooth fallback):', err.message);
      setWebGlFailed(true);
    }

    return () => {
      try {
        engineRef.current?.destroy();
      } catch (_) {}
      engineRef.current = null;
    };
  }, []);

  // Update speech state and trigger visemes
  useEffect(() => {
    if (!engineRef.current) return;
    try {
      if (isSpeaking && spokenText) {
        engineRef.current.speakText(spokenText);
      } else {
        engineRef.current.stopSpeaking();
      }
    } catch (_) {}
  }, [isSpeaking, spokenText]);

  // Update listening state (attentive nodding)
  useEffect(() => {
    if (engineRef.current) {
      try {
        engineRef.current.setListening(isListening);
      } catch (_) {}
    }
  }, [isListening]);

  // Update empathy mode (reassuring tilt & brow raise)
  useEffect(() => {
    if (engineRef.current) {
      try {
        engineRef.current.setEmpathyMode(isEmpathyActive);
      } catch (_) {}
    }
  }, [isEmpathyActive]);

  if (webGlFailed) {
    return (
      <div style={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isEmpathyActive ? '#9A6854' : 'var(--btn-sage)',
        color: '#F7F3EE',
        borderRadius: '14px',
        animation: isEmpathyActive ? 'avatarNodLean 2.5s infinite ease-in-out' : (isSpeaking ? 'microCalmPulse 2.5s infinite' : 'none')
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#F7F3EE' }} />
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#F7F3EE' }} />
          </div>
          <div style={{
            width: isSpeaking ? '12px' : '8px',
            height: isSpeaking ? '6px' : '3px',
            borderRadius: isSpeaking ? '50%' : '2px',
            backgroundColor: '#F7F3EE',
            transition: 'all 0.15s ease'
          }} />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '14px',
        backgroundColor: '#FAF8F5'
      }}
    />
  );
}
