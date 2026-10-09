import React, { useState } from 'react';
import { 
  ShieldCheck, Brain, TrendingUp, AlertCircle, 
  Sparkles, Database, CheckCircle2, RefreshCw, 
  ArrowRight, FileText, Target, BookOpen, Layers
} from 'lucide-react';
import { generateMoodRecoveryRAG, KNOWLEDGE_CHUNKS } from '../services/placementMoodRecoveryRAG';

export default function PlacementMoodRecoveryRAG() {
  const [userVent, setUserVent] = useState('');
  const [stage, setStage] = useState('technical_2');
  const [companyType, setCompanyType] = useState('Fintech / Tier-1 Product');
  const [isLoading, setIsLoading] = useState(false);
  const [deconstructionResult, setDeconstructionResult] = useState(null);
  const [showRetrievedChunks, setShowRetrievedChunks] = useState(false);

  // Quick preset real-life candidate situations
  const PRESET_SCENARIOS = [
    {
      label: 'Eliminated in Round 2',
      vent: "I was eliminated in Round 2 of the fintech drive. Everyone else got through. I'm just not built for this, I should quit preparing.",
      stage: 'technical_2',
      companyType: 'Fintech Firm'
    },
    {
      label: 'Froze on Live Coding',
      vent: "I completely blanked out on a Graph question in front of the interviewer. My hands froze and I feel like an absolute fraud.",
      stage: 'technical_1',
      companyType: 'Product MNC'
    },
    {
      label: 'Repeated OA Failures',
      vent: "Failed 4 consecutive campus OAs this week while my batchmates are getting shortlisted. It feels like my preparation was completely useless.",
      stage: 'oa',
      companyType: 'Enterprise / MNC'
    },
    {
      label: 'Batchmates Placed First',
      vent: "My 3 closest friends just received their offer letters. I'm the only one left unplaced. I feel like my career is ruined before it even started.",
      stage: 'final_round',
      companyType: 'Campus Drive'
    }
  ];

  const handleApplyPreset = (preset) => {
    setUserVent(preset.vent);
    setStage(preset.stage);
    setCompanyType(preset.companyType);
  };

  const handleRunRAG = async (e) => {
    if (e) e.preventDefault();
    if (!userVent.trim()) return;

    setIsLoading(true);
    setDeconstructionResult(null);

    try {
      // Simulate slight micro-delay for vector retrieval feedback
      await new Promise(r => setTimeout(r, 450));
      const res = await generateMoodRecoveryRAG({
        userVent,
        stage,
        companyType
      });
      setDeconstructionResult(res);
    } catch (err) {
      console.error("RAG execution failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="saas-card-spec" style={{ padding: '32px', marginBottom: '36px', backgroundColor: 'var(--bg-card-solid)', border: '1px solid var(--border-color)' }}>
      
      {/* 1. Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '22px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="pill-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', margin: 0, backgroundColor: 'rgba(82, 98, 87, 0.1)', color: 'var(--btn-sage)' }}>
              <ShieldCheck style={{ width: '13px', height: '13px', color: 'var(--btn-sage)' }} />
              Placement Reality Engine
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
              CBT Vector Knowledge Grounding
            </span>
          </div>

          <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--secondary-heading)', margin: 0 }}>
            Post-Interview Reality Check & Rebound Analyzer
          </h3>
          <p style={{ color: 'var(--body-text)', fontSize: '14px', margin: '6px 0 0 0', maxWidth: '780px', lineHeight: 1.5 }}>
            A clinical RAG pipeline addressing placement burnout. Replaces generic cheerleading with grounded hiring math, 
            CBT cognitive distortion diagnosis, and verified alumni rebound trajectories.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowRetrievedChunks(!showRetrievedChunks)}
          style={{
            padding: '7px 14px',
            fontSize: '12px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'transparent',
            color: 'var(--body-text)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Database style={{ width: '13px', height: '13px', color: 'var(--btn-sage)' }} />
          <span>{showRetrievedChunks ? 'Hide Knowledge Base' : 'Inspect RAG Corpus'}</span>
        </button>
      </div>

      {/* Expandable Knowledge Base Inspection */}
      {showRetrievedChunks && (
        <div style={{
          marginBottom: '24px',
          padding: '18px 20px',
          borderRadius: '12px',
          backgroundColor: 'var(--bg-main)',
          border: '1px solid var(--border-color)'
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '13.5px', fontWeight: 800, color: 'var(--main-heading)' }}>
            Active RAG Grounding Vector Store (3 Domain Corpora)
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-card-solid)', border: '1px solid var(--border-color)' }}>
              <strong style={{ fontSize: '12px', color: 'var(--btn-sage)', display: 'block', marginBottom: '4px' }}>1. CBT Distortion Corpus</strong>
              <p style={{ fontSize: '11.5px', color: 'var(--body-text)', margin: 0 }}>CBT Thought records separating isolated technical variables from personal capacity.</p>
            </div>
            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-card-solid)', border: '1px solid var(--border-color)' }}>
              <strong style={{ fontSize: '12px', color: 'var(--accent-terracotta)', display: 'block', marginBottom: '4px' }}>2. Placement Funnel Realities</strong>
              <p style={{ fontSize: '11.5px', color: 'var(--body-text)', margin: 0 }}>60-75% Round 2 attrition statistics, quota caps, and automated OA threshold mechanics.</p>
            </div>
            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-card-solid)', border: '1px solid var(--border-color)' }}>
              <strong style={{ fontSize: '12px', color: 'var(--secondary-olive)', display: 'block', marginBottom: '4px' }}>3. Verified Alumni Case Studies</strong>
              <p style={{ fontSize: '11.5px', color: 'var(--body-text)', margin: 0 }}>Anonymized recovery timelines showing 48h skill gap fixes yielding offers within 7-14 days.</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Scenario Presets */}
      <div style={{ marginBottom: '16px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
          Select a Common Situation or Describe Your Own
        </span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {PRESET_SCENARIOS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--main-heading)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--btn-sage)';
                e.currentTarget.style.backgroundColor = 'rgba(82, 98, 87, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.backgroundColor = 'var(--bg-main)';
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Input Query Form */}
      <form onSubmit={handleRunRAG} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
        <textarea
          rows={3}
          value={userVent}
          onChange={(e) => setUserVent(e.target.value)}
          placeholder="Describe your interview setback or thoughts (e.g., Eliminated in Round 2, froze on graph traversal, feel like quitting...)"
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            fontSize: '13.5px',
            fontFamily: 'inherit',
            backgroundColor: 'var(--bg-main)',
            color: 'var(--main-heading)',
            outline: 'none',
            resize: 'vertical',
            lineHeight: 1.5
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginRight: '6px' }}>Round Stage:</span>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--main-heading)',
                  fontSize: '12px',
                  outline: 'none'
                }}
              >
                <option value="oa">Online Assessment (OA)</option>
                <option value="technical_1">Round 1 Technical</option>
                <option value="technical_2">Round 2 Technical</option>
                <option value="final_round">Final / Managerial Round</option>
                <option value="hr">HR Round</option>
              </select>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginRight: '6px' }}>Target Sector:</span>
              <select
                value={companyType}
                onChange={(e) => setCompanyType(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--main-heading)',
                  fontSize: '12px',
                  outline: 'none'
                }}
              >
                <option value="Fintech Firm">Fintech Firm</option>
                <option value="Product MNC">Tier-1 Product MNC</option>
                <option value="Fast Startup">Fast-Growing Startup</option>
                <option value="Enterprise / MNC">Enterprise / Campus Recruiter</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !userVent.trim()}
            className="btn-primary-spec"
            style={{
              padding: '9px 20px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '8px',
              backgroundColor: 'var(--btn-sage)',
              color: '#ffffff',
              border: '1px solid var(--btn-sage-hover)',
              cursor: isLoading || !userVent.trim() ? 'not-allowed' : 'pointer',
              opacity: isLoading || !userVent.trim() ? 0.7 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {isLoading ? <RefreshCw style={{ width: '14px', height: '14px', animation: 'spin 1s infinite linear', color: '#ffffff' }} /> : <Sparkles style={{ width: '14px', height: '14px', color: '#ffffff' }} />}
            <span style={{ color: '#ffffff' }}>{isLoading ? 'Retrieving Grounding Chunks...' : 'Deconstruct Rejection with RAG'}</span>
          </button>
        </div>
      </form>

      {/* 4. Structured RAG Deconstruction Output */}
      {deconstructionResult && (
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--main-heading)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Clinical Evidence-Grounded Audit
            </span>
            <span style={{ fontSize: '11.5px', color: 'var(--btn-sage)', fontWeight: 700 }}>
              3 Grounded Vector Anchors Retrieved
            </span>
          </div>

          {/* 4-Pillar Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            
            {/* Pillar 1: Cognitive Distortion Diagnosis */}
            <div style={{ padding: '18px', borderRadius: '12px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Brain style={{ width: '15px', height: '15px', color: 'var(--btn-sage)' }} />
                <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                  1. Cognitive Distortion Diagnosis
                </span>
              </div>
              <h5 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--main-heading)' }}>
                {deconstructionResult.diagnosis.distortionType}
              </h5>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--body-text)', lineHeight: 1.45 }}>
                {deconstructionResult.diagnosis.mechanism}
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px dashed var(--border-color)', fontSize: '11px', color: 'var(--secondary-olive)', fontStyle: 'italic' }}>
                Reframing Anchor: {deconstructionResult.diagnosis.cbtAnchor}
              </div>
            </div>

            {/* Pillar 2: Data-Grounded Reality Check */}
            <div style={{ padding: '18px', borderRadius: '12px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp style={{ width: '15px', height: '15px', color: 'var(--accent-terracotta)' }} />
                <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                  2. Pipeline Conversion Math
                </span>
              </div>
              <h5 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--main-heading)' }}>
                {deconstructionResult.realityCheck.pipelineMetric}
              </h5>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--body-text)', lineHeight: 1.45 }}>
                {deconstructionResult.realityCheck.factualContext}
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px dashed var(--border-color)', fontSize: '11.5px', color: 'var(--accent-terracotta)', fontWeight: 600 }}>
                {deconstructionResult.realityCheck.stageAnalysis}
              </div>
            </div>

            {/* Pillar 3: Knowledge Gap vs. Self-Worth */}
            <div style={{ padding: '18px', borderRadius: '12px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Target style={{ width: '15px', height: '15px', color: 'var(--btn-sage)' }} />
                <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                  3. Isolated Variable vs Self-Worth
                </span>
              </div>
              <h5 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--main-heading)' }}>
                Identified Gap: {deconstructionResult.gapSeparation.isolatedVariable}
              </h5>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--body-text)', lineHeight: 1.45 }}>
                {deconstructionResult.gapSeparation.competenceVsWorth}
              </p>
            </div>

            {/* Pillar 4: Verified Alumni Precedent */}
            <div style={{ padding: '18px', borderRadius: '12px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 style={{ width: '15px', height: '15px', color: 'var(--btn-sage)' }} />
                <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                  4. Alumni Precedent & 48-Hour Plan
                </span>
              </div>
              <h5 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--main-heading)' }}>
                {deconstructionResult.precedentAnchor.caseTitle}
              </h5>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--body-text)', lineHeight: 1.45 }}>
                {deconstructionResult.precedentAnchor.alumniTrajectory}
              </p>
              <ul style={{ margin: '6px 0 0 16px', padding: 0, fontSize: '11.5px', color: 'var(--secondary-heading)', lineHeight: 1.45 }}>
                {deconstructionResult.precedentAnchor.actionableReboundPlan.map((step, sIdx) => (
                  <li key={sIdx}>{step}</li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
