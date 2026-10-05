import React, { useState } from "react";
import { dbService } from "../services/db";

const STEPS = ["Dimensions", "Symptoms", "Context", "Report"];

const DIMENSIONS = [
  { key: "stress",         label: "Placement / Exam Stress",       icon: "⚡", description: "Overall pressure from upcoming placements, tests, or deadlines.",                    polarity: "negative", weight: 0.20 },
  { key: "anxiety",        label: "Interview Anxiety",              icon: "💓", description: "Racing heart, blank mind, or panic when imagining an interview.",                    polarity: "negative", weight: 0.18 },
  { key: "imposter",       label: "Imposter Syndrome",             icon: "🪞", description: "Feeling unqualified despite preparation; comparing yourself to peers.",              polarity: "negative", weight: 0.14 },
  { key: "physicalSymptoms",label: "Physical Stress Symptoms",     icon: "🤕", description: "Headaches, tight chest, sweating, or stomach tension related to study.",             polarity: "negative", weight: 0.10 },
  { key: "socialPressure", label: "Social / Family Pressure",      icon: "👨‍👩‍👧",  description: "Perceived pressure from family, peers, or society about placements.",          polarity: "negative", weight: 0.08 },
  { key: "sleep",          label: "Sleep Quality & Restoration",   icon: "🌙", description: "How rested and energised did you feel after sleeping last night?",                    polarity: "positive", weight: 0.13 },
  { key: "focus",          label: "Focus & Deep-Work Capacity",    icon: "🎯", description: "Ability to concentrate on coding problems without distraction.",                     polarity: "positive", weight: 0.08 },
  { key: "motivation",     label: "Motivation & Drive",            icon: "🚀", description: "Inner pull to practice, learn, and push through difficult topics.",                  polarity: "positive", weight: 0.05 },
  { key: "emotionalReg",   label: "Emotional Regulation",         icon: "🧘", description: "Ability to pause, breathe, and stay calm when things go wrong.",                     polarity: "positive", weight: 0.04 },
];

const SYMPTOMS = [
  { key: "blanks",        label: "Mind goes blank during practice problems" },
  { key: "procrastinate", label: "Procrastinating study due to fear of failure" },
  { key: "negSelf",       label: 'Negative self-talk ("I am not good enough")' },
  { key: "compare",       label: "Constantly comparing yourself to placed friends" },
  { key: "appetite",      label: "Loss of appetite or overeating due to stress" },
  { key: "insomnia",      label: "Difficulty falling or staying asleep" },
  { key: "irritable",     label: "Easily irritable or snapping at people" },
  { key: "avoidance",     label: "Avoiding hard topics (DP, graphs, system design)" },
  { key: "overthinking",  label: "Overthinking every answer; second-guessing yourself" },
  { key: "burnout",       label: "Feeling burnt out – studying but retaining nothing" },
];

const MOOD_OPTIONS = [
  { label: "Confident",   emoji: "😎", color: "#059669", desc: "Clear, calm, and ready." },
  { label: "Focused",     emoji: "🎯", color: "#2563EB", desc: "In the zone, sharp thinking." },
  { label: "Neutral",     emoji: "😐", color: "#6B7280", desc: "Average, manageable day." },
  { label: "Anxious",     emoji: "😰", color: "#D97706", desc: "Nervous about upcoming tasks." },
  { label: "Overwhelmed", emoji: "😵", color: "#DC2626", desc: "Too much, too little time." },
  { label: "Drained",     emoji: "😞", color: "#7C3AED", desc: "Exhausted and low energy." },
];

function computeProfile(dimensions, symptoms, mood) {
  let stressSum = 0, posSum = 0, negW = 0, posW = 0;
  DIMENSIONS.forEach(dim => {
    const val = (dimensions[dim.key] || 5) / 10;
    if (dim.polarity === "negative") { stressSum += val * dim.weight; negW += dim.weight; }
    else { posSum += val * dim.weight; posW += dim.weight; }
  });
  const rawStress = negW > 0 ? (stressSum / negW) * 10 : 5;
  const rawReadiness = posW > 0 ? (posSum / posW) * 10 : 5;
  const symPenalty = Math.min(2.5, symptoms.length * 0.25);
  const moodNudge = { Confident: -0.5, Focused: -0.3, Neutral: 0, Anxious: 0.5, Overwhelmed: 1.0, Drained: 0.8 }[mood] ?? 0;
  const finalStress = Math.min(10, Math.max(1, parseFloat((rawStress + symPenalty + moodNudge).toFixed(1))));
  const finalReadiness = Math.min(10, Math.max(1, parseFloat((rawReadiness - moodNudge * 0.4).toFixed(1))));
  const finalConfidence = Math.min(10, Math.max(1, Math.round(
    (dimensions.motivation || 5) * 0.35 + ((10 - (dimensions.imposter || 4)) * 0.35) + (dimensions.emotionalReg || 5) * 0.30
  )));

  let profile, color, icon, urgency, summary, coping, pacing;
  if (finalStress >= 7.5) {
    profile="Acute Psychological Overload"; color="#DC2626"; icon="🚨"; urgency="HIGH";
    summary="Peak stress levels detected — cognitive performance in interviews will be significantly impaired. Immediate decompression is essential before any practice.";
    coping=["🧘 Start with 5 min Navy SEAL Box Breathing (4-4-4-4 count) right now.","📝 Open Thought Journal — write down your top 3 fear thoughts and reframe each.","🔢 Practice only 1 Easy Array/String problem to rebuild momentum, not Hard.","📵 Take a 30-min walk without your phone after this check-in.","🌙 Set a strict 10 PM sleep alarm tonight — cognitive recovery is non-negotiable."];
    pacing="120 WPM — Slow pacing + Step-by-step hint prompts enabled in mock interviews.";
  } else if (finalStress >= 5.5 || symptoms.length >= 5) {
    profile="Elevated Anxiety & Performance Pressure"; color="#D97706"; icon="⚠️"; urgency="MODERATE-HIGH";
    summary="Stress levels are elevated and will affect recall speed and problem clarity. Targeted decompression before any timed practice is recommended.";
    coping=["🔄 Complete Socratic Reappraisal: \"What evidence supports that I will fail?\"","📖 Review your last 5 solved problems to rebuild evidence of competence.","🎯 Do Aptitude MCQs before coding — a lower-stakes warm-up works best.","🕐 Use Pomodoro 25/5 sprints instead of marathon sessions today.","👥 Avoid scrolling peer placement posts — set a social media timer."];
    pacing="140 WPM — Moderate interview pacing + Supportive tone feedback.";
  } else if (finalStress >= 3.5 && finalReadiness >= 5) {
    profile="Functional Stress with Good Readiness"; color="#2563EB"; icon="📊"; urgency="LOW-MODERATE";
    summary="Some stress is present but readiness indicators are healthy. Channel this pressure into structured practice — it will sharpen your performance.";
    coping=["🎯 Attempt one Company-Specific timed question set (TCS NQT / Infosys style).","⏱️ Simulate a 45-min LeetCode medium problem with a timer.","🤝 Explain a solved solution out loud — verbal rehearsal boosts retention.","📅 Plan tomorrow's study schedule tonight to reduce decision fatigue."];
    pacing="155 WPM — Standard technical panel pacing.";
  } else if (finalReadiness >= 7) {
    profile="Peak Placement Readiness"; color="#059669"; icon="🏆"; urgency="OPTIMAL";
    summary="Psychological state is optimal for high-performance practice. This is the ideal window for tackling your hardest challenges.";
    coping=["🚀 Attempt a full-length mock interview at maximum pacing now.","💡 Solve 1 Hard graph/DP problem — this is your peak state.","📋 Write a self-assessment after the session: what went well, what to improve.","🎤 Practise your System Design explanation aloud for 10 minutes."];
    pacing="175–180 WPM — Challenge mode. Full pressure simulation enabled.";
  } else {
    profile="Cognitive Fatigue & Low Drive"; color="#7C3AED"; icon="🔋"; urgency="REST PRIORITY";
    summary="Energy and motivation are depleted. Pushing through will reinforce burnout. Restorative actions will return you to productive state faster.";
    coping=["😴 Take a 20–30 min power nap before any study session.","🥗 Eat a proper meal — fatigue is amplified by skipped meals.","🎵 Listen to focus music (brown noise / lo-fi) during easy revision.","📚 Do light revision only — flashcards or watching explanation videos.","📝 Write in Positive Memories log — recall recent wins to re-motivate."];
    pacing="135 WPM — Reduced pace with extended problem time limits.";
  }

  return { profile, color, icon, urgency, summary, coping, pacing, finalStress, finalReadiness, finalConfidence,
    symptomCount: symptoms.length, date: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) };
}

function DimensionSlider({ dim, value, onChange }) {
  const negLabels = ["None","Mild","Noticeable","High","Extreme"];
  const posLabels = ["Very Low","Low","Moderate","Good","Excellent"];
  const lvl = Math.min(4, Math.floor((value - 1) / 2.25));
  const displayLabel = dim.polarity === "negative" ? negLabels[lvl] : posLabels[lvl];
  const trackColor = dim.polarity === "negative"
    ? (value <= 3 ? "#059669" : value <= 6 ? "#D97706" : "#DC2626")
    : (value <= 3 ? "#DC2626" : value <= 6 ? "#D97706" : "#059669");
  return (
    <div style={{ marginBottom: 18, padding: "14px 16px", borderRadius: 10, background: "#FAFAFA", border: "1px solid #E5E7EB" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: "1rem", marginRight: 6 }}>{dim.icon}</span>
          <strong style={{ fontSize: "0.88rem", color: "#111827" }}>{dim.label}</strong>
          <p style={{ fontSize: "0.76rem", color: "#6B7280", margin: "2px 0 0 22px" }}>{dim.description}</p>
        </div>
        <div style={{ textAlign: "right", minWidth: 72, flexShrink: 0 }}>
          <span style={{ fontSize: "1.3rem", fontWeight: 800, color: trackColor }}>{value}</span>
          <span style={{ fontSize: "0.7rem", color: "#9CA3AF", display: "block" }}>{displayLabel}</span>
        </div>
      </div>
      <input type="range" min={1} max={10} step={1} value={value}
        onChange={e => onChange(dim.key, Number(e.target.value))}
        style={{ width: "100%", accentColor: trackColor, cursor: "pointer" }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "#9CA3AF", marginTop: 2 }}>
        <span>1 — {dim.polarity === "negative" ? "None" : "Very Low"}</span>
        <span>10 — {dim.polarity === "negative" ? "Extreme" : "Excellent"}</span>
      </div>
    </div>
  );
}

function ScoreRing({ value, max = 10, label, color, size = 90 }) {
  const r = 32, circ = 2 * Math.PI * r, dash = circ * (value / max);
  return (
    <div style={{ textAlign: "center" }}>
      <svg width={size} height={size} viewBox="0 0 76 76">
        <circle cx={38} cy={38} r={r} fill="none" stroke="#E5E7EB" strokeWidth={7} />
        <circle cx={38} cy={38} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 38 38)"
          style={{ transition: "stroke-dasharray 0.6s ease" }} />
        <text x={38} y={43} textAnchor="middle" fontSize={15} fontWeight={800} fill={color}>{value}</text>
      </svg>
      <div style={{ fontSize: "0.73rem", color: "#6B7280", marginTop: 2, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

export default function MoodAssessment({ moodState, setMoodState, setActiveTab, userEmail = "guest" }) {
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const initDims = () => { const d = {}; DIMENSIONS.forEach(dim => { d[dim.key] = 5; }); return d; };
  const [dims, setDims] = useState(initDims);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [selectedMood, setSelectedMood] = useState("Neutral");
  const [context, setContext] = useState("");
  const [studyHours, setStudyHours] = useState(3);
  const [daysToInterview, setDaysToInterview] = useState(14);
  const [report, setReport] = useState(null);

  const handleDimChange = (key, val) => setDims(prev => ({ ...prev, [key]: val }));
  const toggleSymptom = key => setSelectedSymptoms(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

  const generateReport = () => {
    const r = computeProfile(dims, selectedSymptoms, selectedMood);
    r.moodLabel = selectedMood; r.studyHours = studyHours; r.daysToInterview = daysToInterview;
    r.context = context; r.dimensions = { ...dims }; r.symptoms = [...selectedSymptoms];
    setReport(r); setStep(3);
    const updatedMoodState = { label: selectedMood, stress: r.finalStress, confidence: r.finalConfidence, readiness: r.finalReadiness };
    setMoodState(updatedMoodState);
    dbService.logMood(updatedMoodState);
    dbService.saveTestScore("mood", r.finalStress, userEmail, { label: selectedMood, confidence: r.finalConfidence, readiness: r.finalReadiness, profile: r.profile });
    setSaved(true); setTimeout(() => setSaved(false), 4000);
  };

  const StepBar = () => (
    <div style={{ display: "flex", gap: 0, marginBottom: 24 }}>
      {STEPS.map((s, i) => (
        <div key={s} style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <div style={{ height: 4, borderRadius: 4, background: i <= step ? "#111827" : "#E5E7EB", transition: "background 0.3s" }} />
            <div style={{ fontSize: "0.7rem", color: i <= step ? "#111827" : "#9CA3AF", fontWeight: 600, marginTop: 4 }}>{s}</div>
          </div>
          {i < STEPS.length - 1 && <div style={{ width: 8 }} />}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ flex: 1, padding: "28px 24px", maxWidth: 1100, margin: "0 auto", width: "100%", fontFamily: "var(--font-inter)" }}>
      <div style={{ marginBottom: 18 }}>
        <button onClick={() => setActiveTab && setActiveTab("dashboard")} className="btn-back-dashboard" style={{ padding: "8px 18px", fontSize: "0.88rem" }}>← Back to Dashboard</button>
      </div>

      <div className="saas-card-spec" style={{ padding: "22px 26px", marginBottom: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <span className="pill-tag">Psychological Intelligence</span>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#111827", margin: "6px 0 4px" }}>Multi-Dimension Mood & Readiness Check-in</h2>
            <p style={{ color: "#6B7280", fontSize: "0.88rem", maxWidth: 580 }}>10-dimension psychological profiling — generates a precision readiness score and personalised coping plan.</p>
          </div>
          {report && (
            <div style={{ display: "flex", gap: 16, flexShrink: 0 }}>
              <ScoreRing value={report.finalStress} label="Stress" color={report.finalStress >= 7 ? "#DC2626" : report.finalStress >= 5 ? "#D97706" : "#059669"} />
              <ScoreRing value={report.finalReadiness} label="Readiness" color="#2563EB" />
              <ScoreRing value={report.finalConfidence} label="Confidence" color="#7C3AED" />
            </div>
          )}
        </div>
      </div>

      {saved && (
        <div style={{ padding: "12px 18px", borderRadius: 10, background: "#ECFDF5", border: "1px solid #059669", color: "#065F46", fontWeight: 700, marginBottom: 18, fontSize: "0.88rem" }}>
          ✅ Assessment saved to database — Adaptive Engine updated with your current profile.
        </div>
      )}

      <StepBar />

      {/* ── STEP 0: DIMENSIONS ── */}
      {step === 0 && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div className="saas-card-spec" style={{ padding: 22 }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#DC2626", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
                ⬆️ Stress Indicators <span style={{ fontSize: "0.72rem", color: "#9CA3AF", fontWeight: 400 }}>(higher = more stress)</span>
              </h3>
              {DIMENSIONS.filter(d => d.polarity === "negative").map(dim => (
                <DimensionSlider key={dim.key} dim={dim} value={dims[dim.key]} onChange={handleDimChange} />
              ))}
            </div>
            <div className="saas-card-spec" style={{ padding: 22 }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#059669", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
                ⬆️ Readiness Indicators <span style={{ fontSize: "0.72rem", color: "#9CA3AF", fontWeight: 400 }}>(higher = better)</span>
              </h3>
              {DIMENSIONS.filter(d => d.polarity === "positive").map(dim => (
                <DimensionSlider key={dim.key} dim={dim} value={dims[dim.key]} onChange={handleDimChange} />
              ))}
            </div>
          </div>
          <div style={{ textAlign: "right", marginTop: 18 }}>
            <button onClick={() => setStep(1)} className="btn-primary-spec" style={{ padding: "12px 32px" }}>Next: Symptom Checklist →</button>
          </div>
        </div>
      )}

      {/* ── STEP 1: SYMPTOMS ── */}
      {step === 1 && (
        <div className="saas-card-spec" style={{ padding: 26 }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#111827", marginBottom: 4 }}>Which of these have you experienced in the last 24–48 hours?</h3>
          <p style={{ color: "#6B7280", fontSize: "0.83rem", marginBottom: 18 }}>Select all that apply. This refines your psychological profile beyond simple sliders.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {SYMPTOMS.map(sym => {
              const active = selectedSymptoms.includes(sym.key);
              return (
                <div key={sym.key} onClick={() => toggleSymptom(sym.key)}
                  style={{ padding: "13px 15px", borderRadius: 10, border: active ? "2px solid #111827" : "1.5px solid #E5E7EB",
                    background: active ? "#F8F9FA" : "#FFFFFF", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s ease",
                    fontSize: "0.85rem", color: "#374151", fontWeight: active ? 600 : 400 }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                    border: active ? "2px solid #111827" : "1.5px solid #D1D5DB",
                    background: active ? "#111827" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s ease" }}>
                    {active && <span style={{ color: "#fff", fontSize: "0.65rem", fontWeight: 800 }}>✓</span>}
                  </div>
                  {sym.label}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 18, padding: "10px 14px", borderRadius: 8, background: "#F3F4F6", fontSize: "0.81rem", color: "#374151" }}>
            {selectedSymptoms.length === 0 ? "✅ No symptoms selected — great sign!" : `⚠️ ${selectedSymptoms.length} symptom${selectedSymptoms.length > 1 ? "s" : ""} selected — will increase computed stress index.`}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22 }}>
            <button onClick={() => setStep(0)} className="btn-back-dashboard" style={{ padding: "10px 24px" }}>← Back</button>
            <button onClick={() => setStep(2)} className="btn-primary-spec" style={{ padding: "12px 32px" }}>Next: Context →</button>
          </div>
        </div>
      )}

      {/* ── STEP 2: CONTEXT ── */}
      {step === 2 && (
        <div className="saas-card-spec" style={{ padding: 26 }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#111827", marginBottom: 18 }}>Context & Emotional State</h3>
          <div style={{ marginBottom: 22 }}>
            <label style={{ fontSize: "0.87rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 10 }}>Current Emotional State</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {MOOD_OPTIONS.map(m => (
                <div key={m.label} onClick={() => setSelectedMood(m.label)}
                  style={{ padding: "14px 12px", borderRadius: 10,
                    border: selectedMood === m.label ? `2px solid ${m.color}` : "1.5px solid #E5E7EB",
                    background: selectedMood === m.label ? `${m.color}12` : "#FFFFFF",
                    cursor: "pointer", textAlign: "center", transition: "all 0.15s ease" }}>
                  <div style={{ fontSize: "1.7rem", marginBottom: 4 }}>{m.emoji}</div>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem", color: selectedMood === m.label ? m.color : "#111827" }}>{m.label}</div>
                  <div style={{ fontSize: "0.73rem", color: "#6B7280", marginTop: 2 }}>{m.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 22 }}>
            {[
              { label: "Study hours today", value: studyHours, min: 0, max: 12, step: 0.5, suffix: "h", set: setStudyHours },
              { label: "Days to next interview", value: daysToInterview, min: 1, max: 30, step: 1, suffix: "d", set: setDaysToInterview },
            ].map(s => (
              <div key={s.label} style={{ padding: "15px 16px", borderRadius: 12, background: "#FAFAFA", border: "1px solid #E5E7EB" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <label style={{ fontSize: "0.84rem", fontWeight: 600, color: "#374151" }}>{s.label}</label>
                  <strong style={{ color: "#111827" }}>{s.value > 30 ? "30+" : s.value}{s.suffix}</strong>
                </div>
                <input type="range" min={s.min} max={s.max} step={s.step} value={s.value}
                  onChange={e => s.set(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#111827" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "#9CA3AF", marginTop: 2 }}>
                  <span>{s.min}{s.suffix}</span><span>{s.max}{s.suffix}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 22 }}>
            <label style={{ fontSize: "0.87rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>
              What is on your mind right now? <span style={{ fontWeight: 400, color: "#9CA3AF" }}>(optional)</span>
            </label>
            <textarea value={context} onChange={e => setContext(e.target.value)}
              placeholder="e.g. I bombed a mock interview yesterday and cannot get it out of my head..."
              rows={3} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #E5E7EB",
                fontSize: "0.87rem", color: "#111827", resize: "vertical", fontFamily: "inherit",
                lineHeight: 1.6, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => setStep(1)} className="btn-back-dashboard" style={{ padding: "10px 24px" }}>← Back</button>
            <button onClick={generateReport} className="btn-primary-spec" style={{ padding: "12px 32px" }}>Generate Psychological Report 🧠</button>
          </div>
        </div>
      )}

      {/* ── STEP 3: REPORT ── */}
      {step === 3 && report && (
        <div>
          <div style={{ padding: "22px 26px", borderRadius: 16, marginBottom: 22,
            background: `linear-gradient(135deg, ${report.color}15 0%, ${report.color}05 100%)`,
            border: `2px solid ${report.color}40` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: "1.8rem" }}>{report.icon}</span>
                  <div>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: report.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>Profile — {report.urgency}</div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#111827", margin: 0 }}>{report.profile}</h3>
                  </div>
                </div>
                <p style={{ fontSize: "0.87rem", color: "#374151", maxWidth: 580, lineHeight: 1.65, marginTop: 6 }}>{report.summary}</p>
              </div>
              <div style={{ display: "flex", gap: 18 }}>
                <ScoreRing value={report.finalStress} label="Stress Index" color={report.finalStress >= 7 ? "#DC2626" : report.finalStress >= 5 ? "#D97706" : "#059669"} size={96} />
                <ScoreRing value={report.finalReadiness} label="Readiness" color="#2563EB" size={96} />
                <ScoreRing value={report.finalConfidence} label="Confidence" color="#7C3AED" size={96} />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 22 }}>
            {[
              { label: "Mood State", value: `${MOOD_OPTIONS.find(m => m.label === report.moodLabel)?.emoji || ""} ${report.moodLabel}` },
              { label: "Symptoms Flagged", value: `${report.symptomCount} / ${SYMPTOMS.length}` },
              { label: "Study Hours Today", value: `${report.studyHours}h` },
              { label: "Days to Interview", value: `${report.daysToInterview > 30 ? "30+" : report.daysToInterview}d` },
              { label: "Assessment Date", value: report.date },
            ].map(m => (
              <div key={m.label} style={{ padding: "13px 14px", borderRadius: 12, background: "#F8F9FA", border: "1px solid #E5E7EB", textAlign: "center" }}>
                <div style={{ fontSize: "0.71rem", color: "#6B7280", fontWeight: 600, marginBottom: 5 }}>{m.label}</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "#111827" }}>{m.value}</div>
              </div>
            ))}
          </div>

          <div className="saas-card-spec" style={{ padding: 22, marginBottom: 22 }}>
            <h4 style={{ fontSize: "0.92rem", fontWeight: 700, color: "#111827", marginBottom: 14 }}>Dimension Breakdown</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 22px" }}>
              {DIMENSIONS.map(dim => {
                const val = report.dimensions[dim.key];
                const barColor = dim.polarity === "positive"
                  ? (val >= 7 ? "#059669" : val >= 5 ? "#D97706" : "#DC2626")
                  : (val <= 3 ? "#059669" : val <= 6 ? "#D97706" : "#DC2626");
                return (
                  <div key={dim.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: "0.95rem", flexShrink: 0 }}>{dim.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: "0.76rem", color: "#374151", fontWeight: 600 }}>{dim.label}</span>
                        <span style={{ fontSize: "0.76rem", color: barColor, fontWeight: 700 }}>{val}/10</span>
                      </div>
                      <div style={{ height: 5, borderRadius: 5, background: "#E5E7EB", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${val * 10}%`, background: barColor, borderRadius: 5, transition: "width 0.5s ease" }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: 20, marginBottom: 24 }}>
            <div className="saas-card-spec" style={{ padding: 22 }}>
              <h4 style={{ fontSize: "0.92rem", fontWeight: 700, color: "#111827", marginBottom: 12 }}>🎯 Personalised Coping & Action Plan</h4>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {report.coping.map((c, i) => (
                  <li key={i} style={{ padding: "10px 13px", borderRadius: 8,
                    background: i === 0 ? "#FEF3C7" : "#F9FAFB",
                    border: i === 0 ? "1px solid #FCD34D" : "1px solid #E5E7EB",
                    fontSize: "0.84rem", color: "#374151", lineHeight: 1.6 }}>
                    {i === 0 && <span style={{ fontWeight: 700, color: "#92400E", display: "block", fontSize: "0.72rem", marginBottom: 2 }}>PRIORITY ACTION</span>}
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="saas-card-spec" style={{ padding: 18, flex: 1 }}>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#111827", marginBottom: 8 }}>🤖 Adaptive Engine Pacing</h4>
                <p style={{ fontSize: "0.84rem", color: "#374151", lineHeight: 1.65 }}>{report.pacing}</p>
              </div>
              {report.context && (
                <div className="saas-card-spec" style={{ padding: 16, background: "#FFFBEB", borderColor: "#FCD34D" }}>
                  <h4 style={{ fontSize: "0.82rem", fontWeight: 700, color: "#92400E", marginBottom: 5 }}>Your Context Note</h4>
                  <p style={{ fontSize: "0.8rem", color: "#78350F", lineHeight: 1.6, fontStyle: "italic" }}>"{report.context}"</p>
                </div>
              )}
              <button onClick={() => setActiveTab && setActiveTab("dashboard")} className="btn-primary-spec" style={{ width: "100%", justifyContent: "center", padding: "12px" }}>Apply to Dashboard & Hubs</button>
              <button onClick={() => { setStep(0); setReport(null); setSelectedSymptoms([]); setDims(initDims()); }} className="btn-back-dashboard" style={{ width: "100%", justifyContent: "center", padding: "10px" }}>Redo Assessment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
