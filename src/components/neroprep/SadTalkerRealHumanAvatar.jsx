import React, { useEffect, useRef, useState } from 'react';
import { TalkingHead } from '@met4citizen/talkinghead';
import { LipsyncEn } from '@met4citizen/talkinghead/modules/lipsync-en.mjs';

/**
 * 100% Free ($0 Forever) 3D WebGL TalkingHead Personas.
 * Renders real-time 3D GLB avatars in the browser with Oculus Viseme lip-sync,
 * blinking, eye contact, head motion, and mood expressions.
 * Keeps CORS-enabled portrait posters as an instant loading/fallback layer.
 */
const GLB_FEMALE = 'https://cdn.jsdelivr.net/gh/met4citizen/TalkingHead@1.8/avatars/brunette.glb';
const GLB_MALE   = 'https://cdn.jsdelivr.net/gh/met4citizen/TalkingHead@1.8/avatars/avaturn.glb';

export const SADTALKER_TRACK_PERSONAS = {
  hr: {
    name: 'Maya',
    role: 'HR Talent Lead',
    glbUrl: GLB_FEMALE,
    body: 'F',
    posterUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=85'
  },
  tech: {
    name: 'Alex',
    role: 'Technical Specialist',
    glbUrl: GLB_MALE,
    body: 'M',
    posterUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=85'
  },
  dsa: {
    name: 'Aria',
    role: 'DSA Evaluator',
    glbUrl: GLB_FEMALE,
    body: 'F',
    posterUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=85'
  },
  coding: {
    name: 'Aria',
    role: 'Live Coding Lead',
    glbUrl: GLB_FEMALE,
    body: 'F',
    posterUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=85'
  },
  system_design: {
    name: 'Daniel',
    role: 'System Architect',
    glbUrl: GLB_MALE,
    body: 'M',
    posterUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=85'
  },
  lld: {
    name: 'Daniel',
    role: 'LLD Specialist',
    glbUrl: GLB_MALE,
    body: 'M',
    posterUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=85'
  },
  behavioral: {
    name: 'Maya',
    role: 'Behavioral Evaluator',
    glbUrl: GLB_FEMALE,
    body: 'F',
    posterUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=85'
  },
  managerial: {
    name: 'Sarah',
    role: 'Engineering Manager',
    glbUrl: GLB_FEMALE,
    body: 'F',
    posterUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=85'
  },
  project: {
    name: 'Alex',
    role: 'Project Viva Examiner',
    glbUrl: GLB_MALE,
    body: 'M',
    posterUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=85'
  },
  resume: {
    name: 'Sarah',
    role: 'Resume Examiner',
    glbUrl: GLB_FEMALE,
    body: 'F',
    posterUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=85'
  },
  stress: {
    name: 'Victor',
    role: 'Stress Interviewer',
    glbUrl: GLB_MALE,
    body: 'M',
    posterUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=85'
  },
  ai_ml: {
    name: 'Nova',
    role: 'AI / ML Specialist',
    glbUrl: GLB_FEMALE,
    body: 'F',
    posterUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=85'
  },
  cybersecurity: {
    name: 'Cipher',
    role: 'Security Architect',
    glbUrl: GLB_MALE,
    body: 'M',
    posterUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=85'
  },
  cloud: {
    name: 'Marcus',
    role: 'Cloud Architect',
    glbUrl: GLB_MALE,
    body: 'M',
    posterUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=85'
  },
  devops: {
    name: 'Soren',
    role: 'DevOps Engineer',
    glbUrl: GLB_MALE,
    body: 'M',
    posterUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=85'
  },
  default: {
    name: 'Morgan',
    role: 'AI Interviewer',
    glbUrl: GLB_FEMALE,
    body: 'F',
    posterUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=85'
  }
};

/**
 * Build word-timing arrays from text so TalkingHead's Oculus Viseme engine
 * animates real phoneme lip-sync alongside browser Web Speech TTS.
 */
function buildWordTimings(text) {
  const words = String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const wtimes = [];
  const wdurations = [];
  let cursorMs = 0;

  for (const w of words) {
    const dur = Math.min(520, Math.max(170, w.length * 52));
    wtimes.push(cursorMs);
    wdurations.push(dur);
    cursorMs += dur + 45;
  }
  return { words, wtimes, wdurations, totalMs: Math.max(600, cursorMs) };
}

export default function SadTalkerRealHumanAvatar({
  aiStatus = 'speaking', // 'speaking' | 'listening' | 'thinking' | 'connecting'
  isEmpathyActive = false,
  spokenText = '',
  trackId = 'hr',
  width = '100%',
  height = '100%'
}) {
  const containerRef = useRef(null);
  const headRef = useRef(null);
  const lastSpokenRef = useRef('');
  const [avatarReady, setAvatarReady] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const cleanTrackId = String(trackId || 'hr').toLowerCase();
  const persona = SADTALKER_TRACK_PERSONAS[cleanTrackId] || SADTALKER_TRACK_PERSONAS.default;
  const isSpeaking = aiStatus === 'speaking';

  // Initialize TalkingHead 3D WebGL scene and load persona GLB
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    let cancelled = false;
    setAvatarReady(false);
    setAvatarError(false);

    let head = null;
    try {
      head = new TalkingHead(node, {
        ttsEndpoint: null,
        lipsyncModules: [],
        cameraView: 'head',
        cameraDistance: 0.42,
        cameraY: 0.04,
        lightAmbientColor: 0xffffff,
        lightAmbientIntensity: 2.2,
        lightDirectColor: 0xfff5eb,
        lightDirectIntensity: 18,
        avatarMood: 'neutral'
      });
      // Register bundled English viseme processor directly (safe for Vite production builds)
      head.lipsync['en'] = new LipsyncEn();
      headRef.current = head;

      head
        .showAvatar({
          url: persona.glbUrl,
          body: persona.body,
          avatarMood: 'neutral',
          lipsyncLang: 'en'
        })
        .then(() => {
          if (cancelled) return;
          setAvatarReady(true);
        })
        .catch((err) => {
          if (cancelled) return;
          console.warn('[TalkingHead] 3D GLB load fallback:', err?.message || err);
          setAvatarError(true);
        });
    } catch (err) {
      console.warn('[TalkingHead] WebGL init fallback:', err?.message || err);
      setAvatarError(true);
    }

    return () => {
      cancelled = true;
      try {
        head?.stopSpeaking?.();
        head?.dispose?.();
      } catch {
        // ignore cleanup errors
      }
      if (headRef.current === head) {
        headRef.current = null;
      }
      if (node) {
        node.innerHTML = '';
      }
    };
  }, [persona.glbUrl, persona.body]);

  // Sync facial mood with empathy / track
  useEffect(() => {
    const head = headRef.current;
    if (!head || !avatarReady) return;
    try {
      if (isEmpathyActive) {
        head.setMood('happy');
      } else if (cleanTrackId === 'stress') {
        head.setMood('neutral');
      } else {
        head.setMood('neutral');
      }
    } catch {
      // ignore mood errors
    }
  }, [isEmpathyActive, cleanTrackId, avatarReady]);

  // Trigger real-time 3D viseme lip-sync when speaking, stop immediately when listening
  useEffect(() => {
    const head = headRef.current;
    if (!head || !avatarReady) return;

    if (!isSpeaking) {
      try {
        head.stopSpeaking();
      } catch {
        // ignore
      }
      lastSpokenRef.current = '';
      return;
    }

    const text = (spokenText || '').trim();
    if (!text || text === lastSpokenRef.current) return;
    lastSpokenRef.current = text;

    try {
      if (head.audioCtx?.state === 'suspended') {
        head.audioCtx.resume().catch(() => {});
      }
      const { words, wtimes, wdurations, totalMs } = buildWordTimings(text);
      if (!words.length || !head.audioCtx) return;

      // Silent AudioBuffer drives TalkingHead's exact viseme timeline while VoiceEngine speaks
      const sampleRate = head.audioCtx.sampleRate || 44100;
      const frameCount = Math.max(1, Math.ceil((totalMs / 1000) * sampleRate));
      const silentBuffer = head.audioCtx.createBuffer(1, frameCount, sampleRate);

      head.speakAudio(
        { audio: silentBuffer, words, wtimes, wdurations },
        { lipsyncLang: 'en' }
      );
    } catch (err) {
      console.warn('[TalkingHead] lipsync notice:', err?.message || err);
    }
  }, [isSpeaking, spokenText, avatarReady]);

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'radial-gradient(circle at 50% 35%, #2D3B33 0%, #161D19 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <style>{`
        @keyframes avatarVoiceBar {
          0%, 100% { height: 4px; }
          50% { height: 12px; }
        }
      `}</style>

      {/* Instant Portrait Fallback while 3D WebGL GLB loads (or if WebGL unavailable) */}
      {(!avatarReady || avatarError) && (
        <img
          src={persona.posterUrl}
          alt={persona.name}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scale(1.04)',
            filter: isEmpathyActive ? 'contrast(1.06) saturate(1.12)' : 'contrast(1.02)'
          }}
        />
      )}

      {/* 3D WebGL TalkingHead Container */}
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: avatarReady && !avatarError ? 1 : 0,
          transition: 'opacity 0.35s ease'
        }}
      />

      {/* Subtle Live Activity Indicator (Voice Bars / Listening Dot) */}
      <div
        aria-label={isSpeaking ? 'Interviewer speaking' : `Interviewer ${aiStatus}`}
        style={{
          position: 'absolute',
          bottom: '6px',
          right: '6px',
          padding: '3px 6px',
          borderRadius: '999px',
          background: 'rgba(17, 24, 20, 0.72)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          gap: '2.5px',
          pointerEvents: 'none',
          zIndex: 2
        }}
      >
        {isSpeaking ? (
          <>
            <span style={{ width: '2.5px', background: '#6EE7B7', borderRadius: '2px', animation: 'avatarVoiceBar 0.55s ease-in-out infinite' }} />
            <span style={{ width: '2.5px', background: '#6EE7B7', borderRadius: '2px', animation: 'avatarVoiceBar 0.45s ease-in-out 0.15s infinite' }} />
            <span style={{ width: '2.5px', background: '#6EE7B7', borderRadius: '2px', animation: 'avatarVoiceBar 0.6s ease-in-out 0.3s infinite' }} />
          </>
        ) : (
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: aiStatus === 'thinking' ? '#FBBF24' : '#93C5FD'
            }}
          />
        )}
      </div>
    </div>
  );
}
