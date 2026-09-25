import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Member, Contribution, WelfareGrant, Notice, AuditLog, AssociationSettings, FundTransaction, OfficeBearer } from '../../types';
import {
  Users, CreditCard, HeartHandshake, FileText, Settings, Activity, Shield, CheckCircle2,
  XCircle, Search, Plus, Filter, Download, ArrowUpRight, ArrowDownRight, DollarSign, PieChart as PieChartIcon,
  Sparkles, RefreshCw, Eye, EyeOff, Pencil, Trash2, AlertTriangle, X, UserPlus, KeyRound, Wallet,
  Award, Phone, Mail, Calendar, Image as ImageIcon, Upload
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'MEMBERS' | 'CONTRIBUTIONS' | 'WELFARE' | 'OFFICE_BEARERS' | 'NOTICES' | 'SETTINGS' | 'AUDIT'>('MEMBERS');

  // State data
  const [members, setMembers] = useState<Member[]>([]);
  const [officeBearers, setOfficeBearers] = useState<OfficeBearer[]>([]);
  const [bearerSearch, setBearerSearch] = useState('');
  const [editingBearer, setEditingBearer] = useState<OfficeBearer | null>(null);
  const [isEditBearerModalOpen, setIsEditBearerModalOpen] = useState(false);
  const [isAddBearerModalOpen, setIsAddBearerModalOpen] = useState(false);

  // Office Bearer Local Photo Upload States (Strict 40 KB limit)
  const [editPhotoFileName, setEditPhotoFileName] = useState('');
  const [editPhotoFileSize, setEditPhotoFileSize] = useState('');
  const [editPhotoError, setEditPhotoError] = useState('');

  const [addPhotoFileName, setAddPhotoFileName] = useState('');
  const [addPhotoFileSize, setAddPhotoFileSize] = useState('');
  const [addPhotoError, setAddPhotoError] = useState('');

  const [newBearerForm, setNewBearerForm] = useState<Omit<OfficeBearer, 'id'>>({
    name: '',
    designation: 'Executive Member',
    courtRole: 'Senior Section Officer',
    shortBio: '',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    priority: 7,
    phone: '+91 94370 00000',
    email: 'executive@OHCEA.gov.in',
    term: '2024 - 2026'
  });
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [fundTransactions, setFundTransactions] = useState<FundTransaction[]>([]);
  const [ledgerView, setLedgerView] = useState<'CONTRIBUTIONS' | 'CORPUS'>('CONTRIBUTIONS');
  const [welfareGrants, setWelfareGrants] = useState<WelfareGrant[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<AssociationSettings | null>(null);

  // Notice PDF Upload from PC States
  const [uploadedPdfFileName, setUploadedPdfFileName] = useState('');
  const [uploadedPdfFileSize, setUploadedPdfFileSize] = useState('');

  // Handler for Edit Office Bearer Photo Upload (Strict 40 KB limit)
  const handleEditBearerPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditPhotoError('');
    const MAX_KB = 40;
    const MAX_BYTES = MAX_KB * 1024;
    const sizeKb = (file.size / 1024).toFixed(1);
    if (file.size > MAX_BYTES) {
      const msg = `Selected photo is ${sizeKb} KB. Maximum allowed size is 40 KB. Please upload a photo under 40 KB.`;
      setEditPhotoError(msg);
      alert(`⚠️ File Size Exceeded!\n${msg}`);
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (editingBearer) {
        setEditingBearer({ ...editingBearer, photo: base64 });
      }
      setEditPhotoFileName(file.name);
      setEditPhotoFileSize(`${sizeKb} KB`);
    };
    reader.readAsDataURL(file);
  };

  // Handler for Add Office Bearer Photo Upload (Strict 40 KB limit)
  const handleAddBearerPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAddPhotoError('');
    const MAX_KB = 40;
    const MAX_BYTES = MAX_KB * 1024;
    const sizeKb = (file.size / 1024).toFixed(1);
    if (file.size > MAX_BYTES) {
      const msg = `Selected photo is ${sizeKb} KB. Maximum allowed size is 40 KB. Please upload a photo under 40 KB.`;
      setAddPhotoError(msg);
      alert(`⚠️ File Size Exceeded!\n${msg}`);
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setNewBearerForm(prev => ({ ...prev, photo: base64 }));
      setAddPhotoFileName(file.name);
      setAddPhotoFileSize(`${sizeKb} KB`);
    };
    reader.readAsDataURL(file);
  };

  // Manual Corpus Entry State
  const [isCorpusModalOpen, setIsCorpusModalOpen] = useState(false);
  const [corpusForm, setCorpusForm] = useState({
    type: 'CREDIT' as 'CREDIT' | 'DEBIT',
    category: 'DONATION' as FundTransaction['category'],
    amount: 50000,
    referenceNo: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Filters
  const [memberSearch, setMemberSearch] = useState('');
  const [memberStatusFilter, setMemberStatusFilter] = useState('ALL');

  // Member Action Modals
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [rejectingMember, setRejectingMember] = useState<Member | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    email: '',
    designation: 'Senior Section Officer',
    department: 'Bench Section',
    postingLocation: 'Main High Court Building, Cuttack',
    employeeCode: '',
    employeeCategory: 'JUDICIAL' as Member['employeeCategory'],
    membershipType: 'REGULAR_MEMBER' as Member['membershipType'],
    mobile: '+91 ',
    bloodGroup: 'B+',
    address: 'High Court Staff Quarters, Cuttack',
    dob: '1985-05-15',
    dateOfJoining: '2015-06-01',
    monthlyContribution: 500,
    role: 'MEMBER' as Member['role'],
    status: 'ACTIVE' as Member['status']
  });

  // Modal forms
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    category: 'CIRCULAR' as Notice['category'],
    content: '',
    description: '',
    visibility: 'PUBLIC' as Notice['visibility'],
    attachmentUrl: '',
    isImportant: false
  });

  const [isManualPaymentOpen, setIsManualPaymentOpen] = useState(false);
  const [manualPaymentForm, setManualPaymentForm] = useState({
    memberId: '',
    monthYear: 'August 2026',
    amount: 500,
    paymentMethod: 'PAYROLL_DEDUCTION' as Contribution['paymentMethod']
  });

  const [cmsForm, setCmsForm] = useState({
    name: "Orissa High Court Employees' Association",
    hero_title: "Serving Justice with Administrative Excellence",
    about_text: ""
  });

  const [adminCredentialsForm, setAdminCredentialsForm] = useState({
    currentPassword: '',
    newUsername: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordChangeMessage, setPasswordChangeMessage] = useState({ type: '', text: '' });


  const loadAllData = () => {
    fetch('/api/members').then(r => r.json()).then(setMembers).catch(console.error);
    fetch('/api/contributions').then(r => r.json()).then(setContributions).catch(console.error);
    fetch('/api/fund/ledger').then(r => r.json()).then(setFundTransactions).catch(console.error);
    fetch('/api/welfare').then(r => r.json()).then(setWelfareGrants).catch(console.error);
    fetch('/api/office-bearers').then(r => r.json()).then(setOfficeBearers).catch(console.error);
    fetch('/api/notices').then(r => r.json()).then(setNotices).catch(console.error);
    fetch('/api/audit-logs').then(r => r.json()).then(setAuditLogs).catch(console.error);
    fetch('/api/settings').then(r => r.json()).then(data => {
      setSettings(data);
      if (data) {
        setCmsForm({
          name: data.name || data.associationName || "Orissa High Court Employees' Association",
          hero_title: data.hero_title || data.patronMessage || "Serving Justice with Administrative Excellence",
          about_text: data.about_text || data.aboutText || ""
        });
      }
    }).catch(console.error);
  };

  // Handler: Save Edited Office Bearer
  const handleSaveEditBearer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBearer) return;
    try {
      const res = await fetch(`/api/office-bearers/${editingBearer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bearer: editingBearer,
          actorName: currentUser?.name || 'Admin'
        })
      });
      if (res.ok) {
        setIsEditBearerModalOpen(false);
        setEditingBearer(null);
        loadAllData();
        alert(`Office Bearer "${editingBearer.name}" details updated successfully!`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update office bearer.");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving office bearer details.");
    }
  };

  // Handler: Add New Office Bearer
  const handleAddNewBearer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBearerForm.name.trim()) {
      alert("Please provide the full name of the office bearer.");
      return;
    }
    try {
      const res = await fetch('/api/office-bearers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bearer: {
            ...newBearerForm,
            priority: Number(newBearerForm.priority) || (officeBearers.length + 1)
          },
          actorName: currentUser?.name || 'Admin'
        })
      });
      if (res.ok) {
        setIsAddBearerModalOpen(false);
        setNewBearerForm({
          name: '',
          designation: 'Executive Member',
          courtRole: 'Senior Section Officer',
          shortBio: '',
          photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
          priority: officeBearers.length + 2,
          phone: '+91 94370 00000',
          email: 'executive@OHCEA.gov.in',
          term: '2024 - 2026'
        });
        loadAllData();
        alert(`New Office Bearer "${newBearerForm.name}" added successfully!`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to add office bearer.");
      }
    } catch (e) {
      console.error(e);
      alert("Error adding new office bearer.");
    }
  };

  // Handler: Delete Office Bearer
  const handleDeleteBearer = async (bearer: OfficeBearer) => {
    if (!window.confirm(`Are you sure you want to permanently delete office bearer: "${bearer.name}" (${bearer.designation})?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/office-bearers/${bearer.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorName: currentUser?.name || 'Admin' })
      });
      if (res.ok) {
        loadAllData();
        alert(`Office Bearer "${bearer.name}" deleted from the database.`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete office bearer.");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting office bearer.");
    }
  };

  // Handler: Delete Notice
  const handleDeleteNotice = async (noticeId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete official notice: "${title}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/notices/${noticeId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorName: currentUser?.name || 'Admin' })
      });
      if (res.ok) {
        setNotices(prev => prev.filter(n => n.id !== noticeId));
        alert("Official notice document has been deleted from the database.");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete notice");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting notice");
    }
  };

  // Handler: Reset Password for Member to default (OHCEA123)
  const handleResetPassword = async (member: Member) => {
    if (!window.confirm(`Reset password for ${member.name} (${member.employeeCode}) to default password: "OHCEA123"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/members/${member.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorName: currentUser?.name || 'Admin' })
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message || `Password for ${member.name} reset to default: OHCEA123`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to reset password");
      }
    } catch (e) {
      console.error(e);
      alert("Error resetting password");
    }
  };

  // Handler: Submit Manual Welfare Corpus Entry
  const handleCorpusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!corpusForm.amount || corpusForm.amount <= 0) {
      alert("Please provide a valid amount.");
      return;
    }
    try {
      const res = await fetch('/api/fund/entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: corpusForm.type,
          category: corpusForm.category,
          amount: Number(corpusForm.amount),
          referenceNo: corpusForm.referenceNo || `CORPUS-${corpusForm.type}-${Math.floor(1000 + Math.random() * 9000)}`,
          description: corpusForm.description || `Manual Welfare Corpus Fund ${corpusForm.type}`,
          createdBy: `${currentUser?.name || 'Admin'} (${currentUser?.role || 'Treasurer'})`
        })
      });

      if (res.ok) {
        setIsCorpusModalOpen(false);
        loadAllData();
        alert(`Successfully recorded ${corpusForm.type} of ₹${Number(corpusForm.amount).toLocaleString()} into Welfare Corpus Fund!`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to record corpus fund entry");
      }
    } catch (e) {
      console.error(e);
      alert("Error recording corpus fund entry");
    }
  };

  const handleSaveSettings = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: { ...settings, ...cmsForm },
          actorName: currentUser?.name || 'Admin'
        })
      });
      if (res.ok) {
        alert("CMS Settings updated successfully!");
        loadAllData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update CMS Settings.");
      }
    } catch (e) {
      console.error(e);
      alert("Error updating CMS Settings.");
    }
  };

  const handleAdminCredentialsChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminCredentialsForm.newPassword && adminCredentialsForm.newPassword !== adminCredentialsForm.confirmPassword) {
      setPasswordChangeMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setIsChangingPassword(true);
    setPasswordChangeMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/auth/admin/change-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser?.username || 'admin',
          currentPassword: adminCredentialsForm.currentPassword,
          newUsername: adminCredentialsForm.newUsername,
          newPassword: adminCredentialsForm.newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordChangeMessage({ type: 'success', text: data.message || 'Admin credentials updated successfully!' });
        setAdminCredentialsForm({ currentPassword: '', newUsername: '', newPassword: '', confirmPassword: '' });
        // If username or password changed, force re-login
        setTimeout(() => {
          localStorage.removeItem('OHCEA_user');
          localStorage.removeItem('OHCEA_token');
          window.location.href = '/admin';
        }, 3000);
      } else {
        setPasswordChangeMessage({ type: 'error', text: data.error || 'Failed to change credentials.' });
      }
    } catch (e) {
      setPasswordChangeMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
    setIsChangingPassword(false);
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
      } else {
        const err = await res.json();
        alert(err.error || "Failed to approve member");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handler: Reject Member
  const handleRejectMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingMember) return;
    try {
      const res = await fetch(`/api/members/${rejectingMember.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: rejectionNotes || 'Clarification required on submitted documents.',
          actorName: currentUser?.name || 'Secretariat'
        })
      });
      if (res.ok) {
        setIsRejectModalOpen(false);
        setRejectingMember(null);
        setRejectionNotes('');
        loadAllData();
        alert("Member application status updated to REJECTED.");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to reject member application");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handler: Delete Member
  const handleDeleteMember = async () => {
    if (!deletingMember) return;
    try {
      const res = await fetch(`/api/members/${deletingMember.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorName: currentUser?.name || 'Secretariat Admin' })
      });
      if (res.ok) {
        setIsDeleteModalOpen(false);
        setDeletingMember(null);
        loadAllData();
        alert("Member record permanently deleted from database.");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete member");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handler: Save Member Edits
  const handleSaveMemberEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    try {
      const res = await fetch(`/api/members/${editingMember.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: editingMember, actorName: currentUser?.name || 'Admin' })
      });
      if (res.ok) {
        setIsEditMemberModalOpen(false);
        setEditingMember(null);
        loadAllData();
        alert("Member details updated successfully in database!");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update member");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handler: Quick Status Change
  const handleQuickStatusChange = async (memberId: string, status: string) => {
    try {
      const res = await fetch(`/api/members/${memberId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, actorName: currentUser?.name || 'Admin' })
      });
      if (res.ok) {
        loadAllData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to change status");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handler: Add New Member
  const handleAddNewMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberForm.name || !newMemberForm.email || !newMemberForm.employeeCode) {
      alert("Please fill in Name, Email and Employee Code.");
      return;
    }
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMemberForm)
      });
      if (res.ok) {
        setIsAddMemberModalOpen(false);
        setNewMemberForm({
          name: '',
          email: '',
          designation: 'Senior Section Officer',
          department: 'Bench Section',
          postingLocation: 'Main High Court Building, Cuttack',
          employeeCode: '',
          employeeCategory: 'JUDICIAL',
          membershipType: 'REGULAR_MEMBER',
          mobile: '+91 ',
          bloodGroup: 'B+',
          address: 'High Court Staff Quarters, Cuttack',
          dob: '1985-05-15',
          dateOfJoining: '2015-06-01',
          monthlyContribution: 500,
          role: 'MEMBER',
          status: 'ACTIVE'
        });
        loadAllData();
        alert("New member successfully registered in database!");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to register new member");
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
      const content = noticeForm.content.trim() ||
        (noticeForm.attachmentUrl ? `Official notification document uploaded and attached. Please open the attached PDF for complete details.` : 'Official Circular from High Court Employees Association.');

      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...noticeForm,
          content,
          publishedBy: currentUser?.name || 'General Secretary',
          date: new Date().toISOString().split('T')[0]
        })
      });
      if (res.ok) {
        setIsNoticeModalOpen(false);
        setNoticeForm({ title: '', category: 'CIRCULAR', content: '', description: '', visibility: 'PUBLIC', attachmentUrl: '', isImportant: false });
        setUploadedPdfFileName('');
        setUploadedPdfFileSize('');
        loadAllData();
        alert("Official notice published successfully!");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to publish notice.");
      }
    } catch (e) {
      console.error(e);
      alert("Error publishing notice.");
    }
  };

  const printReceipt = (contrib: any) => {
    const receiptHTML = `
      <html>
      <head>
        <title>Receipt - ${contrib.receiptNo}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #003366; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #003366; margin: 0; font-size: 24px; text-transform: uppercase; }
          .header p { margin: 5px 0; color: #666; font-size: 14px; }
          .title { text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 30px; text-decoration: underline; }
          .details { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
          .details td { padding: 12px; border: 1px solid #ddd; }
          .details td.label { font-weight: bold; width: 40%; background-color: #f8f9fa; }
          .footer { margin-top: 60px; display: flex; justify-content: space-between; font-weight: bold; }
          .signature { text-align: center; border-top: 1px solid #333; padding-top: 10px; width: 200px; }
          @media print {
            @page { margin: 1cm; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${settings?.associationName || "Orissa High Court Employees' Association"}</h1>
          <p>High Court Campus, Cuttack, Odisha</p>
          <p><strong>Official Payment Receipt</strong></p>
        </div>
        <table class="details">
          <tr><td class="label">Receipt No:</td><td>${contrib.receiptNo}</td></tr>
          <tr><td class="label">Date:</td><td>${contrib.date || contrib.paymentDate}</td></tr>
          <tr><td class="label">Member Name:</td><td>${contrib.memberName}</td></tr>
          <tr><td class="label">Membership ID:</td><td>${contrib.membershipNumber || contrib.membershipId}</td></tr>
          <tr><td class="label">Amount Paid:</td><td>₹${contrib.amount.toLocaleString()}</td></tr>
          <tr><td class="label">Payment Mode:</td><td>${contrib.paymentMode || contrib.paymentMethod}</td></tr>
          <tr><td class="label">Purpose:</td><td>${contrib.purpose || 'Monthly Subscription'}</td></tr>
          <tr><td class="label">Status:</td><td>${contrib.status}</td></tr>
          <tr><td class="label">Transaction ID:</td><td>${contrib.transactionId || 'N/A'}</td></tr>
        </table>
        <div class="footer">
          <div>Member Signature<br><br><br>____________________</div>
          <div class="signature">Authorized Signatory<br>Admin / Treasurer</div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
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
          membershipId: member?.membershipId || 'OHCEA-MEM',
          monthYear: manualPaymentForm.monthYear,
          amount: manualPaymentForm.amount,
          paymentMethod: manualPaymentForm.paymentMethod,
          paymentDate: new Date().toISOString().split('T')[0],
          status: 'PAID'
        })
      });
      if (res.ok) {
        const savedContrib = await res.json();
        setIsManualPaymentOpen(false);
        loadAllData();
        
        if (window.confirm(`Manual contribution logged successfully!\nReceipt No: ${savedContrib.receiptNo}\n\nWould you like to download/print this receipt now?`)) {
          printReceipt(savedContrib);
        }
      } else {
        const err = await res.json();
        alert(err.error || "Failed to log contribution.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error processing payment.");
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
          <div className="flex justify-between items-start">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Welfare Corpus Fund</p>
            <button
              onClick={() => {
                setCorpusForm({
                  type: 'CREDIT',
                  category: 'DONATION',
                  amount: 25000,
                  referenceNo: `CORPUS-${Math.floor(1000 + Math.random() * 9000)}`,
                  description: 'Voluntary Welfare Contribution / Corpus Inflow',
                  date: new Date().toISOString().split('T')[0]
                });
                setIsCorpusModalOpen(true);
              }}
              className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-[10px] inline-flex items-center gap-1 cursor-pointer transition-all shadow-xs"
              title="Add Manual Entry to Welfare Corpus Fund"
            >
              <Plus className="w-3 h-3 text-amber-300" />
              Manual Entry
            </button>
          </div>
          <p className="text-2xl font-extrabold text-emerald-800 font-mono">
            ₹{settings?.stats?.welfareFundBalance ? settings.stats.welfareFundBalance.toLocaleString() : (settings?.welfareCorpusBalance ? settings.welfareCorpusBalance.toLocaleString() : '14,850,000')}
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
          { id: 'OFFICE_BEARERS', label: 'Executive Body & Bearers', icon: Award },
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
              className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${isActive
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
                <option value="SUSPENDED">Suspended</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <button
                onClick={() => setIsAddMemberModalOpen(true)}
                className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Add Member</span>
              </button>
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
                  <th className="p-3">Role</th>
                  <th className="p-3 text-right">Admin Actions</th>
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
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${m.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : m.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-900'
                          : m.status === 'SUSPENDED'
                            ? 'bg-purple-100 text-purple-900'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-[11px] font-bold text-slate-600 font-mono">{m.role}</span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {m.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApproveMember(m.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] inline-flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                              title="Approve & Activate Membership"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setRejectingMember(m);
                                setIsRejectModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[11px] inline-flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                              title="Reject Application"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </>
                        )}

                        {/* Quick Status Dropdown */}
                        <select
                          value={m.status}
                          onChange={e => handleQuickStatusChange(m.id, e.target.value)}
                          className="px-2 py-1 text-[11px] font-bold border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none cursor-pointer hover:border-slate-400"
                          title="Change Member Status"
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="PENDING">PENDING</option>
                          <option value="SUSPENDED">SUSPENDED</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>

                        {/* Reset Password to default (OHCEA123) Button */}
                        <button
                          onClick={() => handleResetPassword(m)}
                          className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                          title="Reset Password to default (OHCEA123)"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                          <span className="hidden lg:inline">Reset Pass</span>
                        </button>

                        {/* Edit Member Button */}
                        <button
                          onClick={() => {
                            setEditingMember({ ...m });
                            setIsEditMemberModalOpen(true);
                          }}
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                          title="Edit Member Information"
                        >
                          <Pencil className="w-3.5 h-3.5 text-blue-600" />
                          <span className="hidden md:inline">Edit</span>
                        </button>

                        {/* Delete Member Button */}
                        <button
                          onClick={() => {
                            setDeletingMember(m);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                          title="Delete Member Record"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span className="hidden md:inline">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SUBSCRIPTION & WELFARE CORPUS LEDGER */}
      {activeTab === 'CONTRIBUTIONS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Financial Ledger & Welfare Corpus Desk</h2>
              <p className="text-xs text-slate-500">Audit member monthly subscriptions and record manual entries to the Welfare Corpus Fund.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setCorpusForm({
                    type: 'CREDIT',
                    category: 'DONATION',
                    amount: 50000,
                    referenceNo: `CORPUS-${Math.floor(1000 + Math.random() * 9000)}`,
                    description: 'Voluntary Welfare Contribution / Corpus Inflow',
                    date: new Date().toISOString().split('T')[0]
                  });
                  setIsCorpusModalOpen(true);
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                Manual Corpus Entry
              </button>

              <button
                onClick={() => setIsManualPaymentOpen(true)}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                Issue Member Receipt
              </button>
            </div>
          </div>

          {/* Sub-view switcher */}
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-xs">
            <button
              onClick={() => setLedgerView('CONTRIBUTIONS')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${ledgerView === 'CONTRIBUTIONS'
                ? 'bg-blue-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Member Subscription Receipts ({contributions.length})</span>
            </button>

            <button
              onClick={() => setLedgerView('CORPUS')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${ledgerView === 'CORPUS'
                ? 'bg-emerald-800 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              <Wallet className="w-3.5 h-3.5 text-amber-400" />
              <span>Welfare Corpus Ledger ({fundTransactions.length} Entries)</span>
            </button>
          </div>

          {ledgerView === 'CONTRIBUTIONS' ? (
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
                    <th className="p-3 text-right">Action</th>
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
                      <td className="p-3 text-right">
                        <button
                          onClick={() => printReceipt(c)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-lg transition-colors flex items-center gap-1.5 ml-auto cursor-pointer"
                          title="Download / Print Receipt"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200 text-[10px]">
                  <tr>
                    <th className="p-3">Txn ID</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Particulars / Description</th>
                    <th className="p-3 text-right">Amount (₹)</th>
                    <th className="p-3 text-right">Balance After (₹)</th>
                    <th className="p-3">Voucher Ref</th>
                    <th className="p-3">Officer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {fundTransactions.map((ft) => (
                    <tr key={ft.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-700">{ft.transactionId}</td>
                      <td className="p-3 text-slate-500 font-mono">{ft.date}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${ft.type === 'CREDIT'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}>
                          {ft.type}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-800 text-[11px]">{ft.category}</td>
                      <td className="p-3 text-slate-700 max-w-xs">{ft.description}</td>
                      <td className={`p-3 text-right font-mono font-bold ${ft.type === 'CREDIT' ? 'text-emerald-700' : 'text-rose-700'
                        }`}>
                        {ft.type === 'CREDIT' ? '+' : '-'}₹{ft.amount.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-mono font-extrabold text-slate-900">
                        ₹{ft.balanceAfter.toLocaleString()}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-500">{ft.referenceNo}</td>
                      <td className="p-3 text-[11px] text-slate-600">{ft.createdBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${wg.status === 'APPROVED' || wg.status === 'DISBURSED'
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

      {/* TAB: OFFICE BEARERS & EXECUTIVE BODY MANAGER */}
      {activeTab === 'OFFICE_BEARERS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-900 uppercase tracking-wider">
                  EXECUTIVE GOVERNANCE
                </span>
                <span className="text-xs text-slate-500 font-semibold font-mono">
                  {officeBearers.length} Office Bearers Active
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">Association Executive Body & Office Bearers</h2>
              <p className="text-xs text-slate-500">
                Change office bearer details, update designations, High Court official wings, contact numbers, tenure, and executive profile photographs.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search bearer or designation..."
                  value={bearerSearch}
                  onChange={e => setBearerSearch(e.target.value)}
                  className="pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:outline-none w-56"
                />
              </div>

              <button
                onClick={() => {
                  setNewBearerForm({
                    name: '',
                    designation: 'Executive Member',
                    courtRole: 'Senior Section Officer',
                    shortBio: '',
                    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
                    priority: officeBearers.length + 1,
                    phone: '+91 94370 00000',
                    email: 'executive@OHCEA.gov.in',
                    term: '2024 - 2026'
                  });
                  setIsAddBearerModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>+ Add Office Bearer</span>
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {officeBearers
              .filter(ob =>
                ob.name.toLowerCase().includes(bearerSearch.toLowerCase()) ||
                ob.designation.toLowerCase().includes(bearerSearch.toLowerCase()) ||
                ob.courtRole.toLowerCase().includes(bearerSearch.toLowerCase())
              )
              .sort((a, b) => a.priority - b.priority)
              .map(ob => (
                <div
                  key={ob.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-blue-900 hover:shadow-md transition-all group"
                >
                  <div className="p-5 space-y-4">
                    {/* Header: Priority & Designation */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-900 text-amber-300 uppercase tracking-wider">
                        {ob.designation}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono font-bold">
                        Rank #{ob.priority}
                      </span>
                    </div>

                    {/* Photo + Name + Role */}
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        <img
                          src={ob.photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"}
                          alt={ob.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80";
                          }}
                          className="w-20 h-24 rounded-xl object-cover border-2 border-amber-400 shadow-sm"
                        />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2">
                          {ob.name}
                        </h3>
                        <p className="text-xs font-semibold text-slate-500 line-clamp-2">
                          {ob.courtRole}
                        </p>
                        <div className="inline-flex items-center gap-1 font-mono text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                          <Calendar className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>Term: {ob.term}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    {ob.shortBio && (
                      <p className="text-xs text-slate-600 leading-relaxed italic border-t border-slate-100 pt-3 line-clamp-3">
                        "{ob.shortBio}"
                      </p>
                    )}

                    {/* Contact Info */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-600">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                        <span className="font-mono text-[11px]">{ob.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                        <span className="truncate text-[11px]">{ob.email || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setEditingBearer({ ...ob });
                        setIsEditBearerModalOpen(true);
                      }}
                      className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <Pencil className="w-3.5 h-3.5 text-blue-900" />
                      <span>Edit Details</span>
                    </button>

                    <button
                      onClick={() => handleDeleteBearer(ob)}
                      className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      title="Remove Office Bearer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {officeBearers.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Award className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="font-bold">No office bearers found in database</p>
              <p className="text-xs">Click "+ Add Office Bearer" to create the executive body.</p>
            </div>
          )}
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
              <div key={n.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 uppercase">
                      {n.category}
                    </span>
                    <span className="text-slate-400 font-mono">{n.date}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-1">{n.title}</h3>
                  <p className="text-slate-600 line-clamp-1">{n.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 bg-slate-200 text-slate-800 rounded font-bold uppercase text-[10px]">
                    {n.visibility}
                  </span>

                  <a
                    href={n.attachmentUrl ? `/api/notices/${n.id}/pdf` : `/notice/${n.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-bold text-[11px]"
                    title="View official notice circular PDF in new tab"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-700" />
                    <span>View Notice (New Tab)</span>
                  </a>

                  <button
                    onClick={() => handleDeleteNotice(n.id, n.title)}
                    className="p-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-bold text-[11px]"
                    title="Delete Notice from Database"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Delete</span>
                  </button>
                </div>
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
                value={cmsForm.name}
                onChange={e => setCmsForm({ ...cmsForm, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">High Court Patron / Chief Justice Banner</label>
              <input
                type="text"
                value={cmsForm.hero_title}
                onChange={e => setCmsForm({ ...cmsForm, hero_title: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">About Association Overview Text</label>
              <textarea
                rows={3}
                value={cmsForm.about_text}
                onChange={e => setCmsForm({ ...cmsForm, about_text: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
              ></textarea>
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            className="px-6 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md transition-all"
          >
            Save Association CMS Settings
          </button>

          {/* Admin Security Settings */}
          {currentUser?.isAdmin && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-600" />
                Admin Security & Credentials
              </h3>

              <form onSubmit={handleAdminCredentialsChange} className="max-w-md space-y-4">
                {passwordChangeMessage.text && (
                  <div className={`p-3 rounded-lg text-xs font-semibold ${passwordChangeMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                    {passwordChangeMessage.text}
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Current Password (Required)</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={adminCredentialsForm.currentPassword}
                      onChange={(e) => setAdminCredentialsForm({ ...adminCredentialsForm, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 pr-10 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[10px] text-slate-500 mb-2">Leave new fields blank if you do not wish to change them.</p>

                  <label className="block font-bold text-slate-700 mb-1">New Username (Optional)</label>
                  <input
                    type="text"
                    value={adminCredentialsForm.newUsername}
                    onChange={(e) => setAdminCredentialsForm({ ...adminCredentialsForm, newUsername: e.target.value })}
                    placeholder={currentUser?.username || 'admin'}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 mb-3"
                  />

                  <label className="block font-bold text-slate-700 mb-1">New Password</label>
                  <div className="relative mb-3">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={adminCredentialsForm.newPassword}
                      onChange={(e) => setAdminCredentialsForm({ ...adminCredentialsForm, newPassword: e.target.value })}
                      className="w-full px-3 py-2 pr-10 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <label className="block font-bold text-slate-700 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={adminCredentialsForm.confirmPassword}
                      onChange={(e) => setAdminCredentialsForm({ ...adminCredentialsForm, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 pr-10 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md transition-all disabled:opacity-60 w-full mt-4"
                >
                  {isChangingPassword ? 'Updating...' : 'Update Admin Credentials'}
                </button>
              </form>
            </div>
          )}
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
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
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

              <label className="flex items-center gap-2 cursor-pointer bg-amber-50 p-3 rounded-lg border border-amber-200">
                <input 
                  type="checkbox"
                  checked={noticeForm.isImportant}
                  onChange={e => setNoticeForm({ ...noticeForm, isImportant: e.target.checked })}
                  className="w-4 h-4 text-blue-900 border-slate-300 rounded focus:ring-blue-900"
                />
                <span className="text-sm font-bold text-amber-900">Show in Scrolling Announcement on Homepage</span>
              </label>

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

              {/* PDF Document Upload from Local PC */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Upload Notice PDF Document from PC (Recommended)
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-900 rounded-xl p-3 bg-slate-50 transition-all text-center">
                  {noticeForm.attachmentUrl ? (
                    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                      <div className="flex items-center gap-2.5 text-left">
                        <div className="p-2 bg-blue-900 text-amber-300 rounded-lg shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs truncate max-w-[200px] sm:max-w-xs">
                            {uploadedPdfFileName || 'Uploaded Notice PDF'}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {uploadedPdfFileSize || 'PDF Ready'} • Will open directly when clicked
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setNoticeForm(prev => ({ ...prev, attachmentUrl: '' }));
                          setUploadedPdfFileName('');
                          setUploadedPdfFileSize('');
                        }}
                        className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-[11px] border border-rose-200 transition-all cursor-pointer"
                      >
                        Remove PDF
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        id="notice-pdf-upload"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
                            alert('Please select a valid PDF document (.pdf).');
                            e.target.value = '';
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = () => {
                            const base64 = reader.result as string;
                            setNoticeForm(prev => ({
                              ...prev,
                              attachmentUrl: base64,
                              title: prev.title || file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "),
                              description: prev.description || `Official notification document: ${file.name}`
                            }));
                            setUploadedPdfFileName(file.name);
                            setUploadedPdfFileSize(`${(file.size / 1024).toFixed(1)} KB`);
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                      <label
                        htmlFor="notice-pdf-upload"
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white hover:bg-blue-50 text-blue-900 border border-blue-300 font-bold rounded-xl cursor-pointer shadow-xs transition-all text-xs"
                      >
                        <Upload className="w-3.5 h-3.5 text-blue-900" />
                        <span>Select PDF Document from PC</span>
                      </label>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Upload official signed circular, resolution, or order PDF from your computer.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Notice Content {noticeForm.attachmentUrl ? '(Optional when PDF is uploaded)' : '*'}
                </label>
                <textarea
                  rows={3}
                  required={!noticeForm.attachmentUrl}
                  placeholder={noticeForm.attachmentUrl ? "Optional explanatory note or leave empty..." : "Detailed circular text..."}
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
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
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

      {/* MODAL: EDIT MEMBER */}
      {isEditMemberModalOpen && editingMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={editingMember.avatarUrl || 'https://i.pravatar.cc/100'}
                  alt={editingMember.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-300"
                />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Edit Member Details</h3>
                  <p className="text-xs text-blue-900 font-mono font-bold">{editingMember.membershipId} • {editingMember.employeeCode}</p>
                </div>
              </div>
              <button
                onClick={() => { setIsEditMemberModalOpen(false); setEditingMember(null); }}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMemberEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingMember.name}
                    onChange={e => setEditingMember({ ...editingMember, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editingMember.email}
                    onChange={e => setEditingMember({ ...editingMember, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={editingMember.mobile}
                    onChange={e => setEditingMember({ ...editingMember, mobile: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Employee Code</label>
                  <input
                    type="text"
                    required
                    value={editingMember.employeeCode}
                    onChange={e => setEditingMember({ ...editingMember, employeeCode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    value={editingMember.designation}
                    onChange={e => setEditingMember({ ...editingMember, designation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department / Wing</label>
                  <input
                    type="text"
                    required
                    value={editingMember.department}
                    onChange={e => setEditingMember({ ...editingMember, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Posting Location</label>
                  <input
                    type="text"
                    value={editingMember.postingLocation}
                    onChange={e => setEditingMember({ ...editingMember, postingLocation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={editingMember.bloodGroup}
                    onChange={e => setEditingMember({ ...editingMember, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    {['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Employee Category</label>
                  <select
                    value={editingMember.employeeCategory}
                    onChange={e => setEditingMember({ ...editingMember, employeeCategory: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="JUDICIAL">JUDICIAL</option>
                    <option value="EXECUTIVE">EXECUTIVE</option>
                    <option value="ADMINISTRATIVE">ADMINISTRATIVE</option>
                    <option value="TECHNICAL">TECHNICAL</option>
                    <option value="SUPPORT">SUPPORT</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Membership Type</label>
                  <select
                    value={editingMember.membershipType}
                    onChange={e => setEditingMember({ ...editingMember, membershipType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="REGULAR_MEMBER">REGULAR MEMBER</option>
                    <option value="LIFE_MEMBER">LIFE MEMBER</option>
                    <option value="HONORARY_MEMBER">HONORARY MEMBER</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">System Role</label>
                  <select
                    value={editingMember.role}
                    onChange={e => setEditingMember({ ...editingMember, role: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none font-bold"
                  >
                    <option value="MEMBER">MEMBER</option>
                    <option value="PRESIDENT">PRESIDENT</option>
                    <option value="SECRETARY">SECRETARY</option>
                    <option value="TREASURER">TREASURER</option>
                    <option value="SUPER_ADMIN">SUPER ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Membership Status</label>
                  <select
                    value={editingMember.status}
                    onChange={e => setEditingMember({ ...editingMember, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none font-bold text-blue-900"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PENDING">PENDING</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="EXPIRED">EXPIRED</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Monthly Subscription (₹)</label>
                  <input
                    type="number"
                    value={editingMember.monthlyContribution}
                    onChange={e => setEditingMember({ ...editingMember, monthlyContribution: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    value={editingMember.emergencyContact || ''}
                    onChange={e => setEditingMember({ ...editingMember, emergencyContact: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                    placeholder="Relation & Phone"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Residential Address</label>
                <textarea
                  rows={2}
                  value={editingMember.address}
                  onChange={e => setEditingMember({ ...editingMember, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              {/* Account Security & Password */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-amber-600" />
                    Member Portal Login Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingMember({ ...editingMember, password: 'OHCEA123' });
                      alert("Password reset field set to default: 'OHCEA123'. Click 'Save Member Changes' to save.");
                    }}
                    className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-lg font-bold text-[10px] cursor-pointer"
                  >
                    Reset to Default: OHCEA123
                  </button>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Enter new password or leave blank to keep unchanged"
                    value={editingMember.password || ''}
                    onChange={e => setEditingMember({ ...editingMember, password: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none font-mono text-xs"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    System default reset password for all employees is <code className="font-bold text-slate-700">OHCEA123</code>.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => { setIsEditMemberModalOpen(false); setEditingMember(null); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl cursor-pointer shadow-md transition-all"
                >
                  Save Member Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL CORPUS FUND ENTRY */}
      {isCorpusModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded uppercase tracking-wider">
                  CORPUS LEDGER DISPATCH
                </span>
                <h3 className="font-extrabold text-slate-900 text-lg mt-0.5">Manual Welfare Corpus Fund Entry</h3>
              </div>
              <button
                onClick={() => setIsCorpusModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCorpusSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Transaction Nature *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCorpusForm({ ...corpusForm, type: 'CREDIT' })}
                    className={`p-2.5 rounded-xl font-bold border flex items-center justify-center gap-2 cursor-pointer transition-all ${corpusForm.type === 'CREDIT'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    <ArrowDownRight className="w-4 h-4 text-emerald-300" />
                    <span>CREDIT (Inflow / Grant)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCorpusForm({ ...corpusForm, type: 'DEBIT' })}
                    className={`p-2.5 rounded-xl font-bold border flex items-center justify-center gap-2 cursor-pointer transition-all ${corpusForm.type === 'DEBIT'
                      ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    <ArrowUpRight className="w-4 h-4 text-rose-300" />
                    <span>DEBIT (Outflow / Expense)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Corpus Category *</label>
                <select
                  value={corpusForm.category}
                  onChange={e => setCorpusForm({ ...corpusForm, category: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                >
                  <option value="DONATION">Voluntary Donation / Patron Grant</option>
                  <option value="INTEREST">Bank Fixed Deposit (FD) / Savings Interest</option>
                  <option value="SPECIAL_GRANT">Government / High Court Subvention</option>
                  <option value="CONTRIBUTION">Bulk Subscription / Member Contribution</option>
                  <option value="CORPUS_ALLOCATION">General Reserve / Corpus Allocation</option>
                  <option value="WELFARE_DISBURSED">Welfare Assistance Disbursal</option>
                  <option value="EVENT_EXPENSE">Cultural / Sports Association Event</option>
                  <option value="ADMIN_EXPENSE">Administrative / Office Audit Expense</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={corpusForm.amount}
                    onChange={e => setCorpusForm({ ...corpusForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none font-bold"
                    placeholder="e.g. 50000"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Transaction Date</label>
                  <input
                    type="date"
                    required
                    value={corpusForm.date}
                    onChange={e => setCorpusForm({ ...corpusForm, date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Voucher / Bank Cheque / Reference No. *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SBI-NEFT-92810 or TREASURY-CHQ-401"
                  value={corpusForm.referenceNo}
                  onChange={e => setCorpusForm({ ...corpusForm, referenceNo: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Particulars *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter details of donor, bank transaction ID, or purpose..."
                  value={corpusForm.description}
                  onChange={e => setCorpusForm({ ...corpusForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCorpusModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl cursor-pointer shadow-md transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Commit Corpus Entry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE MEMBER CONFIRMATION */}
      {isDeleteModalOpen && deletingMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Permanently Delete Member?</h3>
                <p className="text-xs text-slate-500 font-mono">{deletingMember.membershipId}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-slate-900 font-bold">{deletingMember.name}</strong> ({deletingMember.employeeCode})?
              All linked contributions, welfare history, and records will be deleted from the database.
            </p>

            <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-[11px] text-rose-800">
              ⚠️ <strong>Warning:</strong> This operation is permanent and cannot be undone.
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setIsDeleteModalOpen(false); setDeletingMember(null); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteMember}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md transition-all"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REJECT APPLICATION */}
      {isRejectModalOpen && rejectingMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-amber-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-100 rounded-full text-rose-600">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Reject Application</h3>
                <p className="text-xs text-slate-500">{rejectingMember.name} • {rejectingMember.employeeCode}</p>
              </div>
            </div>

            <form onSubmit={handleRejectMember} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Reason for Rejection / Clarification Required:
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionNotes}
                  onChange={e => setRejectionNotes(e.target.value)}
                  placeholder="e.g. Incomplete employee appointment letter or discrepancy in service details..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  This message will be recorded in the audit logs and sent directly to the applicant's portal notifications.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsRejectModalOpen(false); setRejectingMember(null); setRejectionNotes(''); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl cursor-pointer shadow-md transition-all"
                >
                  Reject Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW MEMBER */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 text-blue-900 rounded-lg">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Enroll New High Court Employee</h3>
                  <p className="text-xs text-slate-500">Create a new association member record directly in PostgreSQL.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddMemberModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewMember} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newMemberForm.name}
                    onChange={e => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                    placeholder="Sri/Smt. Staff Name"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newMemberForm.email}
                    onChange={e => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                    placeholder="staff@OHCEA.gov.in"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Employee Code *</label>
                  <input
                    type="text"
                    required
                    value={newMemberForm.employeeCode}
                    onChange={e => setNewMemberForm({ ...newMemberForm, employeeCode: e.target.value })}
                    placeholder="HC-EMP-2050"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={newMemberForm.mobile}
                    onChange={e => setNewMemberForm({ ...newMemberForm, mobile: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={newMemberForm.designation}
                    onChange={e => setNewMemberForm({ ...newMemberForm, designation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department / Wing</label>
                  <input
                    type="text"
                    value={newMemberForm.department}
                    onChange={e => setNewMemberForm({ ...newMemberForm, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cadre Category</label>
                  <select
                    value={newMemberForm.employeeCategory}
                    onChange={e => setNewMemberForm({ ...newMemberForm, employeeCategory: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="JUDICIAL">JUDICIAL</option>
                    <option value="EXECUTIVE">EXECUTIVE</option>
                    <option value="ADMINISTRATIVE">ADMINISTRATIVE</option>
                    <option value="TECHNICAL">TECHNICAL</option>
                    <option value="SUPPORT">SUPPORT</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={newMemberForm.bloodGroup}
                    onChange={e => setNewMemberForm({ ...newMemberForm, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    {['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Membership Status</label>
                  <select
                    value={newMemberForm.status}
                    onChange={e => setNewMemberForm({ ...newMemberForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none font-bold text-emerald-800"
                  >
                    <option value="ACTIVE">ACTIVE (Instantly Approved)</option>
                    <option value="PENDING">PENDING (Awaiting Review)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Monthly Dues (₹)</label>
                  <input
                    type="number"
                    value={newMemberForm.monthlyContribution}
                    onChange={e => setNewMemberForm({ ...newMemberForm, monthlyContribution: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Residential Address</label>
                <textarea
                  rows={2}
                  value={newMemberForm.address}
                  onChange={e => setNewMemberForm({ ...newMemberForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl cursor-pointer shadow-md transition-all"
                >
                  Enroll & Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT OFFICE BEARER */}
      {isEditBearerModalOpen && editingBearer && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-400/20 text-amber-300 rounded-lg">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Edit Office Bearer Details</h3>
                  <p className="text-xs text-slate-400">Update executive portfolio, contact details, or profile picture.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEditBearerModalOpen(false);
                  setEditingBearer(null);
                }}
                className="text-slate-400 hover:text-white font-bold cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditBearer} className="p-6 space-y-4 text-xs">
              {/* Photo Upload from PC (Strict 40 KB limit) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800 text-xs">
                    Office Bearer Photograph (Upload from Local Storage / PC)
                  </label>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    Max Limit: 40 KB
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={editingBearer.photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"}
                      alt="Preview"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80";
                      }}
                      className="w-20 h-24 rounded-xl object-cover border-2 border-amber-400 shadow-md bg-white"
                    />
                    <span className="absolute bottom-1 right-1 bg-blue-900 text-amber-300 text-[9px] px-1 rounded font-bold">
                      Preview
                    </span>
                  </div>

                  <div className="w-full space-y-2">
                    <input
                      type="file"
                      id="edit-bearer-photo-file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      className="hidden"
                      onChange={handleEditBearerPhotoUpload}
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <label
                        htmlFor="edit-bearer-photo-file"
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm transition-all"
                      >
                        <Upload className="w-3.5 h-3.5 text-amber-300" />
                        <span>Choose Photo from PC (Max 40 KB)</span>
                      </label>

                      {editingBearer.photo && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBearer({ ...editingBearer, photo: '' });
                            setEditPhotoFileName('');
                            setEditPhotoFileSize('');
                          }}
                          className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {editPhotoFileName && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-[11px] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{editPhotoFileName} ({editPhotoFileSize}) • Under 40 KB limit</span>
                      </div>
                    )}

                    {editPhotoError && (
                      <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {editPhotoError}
                      </p>
                    )}

                    <div className="pt-1">
                      <details className="text-[11px] text-slate-500">
                        <summary className="cursor-pointer hover:text-slate-800 font-medium">Or enter Web Image URL manually</summary>
                        <input
                          type="url"
                          value={editingBearer.photo}
                          onChange={e => setEditingBearer({ ...editingBearer, photo: e.target.value })}
                          placeholder="https://..."
                          className="w-full mt-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                        />
                      </details>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editingBearer.name}
                    onChange={e => setEditingBearer({ ...editingBearer, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Association Designation *</label>
                  <input
                    type="text"
                    required
                    value={editingBearer.designation}
                    onChange={e => setEditingBearer({ ...editingBearer, designation: e.target.value })}
                    placeholder="e.g. President, General Secretary, Treasurer"
                    list="edit-designations-list"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none font-bold text-blue-900"
                  />
                  <datalist id="edit-designations-list">
                    <option value="President" />
                    <option value="Vice President" />
                    <option value="General Secretary" />
                    <option value="Joint Secretary" />
                    <option value="Treasurer" />
                    <option value="Executive Member" />
                    <option value="Welfare Secretary" />
                    <option value="Cultural Secretary" />
                    <option value="Organizing Secretary" />
                    <option value="Legal Advisor" />
                  </datalist>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">High Court Wing / Official Role *</label>
                  <input
                    type="text"
                    required
                    value={editingBearer.courtRole}
                    onChange={e => setEditingBearer({ ...editingBearer, courtRole: e.target.value })}
                    placeholder="e.g. Senior Section Officer (Judicial Wing)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Display Rank / Priority Order *</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    required
                    value={editingBearer.priority}
                    onChange={e => setEditingBearer({ ...editingBearer, priority: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">1 = Top rank (President), 2 = Vice President, etc.</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Elected Term / Tenure *</label>
                  <input
                    type="text"
                    required
                    value={editingBearer.term}
                    onChange={e => setEditingBearer({ ...editingBearer, term: e.target.value })}
                    placeholder="2024 - 2026"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Mobile / WhatsApp</label>
                  <input
                    type="text"
                    value={editingBearer.phone}
                    onChange={e => setEditingBearer({ ...editingBearer, phone: e.target.value })}
                    placeholder="+91 94370 12345"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Official Email Address</label>
                  <input
                    type="email"
                    value={editingBearer.email}
                    onChange={e => setEditingBearer({ ...editingBearer, email: e.target.value })}
                    placeholder="bearer@OHCEA.gov.in"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Short Profile Bio & Focus Areas</label>
                <textarea
                  rows={3}
                  value={editingBearer.shortBio}
                  onChange={e => setEditingBearer({ ...editingBearer, shortBio: e.target.value })}
                  placeholder="Summary of experience, key advocacy initiatives, or association message..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditBearerModalOpen(false);
                    setEditingBearer(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl cursor-pointer shadow-md transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD OFFICE BEARER */}
      {isAddBearerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-400 text-slate-950 rounded-lg">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Add New Office Bearer</h3>
                  <p className="text-xs text-slate-400">Add an elected member to the Executive Council directory.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddBearerModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewBearer} className="p-6 space-y-4 text-xs">
              {/* Photo Upload from PC (Strict 40 KB limit) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800 text-xs">
                    Office Bearer Photograph (Upload from Local Storage / PC)
                  </label>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    Max Limit: 40 KB
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={newBearerForm.photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"}
                      alt="Preview"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80";
                      }}
                      className="w-20 h-24 rounded-xl object-cover border-2 border-amber-400 shadow-md bg-white"
                    />
                    <span className="absolute bottom-1 right-1 bg-blue-900 text-amber-300 text-[9px] px-1 rounded font-bold">
                      Preview
                    </span>
                  </div>

                  <div className="w-full space-y-2">
                    <input
                      type="file"
                      id="add-bearer-photo-file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      className="hidden"
                      onChange={handleAddBearerPhotoUpload}
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <label
                        htmlFor="add-bearer-photo-file"
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm transition-all"
                      >
                        <Upload className="w-3.5 h-3.5 text-amber-300" />
                        <span>Choose Photo from PC (Max 40 KB)</span>
                      </label>

                      {newBearerForm.photo && (
                        <button
                          type="button"
                          onClick={() => {
                            setNewBearerForm(prev => ({ ...prev, photo: '' }));
                            setAddPhotoFileName('');
                            setAddPhotoFileSize('');
                          }}
                          className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {addPhotoFileName && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-[11px] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{addPhotoFileName} ({addPhotoFileSize}) • Under 40 KB limit</span>
                      </div>
                    )}

                    {addPhotoError && (
                      <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {addPhotoError}
                      </p>
                    )}

                    <div className="pt-1">
                      <details className="text-[11px] text-slate-500">
                        <summary className="cursor-pointer hover:text-slate-800 font-medium">Or enter Web Image URL manually</summary>
                        <input
                          type="url"
                          value={newBearerForm.photo}
                          onChange={e => setNewBearerForm({ ...newBearerForm, photo: e.target.value })}
                          placeholder="https://..."
                          className="w-full mt-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                        />
                      </details>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sri Rajeshwar Prasad Sharma"
                    value={newBearerForm.name}
                    onChange={e => setNewBearerForm({ ...newBearerForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Association Designation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. President, General Secretary, Treasurer"
                    list="new-designations-list"
                    value={newBearerForm.designation}
                    onChange={e => setNewBearerForm({ ...newBearerForm, designation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none font-bold text-blue-900"
                  />
                  <datalist id="new-designations-list">
                    <option value="President" />
                    <option value="Vice President" />
                    <option value="General Secretary" />
                    <option value="Joint Secretary" />
                    <option value="Treasurer" />
                    <option value="Executive Member" />
                    <option value="Welfare Secretary" />
                    <option value="Cultural Secretary" />
                    <option value="Organizing Secretary" />
                    <option value="Legal Advisor" />
                  </datalist>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">High Court Wing / Official Role *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Section Officer (Judicial Wing)"
                    value={newBearerForm.courtRole}
                    onChange={e => setNewBearerForm({ ...newBearerForm, courtRole: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Display Rank / Priority Order *</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    required
                    value={newBearerForm.priority}
                    onChange={e => setNewBearerForm({ ...newBearerForm, priority: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">1 = Top rank (President), 2 = Vice President, etc.</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Elected Term / Tenure *</label>
                  <input
                    type="text"
                    required
                    value={newBearerForm.term}
                    onChange={e => setNewBearerForm({ ...newBearerForm, term: e.target.value })}
                    placeholder="2024 - 2026"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Mobile / WhatsApp</label>
                  <input
                    type="text"
                    value={newBearerForm.phone}
                    onChange={e => setNewBearerForm({ ...newBearerForm, phone: e.target.value })}
                    placeholder="+91 94370 12345"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Official Email Address</label>
                  <input
                    type="email"
                    value={newBearerForm.email}
                    onChange={e => setNewBearerForm({ ...newBearerForm, email: e.target.value })}
                    placeholder="bearer@OHCEA.gov.in"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Short Profile Bio & Focus Areas</label>
                <textarea
                  rows={3}
                  value={newBearerForm.shortBio}
                  onChange={e => setNewBearerForm({ ...newBearerForm, shortBio: e.target.value })}
                  placeholder="Summary of experience, key advocacy initiatives, or association message..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddBearerModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl cursor-pointer shadow-md transition-all"
                >
                  Add to Executive Body
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
