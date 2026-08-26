import React from 'react';
import { Sparkles, LogOut, Home, ArrowLeft } from 'lucide-react';

export default function Navigation({ activeTab = 'dashboard', setActiveTab, userProfile = {}, onSignOut, onGoHome }) {

  return (
    <header style={{
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E5E7EB',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
    }}>
      {/* Top Header Row */}
      <div style={{
        height: '64px',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #F3F4F6'
      }}>
        {/* Logo & Title */}
        <div 
          onClick={onGoHome}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: '#475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF'
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.3px' }}>
              NeuroPrep
            </h1>
            <p style={{ fontSize: '0.72rem', color: '#6B7280', margin: 0 }}>
              Stress-Adaptive Placement Ecosystem
            </p>
          </div>
        </div>

        {/* User Badge & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: '#475569',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}>
              {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : (userProfile.email ? userProfile.email.charAt(0).toUpperCase() : 'U')}
            </div>
            <div style={{ display: 'none', minWidth: '100px', '@media (min-width: 768px)': { display: 'block' } }}>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                {userProfile.name || (userProfile.email ? userProfile.email.split('@')[0] : 'Profile')}
              </p>
              <p style={{ fontSize: '0.7rem', color: '#6B7280', margin: 0 }}>
                {userProfile.targetCompany ? `${userProfile.targetCompany} Prep` : 'Placement Prep'}
              </p>
            </div>

            <button 
              onClick={onGoHome}
              title="Return Home"
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                color: '#374151',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Home size={14} /> Home
            </button>

            <button 
              onClick={onSignOut}
              title="Sign Out"
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                color: '#111827',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </div>

    </header>
  );
}

