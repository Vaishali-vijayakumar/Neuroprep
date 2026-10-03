import React, { useEffect, useRef, useState } from 'react';
import { RealisticHumanEngine } from './engines/RealisticHumanEngine';
import { Volume2, Sparkles } from 'lucide-react';

export default function Realistic3DHumanAvatar({
  aiStatus = 'speaking', // 'speaking' | 'listening' | 'thinking' | 'connecting'
  isEmpathyActive = false,
  spokenText = '',
  trackId = 'hr',
  width = '100%',
  height = '100%'
}) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const containerRef = useRef(null);
  const [hasWebGLError, setHasWebGLError] = useState(false);

  const getModelType = (tId) => {
    if (tId === 'tech' || tId === 'dsa' || tId === 'coding') return 'tech_male';
    if (tId === 'system_design' || tId === 'lld') return 'architect_male';
    if (tId === 'managerial' || tId === 'behavioral') return 'manager_female';
    return 'hr_female';
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    try {
      const rect = container.getBoundingClientRect();
      const w = Math.max(120, Math.round(rect.width || 140));
      const h = Math.max(120, Math.round(rect.height || 140));

      const engine = new RealisticHumanEngine(canvas, {
        modelType: getModelType(trackId),
        width: w,
        height: h
      });

      engineRef.current = engine;
    } catch (err) {
      console.warn('[Realistic3DHumanAvatar] WebGL notice:', err);
      setHasWebGLError(true);
    }

    return () => {
      engineRef.current?.destroy?.();
      engineRef.current = null;
    };
  }, [trackId]);

  // Sync AI state changes into avatar engine in real-time
  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.setExpressionState({
      isSpeaking: aiStatus === 'speaking',
      isListening: aiStatus === 'listening',
      isEmpathyActive,
      spokenText
    });
  }, [aiStatus, isEmpathyActive, spokenText]);

  // Handle dynamic resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && engineRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        engineRef.current.resize(rect.width, rect.height);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width,
        height,
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'radial-gradient(circle at 50% 35%, #35413A 0%, #1A221E 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* 3D WebGL Realistic Human Canvas */}
      {!hasWebGLError && (
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            outline: 'none'
          }}
        />
      )}

      {/* Fallback Display if WebGL context disabled */}
      {hasWebGLError && (
        <div style={{ textAlign: 'center', padding: '10px' }}>
          <div style={{ fontSize: '32px', marginBottom: '4px' }}>👩‍💼</div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#FFFFFF' }}>
            {aiStatus === 'speaking' ? 'Interviewer Speaking' : 'Listening Intently'}
          </div>
        </div>
      )}
    </div>
  );
}
