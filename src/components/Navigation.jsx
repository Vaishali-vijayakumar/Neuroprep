import React from 'react';
import { Sparkles, LogOut, Home } from 'lucide-react';

export default function Navigation({ activeTab = 'dashboard', setActiveTab, userProfile = {}, onSignOut, onGoHome }) {

  return (
    <header style={{
      backgroundColor: 'rgba(252, 249, 246, 0.94)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid #D8D2CE',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 16px rgba(52, 52, 58, 0.03)'
    }}>
      {/* Top Header Row */}
      <div style={{
        height: '64px',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(216, 210, 206, 0.4)'
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
            backgroundColor: '#526257',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#F7F3EE',
            boxShadow: '0 3px 10px rgba(82, 98, 87, 0.25)'
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34343A', margin: 0, letterSpacing: '-0.3px' }}>
              NeuroPrep
            </h1>
            <p style={{ fontSize: '0.72rem', color: '#89878A', margin: 0 }}>
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
              backgroundColor: '#9A6854',
              color: '#F7F3EE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}>
              {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : (userProfile.email ? userProfile.email.charAt(0).toUpperCase() : 'U')}
            </div>
            <div style={{ display: 'none', minWidth: '100px', '@media (min-width: 768px)': { display: 'block' } }}>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#34343A', margin: 0 }}>
                {userProfile.name || (userProfile.email ? userProfile.email.split('@')[0] : 'Profile')}
              </p>
              <p style={{ fontSize: '0.7rem', color: '#89878A', margin: 0 }}>
                {userProfile.targetCompany ? `${userProfile.targetCompany} Prep` : 'Placement Prep'}
              </p>
            </div>

            <button 
              onClick={onGoHome}
              title="Return Home"
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                border: '1px solid #D8D2CE',
                backgroundColor: '#FCF9F6',
                color: '#4F5056',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease'
              }}
            >
              <Home size={14} /> Home
            </button>

            <button 
              onClick={onSignOut}
              title="Sign Out"
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                border: '1px solid #D8D2CE',
                backgroundColor: '#FCF9F6',
                color: '#4F5056',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease'
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
