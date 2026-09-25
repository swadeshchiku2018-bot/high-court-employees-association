import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Member } from '../../types';
import {
  Shield, CheckCircle2, User, Building, Upload, ArrowRight,
  Loader2, Eye, EyeOff, Key, RefreshCw, AlertTriangle, X, FileText
} from 'lucide-react';
import { IdCard } from '../../components/common/IdCard';

interface RegisterPageProps {
  onNavigate: (route: string) => void;
}

// ---------- helpers ----------
function passwordStrength(pwd: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 2) return { score, label: 'Weak', color: '#ef4444' };
  if (score <= 4) return { score, label: 'Moderate', color: '#f59e0b' };
  return { score, label: 'Strong', color: '#22c55e' };
}

function generateStrongPassword(): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const special = '@#$!%*?&';
  const all = upper + lower + digits + special;
  let pwd = '';
  pwd += upper[Math.floor(Math.random() * upper.length)];
  pwd += lower[Math.floor(Math.random() * lower.length)];
  pwd += digits[Math.floor(Math.random() * digits.length)];
  pwd += special[Math.floor(Math.random() * special.length)];
  for (let i = 4; i < 12; i++) pwd += all[Math.floor(Math.random() * all.length)];
  return pwd.split('').sort(() => Math.random() - 0.5).join('');
}

function toBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result as string);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

// Simple client-side bot / rate-limit guard
const SUBMISSION_COOLDOWN_MS = 30000;
let lastSubmitTime = 0;

// ---------- component ----------
export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [registeredMember, setRegisteredMember] = useState<Member | null>(null);

  // Dropdowns loaded from public JSON
  const [posts, setPosts] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);

  // Honeypot anti-bot field (should always remain blank)
  const [honeypot, setHoneypot] = useState('');

  // Rate-limit UI state
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ----- STEP 1: Personal -----
  const [personalData, setPersonalData] = useState({
    name: '',
    gender: '',
    dob: '',
    bloodGroup: 'B+',
    mobile: '',
    email: '',
    address: '',
  });

  // ----- STEP 2: Employment -----
  const [employmentData, setEmploymentData] = useState({
    employeeCode: '',
    designation: '',
    department: '',
    cadre: 'Ministerial',
    postingLocation: '',
    dateOfJoining: '',
    emergencyContact: '',
    membershipType: 'REGULAR_MEMBER' as Member['membershipType'],
  });

  // ----- STEP 3: Documents -----
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [photoError, setPhotoError] = useState('');
  const [idDocFile, setIdDocFile] = useState<File | null>(null);
  const [idDocName, setIdDocName] = useState('');
  const [idDocError, setIdDocError] = useState('');
  const [idDocType, setIdDocType] = useState('Aadhaar Card');

  // ----- STEP 4: Account -----
  const [accountData, setAccountData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Load JSON data
  useEffect(() => {
    fetch('/posts.json').then(r => r.json()).then(setPosts).catch(() => setPosts([]));
    fetch('/departments.json').then(r => r.json()).then(setDepartments).catch(() => setDepartments([]));
  }, []);

  // Cleanup cooldown on unmount
  useEffect(() => () => { if (cooldownRef.current) clearInterval(cooldownRef.current); }, []);

  const startCooldown = useCallback(() => {
    lastSubmitTime = Date.now();
    setCooldownLeft(Math.ceil(SUBMISSION_COOLDOWN_MS / 1000));
    cooldownRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((lastSubmitTime + SUBMISSION_COOLDOWN_MS - Date.now()) / 1000));
      setCooldownLeft(remaining);
      if (remaining === 0 && cooldownRef.current) clearInterval(cooldownRef.current);
    }, 1000);
  }, []);

  // ---------- handlers ----------
  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setPersonalData(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleEmploymentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setEmploymentData(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError('');
    if (!file.type.startsWith('image/')) {
      setPhotoError('Only image files are allowed for photo.');
      return;
    }
    if (file.size > 40 * 1024) {
      setPhotoError(`Photo must be ≤ 40 KB. Your file is ${(file.size / 1024).toFixed(1)} KB.`);
      return;
    }
    const b64 = await toBase64(file);
    setPhotoFile(file);
    setPhotoPreview(b64);
  };

  const handleIdDocChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdDocError('');
    const allowed = ['image/jpeg', 'image/jpg', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setIdDocError('Only JPEG or PDF files are accepted for ID documents.');
      return;
    }
    if (file.size > 100 * 1024) {
      setIdDocError(`Document must be ≤ 100 KB. Your file is ${(file.size / 1024).toFixed(1)} KB.`);
      return;
    }
    setIdDocFile(file);
    setIdDocName(file.name);
  };

  // Step validation
  const validateStep1 = () => {
    const { name, gender, dob, mobile, email, address } = personalData;
    if (!name.trim()) return 'Full Name is required.';
    if (!gender) return 'Gender is required.';
    if (!dob) return 'Date of Birth is required.';
    if (!mobile.trim()) return 'Mobile Number is required.';
    if (!/^[6-9]\d{9}$/.test(mobile.replace(/\s|-/g, ''))) return 'Enter a valid 10-digit Indian mobile number.';
    if (!email.trim()) return 'Email ID is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
    if (!address.trim()) return 'Residential Address is required.';
    return null;
  };

  const validateStep2 = () => {
    const { employeeCode, designation, department, cadre, postingLocation, dateOfJoining } = employmentData;
    if (!employeeCode.trim()) return 'Employee Code / ID is required.';
    if (!designation) return 'Current Designation is required.';
    if (!department) return 'Department is required.';
    if (!cadre) return 'Cadre is required.';
    if (!postingLocation.trim()) return 'Current Place of Posting is required.';
    if (!dateOfJoining) return 'Date of Joining is required.';
    return null;
  };

  const validateStep3 = () => {
    if (!photoFile) return 'Please upload your passport-size photo (max 40 KB).';
    if (!idDocFile) return 'Please upload an Identity Document (Aadhaar/PAN/Voter ID/Driving Licence/OHC ID Card) — max 100 KB.';
    return null;
  };

  const validateStep4 = () => {
    const { password, confirmPassword } = accountData;
    if (!password || password.length < 8) return 'Password must be at least 8 characters.';
    const strength = passwordStrength(password);
    if (strength.score < 3) return 'Please choose a stronger password (mix uppercase, lowercase, numbers, symbols).';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const goNext = () => {
    setError('');
    let err: string | null = null;
    if (step === 1) err = validateStep1();
    if (step === 2) err = validateStep2();
    if (step === 3) err = validateStep3();
    if (err) { setError(err); return; }
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => { setError(''); setStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Anti-bot: honeypot check
    if (honeypot) {
      setError('Bot activity detected. Submission blocked.');
      return;
    }

    // Rate-limit check
    if (Date.now() - lastSubmitTime < SUBMISSION_COOLDOWN_MS) {
      setError(`Please wait ${cooldownLeft} seconds before submitting again.`);
      return;
    }

    const step4Err = validateStep4();
    if (step4Err) { setError(step4Err); return; }

    setIsSubmitting(true);
    setError('');

    try {
      // Convert documents to base64 for storage
      const photoB64 = photoPreview;
      let idDocB64 = '';
      if (idDocFile) {
        idDocB64 = await toBase64(idDocFile);
      }

      const payload = {
        // Personal
        name: personalData.name.trim(),
        gender: personalData.gender,
        dob: personalData.dob,
        bloodGroup: personalData.bloodGroup,
        mobile: personalData.mobile.replace(/\s|-/g, ''),
        email: personalData.email.trim().toLowerCase(),
        address: personalData.address.trim(),
        // Employment
        employeeCode: employmentData.employeeCode.trim().toUpperCase(),
        designation: employmentData.designation,
        department: employmentData.department,
        cadre: employmentData.cadre,
        postingLocation: employmentData.postingLocation.trim(),
        dateOfJoining: employmentData.dateOfJoining,
        emergencyContact: employmentData.emergencyContact.trim(),
        membershipType: employmentData.membershipType,
        employeeCategory: employmentData.cadre === 'Ministerial' ? 'ADMINISTRATIVE' : 'JUDICIAL',
        // Account — HRMS ID is used as the login username
        userId: employmentData.employeeCode.trim().toUpperCase(),
        password: accountData.password,
        // Documents
        avatarUrl: photoB64 || `https://i.pravatar.cc/300?img=${Math.floor(Math.random() * 50) + 1}`,
        documents: [
          {
            id: `doc-${Date.now()}`,
            title: `${idDocType} Copy`,
            url: idDocB64,
            uploadedAt: new Date().toISOString().split('T')[0]
          }
        ],
        role: 'MEMBER',
        membershipDate: new Date().toISOString().split('T')[0],
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Registration failed. Please try again.');
      }

      const newMember = await res.json();
      startCooldown();
      setIsSubmitting(false);
      setRegisteredMember(newMember);
    } catch (err: any) {
      setIsSubmitting(false);
      startCooldown();
      setError(err.message || 'An unexpected error occurred.');
    }
  };

  const pwdStrength = passwordStrength(accountData.password);
  const inputClass = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none bg-white';
  const labelClass = 'block font-bold text-slate-700 mb-1 text-xs';

  const stepLabels = [
    { n: 1, label: 'Personal Details', icon: <User className="w-4 h-4" /> },
    { n: 2, label: 'Employment Info', icon: <Building className="w-4 h-4" /> },
    { n: 3, label: 'Upload Documents', icon: <Upload className="w-4 h-4" /> },
    { n: 4, label: 'Create Account', icon: <Key className="w-4 h-4" /> },
  ];

  // ===== SUCCESS SCREEN =====
  if (registeredMember) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 border-2 border-emerald-400 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">Registration Submitted Successfully!</h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Your application has been logged with Membership ID:{' '}
              <strong className="text-blue-900 font-mono">{registeredMember.membershipId}</strong>.
            </p>
            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-4 rounded-lg max-w-md mx-auto font-medium space-y-2">
              <p className="font-bold uppercase tracking-wider text-[10px]">Status: Pending Verification</p>
              <p>After successful verification your digital membership card will be issued and you can download it by logging in to your account.</p>
            </div>
          </div>
          <div className="flex justify-center gap-4 pt-6 mt-4 border-t border-slate-200">
            <button
              onClick={() => onNavigate('/login')}
              className="px-6 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer text-sm"
            >
              Go to Member Login
            </button>
            <button
              onClick={() => onNavigate('/')}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all cursor-pointer text-sm"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-extrabold tracking-widest text-amber-700 uppercase bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          ONLINE REGISTRATION PORTAL
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Become a Member of the Association
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Complete the official enrollment form for Orissa High Court judicial, executive, administrative, and technical personnel.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Step Progress Bar */}
        <div className="bg-slate-900 text-white p-4 border-b border-slate-800 grid grid-cols-4 gap-2 text-xs text-center font-bold">
          {stepLabels.map(({ n, label, icon }) => (
            <button
              key={n}
              type="button"
              onClick={() => { if (n < step) { setError(''); setStep(n); } }}
              className={`py-2.5 px-2 rounded-lg transition-all flex flex-col items-center gap-1 ${
                step === n
                  ? 'bg-amber-400 text-slate-950'
                  : n < step
                  ? 'bg-emerald-700 text-white cursor-pointer hover:bg-emerald-600'
                  : 'text-slate-400 cursor-default'
              }`}
            >
              {n < step ? <CheckCircle2 className="w-4 h-4" /> : icon}
              <span className="hidden sm:inline">{n}. {label}</span>
              <span className="sm:hidden">{n}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Honeypot - invisible to humans, visible to bots */}
          <div style={{ display: 'none' }} aria-hidden="true">
            <input
              type="text"
              name="website_url"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={e => setHoneypot(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* ===== STEP 1: PERSONAL DETAILS ===== */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-base border-b border-slate-200 pb-2 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-900" />
                Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className={labelClass}>Full Name (As per service record) *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Sri Ramesh Chandra Das"
                    value={personalData.name}
                    onChange={handlePersonalChange}
                    className={inputClass}
                    autoComplete="name"
                  />
                </div>
                {/* Gender */}
                <div>
                  <label className={labelClass}>Gender *</label>
                  <select
                    name="gender"
                    required
                    value={personalData.gender}
                    onChange={handlePersonalChange}
                    className={inputClass}
                  >
                    <option value="">-- Select Gender --</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {/* Date of Birth */}
                <div>
                  <label className={labelClass}>Date of Birth *</label>
                  <input
                    type="date"
                    name="dob"
                    required
                    value={personalData.dob}
                    onChange={handlePersonalChange}
                    className={inputClass}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  />
                </div>
                {/* Blood Group */}
                <div>
                  <label className={labelClass}>Blood Group</label>
                  <select
                    name="bloodGroup"
                    value={personalData.bloodGroup}
                    onChange={handlePersonalChange}
                    className={inputClass}
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                {/* Mobile */}
                <div>
                  <label className={labelClass}>Mobile No. (WhatsApp Enabled) *</label>
                  <input
                    type="tel"
                    name="mobile"
                    required
                    placeholder="e.g. 9437000000"
                    value={personalData.mobile}
                    onChange={handlePersonalChange}
                    className={inputClass}
                    autoComplete="tel"
                    maxLength={10}
                  />
                </div>
                {/* Email */}
                <div>
                  <label className={labelClass}>Email ID *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="e.g. ramesh.das@example.com"
                    value={personalData.email}
                    onChange={handlePersonalChange}
                    className={inputClass}
                    autoComplete="email"
                  />
                </div>
                {/* Address */}
                <div className="md:col-span-2">
                  <label className={labelClass}>Residential Address *</label>
                  <textarea
                    name="address"
                    required
                    rows={2}
                    placeholder="Qtr No., Colony, City, Pin Code"
                    value={personalData.address}
                    onChange={handlePersonalChange}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={goNext}
                  className="px-6 py-2.5 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-950 transition-all cursor-pointer text-sm flex items-center gap-2"
                >
                  Next: Employment Info <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ===== STEP 2: EMPLOYMENT INFORMATION ===== */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-base border-b border-slate-200 pb-2 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-900" />
                Employment Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Employee Code */}
                <div>
                  <label className={labelClass}>HRMS ID *</label>
                  <input
                    type="text"
                    name="employeeCode"
                    required
                    placeholder="e.g. HRMS-10821"
                    value={employmentData.employeeCode}
                    onChange={handleEmploymentChange}
                    className={`${inputClass} font-mono`}
                  />
                </div>
                {/* Membership Type */}
                <div>
                  <label className={labelClass}>Membership Plan</label>
                  <select
                    name="membershipType"
                    value={employmentData.membershipType}
                    onChange={handleEmploymentChange}
                    className={inputClass}
                  >
                    <option value="REGULAR_MEMBER">Regular Subscription Member (₹500/month)</option>
                    <option value="LIFE_MEMBER">Life Member Corpus Subscriber</option>
                  </select>
                </div>
                {/* Current Designation */}
                <div>
                  <label className={labelClass}>Current Designation *</label>
                  <select
                    name="designation"
                    required
                    value={employmentData.designation}
                    onChange={handleEmploymentChange}
                    className={inputClass}
                  >
                    <option value="">-- Select Designation --</option>
                    {posts.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                {/* Department */}
                <div>
                  <label className={labelClass}>Department / Section *</label>
                  <select
                    name="department"
                    required
                    value={employmentData.department}
                    onChange={handleEmploymentChange}
                    className={inputClass}
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                {/* Cadre */}
                <div>
                  <label className={labelClass}>Cadre *</label>
                  <select
                    name="cadre"
                    required
                    value={employmentData.cadre}
                    onChange={handleEmploymentChange}
                    className={inputClass}
                  >
                    <option value="Ministerial">Ministerial</option>
                    <option value="Secretarial">Secretarial</option>
                  </select>
                </div>
                {/* Current Place of Posting */}
                <div>
                  <label className={labelClass}>Current Place of Posting *</label>
                  <input
                    type="text"
                    name="postingLocation"
                    required
                    placeholder="e.g. Main High Court Building, Cuttack"
                    value={employmentData.postingLocation}
                    onChange={handleEmploymentChange}
                    className={inputClass}
                  />
                </div>
                {/* Date of Joining */}
                <div>
                  <label className={labelClass}>Date of Joining *</label>
                  <input
                    type="date"
                    name="dateOfJoining"
                    required
                    value={employmentData.dateOfJoining}
                    onChange={handleEmploymentChange}
                    className={inputClass}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                {/* Emergency Contact */}
                <div>
                  <label className={labelClass}>Emergency Contact No.</label>
                  <input
                    type="tel"
                    name="emergencyContact"
                    placeholder="Spouse / Parent Name & Phone"
                    value={employmentData.emergencyContact}
                    onChange={handleEmploymentChange}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-between">
                <button type="button" onClick={goBack} className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg text-sm">
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="px-6 py-2.5 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-950 transition-all cursor-pointer text-sm flex items-center gap-2"
                >
                  Next: Upload Documents <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ===== STEP 3: UPLOAD DOCUMENTS ===== */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="font-bold text-slate-900 text-base border-b border-slate-200 pb-2 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-900" />
                Upload Documents
              </h3>

              {/* Photo Upload */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div>
                  <p className="font-bold text-slate-800 text-sm">Passport-size Photo *</p>
                  <p className="text-xs text-slate-500">JPEG/PNG only · Maximum size: <strong>40 KB</strong></p>
                </div>
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <label
                    htmlFor="photo-upload"
                    className="flex-1 border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-700 transition-all"
                  >
                    <Upload className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-blue-900">
                      {photoFile ? photoFile.name : 'Click to upload photo'}
                    </span>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </label>
                  {photoPreview && (
                    <div className="relative">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-24 h-28 object-cover rounded-lg border-2 border-slate-300 shadow"
                      />
                      <button
                        type="button"
                        onClick={() => { setPhotoFile(null); setPhotoPreview(''); }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
                {photoError && <p className="text-xs text-red-600 font-semibold">{photoError}</p>}
                {photoFile && !photoError && (
                  <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Photo uploaded: {(photoFile.size / 1024).toFixed(1)} KB
                  </p>
                )}
              </div>

              {/* ID Document Upload */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div>
                  <p className="font-bold text-slate-800 text-sm">Identity Document *</p>
                  <p className="text-xs text-slate-500">JPEG or PDF only · Maximum size: <strong>100 KB</strong></p>
                </div>
                <div>
                  <label className={labelClass}>Document Type</label>
                  <select
                    value={idDocType}
                    onChange={e => setIdDocType(e.target.value)}
                    className={inputClass}
                  >
                    <option>Aadhaar Card</option>
                    <option>PAN Card</option>
                    <option>Voter ID Card</option>
                    <option>Driving Licence</option>
                    <option>Orissa High Court ID Card</option>
                    <option>Passport</option>
                  </select>
                </div>
                <label
                  htmlFor="id-doc-upload"
                  className="flex border-2 border-dashed border-slate-300 rounded-lg p-4 items-center gap-3 cursor-pointer hover:border-blue-700 transition-all"
                >
                  <FileText className="w-6 h-6 text-slate-400 flex-shrink-0" />
                  <span className="text-xs font-semibold text-blue-900">
                    {idDocFile ? idDocName : `Click to upload ${idDocType} copy`}
                  </span>
                  <input
                    id="id-doc-upload"
                    type="file"
                    accept=".jpg,.jpeg,.pdf,image/jpeg,application/pdf"
                    className="hidden"
                    onChange={handleIdDocChange}
                  />
                </label>
                {idDocError && <p className="text-xs text-red-600 font-semibold">{idDocError}</p>}
                {idDocFile && !idDocError && (
                  <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {idDocType} uploaded: {(idDocFile.size / 1024).toFixed(1)} KB
                  </p>
                )}
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <p className="font-bold">Important:</p>
                <p>Uploaded documents are used for identity verification only. They will be reviewed by the Secretariat before membership is approved.</p>
              </div>

              <div className="pt-2 flex justify-between">
                <button type="button" onClick={goBack} className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg text-sm">
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="px-6 py-2.5 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-950 transition-all cursor-pointer text-sm flex items-center gap-2"
                >
                  Next: Create Account <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ===== STEP 4: CREATE ACCOUNT ===== */}
          {step === 4 && (
            <div className="space-y-5">
              <h3 className="font-bold text-slate-900 text-base border-b border-slate-200 pb-2 flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-900" />
                Create Your Account
              </h3>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 space-y-1">
                <p className="font-bold">Set your portal login password</p>
                <p>Your <strong>HRMS ID</strong> (<code className="bg-blue-100 px-1 rounded font-mono">{employmentData.employeeCode.toUpperCase() || 'your HRMS ID'}</code>) will be your login username. Create a strong password below.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Password */}
                <div>
                  <label className={labelClass}>Password *</label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      required
                      placeholder="Create a strong password"
                      value={accountData.password}
                      onChange={e => setAccountData(a => ({ ...a, password: e.target.value }))}
                      className={`${inputClass} pr-10`}
                      autoComplete="new-password"
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(v => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Strength Meter */}
                  {accountData.password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                          <div
                            key={i}
                            className="h-1.5 flex-1 rounded-full transition-all duration-300"
                            style={{ backgroundColor: i <= pwdStrength.score ? pwdStrength.color : '#e2e8f0' }}
                          />
                        ))}
                      </div>
                      <p className="text-xs font-semibold" style={{ color: pwdStrength.color }}>
                        Password Strength: {pwdStrength.label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className={labelClass}>Confirm Password *</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      required
                      placeholder="Re-enter your password"
                      value={accountData.confirmPassword}
                      onChange={e => setAccountData(a => ({ ...a, confirmPassword: e.target.value }))}
                      className={`${inputClass} pr-10 ${
                        accountData.confirmPassword && accountData.password !== accountData.confirmPassword
                          ? 'border-red-400'
                          : accountData.confirmPassword && accountData.password === accountData.confirmPassword
                          ? 'border-emerald-400'
                          : ''
                      }`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {accountData.confirmPassword && (
                    <p className={`text-xs mt-1 font-semibold ${accountData.password === accountData.confirmPassword ? 'text-emerald-600' : 'text-red-500'}`}>
                      {accountData.password === accountData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                  )}
                </div>
              </div>

              {/* Generate Password Suggestion */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold text-slate-700">💡 Strong Password Tips</p>
                <ul className="text-xs text-slate-500 list-disc list-inside space-y-0.5">
                  <li>At least 8 characters (12+ recommended)</li>
                  <li>Mix of UPPERCASE and lowercase letters</li>
                  <li>Include at least one number (0–9)</li>
                  <li>Add a special character (@, #, $, !, %, etc.)</li>
                  <li>Avoid your name, birthday, or simple words</li>
                </ul>
                <button
                  type="button"
                  onClick={() => {
                    const gen = generateStrongPassword();
                    setAccountData(a => ({ ...a, password: gen, confirmPassword: gen }));
                    setShowPwd(true);
                  }}
                  className="mt-2 flex items-center gap-2 text-xs font-bold text-blue-900 hover:text-blue-700 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Generate a Strong Password for me
                </button>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <p className="font-bold">Security Notice:</p>
                <p>Your password is stored securely using industry-standard hashing. The Secretariat cannot see your password. Default reset password is <code className="bg-amber-100 px-1 rounded">OHCEA123</code> if you ever get locked out.</p>
              </div>

              <div className="pt-2 flex justify-between">
                <button type="button" onClick={goBack} className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg text-sm">
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || cooldownLeft > 0}
                  className="px-8 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold rounded-xl shadow-lg transition-all cursor-pointer text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting Application...
                    </>
                  ) : cooldownLeft > 0 ? (
                    <>Please wait {cooldownLeft}s...</>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                      Submit Application &amp; Generate ID
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
