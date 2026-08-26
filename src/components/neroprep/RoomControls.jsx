import React from 'react';
import useInterviewStore from '../../store/interviewStore';

export default function RoomControls() {
  const exitInterview = useInterviewStore((state) => state.exitInterview);
  const endInterview = useInterviewStore((state) => state.endInterview);
  const addTranscriptLine = useInterviewStore((state) => state.addTranscriptLine);
  const setStressIndex = useInterviewStore((state) => state.setStressIndex);

  const handleSimulateStress = () => setStressIndex(Math.floor(Math.random() * 100));
  const handleSimulateAnswer = () => {
    addTranscriptLine({ role: 'user', text: 'I would use a hash map to achieve O(N) time complexity and handle collisions with chaining.' });
    setTimeout(() => {
      addTranscriptLine({ role: 'ai', text: 'Good approach. How would you handle cases where the hash function produces many collisions?' });
    }, 900);
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', height: '64px', fontFamily: 'var(--font-inter)'
    }}>

      {/* Left: Dev simulation tools */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleSimulateStress}
          className="btn-primary-spec"
          style={{ padding: '8px 14px', fontSize: '13px', borderRadius: '8px' }}
        >
          Simulate Stress
        </button>
        <button
          onClick={handleSimulateAnswer}
          className="btn-primary-spec"
          style={{ padding: '8px 14px', fontSize: '13px', borderRadius: '8px' }}
        >
          Simulate Answer
        </button>
      </div>

      {/* Center: A/V controls */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          className="btn-primary-spec"
          style={{ padding: '8px 20px', fontSize: '13px', borderRadius: '20px' }}
        >
          Mic — On
        </button>
        <button
          className="btn-primary-spec"
          style={{ padding: '8px 20px', fontSize: '13px', borderRadius: '20px' }}
        >
          Camera — On
        </button>
      </div>

      {/* Right: Session controls */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={exitInterview}
          style={{
            padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            backgroundColor: '#FFFFFF', color: 'var(--text-muted)', border: '1px solid var(--border-color)',
            borderRadius: '8px', transition: 'all 0.15s ease'
          }}
        >
          Exit Room
        </button>
        <button
          onClick={endInterview}
          style={{
            padding: '8px 16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
            backgroundColor: '#475569', color: '#FFFFFF', border: 'none',
            borderRadius: '8px', transition: 'background-color 0.15s ease'
          }}
        >
          End Interview
        </button>
      </div>

    </div>
  );
}
