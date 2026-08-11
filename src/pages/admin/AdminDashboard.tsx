import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Member, Contribution, WelfareGrant, Notice, AuditLog, AssociationSettings } from '../../types';
import {
  Users, CreditCard, HeartHandshake, FileText, Settings, Activity, Shield, CheckCircle2,
  XCircle, Search, Plus, Filter, Download, ArrowUpRight, DollarSign, PieChart as PieChartIcon,
  Sparkles, RefreshCw, Eye
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'MEMBERS' | 'CONTRIBUTIONS' | 'WELFARE' | 'NOTICES' | 'SETTINGS' | 'AUDIT'>('MEMBERS');

  // State data
  const [members, setMembers] = useState<Member[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [welfareGrants, setWelfareGrants] = useState<WelfareGrant[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<AssociationSettings | null>(null);

  // Filters
  const [memberSearch, setMemberSearch] = useState('');
  const [memberStatusFilter, setMemberStatusFilter] = useState('ALL');

  // Modal forms
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    category: 'CIRCULAR' as Notice['category'],
    content: '',
    description: '',
    visibility: 'PUBLIC' as Notice['visibility']
  });

  const [isManualPaymentOpen, setIsManualPaymentOpen] = useState(false);
  const [manualPaymentForm, setManualPaymentForm] = useState({
    memberId: '',
    monthYear: 'August 2026',
    amount: 500,
    paymentMethod: 'PAYROLL_DEDUCTION' as Contribution['paymentMethod']
  });

  const loadAllData = () => {
    fetch('/api/members').then(r => r.json()).then(setMembers).catch(console.error);
    fetch('/api/contributions').then(r => r.json()).then(setContributions).catch(console.error);
    fetch('/api/welfare').then(r => r.json()).then(setWelfareGrants).catch(console.error);
    fetch('/api/notices').then(r => r.json()).then(setNotices).catch(console.error);
    fetch('/api/audit-logs').then(r => r.json()).then(setAuditLogs).catch(console.error);
    fetch('/api/settings').then(r => r.json()).then(setSettings).catch(console.error);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handler: Approve Member
  const handleApproveMember = async (memberId: string) => {
    try {
      const res = await fetch(`/api/members/${memberId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verifiedBy: currentUser?.name || 'Secretariat' })
      });
      if (res.ok) {
        loadAllData();
        alert("Member application verified & approved! Digital ID activated.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handler: Action on Welfare Application
  const handleWelfareAction = async (grantId: string, status: 'APPROVED' | 'REJECTED' | 'DISBURSED', amountSanctioned: number) => {
    try {
      const res = await fetch(`/api/welfare/${grantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, amountSanctioned })
      });
      if (res.ok) {
        loadAllData();
        alert(`Welfare Grant ${grantId} status updated to ${status}.`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handler: Create Notice
  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...noticeForm,
          publishedBy: currentUser?.name || 'General Secretary',
          date: new Date().toISOString().split('T')[0]
        })
      });
      if (res.ok) {
        setIsNoticeModalOpen(false);
        setNoticeForm({ title: '', category: 'CIRCULAR', content: '', description: '', visibility: 'PUBLIC' });
        loadAllData();
        alert("Official notice published!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handler: Submit Manual Contribution Receipt
  const handleManualPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPaymentForm.memberId) {
      alert("Please select a member.");
      return;
    }
    const member = members.find(m => m.id === manualPaymentForm.memberId);
    try {
      const res = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: manualPaymentForm.memberId,
          memberName: member?.name || 'Staff Member',
          membershipId: member?.membershipId || 'HCEA-MEM',
          monthYear: manualPaymentForm.monthYear,
          amount: manualPaymentForm.amount,
          paymentMethod: manualPaymentForm.paymentMethod,
          paymentDate: new Date().toISOString().split('T')[0],
          status: 'PAID'
        })
      });
      if (res.ok) {
        setIsManualPaymentOpen(false);
        loadAllData();
        alert("Manual contribution logged & receipt issued!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered members
  const filteredMembers = members.filter(m => {
    const matchQuery = m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.membershipId.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.employeeCode.toLowerCase().includes(memberSearch.toLowerCase());
    const matchStatus = memberStatusFilter === 'ALL' || m.status === memberStatusFilter;
    return matchQuery && matchStatus;
  });

  // Analytics chart data
  const collectionData = [
    { month: 'Apr', collections: 42000, welfare: 15000 },
    { month: 'May', collections: 48000, welfare: 20000 },
    { month: 'Jun', collections: 51000, welfare: 25000 },
    { month: 'Jul', collections: 55000, welfare: 30000 },
    { month: 'Aug', collections: 62000, welfare: 35000 }
  ];

  const cadreDistribution = [
    { name: 'Judicial Staff', value: 340, color: '#1e3a8a' },
    { name: 'Executive Cadre', value: 180, color: '#d97706' },
    { name: 'Administrative Officers', value: 120, color: '#047857' },
    { name: 'Technical & IT Cell', value: 95, color: '#6d28d9' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 text-slate-800">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-400 text-slate-950 uppercase tracking-widest">
              SECRETARIAT ADMIN CONSOLE
            </span>
            <span className="text-xs font-mono text-slate-400">Logged in as: {currentUser?.name} ({currentUser?.role})</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">High Court Executive Portal</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all cursor-pointer text-xs flex items-center gap-1.5 font-bold"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            Sync Ledger
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Total Association Members</p>
          <p className="text-2xl font-extrabold text-slate-900 font-mono">{members.length}</p>
          <p className="text-[10px] text-amber-700 font-bold">
            {members.filter(m => m.status === 'PENDING').length} Pending Verification
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Welfare Corpus Fund Balance</p>
          <p className="text-2xl font-extrabold text-emerald-800 font-mono">
            ₹{settings?.welfareCorpusBalance ? settings.welfareCorpusBalance.toLocaleString() : '12,50,000'}
          </p>
          <p className="text-[10px] text-slate-500 font-semibold">Active & Audited Corpus</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Total Monthly Collections</p>
          <p className="text-2xl font-extrabold text-blue-900 font-mono">
            ₹{contributions.reduce((a, c) => a + c.amount, 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-emerald-700 font-semibold">{contributions.length} Receipts Logged</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Pending Welfare Applications</p>
          <p className="text-2xl font-extrabold text-amber-800 font-mono">
            {welfareGrants.filter(w => w.status === 'PENDING').length}
          </p>
          <p className="text-[10px] text-slate-500 font-semibold">Awaiting Committee Sanction</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm flex flex-wrap gap-2 text-xs font-bold">
        {[
          { id: 'MEMBERS', label: 'Member Verification Queue', icon: Users },
          { id: 'CONTRIBUTIONS', label: 'Subscription Ledger', icon: CreditCard },
          { id: 'WELFARE', label: 'Welfare Applications', icon: HeartHandshake },
          { id: 'NOTICES', label: 'Circulars & Notices', icon: FileText },
          { id: 'SETTINGS', label: 'Association CMS Settings', icon: Settings },
          { id: 'AUDIT', label: 'Analytics & Audit Logs', icon: Activity }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
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

      {/* TAB 1: MEMBER VERIFICATION QUEUE */}
      {activeTab === 'MEMBERS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Member Directory & Approval Queue</h2>
              <p className="text-xs text-slate-500">Verify official credentials, assign roles, and activate digital identity cards.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search Name, ID, Code..."
                  value={memberSearch}
                  onChange={e => setMemberSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
              </div>

              <select
                value={memberStatusFilter}
                onChange={e => setMemberStatusFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg font-bold text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending Approval</option>
                <option value="ACTIVE">Verified Active</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200 text-[10px]">
                <tr>
                  <th className="p-3">Member Name</th>
                  <th className="p-3">Membership ID</th>
                  <th className="p-3">Emp Code</th>
                  <th className="p-3">Designation & Section</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Joined Date</th>
                  <th className="p-3 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-all">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img src={m.avatarUrl} alt={m.name} className="w-8 h-8 rounded-full object-cover border border-slate-300" />
                        <div>
                          <p className="font-bold text-slate-900">{m.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-mono font-bold text-blue-900">{m.membershipId}</td>
                    <td className="p-3 font-mono text-slate-600">{m.employeeCode}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-800">{m.designation}</p>
                      <p className="text-[10px] text-slate-500">{m.department}</p>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        m.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{m.membershipDate}</td>
                    <td className="p-3 text-right">
                      {m.status === 'PENDING' ? (
                        <button
                          onClick={() => handleApproveMember(m.id)}
                          className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verify & Approve
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-semibold italic">Verified Record</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SUBSCRIPTION LEDGER */}
      {activeTab === 'CONTRIBUTIONS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Subscription & Contribution Ledger</h2>
              <p className="text-xs text-slate-500">Log manual payroll deductions or online payment transactions.</p>
            </div>
            <button
              onClick={() => setIsManualPaymentOpen(true)}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              Issue Manual Receipt
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200 text-[10px]">
                <tr>
                  <th className="p-3">Receipt No</th>
                  <th className="p-3">Member Name & ID</th>
                  <th className="p-3">Month / Year</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {contributions.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-blue-900">{c.receiptNo}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{c.memberName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{c.membershipId}</p>
                    </td>
                    <td className="p-3 font-bold text-slate-800">{c.monthYear}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">₹{c.amount}</td>
                    <td className="p-3 text-slate-600">{c.paymentMethod}</td>
                    <td className="p-3 text-slate-500">{c.paymentDate}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 uppercase">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: WELFARE APPLICATIONS & SANCTIONS */}
      {activeTab === 'WELFARE' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900">Welfare Grant Review & Sanction Desk</h2>
            <p className="text-xs text-slate-500">Sanction medical, educational, or bereavement funds for staff members.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {welfareGrants.map((wg) => (
              <div key={wg.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-900 uppercase">
                      {wg.grantType} GRANT
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{wg.memberName}</h3>
                    <p className="text-[10px] font-mono text-slate-400">{wg.membershipId}</p>
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

                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                  <p className="font-bold text-slate-800">Institution: {wg.institutionName}</p>
                  <p className="text-slate-600 leading-relaxed italic">"{wg.reason}"</p>
                  <div className="flex justify-between pt-1 font-mono">
                    <span>Requested: <strong className="text-slate-900">₹{wg.amountRequested.toLocaleString()}</strong></span>
                    <span>Sanctioned: <strong className="text-emerald-800">₹{wg.amountSanctioned.toLocaleString()}</strong></span>
                  </div>
                </div>

                {wg.status === 'PENDING' && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleWelfareAction(wg.id, 'APPROVED', wg.amountRequested)}
                      className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs cursor-pointer"
                    >
                      Approve Full Amount
                    </button>
                    <button
                      onClick={() => handleWelfareAction(wg.id, 'REJECTED', 0)}
                      className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-lg text-xs cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CIRCULARS & NOTICES MANAGER */}
      {activeTab === 'NOTICES' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Association Notices & Circulars Manager</h2>
              <p className="text-xs text-slate-500">Publish official communications, GBM notices, and press releases.</p>
            </div>
            <button
              onClick={() => setIsNoticeModalOpen(true)}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              Publish New Notice
            </button>
          </div>

          <div className="space-y-3">
            {notices.map((n) => (
              <div key={n.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 uppercase">
                      {n.category}
                    </span>
                    <span className="text-slate-400 font-mono">{n.date}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-1">{n.title}</h3>
                  <p className="text-slate-600 line-clamp-1">{n.description}</p>
                </div>
                <span className="px-2.5 py-1 bg-slate-200 text-slate-800 rounded font-bold uppercase text-[10px]">
                  {n.visibility}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: CMS & SETTINGS */}
      {activeTab === 'SETTINGS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 text-xs">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">
            Association Website CMS & Policy Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Association Full Title</label>
              <input
                type="text"
                defaultValue={settings?.associationName || "Orissa High Court Employees' Association"}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">High Court Patron / Chief Justice Banner</label>
              <input
                type="text"
                defaultValue={settings?.patronMessage || "Serving Justice with Administrative Excellence"}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">About Association Overview Text</label>
              <textarea
                rows={3}
                defaultValue={settings?.aboutText}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none"
              ></textarea>
            </div>
          </div>

          <button
            onClick={() => alert("CMS Settings updated successfully!")}
            className="px-6 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md"
          >
            Save Association CMS Settings
          </button>
        </div>
      )}

      {/* TAB 6: ANALYTICS & IMMUTABLE AUDIT LOGS */}
      {activeTab === 'AUDIT' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Collections vs Welfare Grants */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Monthly Revenue vs Welfare Grant Outflow</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={collectionData}>
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="collections" fill="#1e3a8a" name="Collections (₹)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="welfare" fill="#047857" name="Welfare Grants (₹)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Cadre Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Cadre Distribution Across High Court</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={cadreDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {cadreDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Immutable Audit Logs Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
              Immutable Secretariat Audit Log Trail
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200 text-[10px]">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Action Type</th>
                    <th className="p-3">Performed By</th>
                    <th className="p-3">Target / Reference</th>
                    <th className="p-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-3 text-slate-400 font-mono">{log.timestamp}</td>
                      <td className="p-3 font-bold text-blue-900">{log.action}</td>
                      <td className="p-3 text-slate-800">{log.performedBy}</td>
                      <td className="p-3 font-mono text-amber-800">{log.targetId}</td>
                      <td className="p-3 text-slate-600">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PUBLISH NOTICE */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center border-b border-slate-800">
              <h3 className="font-bold text-base text-amber-300">Publish Official Notice</h3>
              <button onClick={() => setIsNoticeModalOpen(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Notice Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Notice regarding General Body Meeting 2026"
                  value={noticeForm.title}
                  onChange={e => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={noticeForm.category}
                    onChange={e => setNoticeForm({ ...noticeForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="CIRCULAR">CIRCULAR</option>
                    <option value="GENERAL">GENERAL</option>
                    <option value="WELFARE">WELFARE</option>
                    <option value="EVENT">EVENT</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Visibility</label>
                  <select
                    value={noticeForm.visibility}
                    onChange={e => setNoticeForm({ ...noticeForm, visibility: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="PUBLIC">Public Notice</option>
                    <option value="MEMBERS_ONLY">Members Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Short Description *</label>
                <input
                  type="text"
                  required
                  placeholder="1-2 line summary for card view..."
                  value={noticeForm.description}
                  onChange={e => setNoticeForm({ ...noticeForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Notice Content *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed circular text..."
                  value={noticeForm.content}
                  onChange={e => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNoticeModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL PAYMENT ENTRY */}
      {isManualPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center border-b border-slate-800">
              <h3 className="font-bold text-base text-amber-300">Issue Manual Receipt / Log Contribution</h3>
              <button onClick={() => setIsManualPaymentOpen(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleManualPaymentSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Association Member *</label>
                <select
                  value={manualPaymentForm.memberId}
                  onChange={e => setManualPaymentForm({ ...manualPaymentForm, memberId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none"
                >
                  <option value="">-- Choose Active Member --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.membershipId}) - {m.designation}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Month & Year</label>
                  <input
                    type="text"
                    value={manualPaymentForm.monthYear}
                    onChange={e => setManualPaymentForm({ ...manualPaymentForm, monthYear: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={manualPaymentForm.amount}
                    onChange={e => setManualPaymentForm({ ...manualPaymentForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Channel</label>
                <select
                  value={manualPaymentForm.paymentMethod}
                  onChange={e => setManualPaymentForm({ ...manualPaymentForm, paymentMethod: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none"
                >
                  <option value="PAYROLL_DEDUCTION">Salary Payroll Deduction</option>
                  <option value="CASH_SECRETARIAT">Cash at Secretariat Desk</option>
                  <option value="BANK_TRANSFER">Direct Bank NEFT/RTGS</option>
                  <option value="ONLINE_UPI">Online UPI Gateway</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsManualPaymentOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Generate Receipt & Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
