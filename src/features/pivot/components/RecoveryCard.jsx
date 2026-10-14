import React from 'react';
import { ShieldCheck, Target, ArrowRight } from 'lucide-react';

export default function RecoveryCard({ category, nextAction, supportNeed }) {
  if (!nextAction && !category) return null;

  return (
    <div className="pivot-recovery-card">
      <div className="pivot-recovery-card-header">
        <ShieldCheck size={18} className="pivot-recovery-badge-icon" />
        <div>
          <h4>Current Grounding Summary</h4>
          <p>Tentative focus: {category ? category.replace(/_/g, ' ') : 'Placement Conversation'}</p>
        </div>
      </div>

      {nextAction && (
        <div className="pivot-recovery-card-action">
          <div className="pivot-recovery-action-label">
            <Target size={14} /> Controllable Next Step
          </div>
          <p className="pivot-recovery-action-text">{nextAction}</p>
        </div>
      )}
    </div>
  );
}
