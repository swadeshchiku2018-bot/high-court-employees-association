import React, { useState } from 'react';
import { Member } from '../../types';
import { Shield, CheckCircle2, User, Building, CreditCard, Upload, ArrowRight, Loader2, IdCard as IdCardIcon } from 'lucide-react';
import { IdCard } from '../../components/common/IdCard';

interface RegisterPageProps {
  onNavigate: (route: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [registeredMember, setRegisteredMember] = useState<Member | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    employeeCode: '',
    email: '',
    mobile: '',
    dob: '',
    bloodGroup: 'B+',
    address: '',
    designation: 'Court Master',
    department: 'Bench Section',
    postingLocation: 'Main High Court Building, Cuttack',
    dateOfJoining: '2022-04-15',
    employeeCategory: 'JUDICIAL' as Member['employeeCategory'],
    membershipType: 'REGULAR_MEMBER' as Member['membershipType'],
    emergencyContact: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.employeeCode || !formData.email || !formData.mobile) {
      setError("Please fill in all required personal and employment fields.");
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          role: 'MEMBER',
          avatarUrl: `https://i.pravatar.cc/300?img=${Math.floor(Math.random() * 50) + 1}`,
          membershipDate: new Date().toISOString().split('T')[0],
          documents: [
            { id: 'd-1', title: 'High Court Official ID Proof', url: '#', uploadedAt: new Date().toISOString().split('T')[0] }
          ]
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }

      const newMember = await res.json();
      setIsSubmitting(false);
      setRegisteredMember(newMember);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-extrabold tracking-widest text-amber-700 uppercase bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          ONLINE REGISTRATION PORTAL
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Become a Member of the Association
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Complete the official enrollment form for High Court judicial, executive, administrative, and technical personnel.
        </p>
      </div>

      {registeredMember ? (
        /* Confirmation Screen */
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 border-2 border-emerald-400 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">Registration Submitted Successfully!</h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Your application has been logged with Membership ID: <strong className="text-blue-900 font-mono">{registeredMember.membershipId}</strong>.
            </p>
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-2.5 rounded-lg max-w-md mx-auto font-medium">
              STATUS: Pending Verification by Secretariat. You can view your digital ID preview below.
            </p>
          </div>

          {/* Digital ID Preview */}
          <div className="py-4">
            <IdCard member={registeredMember} />
          </div>

          <div className="flex justify-center gap-4 pt-4 border-t border-slate-200">
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
      ) : (
        /* Multi-step Form */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Progress Bar Header */}
          <div className="bg-slate-900 text-white p-6 border-b border-slate-800 grid grid-cols-3 gap-2 text-xs text-center font-bold">
            <button
              onClick={() => setStep(1)}
              className={`py-2 rounded-lg transition-all ${step === 1 ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              1. Personal Details
            </button>
            <button
              onClick={() => setStep(2)}
              className={`py-2 rounded-lg transition-all ${step === 2 ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              2. Employment Details
            </button>
            <button
              onClick={() => setStep(3)}
              className={`py-2 rounded-lg transition-all ${step === 3 ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              3. Membership & ID
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold">
                {error}
              </div>
            )}

            {/* STEP 1: PERSONAL INFORMATION */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-base border-b border-slate-200 pb-2 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-900" />
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Name (As per High Court Service Record) *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Sri Ramesh Chandra Das"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">High Court Employee Code / ID *</label>
                    <input
                      type="text"
                      name="employeeCode"
                      required
                      placeholder="e.g. HC-EMP-1082"
                      value={formData.employeeCode}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Official Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="e.g. ramesh.das@hcea.gov.in"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mobile Number (WhatsApp Enabled) *</label>
                    <input
                      type="tel"
                      name="mobile"
                      required
                      placeholder="+91 94370 00000"
                      value={formData.mobile}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    >
                      {['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Residential Address</label>
                    <input
                      type="text"
                      name="address"
                      placeholder="Qtr No, Colony, City, Pin Code"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-2.5 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-950 transition-all cursor-pointer text-sm"
                  >
                    Next: Employment Details →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: EMPLOYMENT INFORMATION */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-base border-b border-slate-200 pb-2 flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-900" />
                  Employment Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Current Designation</label>
                    <select
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    >
                      <option value="Senior Section Officer">Senior Section Officer</option>
                      <option value="Court Master">Court Master</option>
                      <option value="Personal Assistant">Personal Assistant</option>
                      <option value="Translator Grade-I">Translator Grade-I</option>
                      <option value="Assistant Registrar">Assistant Registrar</option>
                      <option value="Senior Clerk">Senior Clerk</option>
                      <option value="Data Entry Inspector">Data Entry Inspector</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Department / Section</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    >
                      <option value="Bench Section">Bench Section</option>
                      <option value="Filing & Registry">Filing & Registry</option>
                      <option value="Judicial Accounts">Judicial Accounts</option>
                      <option value="Translation Wing">Translation Wing</option>
                      <option value="IT & Digitization Cell">IT & Digitization Cell</option>
                      <option value="Copying Department">Copying Department</option>
                      <option value="Protocol & Security">Protocol & Security</option>
                      <option value="Administrative Wing">Administrative Wing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Cadre Category</label>
                    <select
                      name="employeeCategory"
                      value={formData.employeeCategory}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    >
                      <option value="JUDICIAL">Judicial Staff</option>
                      <option value="EXECUTIVE">Executive Cadre</option>
                      <option value="ADMINISTRATIVE">Administrative Officer</option>
                      <option value="TECHNICAL">Technical / IT Staff</option>
                      <option value="SUPPORT">Support Cadre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Place of Posting</label>
                    <input
                      type="text"
                      name="postingLocation"
                      value={formData.postingLocation}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Date of High Court Joining</label>
                    <input
                      type="date"
                      name="dateOfJoining"
                      value={formData.dateOfJoining}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Emergency Contact Phone</label>
                    <input
                      type="text"
                      name="emergencyContact"
                      placeholder="Spouse/Parent Name & Phone"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg text-sm"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-6 py-2.5 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-950 transition-all cursor-pointer text-sm"
                  >
                    Next: Membership Type →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: MEMBERSHIP & DOCUMENT UPLOAD */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-base border-b border-slate-200 pb-2 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-900" />
                  Membership Type & Document Upload
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Membership Plan</label>
                    <select
                      name="membershipType"
                      value={formData.membershipType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    >
                      <option value="REGULAR_MEMBER">Regular Subscription Member (₹500/month)</option>
                      <option value="LIFE_MEMBER">Life Member Corpus Subscriber</option>
                    </select>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900">Document Upload Notice</p>
                    <p className="text-slate-500 mt-1">
                      Upload your High Court Staff Identity Card copy for automatic employee verification.
                    </p>
                    <div className="mt-2 border-2 border-dashed border-slate-300 rounded-lg p-3 text-center text-slate-500 hover:border-blue-900 cursor-pointer">
                      <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                      <span className="font-semibold text-blue-900">Upload High Court ID Proof</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                  <p className="font-bold">Automated Security Numbering:</p>
                  <p>Upon clicking submit, a unique secure Membership Number (e.g. <strong>HCEA-2026-XXXX</strong>) will be generated on the server and logged in the approval queue.</p>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg text-sm"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold rounded-xl shadow-lg transition-all cursor-pointer text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating Membership ID...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-slate-950" />
                        Submit Application & Generate ID
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};
