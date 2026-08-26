import React, { useState } from 'react';
import { dbService } from '../services/db';

export default function AuthModal({ initialMode = 'login', onClose, onLoginSuccess }) {
 const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot'
 
 const [fullName, setFullName] = useState('');
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
 const [college, setCollege] = useState('');
 const [department, setDepartment] = useState('Computer Science and Engineering');
 const [gradYear, setGradYear] = useState(2026);

 const [errorMsg, setErrorMsg] = useState('');
 const [successMsg, setSuccessMsg] = useState('');

 const handleSubmit = (e) => {
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

 const res = dbService.registerUser({
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

 setSuccessMsg('Registration successful! Loading your dashboard...');
 setTimeout(() => {
 onLoginSuccess(res.user);
 }, 500);
 } else if (mode === 'login') {
 if (!email.trim() || !password) {
 setErrorMsg('Please enter both your registered email and password.');
 return;
 }

 const res = dbService.authenticateUser(email.trim(), password);

 if (!res.success) {
 setErrorMsg(res.error || 'Authentication failed.');
 return;
 }

 setSuccessMsg('Login successful! Loading your dashboard...');
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
 setSuccessMsg('Password reset instructions have been simulated and sent to your email.');
 }
 };

 return (
 <div style={{
 position: 'fixed',
 top: 0,
 left: 0,
 right: 0,
 bottom: 0,
 backgroundColor: 'rgba(17, 24, 39, 0.65)',
 backdropFilter: 'blur(6px)',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 zIndex: 200,
 padding: '16px'
 }}>
 <div style={{
 width: '100%',
 maxWidth: '520px',
 maxHeight: '92vh',
 overflowY: 'auto',
 backgroundColor: '#FFFFFF',
 borderRadius: '18px',
 padding: '24px 28px',
 position: 'relative',
 boxShadow: '0 25px 50px -12px rgba(17, 24, 39, 0.25)',
 border: '1px solid #E5E7EB'
 }}>
 {/* Close Button */}
 <button 
 onClick={onClose} 
 style={{
 position: 'absolute',
 top: '16px',
 right: '16px',
 background: '#F3F4F6',
 border: 'none',
 borderRadius: '50%',
 width: '30px',
 height: '30px',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 cursor: 'pointer',
 color: '#111827',
 fontWeight: 700,
 fontSize: '0.85rem'
 }}
 >
 
 </button>

 {/* Branding & Header */}
 <div style={{ marginBottom: '16px' }}>
 <span className="pill-tag" style={{ marginBottom: '6px' }}>
 NeuroPrep Student Onboarding
 </span>
 <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#111827', fontFamily: 'var(--font-inter)' }}>
 {mode === 'login' ? 'Sign In to NeuroPrep' : mode === 'register' ? 'Student Registration' : 'Reset Your Password'}
 </h2>
 </div>

 {/* Tab Switcher */}
 <div style={{
 display: 'flex',
 backgroundColor: '#F3F4F6',
 borderRadius: '10px',
 padding: '3px',
 marginBottom: '16px',
 border: '1px solid #E5E7EB'
 }}>
 <button
 onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
 style={{
 flex: 1,
 padding: '8px',
 borderRadius: '8px',
 border: 'none',
 backgroundColor: mode === 'login' ? '#FFFFFF' : 'transparent',
 fontWeight: mode === 'login' ? 700 : 600,
 color: mode === 'login' ? '#111827' : '#6B7280',
 cursor: 'pointer',
 fontSize: '0.85rem',
 boxShadow: mode === 'login' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
 fontFamily: 'var(--font-inter)',
 transition: 'all 0.15s ease'
 }}
 >
 Sign In
 </button>
 <button
 onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
 style={{
 flex: 1,
 padding: '8px',
 borderRadius: '8px',
 border: 'none',
 backgroundColor: mode === 'register' ? '#FFFFFF' : 'transparent',
 fontWeight: mode === 'register' ? 700 : 600,
 color: mode === 'register' ? '#111827' : '#6B7280',
 cursor: 'pointer',
 fontSize: '0.85rem',
 boxShadow: mode === 'register' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
 fontFamily: 'var(--font-inter)',
 transition: 'all 0.15s ease'
 }}
 >
 Register Student
 </button>
 </div>

 {/* Alert Messages */}
 {errorMsg && (
 <div style={{
 padding: '10px 14px',
 borderRadius: '8px',
 backgroundColor: '#F8F9FA',
 border: '1px solid #111827',
 color: '#111827',
 fontSize: '0.82rem',
 fontWeight: 600,
 marginBottom: '14px'
 }}>
 {errorMsg}
 </div>
 )}

 {successMsg && (
 <div style={{
 padding: '10px 14px',
 borderRadius: '8px',
 backgroundColor: '#F3F4F6',
 border: '1px solid #D1D5DB',
 color: '#111827',
 fontSize: '0.82rem',
 fontWeight: 700,
 marginBottom: '14px'
 }}>
 {successMsg}
 </div>
 )}

 {/* Form Controls */}
 <form onSubmit={handleSubmit}>
 
 {mode === 'register' && (
 <div style={{ marginBottom: '12px' }}>
 <label style={{ display: 'block', fontSize: '0.8rem', color: '#111827', marginBottom: '4px', fontWeight: 600 }}>
 Full Name *
 </label>
 <input 
 type="text" 
 placeholder="e.g. Rahul Kumar"
 value={fullName} 
 onChange={(e) => setFullName(e.target.value)} 
 className="input-field" 
 style={{ padding: '9px 12px', fontSize: '0.88rem' }}
 required 
 />
 </div>
 )}

 <div style={{ marginBottom: '12px' }}>
 <label style={{ display: 'block', fontSize: '0.8rem', color: '#111827', marginBottom: '4px', fontWeight: 600 }}>
 Email Address *
 </label>
 <input 
 type="email" 
 placeholder="e.g. rahul.kumar@tce.edu"
 value={email} 
 onChange={(e) => setEmail(e.target.value)} 
 className="input-field" 
 style={{ padding: '9px 12px', fontSize: '0.88rem' }}
 required 
 />
 </div>

 {/* Password & Confirm Password Side by Side in Registration */}
 {mode === 'register' ? (
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
 <div>
 <label style={{ display: 'block', fontSize: '0.8rem', color: '#111827', marginBottom: '4px', fontWeight: 600 }}>
 Password *
 </label>
 <input 
 type="password" 
 placeholder="Enter password"
 value={password} 
 onChange={(e) => setPassword(e.target.value)} 
 className="input-field" 
 style={{ padding: '9px 12px', fontSize: '0.88rem' }}
 required 
 />
 </div>
 <div>
 <label style={{ display: 'block', fontSize: '0.8rem', color: '#111827', marginBottom: '4px', fontWeight: 600 }}>
 Confirm Password *
 </label>
 <input 
 type="password" 
 placeholder="Re-enter password"
 value={confirmPassword} 
 onChange={(e) => setConfirmPassword(e.target.value)} 
 className="input-field" 
 style={{ padding: '9px 12px', fontSize: '0.88rem' }}
 required 
 />
 </div>
 </div>
 ) : mode !== 'forgot' ? (
 <div style={{ marginBottom: '12px' }}>
 <label style={{ display: 'block', fontSize: '0.8rem', color: '#111827', marginBottom: '4px', fontWeight: 600 }}>
 Password *
 </label>
 <input 
 type="password" 
 placeholder="Enter password"
 value={password} 
 onChange={(e) => setPassword(e.target.value)} 
 className="input-field" 
 style={{ padding: '9px 12px', fontSize: '0.88rem' }}
 required 
 />
 </div>
 ) : null}

 {mode === 'register' && (
 <>
 {/* College & Graduation Year Side by Side */}
 <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '10px', marginBottom: '12px' }}>
 <div>
 <label style={{ display: 'block', fontSize: '0.8rem', color: '#111827', marginBottom: '4px', fontWeight: 600 }}>
 College Name *
 </label>
 <input 
 type="text" 
 placeholder="e.g. Thiagarajar College of Engineering"
 value={college} 
 onChange={(e) => setCollege(e.target.value)} 
 className="input-field" 
 style={{ padding: '9px 12px', fontSize: '0.88rem' }}
 required 
 />
 </div>
 <div>
 <label style={{ display: 'block', fontSize: '0.8rem', color: '#111827', marginBottom: '4px', fontWeight: 600 }}>
 Grad Year *
 </label>
 <input 
 type="number" 
 value={gradYear} 
 onChange={(e) => setGradYear(e.target.value)} 
 className="input-field" 
 style={{ padding: '9px 12px', fontSize: '0.88rem' }}
 required 
 />
 </div>
 </div>

 <div style={{ marginBottom: '16px' }}>
 <label style={{ display: 'block', fontSize: '0.8rem', color: '#111827', marginBottom: '4px', fontWeight: 600 }}>
 Department
 </label>
 <select 
 value={department} 
 onChange={(e) => setDepartment(e.target.value)} 
 className="input-field"
 style={{ padding: '9px 12px', fontSize: '0.88rem' }}
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
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', fontSize: '0.82rem' }}>
 <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#4B5563' }}>
 <input type="checkbox" defaultChecked style={{ accentColor: '#111827', width: '15px', height: '15px' }} /> Remember session
 </label>
 <button 
 type="button" 
 onClick={() => { setMode('forgot'); setErrorMsg(''); setSuccessMsg(''); }} 
 style={{ background: 'none', border: 'none', color: '#111827', fontWeight: 700, cursor: 'pointer' }}
 >
 Forgot Password?
 </button>
 </div>
 )}

 {/* Primary Submit Button */}
 <button 
 type="submit" 
 className="btn-primary-spec" 
 style={{
 width: '100%',
 justifyContent: 'center',
 padding: '11px',
 fontSize: '0.92rem',
 borderRadius: '10px'
 }}
 >
 {mode === 'login' ? 'Sign In to Dashboard' : mode === 'register' ? 'Register Student Account' : 'Send Reset Instructions'}
 </button>

 {mode === 'forgot' && (
 <button 
 type="button"
 onClick={() => setMode('login')}
 className="btn-secondary-spec"
 style={{ width: '100%', justifyContent: 'center', marginTop: '10px', fontSize: '0.85rem' }}
 >
 Back to Sign In
 </button>
 )}
 </form>
 </div>
 </div>
 );
}

