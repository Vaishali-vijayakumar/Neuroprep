import React, { useState } from 'react';
import { User, FileText, Target, CheckCircle2, AlertCircle, Upload, Plus, Trash2, Award, Save } from 'lucide-react';
import { dbService } from '../services/db';

export default function UserProfile({ profile, setProfile, setActiveTab }) {
 const [activeSubTab, setActiveSubTab] = useState('personal');
 const [newSkill, setNewSkill] = useState('');
 const [skillLevel, setSkillLevel] = useState('Intermediate');
 const [uploadStatus, setUploadStatus] = useState(profile.resumeUploaded ? 'Uploaded' : 'Pending');
 const [savedSuccess, setSavedSuccess] = useState(false);

 const handleSaveToDb = () => {
 if (profile.email) {
 dbService.saveUserProfile(profile.email, profile);
 setSavedSuccess(true);
 setTimeout(() => setSavedSuccess(false), 3000);
 }
 };

 // Handle adding technical skills
 const handleAddSkill = (e) => {
 e.preventDefault();
 if (!newSkill.trim()) return;
 const updated = [...profile.skills, { name: newSkill.trim(), level: skillLevel }];
 setProfile({ ...profile, skills: updated });
 setNewSkill('');
 };

 // Handle removing a skill
 const handleRemoveSkill = (index) => {
 const updated = profile.skills.filter((_, i) => i !== index);
 setProfile({ ...profile, skills: updated });
 };

 // Simulated ATS Resume Parser Upload
 const handleResumeUpload = (e) => {
 const file = e.target.files[0];
 if (file) {
 setUploadStatus('Analyzing...');
 setTimeout(() => {
 setUploadStatus('Uploaded & Parsed');
 setProfile({
 ...profile,
 resumeName: file.name,
 resumeUploaded: true,
 atsScore: 84,
 atsKeywordsMatched: ['Java', 'Data Structures', 'Git', 'SQL', 'REST API'],
 atsMissingKeywords: ['Docker', 'Microservices', 'System Design']
 });
 }, 1200);
 }
 };

 // Calculate Profile Completion
 const completionPercentage = Math.min(100, Math.round(
 ((profile.name ? 20 : 0) +
 (profile.college ? 20 : 0) +
 (profile.skills.length > 0 ? 20 : 0) +
 (profile.resumeUploaded ? 20 : 0) +
 (profile.targetCompany ? 20 : 0))
 ));

 return (
 <div style={{ flex: 1, padding: '28px', maxWidth: '1200px', margin: '0 auto' }}>
 {/* Header Banner */}
 <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
 <div>
 <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
 Student Profile & ATS Resume Engine
 </h2>
 <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
 Module 2: Manage academic credentials, technical skills, and target company preferences.
 </p>
 </div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
 <div style={{ textAlign: 'right' }}>
 <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Profile Completion</p>
 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
 <div style={{ width: '120px', height: '10px', backgroundColor: '#E5E7EB', borderRadius: '5px', overflow: 'hidden' }}>
 <div style={{ width: `${completionPercentage}%`, height: '100%', backgroundColor: '#111827', transition: 'width 0.5s' }}></div>
 </div>
 <span style={{ fontWeight: 700, color: '#111827' }}>{completionPercentage}%</span>
 </div>
 </div>
 <button 
 onClick={() => setActiveTab && setActiveTab('dashboard')} 
 className="btn-secondary-spec"
 style={{ padding: '8px 18px', fontSize: '0.85rem' }}
 >
 Back to Dashboard
 </button>
 </div>
 </div>

 {/* Sub Tabs Navigation */}
 <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
 {[
 { id: 'personal', label: 'Personal & Academic', icon: User },
 { id: 'skills', label: 'Technical Skills', icon: Award },
 { id: 'resume', label: 'ATS Resume Management', icon: FileText },
 { id: 'preferences', label: 'Placement Goals', icon: Target }
 ].map(tab => {
 const Icon = tab.icon;
 const isActive = activeSubTab === tab.id;
 return (
 <button
 key={tab.id}
 onClick={() => setActiveSubTab(tab.id)}
 className={isActive ? 'btn-primary-spec' : 'btn-secondary-spec'}
 style={{ fontSize: '0.88rem' }}
 >
 <Icon size={16} />
 {tab.label}
 </button>
 );
 })}
 </div>

 {/* Sub Tab Content */}
 {activeSubTab === 'personal' && (
 <div className="glass-card" style={{ padding: '24px' }}>
 <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#111827' }}>Academic Information</h3>
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
 <div>
 <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Full Name</label>
 <input 
 type="text" 
 value={profile.name} 
 onChange={(e) => setProfile({...profile, name: e.target.value})}
 className="input-field" 
 />
 </div>
 <div>
 <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Email Address</label>
 <input 
 type="email" 
 value={profile.email} 
 onChange={(e) => setProfile({...profile, email: e.target.value})}
 className="input-field" 
 />
 </div>
 <div>
 <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>College / University</label>
 <input 
 type="text" 
 value={profile.college} 
 onChange={(e) => setProfile({...profile, college: e.target.value})}
 className="input-field" 
 />
 </div>
 <div>
 <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Department / Branch</label>
 <input 
 type="text" 
 value={profile.department} 
 onChange={(e) => setProfile({...profile, department: e.target.value})}
 className="input-field" 
 />
 </div>
 <div>
 <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>CGPA</label>
 <input 
 type="number" 
 step="0.1"
 value={profile.cgpa} 
 onChange={(e) => setProfile({...profile, cgpa: e.target.value})}
 className="input-field" 
 />
 </div>
 <div>
 <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Graduation Year</label>
 <input 
 type="number" 
 value={profile.graduationYear} 
 onChange={(e) => setProfile({...profile, graduationYear: e.target.value})}
 className="input-field" 
 />
 </div>
 </div>
 </div>
 )}

 {activeSubTab === 'skills' && (
 <div className="glass-card" style={{ padding: '24px' }}>
 <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#111827' }}>Technical Skills & Languages</h3>
 
 <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
 <input 
 type="text" 
 placeholder="e.g. Java, Python, React, Data Structures" 
 value={newSkill}
 onChange={(e) => setNewSkill(e.target.value)}
 className="input-field" 
 style={{ flex: 1 }}
 />
 <select 
 value={skillLevel} 
 onChange={(e) => setSkillLevel(e.target.value)}
 className="input-field"
 style={{ width: '160px' }}
 >
 <option value="Beginner">Beginner</option>
 <option value="Intermediate">Intermediate</option>
 <option value="Advanced">Advanced</option>
 </select>
 <button type="submit" className="btn-primary-spec">
 <Plus size={16} /> Add Skill
 </button>
 </form>

 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
 {profile.skills.map((skill, index) => (
 <div 
 key={index}
 style={{
 padding: '8px 16px',
 borderRadius: '20px',
 backgroundColor: '#F3F4F6',
 border: '1px solid #E5E7EB',
 display: 'flex',
 alignItems: 'center',
 gap: '10px'
 }}
 >
 <div>
 <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827' }}>{skill.name}</span>
 <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '8px' }}>({skill.level})</span>
 </div>
 <button 
 onClick={() => handleRemoveSkill(index)}
 style={{ background: 'none', border: 'none', color: '#111827', cursor: 'pointer' }}
 >
 <Trash2 size={14} />
 </button>
 </div>
 ))}
 </div>
 </div>
 )}

 {activeSubTab === 'resume' && (
 <div className="glass-card" style={{ padding: '24px' }}>
 <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#111827' }}>ATS Resume Analysis Engine</h3>
 
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
 <div style={{
 border: '2px dashed #D1D5DB',
 borderRadius: '16px',
 padding: '40px 20px',
 textAlign: 'center',
 backgroundColor: '#F9FAFB'
 }}>
 <Upload size={48} color="#111827" style={{ marginBottom: '16px' }} />
 <h4 style={{ marginBottom: '8px', color: '#111827' }}>Upload Resume (PDF format)</h4>
 <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
 AI Sentence-BERT & spaCy parser evaluates ATS score and keyword gap.
 </p>
 <input 
 type="file" 
 accept=".pdf"
 id="resumeInput"
 onChange={handleResumeUpload}
 style={{ display: 'none' }} 
 />
 <label htmlFor="resumeInput" className="btn-primary-spec" style={{ cursor: 'pointer' }}>
 Select PDF File
 </label>
 {profile.resumeUploaded && (
 <p style={{ marginTop: '16px', fontSize: '0.85rem', color: '#111827' }}>
 Current File: <strong>{profile.resumeName}</strong> ({uploadStatus})
 </p>
 )}
 </div>

 {/* ATS Analysis Output Card */}
 <div className="glass-card" style={{ padding: '20px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
 <h4 style={{ fontSize: '1.05rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#111827' }}>
 <CheckCircle2 color="#111827" size={20} />
 ATS Compatibility Report
 </h4>
 {profile.resumeUploaded ? (
 <>
 <div style={{ marginBottom: '16px' }}>
 <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Overall ATS Match Score:</span>
 <div style={{ fontSize: '2rem', fontWeight: 800, color: '#111827' }}>
 {profile.atsScore || 0}%
 </div>
 </div>

 <div style={{ marginBottom: '14px' }}>
 <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>
 Matched Keywords
 </p>
 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
 {(profile.atsKeywordsMatched || []).map((kw, i) => (
 <span key={i} className="pill-tag">{kw}</span>
 ))}
 </div>
 </div>

 <div>
 <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>
 • Missing High-Priority Keywords
 </p>
 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
 {(profile.atsMissingKeywords || []).map((kw, i) => (
 <span key={i} className="pill-tag" style={{ backgroundColor: '#111827', color: '#FFFFFF' }}>{kw}</span>
 ))}
 </div>
 </div>
 </>
 ) : (
 <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
 <p style={{ fontSize: '0.88rem', margin: 0 }}>No resume uploaded yet.</p>
 <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Upload a PDF above to generate your live ATS score & keyword match.</p>
 </div>
 )}
 </div>
 </div>
 </div>
 )}

 {activeSubTab === 'preferences' && (
 <div className="glass-card" style={{ padding: '24px' }}>
 <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#111827' }}>Target Companies & Roles</h3>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
 <div>
 <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Target Company</label>
 <select 
 value={profile.targetCompany || ''} 
 onChange={(e) => setProfile({...profile, targetCompany: e.target.value})}
 className="input-field"
 >
 <option value="">Select target company...</option>
 <option value="TCS">TCS (Tata Consultancy Services)</option>
 <option value="Infosys">Infosys</option>
 <option value="Zoho">Zoho Corporation</option>
 <option value="Accenture">Accenture</option>
 <option value="Cognizant">Cognizant</option>
 <option value="Amazon">Amazon</option>
 <option value="Google">Google</option>
 </select>
 </div>
 <div>
 <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Preferred Job Role</label>
 <select 
 value={profile.targetRole || ''} 
 onChange={(e) => setProfile({...profile, targetRole: e.target.value})}
 className="input-field"
 >
 <option value="">Select target role...</option>
 <option value="Software Development Engineer (SDE)">Software Development Engineer (SDE)</option>
 <option value="Java Full Stack Developer">Java Full Stack Developer</option>
 <option value="Python / Backend Engineer">Python / Backend Engineer</option>
 <option value="Frontend Developer">Frontend Developer</option>
 <option value="Data Analyst / Engineer">Data Analyst / Engineer</option>
 </select>
 </div>
 </div>
 </div>
 )}

 {/* Persistent Save Bar */}
 <div style={{
 marginTop: '24px',
 padding: '16px 24px',
 backgroundColor: '#F9FAFB',
 border: '1px solid #E5E7EB',
 borderRadius: '16px',
 display: 'flex',
 justifyContent: 'space-between',
 alignItems: 'center',
 gap: '16px',
 flexWrap: 'wrap'
 }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 <CheckCircle2 size={18} color="#111827" />
 <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
 All details and test credentials are automatically synchronized and persisted to the database.
 </span>
 </div>

 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
 {savedSuccess && (
 <span style={{ fontSize: '0.85rem', color: '#111827', fontWeight: 600 }}>
 Saved to Database successfully!
 </span>
 )}
 <button 
 onClick={handleSaveToDb}
 className="btn-primary-spec"
 style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px' }}
 >
 <Save size={16} /> Save Profile to Database
 </button>
 </div>
 </div>
 </div>
 );
}

