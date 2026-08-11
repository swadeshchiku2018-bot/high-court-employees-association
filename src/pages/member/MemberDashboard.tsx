import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Member, Contribution, WelfareGrant } from '../../types';
import { IdCard } from '../../components/common/IdCard';
import {
  User, CreditCard, HeartHandshake, Bell, Shield, Download, Plus, CheckCircle2,
  Clock, AlertCircle, FileText, Phone, MapPin, Building, Sparkles, RefreshCw
} from 'lucide-react';

interface MemberDashboardProps {
  onOpenPayment: (data: { title: string; amount: number; type: 'SUBSCRIPTION' | 'WELFARE_DONATION'; monthYear?: string }) => void;
  onOpenReceipt: (contribution: Contribution) => void;
  initialTab?: 'ID_CARD' | 'CONTRIBUTIONS' | 'WELFARE' | 'PROFILE' | 'ALERTS';
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  onOpenPayment,
  onOpenReceipt,
  initialTab = 'ID_CARD'
}) => {
  const { currentUser, refreshUserData } = useAuth();
  const [activeTab, setActiveTab] = useState<'ID_CARD' | 'CONTRIBUTIONS' | 'WELFARE' | 'PROFILE' | 'ALERTS'>(initialTab);

  // Local state for contributions & welfare applications
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [welfareGrants, setWelfareGrants] = useState<WelfareGrant[]>([]);
  const [isWelfareModalOpen, setIsWelfareModalOpen] = useState(false);

  // Form for New Welfare Grant
  const [welfareForm, setWelfareForm] = useState({
    grantType: 'MEDICAL' as WelfareGrant['grantType'],
    amountRequested: 25000,
    reason: '',
    institutionName: ''
  });
  const [isSubmittingWelfare, setIsSubmittingWelfare] = useState(false);

  // Profile Edit
  const [profileForm, setProfileForm] = useState({
    mobile: currentUser?.mobile || '',
    address: currentUser?.address || '',
    emergencyContact: currentUser?.emergencyContact || '',
    bloodGroup: currentUser?.bloodGroup || 'B+'
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  useEffect(() => {
    if (currentUser) {
      // Fetch contributions
      fetch(`/api/members/${currentUser.id}/contributions`)
        .then(r => r.json())
        .then(setContributions)
        .catch(console.error);

      // Fetch welfare
      fetch(`/api/members/${currentUser.id}/welfare`)
        .then(r => r.json())
        .then(setWelfareGrants)
        .catch(console.error);

      setProfileForm({
        mobile: currentUser.mobile || '',
        address: currentUser.address || '',
        emergencyContact: currentUser.emergencyContact || '',
        bloodGroup: currentUser.bloodGroup || 'B+'
      });
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const handleWelfareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingWelfare(true);
    try {
      const res = await fetch('/api/welfare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: currentUser.id,
          memberName: currentUser.name,
          membershipId: currentUser.membershipId,
          ...welfareForm,
          documents: ['Medical_Report_Hospital_Bill.pdf']
        })
      });
      if (res.ok) {
        const newGrant = await res.json();
        setWelfareGrants([newGrant, ...welfareGrants]);
        setIsWelfareModalOpen(false);
        setWelfareForm({ grantType: 'MEDICAL', amountRequested: 25000, reason: '', institutionName: '' });
        alert("Welfare grant application submitted successfully! Reference logged.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingWelfare(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMsg('');
    try {
      const res = await fetch(`/api/members/${currentUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      });
      if (res.ok) {
        await refreshUserData();
        setProfileMsg("Profile contact information updated successfully!");
      }
    } catch (e) {
      setProfileMsg("Failed to update profile.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const totalPaid = contributions.reduce((acc, c) => acc + (c.status === 'PAID' ? c.amount : 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-slate-800">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="w-16 h-20 rounded-xl object-cover border-2 border-amber-400 shadow-md shrink-0"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-400 text-slate-950 uppercase tracking-wider">
                {currentUser.membershipType.replace('_', ' ')}
              </span>
              <span className="text-xs font-mono text-amber-300 font-bold bg-white/10 px-2 py-0.5 rounded border border-white/10">
                {currentUser.membershipId}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">{currentUser.name}</h1>
            <p className="text-xs text-slate-300 flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-amber-400" />
              {currentUser.designation} • {currentUser.department} ({currentUser.postingLocation})
            </p>
          </div>
        </div>

        {/* Quick Action Payment Button */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3 shrink-0">
          <button
            onClick={() => onOpenPayment({
              title: "Monthly Membership Subscription (₹500)",
              amount: 500,
              type: 'SUBSCRIPTION',
              monthYear: new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
            })}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold rounded-xl shadow-lg transition-all cursor-pointer text-xs flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4 text-slate-950" />
            <span>Pay Monthly Subscription</span>
          </button>
        </div>
      </div>

      {/* Verification Status Warning if Pending */}
      {currentUser.status === 'PENDING' && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-center justify-between gap-4 text-xs text-amber-900 shadow-sm">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-amber-700 shrink-0" />
            <div>
              <strong className="font-bold">Membership Verification Pending:</strong> Your online enrollment application has been logged. The Secretariat is inspecting your uploaded High Court credentials.
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-200 text-amber-950 rounded-lg font-bold text-[10px] uppercase shrink-0">
            IN QUEUE
          </span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm flex flex-wrap gap-2 text-xs font-bold">
        {[
          { id: 'ID_CARD', label: 'Digital ID Card', icon: Shield },
          { id: 'CONTRIBUTIONS', label: 'Monthly Contributions', icon: CreditCard },
          { id: 'WELFARE', label: 'Welfare Fund Grants', icon: HeartHandshake },
          { id: 'PROFILE', label: 'Service Profile', icon: User },
          { id: 'ALERTS', label: 'Notifications Center', icon: Bell }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-900 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DIGITAL ID CARD & SUMMARY */}
      {activeTab === 'ID_CARD' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-900" />
              Official Member Digital Identity Card
            </h2>
            <p className="text-xs text-slate-600">
              This digital identity card is officially issued by the High Court Employees' Association and features an encrypted QR verification code.
            </p>
            <IdCard member={currentUser} />
          </div>

          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Member Overview & Statistics</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Total Subscription Paid</p>
                <p className="text-2xl font-extrabold text-blue-900 font-mono">₹{totalPaid.toLocaleString()}</p>
                <p className="text-[10px] text-emerald-700 font-semibold">{contributions.length} Months Recorded</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Welfare Grants Received</p>
                <p className="text-2xl font-extrabold text-emerald-800 font-mono">
                  ₹{welfareGrants.filter(w => w.status === 'APPROVED' || w.status === 'DISBURSED').reduce((a, b) => a + b.amountSanctioned, 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-500 font-semibold">{welfareGrants.length} Applications Total</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
                Key Association Amenities & Rights
              </h3>
              <ul className="space-y-2.5 text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Eligible for Emergency Medical Relief Grant up to ₹1,00,000</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Right to vote in High Court Employees' Association Biennial Elections</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Subsidy on High Court Officers Canteen and Transit Guest Room Bookings</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Child Higher Education Incentive Scholarship Eligibility</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MONTHLY CONTRIBUTIONS */}
      {activeTab === 'CONTRIBUTIONS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Monthly Contribution Ledger</h2>
              <p className="text-xs text-slate-500">Official record of monthly membership fees paid to Association Corpus.</p>
            </div>
            <button
              onClick={() => onOpenPayment({
                title: "Monthly Membership Subscription (₹500)",
                amount: 500,
                type: 'SUBSCRIPTION',
                monthYear: new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
              })}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              Pay Subscription Online
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200 text-[10px]">
                <tr>
                  <th className="p-3">Receipt No</th>
                  <th className="p-3">Month / Year</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Payment Method</th>
                  <th className="p-3">Payment Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {contributions.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="p-3 font-mono font-bold text-blue-900">{c.receiptNo}</td>
                    <td className="p-3 font-bold text-slate-800">{c.monthYear}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">₹{c.amount}</td>
                    <td className="p-3 text-slate-600">{c.paymentMethod}</td>
                    <td className="p-3 text-slate-500">{c.paymentDate}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 uppercase">
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onOpenReceipt(c)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[11px] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-900" />
                        View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: WELFARE FUND GRANTS */}
      {activeTab === 'WELFARE' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Welfare Fund Assistance Applications</h2>
              <p className="text-xs text-slate-500">Track status of medical grants, education awards, and bereavement aid.</p>
            </div>
            <button
              onClick={() => setIsWelfareModalOpen(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-xs flex items-center gap-2"
            >
              <HeartHandshake className="w-4 h-4 text-amber-300" />
              Apply for Welfare Grant
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {welfareGrants.length === 0 ? (
              <div className="md:col-span-2 p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
                No welfare grant applications filed yet. Click "Apply for Welfare Grant" to submit a request.
              </div>
            ) : (
              welfareGrants.map((wg) => (
                <div key={wg.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-900 uppercase">
                        {wg.grantType} GRANT
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-1">{wg.reason}</h3>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                      wg.status === 'APPROVED' || wg.status === 'DISBURSED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : wg.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {wg.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Requested</p>
                      <p className="font-mono font-bold text-slate-800">₹{wg.amountRequested.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Sanctioned</p>
                      <p className="font-mono font-bold text-emerald-800">₹{wg.amountSanctioned.toLocaleString()}</p>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-200">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Hospital / College</p>
                      <p className="font-semibold text-slate-700">{wg.institutionName}</p>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 flex justify-between items-center pt-1">
                    <span>Filed: {wg.applicationDate}</span>
                    <span className="font-mono font-bold text-blue-900">Ref: {wg.id}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SERVICE PROFILE */}
      {activeTab === 'PROFILE' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">
            High Court Service Profile & Contact Info
          </h2>

          {profileMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold">
              {profileMsg}
            </div>
          )}

          <form onSubmit={handleProfileUpdate} className="space-y-4 text-xs">
            {/* Readonly High Court Employment Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Employee Code</p>
                <p className="font-mono font-bold text-slate-900 text-sm">{currentUser.employeeCode}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Designation</p>
                <p className="font-bold text-slate-800 text-sm">{currentUser.designation}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Department / Section</p>
                <p className="font-bold text-slate-800 text-sm">{currentUser.department}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Cadre Category</p>
                <p className="font-bold text-slate-800">{currentUser.employeeCategory}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Place of Posting</p>
                <p className="font-bold text-slate-800">{currentUser.postingLocation}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Date of High Court Joining</p>
                <p className="font-bold text-slate-800">{currentUser.dateOfJoining}</p>
              </div>
            </div>

            {/* Editable Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Phone Number (WhatsApp)</label>
                <input
                  type="text"
                  value={profileForm.mobile}
                  onChange={e => setProfileForm({ ...profileForm, mobile: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                <select
                  value={profileForm.bloodGroup}
                  onChange={e => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                >
                  {['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Emergency Contact Person & Phone</label>
                <input
                  type="text"
                  value={profileForm.emergencyContact}
                  onChange={e => setProfileForm({ ...profileForm, emergencyContact: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="px-6 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              {isUpdatingProfile ? "Updating..." : "Save Contact Updates"}
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: NOTIFICATIONS CENTER */}
      {activeTab === 'ALERTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-600" />
            Member Personal Alerts & Communications
          </h2>

          <div className="space-y-3">
            {[
              { title: "July 2026 Subscription Received", desc: "Receipt #HCEA-REC-2026-8801 issued for ₹500.", date: "Today, 10:15 AM", type: "SUCCESS" },
              { title: "General Body Meeting Notice", desc: "Annual General Body Meeting scheduled for August 15, 2026 at Association Hall.", date: "Aug 02, 2026", type: "INFO" },
              { title: "Welfare Application Approved", desc: "Medical grant of ₹25,000 sanctioned under Ref #WG-2026-02.", date: "Jul 28, 2026", type: "SUCCESS" }
            ].map((alt, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">{alt.title}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">{alt.date}</span>
                  </div>
                  <p className="text-slate-600">{alt.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NEW WELFARE GRANT MODAL */}
      {isWelfareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center border-b border-slate-800">
              <h3 className="font-bold text-base text-amber-300">Apply for Association Welfare Grant</h3>
              <button
                onClick={() => setIsWelfareModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleWelfareSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Grant Category *</label>
                <select
                  value={welfareForm.grantType}
                  onChange={e => setWelfareForm({ ...welfareForm, grantType: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                >
                  <option value="MEDICAL">Medical Emergency Relief Grant</option>
                  <option value="EDUCATION">Children Higher Education Award</option>
                  <option value="BEREAVEMENT">Bereavement / Ex-Gratia Grant</option>
                  <option value="RETIREMENT">Superannuation Fare</option>
                  <option value="DISASTER">Natural Calamity Relief</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Amount Requested (₹) *</label>
                <input
                  type="number"
                  required
                  min={1000}
                  max={100000}
                  value={welfareForm.amountRequested}
                  onChange={e => setWelfareForm({ ...welfareForm, amountRequested: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hospital / Medical College / University Name</label>
                <input
                  type="text"
                  placeholder="e.g. Apollo Hospital, Cuttack or AIIMS Bhubaneswar"
                  value={welfareForm.institutionName}
                  onChange={e => setWelfareForm({ ...welfareForm, institutionName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason / Case Brief *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide diagnosis, surgery details, or course admission details..."
                  value={welfareForm.reason}
                  onChange={e => setWelfareForm({ ...welfareForm, reason: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                ></textarea>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-800">Attach Supporting Document (Simulation)</p>
                <p className="text-[11px] text-slate-500">Hospital bills, doctor referral, or admission letter.</p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWelfareModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWelfare}
                  className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  {isSubmittingWelfare ? "Submitting Application..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
