import React, { useState } from 'react';
import { Eye, EyeOff, Mail, CheckCircle2 } from 'lucide-react';
import { dbService } from '../services/db';

export default function AuthModal({ initialMode = 'login', onClose, onLoginSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot' | 'confirm_email'
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('Computer Science and Engineering');
  const [gradYear, setGradYear] = useState(2026);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (mode === 'register') {
      if (!fullName.trim() || !email.trim() || !password || !college.trim()) {
        setErrorMsg('Please complete all required fields (Name, Email, Password, College).');
        return;
      }
      if (password.length < 4) {
        setErrorMsg('Password must be at least 4 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please check and retype.');
        return;
      }

      const res = await dbService.registerUser({
        name: fullName.trim(),
        email: email.trim(),
        password,
        college: college.trim(),
        department,
        graduationYear: Number(gradYear)
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Registration failed.');
        return;
      }

      // If Supabase email confirmation is required
      if (res.emailConfirmationRequired) {
        setRegisteredEmail(email.trim());
        setMode('confirm_email');
        setErrorMsg('');
        setSuccessMsg('');
        return;
      }

      setSuccessMsg('Registration successful! Loading your placement dashboard...');
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 500);
    } else if (mode === 'login') {
      if (!email.trim() || !password) {
        setErrorMsg('Please enter both your registered email and password.');
        return;
      }

      const res = await dbService.authenticateUser(email.trim(), password);

      if (!res.success) {
        setErrorMsg(res.error || 'Authentication failed.');
        return;
      }

      setSuccessMsg('Login successful! Loading your placement dashboard...');
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 500);
    } else {
      if (!email.trim()) {
        setErrorMsg('Please enter your registered email address.');
        return;
      }
      const existing = dbService.getUserProfile(email.trim());
      if (!existing) {
        setErrorMsg('No account found with this email address.');
        return;
      }
      setSuccessMsg('Password reset instructions have been sent to your email.');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(52, 52, 58, 0.45)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: '16px',
      fontFamily: 'var(--font-main)'
    }}>
      <div 
        className="saas-card-spec"
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: '22px',
          padding: '30px 34px',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="btn-secondary-spec"
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            fontWeight: 800,
            color: 'var(--secondary-heading)'
          }}
        >
          &times;
        </button>

        {/* Branding & Header */}
        <div style={{ marginBottom: '18px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--main-heading)', margin: '4px 0 0 0', fontFamily: 'var(--font-heading)' }}>
            {mode === 'login' ? 'Sign In to NeuroPrep' : mode === 'register' ? 'Student Registration' : mode === 'confirm_email' ? 'Check Your Email' : 'Reset Your Password'}
          </h2>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          backgroundColor: '#F5EBE6',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '20px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              flex: 1,
              padding: '9px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: mode === 'login' ? 'var(--btn-sage)' : 'transparent',
              fontWeight: 700,
              color: mode === 'login' ? 'var(--btn-text)' : 'var(--secondary-heading)',
              boxShadow: mode === 'login' ? 'var(--shadow-3d-btn)' : 'none',
              cursor: 'pointer',
              fontSize: '0.86rem',
              transition: 'all 0.18s cubic-bezier(0.2, 0.8, 0.2, 1)'
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              flex: 1,
              padding: '9px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: (mode === 'register' || mode === 'confirm_email') ? 'var(--btn-sage)' : 'transparent',
              fontWeight: 700,
              color: (mode === 'register' || mode === 'confirm_email') ? 'var(--btn-text)' : 'var(--secondary-heading)',
              boxShadow: (mode === 'register' || mode === 'confirm_email') ? 'var(--shadow-3d-btn)' : 'none',
              cursor: 'pointer',
              fontSize: '0.86rem',
              transition: 'all 0.18s cubic-bezier(0.2, 0.8, 0.2, 1)'
            }}
          >
            Register Student
          </button>
        </div>

        {/* Alert Messages */}
        {errorMsg && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            backgroundColor: '#F5EBE6',
            border: '1.5px solid var(--accent-terracotta)',
            color: 'var(--accent-terracotta)',
            fontSize: '0.84rem',
            fontWeight: 600,
            marginBottom: '16px'
          }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            backgroundColor: '#EAECE8',
            border: '1.5px solid var(--btn-sage)',
            color: 'var(--btn-sage)',
            fontSize: '0.84rem',
            fontWeight: 700,
            marginBottom: '16px'
          }}>
            {successMsg}
          </div>
        )}

        {/* Verification Screen after Supabase Registration */}
        {mode === 'confirm_email' ? (
          <div style={{ textAlign: 'center', padding: '10px 4px 6px' }}>
            <div style={{
              width: '68px',
              height: '68px',
              margin: '0 auto 16px',
              borderRadius: '50%',
              backgroundColor: '#EAECE8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--btn-sage)',
              boxShadow: '0 4px 14px rgba(91, 107, 85, 0.16)'
            }}>
              <Mail size={32} color="var(--btn-sage)" />
            </div>

            <h3 style={{ fontSize: '1.24rem', fontWeight: 800, color: 'var(--main-heading)', marginBottom: '8px' }}>
              Confirmation Link Sent!
            </h3>

            <p style={{ fontSize: '0.9rem', color: 'var(--secondary-heading)', lineHeight: '1.55', marginBottom: '16px' }}>
              We have sent a verification email to{' '}
              <strong style={{ color: 'var(--main-heading)' }}>{registeredEmail || email}</strong>.
              <br />
              Please check your inbox and click the verification link before signing in.
            </p>

            <div style={{
              padding: '12px 16px',
              borderRadius: '10px',
              backgroundColor: '#F5EBE6',
              border: '1px solid var(--border-color)',
              color: 'var(--secondary-heading)',
              fontSize: '0.82rem',
              lineHeight: '1.5',
              marginBottom: '20px',
              textAlign: 'left'
            }}>
              📬 <strong>Note:</strong> If you don't find the confirmation email in your primary inbox within 1–2 minutes, please check your <strong>Spam</strong> or <strong>Junk</strong> folder.
            </div>

            <button
              type="button"
              onClick={() => {
                setMode('login');
                setEmail(registeredEmail || email);
                setPassword('');
                setErrorMsg('');
                setSuccessMsg('After clicking the confirmation link in your email, enter your password to sign in.');
              }}
              className="btn-back-dashboard"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '13px 20px',
                fontSize: '0.94rem',
                fontWeight: 800,
                borderRadius: '12px',
                cursor: 'pointer'
              }}
            >
              Proceed to Sign In
            </button>
          </div>
        ) : (
          /* Form Controls */
          <form onSubmit={handleSubmit}>
          
          {mode === 'register' && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--main-heading)', marginBottom: '5px', fontWeight: 700 }}>
                Full Name *
              </label>
              <input 
                type="text" 
                placeholder="e.g. Rahul Kumar"
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                className="input-field" 
                style={{ padding: '10px 14px', fontSize: '0.9rem', backgroundColor: 'var(--bg-card-solid)', border: '1.5px solid var(--border-color)', borderRadius: '10px', width: '100%' }}
                required 
              />
            </div>
          )}

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--main-heading)', marginBottom: '5px', fontWeight: 700 }}>
              Email Address *
            </label>
            <input 
              type="email" 
              placeholder="e.g. rahul.kumar@tce.edu"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="input-field" 
              style={{ padding: '10px 14px', fontSize: '0.9rem', backgroundColor: 'var(--bg-card-solid)', border: '1.5px solid var(--border-color)', borderRadius: '10px', width: '100%' }}
              required 
            />
          </div>

          {/* Password & Confirm Password Side by Side in Registration */}
          {mode === 'register' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--main-heading)', marginBottom: '5px', fontWeight: 700 }}>
                  Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter password"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="input-field" 
                    style={{ padding: '10px 38px 10px 14px', fontSize: '0.9rem', backgroundColor: 'var(--bg-card-solid)', border: '1.5px solid var(--border-color)', borderRadius: '10px', width: '100%' }}
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      padding: '4px',
                      cursor: 'pointer',
                      color: 'var(--secondary-heading)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0.75,
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.75'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--main-heading)', marginBottom: '5px', fontWeight: 700 }}>
                  Confirm Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="Re-enter password"
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    className="input-field" 
                    style={{ padding: '10px 38px 10px 14px', fontSize: '0.9rem', backgroundColor: 'var(--bg-card-solid)', border: '1.5px solid var(--border-color)', borderRadius: '10px', width: '100%' }}
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      padding: '4px',
                      cursor: 'pointer',
                      color: 'var(--secondary-heading)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0.75,
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.75'}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          ) : mode !== 'forgot' ? (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--main-heading)', marginBottom: '5px', fontWeight: 700 }}>
                Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter password"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="input-field" 
                  style={{ padding: '10px 38px 10px 14px', fontSize: '0.9rem', backgroundColor: 'var(--bg-card-solid)', border: '1.5px solid var(--border-color)', borderRadius: '10px', width: '100%' }}
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    padding: '4px',
                    cursor: 'pointer',
                    color: 'var(--secondary-heading)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.75,
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.75'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          ) : null}

          {mode === 'register' && (
            <>
              {/* College & Graduation Year Side by Side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--main-heading)', marginBottom: '5px', fontWeight: 700 }}>
                    College Name *
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. TCE Madurai"
                    value={college} 
                    onChange={(e) => setCollege(e.target.value)} 
                    className="input-field" 
                    style={{ padding: '10px 14px', fontSize: '0.9rem', backgroundColor: 'var(--bg-card-solid)', border: '1.5px solid var(--border-color)', borderRadius: '10px', width: '100%' }}
                    required 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--main-heading)', marginBottom: '5px', fontWeight: 700 }}>
                    Grad Year *
                  </label>
                  <input 
                    type="number" 
                    value={gradYear} 
                    onChange={(e) => setGradYear(e.target.value)} 
                    className="input-field" 
                    style={{ padding: '10px 14px', fontSize: '0.9rem', backgroundColor: 'var(--bg-card-solid)', border: '1.5px solid var(--border-color)', borderRadius: '10px', width: '100%' }}
                    required 
                  />
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--main-heading)', marginBottom: '5px', fontWeight: 700 }}>
                  Department
                </label>
                <select 
                  value={department} 
                  onChange={(e) => setDepartment(e.target.value)} 
                  className="input-field"
                  style={{ padding: '10px 14px', fontSize: '0.9rem', backgroundColor: 'var(--bg-card-solid)', border: '1.5px solid var(--border-color)', borderRadius: '10px', width: '100%' }}
                >
                  <option value="Computer Science and Engineering">Computer Science (CSE)</option>
                  <option value="Information Technology">Information Technology (IT)</option>
                  <option value="Electronics & Communication">Electronics (ECE)</option>
                  <option value="Electrical Engineering">Electrical (EEE)</option>
                  <option value="Mechanical Engineering">Mechanical</option>
                </select>
              </div>
            </>
          )}

          {mode === 'login' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', fontSize: '0.84rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--body-text)', fontWeight: 600 }}>
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--btn-sage)', width: '16px', height: '16px' }} /> Remember session
              </label>
              <button 
                type="button" 
                onClick={() => { setMode('forgot'); setErrorMsg(''); setSuccessMsg(''); }} 
                style={{ background: 'none', border: 'none', color: 'var(--accent-terracotta)', fontWeight: 700, cursor: 'pointer', fontSize: '0.84rem' }}
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Primary Submit Button */}
          <button 
            type="submit" 
            className="btn-back-dashboard" 
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '13px 20px',
              fontSize: '0.94rem',
              fontWeight: 800,
              borderRadius: '12px'
            }}
          >
            {mode === 'login' ? 'Sign In to Dashboard' : mode === 'register' ? 'Register Student Account' : 'Send Reset Instructions'}
          </button>

          {mode === 'forgot' && (
            <button 
              type="button"
              onClick={() => setMode('login')}
              className="btn-secondary-spec"
              style={{ width: '100%', justifyContent: 'center', marginTop: '12px', fontSize: '0.88rem', borderRadius: '10px' }}
            >
              Back to Sign In
            </button>
          )}
        </form>
        )}
      </div>
    </div>
  );
}

