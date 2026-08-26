import React, { useState } from 'react';
import { Brain, CheckCircle2, ShieldAlert, Sparkles, HelpCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { DISTORTIONS } from '../services/aiEngine';

export default function CognitiveReappraisal({ selectedDistortion, setActiveTab }) {
  // Use passed distortion or default to Catastrophizing example
  const activeDistortion = selectedDistortion || DISTORTIONS.CATASTROPHIZING;

  const [evidenceSupporting, setEvidenceSupporting] = useState('');
  const [evidenceContradicting, setEvidenceContradicting] = useState('');
  const [friendAdvice, setFriendAdvice] = useState('');
  const [userBalancedThought, setUserBalancedThought] = useState('');
  const [exerciseCompleted, setExerciseCompleted] = useState(false);

  const handleCompleteExercise = (e) => {
    e.preventDefault();
    setExerciseCompleted(true);
  };

  return (
    <div style={{ flex: 1, padding: '28px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Banner */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Brain color="#111827" size={28} />
            Cognitive Reappraisal & CBT Restructuring
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Module 7: Replace irrational negative thoughts with balanced, evidence-based thinking to reduce interview anxiety.
          </p>
        </div>
        <button 
          onClick={() => setActiveTab && setActiveTab('dashboard')}
          className="btn-secondary-spec"
          style={{ padding: '8px 18px', fontSize: '0.85rem' }}
        >
          Back to Dashboard
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '24px' }}>
        
        {/* Left Interactive Worksheet */}
        <div className="glass-card" style={{ padding: '24px' }}>
          
          {/* Active Distortion Highlight Card */}
          <div style={{
            padding: '16px',
            borderRadius: '12px',
            backgroundColor: '#F3F4F6',
            border: '1px solid #E5E7EB',
            marginBottom: '24px'
          }}>
            <span className="pill-tag" style={{ marginBottom: '6px' }}>Target Distortion</span>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '4px' }}>
              {activeDistortion.name}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {activeDistortion.explanation}
            </p>
          </div>

          <form onSubmit={handleCompleteExercise}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', color: '#111827' }}>
              Guided Evidence Evaluation Exercise
            </h3>

            {/* Evidence Supporting */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                <HelpCircle size={14} color="#111827" />
                1. What concrete evidence supports your negative thought?
              </label>
              <textarea 
                rows="2"
                placeholder="e.g. I struggled with 1 dynamic programming question yesterday."
                value={evidenceSupporting}
                onChange={(e) => setEvidenceSupporting(e.target.value)}
                className="input-field"
              />
            </div>

            {/* Evidence Contradicting */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                <HelpCircle size={14} color="#111827" />
                2. What evidence contradicts it or proves past success?
              </label>
              <textarea 
                rows="2"
                placeholder="e.g. I have cleared Array and String rounds before, and my overall CGPA is 8.4."
                value={evidenceContradicting}
                onChange={(e) => setEvidenceContradicting(e.target.value)}
                className="input-field"
              />
            </div>

            {/* Friend Advice */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                <HelpCircle size={14} color="#111827" />
                3. What advice would you give a friend in your exact situation?
              </label>
              <textarea 
                rows="2"
                placeholder="e.g. I would tell them that one tough interview doesn't define their potential, and to keep practicing."
                value={friendAdvice}
                onChange={(e) => setFriendAdvice(e.target.value)}
                className="input-field"
              />
            </div>

            <button type="submit" className="btn-primary-spec" style={{ width: '100%', justifyContent: 'center' }}>
              Generate Balanced Thought & Complete Exercise
            </button>
          </form>
        </div>

        {/* Right Output: AI Reappraisal & Balanced Thought */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* AI Recommended Balanced Thought Card */}
          <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid #111827' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles color="#111827" size={20} />
              AI Reappraisal: Balanced Perspective
            </h3>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Instead of dismissive toxic positivity, the AI constructs a grounded, rational alternative:
            </p>

            <div style={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              marginBottom: '16px'
            }}>
              <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', fontStyle: 'italic' }}>
                "{activeDistortion.balancedThought}"
              </p>
            </div>

            {exerciseCompleted && (
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: '#111827',
                color: '#FFFFFF',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle2 size={18} /> Emotional Resilience Score +15 Points Awarded!
              </div>
            )}
          </div>

          {/* Recommended Recovery Coping Strategies */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>
              Recommended Follow-Up Actions
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={() => setActiveTab('recovery')} className="btn-secondary-spec" style={{ justifyContent: 'flex-start' }}>
                <span>5-Minute Guided Box Breathing</span>
              </button>
              <button onClick={() => setActiveTab('coding')} className="btn-secondary-spec" style={{ justifyContent: 'flex-start' }}>
                <span>Solve 1 Easy Array Practice Problem</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

