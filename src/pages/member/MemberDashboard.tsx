import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Member, Contribution, WelfareGrant } from '../../types';
import { IdCard } from '../../components/common/IdCard';
import {
  User, CreditCard, HeartHandshake, Bell, Shield, Download, Plus, CheckCircle2,
  Clock, AlertCircle, FileText, Phone, MapPin, Building, Sparkles, RefreshCw,
  Clock, AlertCircle, FileText, Phone, MapPin, Building, Sparkles, RefreshCw,
  KeyRound, Lock, Eye, EyeOff, MessageSquare, Upload, ExternalLink
} from 'lucide-react';
import { GossipCard } from '../../components/common/GossipCard';

interface MemberDashboardProps {
  onOpenPayment: (data: { title: string; amount: number; type: 'SUBSCRIPTION' | 'WELFARE_DONATION'; monthYear?: string }) => void;
  onOpenReceipt: (contribution: Contribution) => void;
  initialTab?: 'ID_CARD' | 'CONTRIBUTIONS' | 'WELFARE' | 'PROFILE' | 'SECURITY' | 'ALERTS' | 'GOSSIP' | 'GRIEVANCE';
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  onOpenPayment,
  onOpenReceipt,
  initialTab = 'ID_CARD'
}) => {
  const { currentUser, refreshUserData } = useAuth();
  const [activeTab, setActiveTab] = useState<'ID_CARD' | 'CONTRIBUTIONS' | 'WELFARE' | 'PROFILE' | 'SECURITY' | 'ALERTS' | 'GOSSIP' | 'GRIEVANCE'>(initialTab);

  // Local state for contributions & welfare applications
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [welfareGrants, setWelfareGrants] = useState<WelfareGrant[]>([]);
  const [isWelfareModalOpen, setIsWelfareModalOpen] = useState(false);

  // Gossip
  const [gossipPosts, setGossipPosts] = useState<any[]>([]);
  const [gossipContent, setGossipContent] = useState('');

  // Grievance
  const [grievances, setGrievances] = useState<any[]>([]);
  const [isGrievanceModalOpen, setIsGrievanceModalOpen] = useState(false);
  const [grievanceForm, setGrievanceForm] = useState({
    subject: '',
    content: '',
    attachmentUrl: ''
  });
  const [isSubmittingGrievance, setIsSubmittingGrievance] = useState(false);
  const [uploadedPdfFileName, setUploadedPdfFileName] = useState('');

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

  // User ID & Password Edit
  const [credentialsForm, setCredentialsForm] = useState({
    employeeCode: currentUser?.employeeCode || '',
    email: currentUser?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isUpdatingCredentials, setIsUpdatingCredentials] = useState(false);
  const [credentialsMsg, setCredentialsMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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

      // Fetch gossip
      fetch('/api/gossip')
        .then(r => r.json())
        .then(setGossipPosts)
        .catch(console.error);

      // Fetch grievances
      fetch(`/api/grievances/member/${currentUser.id}`)
        .then(r => r.json())
        .then(setGrievances)
        .catch(console.error);

      setProfileForm({
        mobile: currentUser.mobile || '',
        address: currentUser.address || '',
        emergencyContact: currentUser.emergencyContact || '',
        bloodGroup: currentUser.bloodGroup || 'B+'
      });

      setCredentialsForm(prev => ({
        ...prev,
        employeeCode: currentUser.employeeCode || '',
        email: currentUser.email || ''
      }));
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredentialsMsg(null);

    if (credentialsForm.newPassword) {
      if (credentialsForm.newPassword !== credentialsForm.confirmPassword) {
        setCredentialsMsg({ text: "New password and confirm password do not match.", isError: true });
        return;
      }
      if (credentialsForm.newPassword.length < 6) {
        setCredentialsMsg({ text: "New password must be at least 6 characters.", isError: true });
        return;
      }
      if (!credentialsForm.currentPassword) {
        setCredentialsMsg({ text: "Current password is required to set a new password.", isError: true });
        return;
      }
    }

    setIsUpdatingCredentials(true);
    try {
      const res = await fetch(`/api/members/${currentUser.id}/change-credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeCode: credentialsForm.employeeCode,
          email: credentialsForm.email,
          currentPassword: credentialsForm.currentPassword,
          newPassword: credentialsForm.newPassword,
          actorName: currentUser.name
        })
      });

      const data = await res.json();
      if (res.ok) {
        setCredentialsMsg({
          text: "Login credentials updated successfully! You can now log in with your updated User ID and password.",
          isError: false
        });
        setCredentialsForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        await refreshUserData();
      } else {
        setCredentialsMsg({ text: data.error || "Failed to update credentials", isError: true });
      }
    } catch (err: any) {
      setCredentialsMsg({ text: err.message || "Network error", isError: true });
    } finally {
      setIsUpdatingCredentials(false);
    }
  };

  const handlePostGossip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gossipContent.trim()) return;
    try {
      await fetch('/api/gossip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: currentUser.id,
          authorName: currentUser.name,
          content: gossipContent
        })
      });
      setGossipContent('');
      const res = await fetch('/api/gossip');
      if (res.ok) setGossipPosts(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

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

  const handleSubmitGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSubmittingGrievance(true);
    try {
      const res = await fetch('/api/grievances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: currentUser.id,
          memberName: currentUser.name,
          subject: grievanceForm.subject,
          content: grievanceForm.content,
          attachmentUrl: grievanceForm.attachmentUrl
        })
      });
      if (res.ok) {
        const newGrv = await res.json();
        setGrievances([newGrv, ...grievances]);
        setIsGrievanceModalOpen(false);
        setGrievanceForm({ subject: '', content: '', attachmentUrl: '' });
        setUploadedPdfFileName('');
        alert('Grievance submitted successfully. You can track its status here.');
      } else {
        alert('Failed to submit grievance');
      }
    } catch (e) {
      console.error(e);
      alert('Error submitting grievance');
    } finally {
      setIsSubmittingGrievance(false);
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
          { id: 'GOSSIP', label: 'ମୋ ମନ କଥା 💭', icon: MessageSquare },
          { id: 'GRIEVANCE', label: 'Grievance Redressal', icon: AlertCircle },
          { id: 'PROFILE', label: 'Service Profile', icon: User },
          { id: 'SECURITY', label: 'User ID & Password', icon: KeyRound },
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
        <div className="flex flex-col items-center justify-center space-y-4 text-center py-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center justify-center gap-2">
            <Shield className="w-6 h-6 text-blue-900" />
            Official Member Digital Identity Card
          </h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto mb-8">
            This digital identity card is officially issued by the High Court Employees' Association and features an encrypted QR verification code.
          </p>
          <div className="w-full">
            <IdCard member={currentUser} />
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

      {/* TAB: GRIEVANCE REDRESSAL */}
      {activeTab === 'GRIEVANCE' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Grievance Redressal</h2>
              <p className="text-xs text-slate-500">Submit your grievances, complaints, or suggestions directly to the Association.</p>
            </div>
            <button
              onClick={() => setIsGrievanceModalOpen(true)}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              File a Grievance
            </button>
          </div>

          <div className="space-y-4">
            {grievances.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
                You have not filed any grievances.
              </div>
            ) : (
              grievances.map((g) => (
                <div key={g.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full ${
                    g.status === 'RESOLVED' ? 'bg-emerald-500' :
                    g.status === 'IN_REVIEW' ? 'bg-amber-500' :
                    g.status === 'REJECTED' ? 'bg-rose-500' : 'bg-blue-500'
                  }`} />
                  <div className="pl-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{g.subject}</h3>
                        <p className="text-[10px] text-slate-400 font-mono">Filed on {new Date(g.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        g.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                        g.status === 'IN_REVIEW' ? 'bg-amber-100 text-amber-900' :
                        g.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {g.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="mt-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg whitespace-pre-wrap border border-slate-100">
                      {g.content}
                    </div>

                    {g.attachmentUrl && (
                      <div className="mt-2 flex">
                        <a
                          href={g.attachmentUrl}
                          download={`Grievance_Document_${g.id}.pdf`}
                          className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          Download Attached Document
                        </a>
                      </div>
                    )}

                    {g.adminNotes && (
                      <div className="mt-3 bg-amber-50/50 border border-amber-100 rounded-lg p-3">
                        <p className="text-[10px] uppercase font-bold text-amber-800 mb-1">Response from Association / Admin:</p>
                        <p className="text-xs text-amber-900">{g.adminNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: GOSSIP */}
      {activeTab === 'GOSSIP' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
              <MessageSquare className="w-6 h-6 text-purple-300" />
              ମୋ ମନ କଥା 💭
            </h2>
            <p className="text-purple-200 text-sm italic mb-4">ମନରେ ଯାହା... କହିଦିଅ, ମନ ହାଲୁକା କର 😜</p>
            
            <form onSubmit={handlePostGossip} className="bg-white/10 rounded-xl p-3 border border-white/20">
              <textarea
                value={gossipContent}
                onChange={e => setGossipContent(e.target.value)}
                placeholder="What's on your mind? Share with the community..."
                className="w-full bg-transparent text-white placeholder-purple-200 border-none outline-none resize-none min-h-[80px] text-sm"
              />
              <div className="flex justify-end pt-2 border-t border-white/10 mt-2">
                <button
                  type="submit"
                  disabled={!gossipContent.trim()}
                  className="px-6 py-2 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Post to Community
                </button>
              </div>
            </form>
          </div>

          <div className="max-w-2xl mx-auto space-y-4">
            {gossipPosts.length === 0 ? (
              <div className="text-center p-8 bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
                No posts yet. Start the conversation!
              </div>
            ) : (
              gossipPosts.map(post => (
                <GossipCard
                  key={post.id}
                  post={post}
                  onReact={async (postId, reaction) => {
                    await fetch(`/api/gossip/${postId}/react`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ reaction })
                    });
                    const res = await fetch('/api/gossip');
                    if (res.ok) setGossipPosts(await res.json());
                  }}
                  onComment={async (postId, content) => {
                    await fetch(`/api/gossip/${postId}/comment`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ authorId: currentUser.id, authorName: currentUser.name, content })
                    });
                    const res = await fetch('/api/gossip');
                    if (res.ok) setGossipPosts(await res.json());
                  }}
                  onDelete={
                    (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'PRESIDENT' || currentUser.role === 'SECRETARY')
                      ? async (postId) => {
                          if (!confirm('Are you sure you want to delete this post?')) return;
                          await fetch(`/api/gossip/${postId}`, { method: 'DELETE' });
                          setGossipPosts(prev => prev.filter(p => p.id !== postId));
                        }
                      : undefined
                  }
                />
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

      {/* TAB: SECURITY, USER ID & PASSWORD */}
      {activeTab === 'SECURITY' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-600" />
              Employee User ID & Password Management
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Update your employee login User ID, registered email, or reset your portal access password.
            </p>
          </div>

          {credentialsMsg && (
            <div className={`p-4 rounded-xl text-xs font-semibold flex items-start gap-2.5 ${
              credentialsMsg.isError
                ? 'bg-rose-50 border border-rose-200 text-rose-800'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            }`}>
              {credentialsMsg.isError ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <span>{credentialsMsg.text}</span>
            </div>
          )}

          {/* Current Credentials Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Employee Code (User ID)</span>
              <p className="text-base font-bold font-mono text-blue-950">{currentUser.employeeCode}</p>
              <p className="text-[10px] text-slate-500">Official Staff Identification</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Email</span>
              <p className="text-base font-bold text-slate-800 break-all">{currentUser.email}</p>
              <p className="text-[10px] text-slate-500">Primary communication & login</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Default Portal Password</span>
              <p className="text-base font-bold font-mono text-amber-900 bg-amber-100 px-2 py-0.5 rounded inline-block">
                OHCEA123
              </p>
              <p className="text-[10px] text-slate-500">Admin default reset password</p>
            </div>
          </div>

          <form onSubmit={handleUpdateCredentials} className="space-y-6 pt-2">
            {/* Section 1: User ID / Employee Code & Email */}
            <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-900" />
                Change Login User ID & Email
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Employee Code / User ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={credentialsForm.employeeCode}
                    onChange={e => setCredentialsForm({ ...credentialsForm, employeeCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none uppercase"
                    placeholder="e.g. HC-0182"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">This code serves as your unique User ID across the portal.</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Registered Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={credentialsForm.email}
                    onChange={e => setCredentialsForm({ ...credentialsForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    placeholder="e.g. staff@OHCEA.odisha.gov.in"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Used for correspondence, receipts, and login.</p>
                </div>
              </div>
            </div>

            {/* Section 2: Change Password */}
            <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-600" />
                  Change Account Password
                </h3>
                <span className="text-[11px] text-slate-500">
                  (Leave blank if keeping current password)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={credentialsForm.currentPassword}
                      onChange={e => setCredentialsForm({ ...credentialsForm, currentPassword: e.target.value })}
                      placeholder="Current or default (OHCEA123)"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Default for new accounts is <code className="font-bold text-slate-700">OHCEA123</code></p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    New Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={credentialsForm.newPassword}
                    onChange={e => setCredentialsForm({ ...credentialsForm, newPassword: e.target.value })}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={credentialsForm.confirmPassword}
                    onChange={e => setCredentialsForm({ ...credentialsForm, confirmPassword: e.target.value })}
                    placeholder="Re-type new password"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="showPassCheckbox"
                  checked={showPassword}
                  onChange={e => setShowPassword(e.target.checked)}
                  className="rounded text-blue-900 focus:ring-blue-900 cursor-pointer"
                />
                <label htmlFor="showPassCheckbox" className="text-xs text-slate-600 font-semibold cursor-pointer">
                  Show passwords in plain text
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isUpdatingCredentials}
                className="px-6 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>{isUpdatingCredentials ? "Updating Credentials..." : "Save User ID & Password Updates"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 6: NOTIFICATIONS CENTER */}
      {activeTab === 'ALERTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-600" />
            Member Personal Alerts & Communications
          </h2>

          <div className="space-y-3">
            {[
              { title: "July 2026 Subscription Received", desc: "Receipt #OHCEA-REC-2026-8801 issued for ₹500.", date: "Today, 10:15 AM", type: "SUCCESS" },
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

      {/* MODAL: FILE GRIEVANCE */}
      {isGrievanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center border-b border-slate-800">
              <h3 className="font-bold text-base text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                File a Grievance
              </h3>
              <button onClick={() => setIsGrievanceModalOpen(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitGrievance} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="Brief subject of your grievance..."
                  value={grievanceForm.subject}
                  onChange={e => setGrievanceForm({ ...grievanceForm, subject: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Description *</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Please describe your grievance in detail..."
                  value={grievanceForm.content}
                  onChange={e => setGrievanceForm({ ...grievanceForm, content: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Supporting Document (PDF Only, Optional)</label>
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-900 rounded-xl p-3 bg-slate-50 transition-all text-center">
                  {grievanceForm.attachmentUrl ? (
                    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                      <div className="flex items-center gap-2.5 text-left">
                        <div className="p-2 bg-blue-900 text-amber-300 rounded-lg shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs truncate max-w-[200px]">
                            {uploadedPdfFileName}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            Document Attached
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setGrievanceForm(prev => ({ ...prev, attachmentUrl: '' }));
                          setUploadedPdfFileName('');
                        }}
                        className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-[11px] border border-rose-200 transition-all cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        id="grievance-doc-upload"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                            alert('Please select a valid PDF document (.pdf).');
                            e.target.value = '';
                            return;
                          }
                          if (file.size > 5 * 1024 * 1024) {
                            alert('File size must be less than 5MB.');
                            e.target.value = '';
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = () => {
                            setGrievanceForm(prev => ({
                              ...prev,
                              attachmentUrl: reader.result as string
                            }));
                            setUploadedPdfFileName(file.name);
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                      <label
                        htmlFor="grievance-doc-upload"
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white hover:bg-blue-50 text-blue-900 border border-blue-300 font-bold rounded-xl cursor-pointer shadow-xs transition-all text-xs"
                      >
                        <Upload className="w-3.5 h-3.5 text-blue-900" />
                        <span>Select PDF Application</span>
                      </label>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Upload written application or proof (Max 5MB PDF)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGrievanceModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingGrievance}
                  className="px-6 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl text-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingGrievance ? 'Submitting...' : 'Submit Grievance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
