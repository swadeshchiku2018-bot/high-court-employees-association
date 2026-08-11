import {
  Member, OfficeBearer, Contribution, WelfareApplication, FundTransaction, Notice,
  EventItem, EventRegistration, GalleryItem, AuditLog, AssociationSettings, AppNotification
} from '../types';
import {
  initialSettings, initialOfficeBearers, generateSeedMembers, generateSeedContributions,
  generateSeedWelfareApplications, generateSeedFundTransactions, initialNotices, initialEvents, initialGallery, initialAuditLogs
} from '../data/seedData';

class BackendStore {
  private settings: AssociationSettings;
  private officeBearers: OfficeBearer[];
  private members: Member[];
  private contributions: Contribution[];
  private welfareApplications: WelfareApplication[];
  private fundTransactions: FundTransaction[];
  private notices: Notice[];
  private events: EventItem[];
  private registrations: EventRegistration[];
  private gallery: GalleryItem[];
  private auditLogs: AuditLog[];
  private notifications: AppNotification[];

  constructor() {
    this.settings = { ...initialSettings };
    this.officeBearers = [...initialOfficeBearers];
    this.members = generateSeedMembers();
    this.contributions = generateSeedContributions(this.members);
    this.welfareApplications = generateSeedWelfareApplications();
    this.fundTransactions = generateSeedFundTransactions();
    this.notices = [...initialNotices];
    this.events = [...initialEvents];
    this.registrations = [];
    this.gallery = [...initialGallery];
    this.auditLogs = [...initialAuditLogs];
    this.notifications = [
      {
        id: "notif-1",
        memberId: "mem-8",
        title: "Medical Welfare Disbursed",
        message: "Your medical assistance grant of ₹75,000 has been transferred to your SBI bank account.",
        date: "2026-07-14",
        read: false,
        type: "WELFARE"
      },
      {
        id: "notif-2",
        memberId: "mem-8",
        title: "AGBM 2026 Notice Published",
        message: "Annual General Body Meeting notice published. Check notices section for agenda.",
        date: "2026-08-05",
        read: true,
        type: "NOTICE"
      }
    ];

    this.recalculateStats();
  }

  private recalculateStats() {
    const totalMembers = this.members.length;
    const activeMembers = this.members.filter(m => m.status === 'ACTIVE').length;
    
    // Calculate fund balance
    let balance = 14850000;
    this.fundTransactions.forEach(t => {
      if (t.type === 'CREDIT') balance += t.amount;
      else balance -= t.amount;
    });

    this.settings.stats = {
      ...this.settings.stats,
      totalMembers,
      activeMembers,
      welfareFundBalance: balance,
      membersSupported: this.welfareApplications.filter(w => w.status === 'APPROVED' || w.status === 'DISBURSED').length + 340
    };
  }

  // --- SETTINGS ---
  getSettings(): AssociationSettings {
    return this.settings;
  }

  updateSettings(newSettings: Partial<AssociationSettings>, actorName: string = "Admin") {
    this.settings = { ...this.settings, ...newSettings };
    this.addAuditLog(actorName, "SUPER_ADMIN", "SETTINGS_UPDATED", "Updated Association Portal settings and branding info");
    return this.settings;
  }

  // --- OFFICE BEARERS ---
  getOfficeBearers(): OfficeBearer[] {
    return [...this.officeBearers].sort((a, b) => a.priority - b.priority);
  }

  updateOfficeBearer(bearer: OfficeBearer, actorName: string = "Admin") {
    const idx = this.officeBearers.findIndex(ob => ob.id === bearer.id);
    if (idx >= 0) {
      this.officeBearers[idx] = bearer;
    } else {
      this.officeBearers.push(bearer);
    }
    this.addAuditLog(actorName, "PRESIDENT", "OFFICE_BEARER_UPDATED", `Updated profile for ${bearer.name} (${bearer.designation})`);
    return this.getOfficeBearers();
  }

  // --- AUTH & MEMBERS ---
  authenticateUser(email: string): Member | undefined {
    return this.members.find(m => m.email.toLowerCase() === email.toLowerCase());
  }

  getMembers(query?: string, status?: string, department?: string): Member[] {
    let list = [...this.members];
    if (status && status !== 'ALL') {
      list = list.filter(m => m.status === status);
    }
    if (department && department !== 'ALL') {
      list = list.filter(m => m.department === department);
    }
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.membershipId.toLowerCase().includes(q) ||
        m.employeeCode.toLowerCase().includes(q) ||
        m.designation.toLowerCase().includes(q) ||
        m.mobile.includes(q) ||
        m.email.toLowerCase().includes(q)
      );
    }
    return list;
  }

  getMemberById(id: string): Member | undefined {
    return this.members.find(m => m.id === id || m.membershipId.toUpperCase() === id.toUpperCase());
  }

  verifyMemberPublic(membershipId: string) {
    const member = this.getMemberById(membershipId);
    if (!member) return null;
    // Public safe view - remove private docs, mobile, email, address
    return {
      membershipId: member.membershipId,
      name: member.name,
      designation: member.designation,
      department: member.department,
      postingLocation: member.postingLocation,
      employeeCategory: member.employeeCategory,
      membershipType: member.membershipType,
      membershipDate: member.membershipDate,
      status: member.status,
      avatarUrl: member.avatarUrl,
      verifiedBy: member.verifiedBy,
      verifiedAt: member.verifiedAt
    };
  }

  registerNewMember(data: Omit<Member, 'id' | 'membershipId' | 'status' | 'monthlyContribution'>): Member {
    const nextNum = (this.members.length + 1).toString().padStart(4, '0');
    const newMember: Member = {
      ...data,
      id: `mem-${Date.now()}`,
      membershipId: `HCEA-2026-${nextNum}`,
      status: 'PENDING',
      monthlyContribution: 500,
      documents: data.documents || []
    };

    this.members.unshift(newMember);
    this.recalculateStats();

    this.addAuditLog("System", "MEMBER", "MEMBER_REGISTERED", `New application submitted by ${newMember.name} (${newMember.employeeCode})`);
    return newMember;
  }

  updateMemberStatus(id: string, status: Member['status'], actorName: string = "President", notes?: string): Member {
    const member = this.members.find(m => m.id === id);
    if (!member) throw new Error("Member not found");

    member.status = status;
    if (status === 'ACTIVE') {
      member.verifiedBy = actorName;
      member.verifiedAt = new Date().toISOString().split('T')[0];
      this.addNotification(member.id, "Membership Approved", `Congratulations! Your HCEA Membership (${member.membershipId}) has been verified and activated. You can now download your digital ID card.`, "APPROVAL");
    } else if (status === 'REJECTED') {
      member.rejectionReason = notes;
      this.addNotification(member.id, "Membership Application Update", `Your membership application requires clarification: ${notes || 'Please check with HCEA Secretariat.'}`, "APPROVAL");
    }

    this.recalculateStats();
    this.addAuditLog(actorName, "PRESIDENT", "MEMBER_STATUS_CHANGED", `Status of ${member.name} (${member.membershipId}) set to ${status}`);
    return member;
  }

  updateMemberProfile(id: string, updates: Partial<Member>, actorName: string = "Member"): Member {
    const member = this.members.find(m => m.id === id);
    if (!member) throw new Error("Member not found");

    // Don't allow changing sensitive fields directly if regular member
    delete updates.membershipId;
    delete updates.status;
    delete updates.role;

    Object.assign(member, updates);
    this.addAuditLog(actorName, member.role, "MEMBER_PROFILE_UPDATED", `Profile details updated for ${member.name}`);
    return member;
  }

  // --- CONTRIBUTIONS & RECEIPTS ---
  getContributions(memberId?: string): Contribution[] {
    if (memberId) {
      return this.contributions.filter(c => c.memberId === memberId || c.membershipNumber === memberId);
    }
    return [...this.contributions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  processOnlineContribution(data: {
    memberId: string;
    amount: number;
    purpose: Contribution['purpose'];
    paymentMode: Contribution['paymentMode'];
    remarks?: string;
  }): Contribution {
    const member = this.getMemberById(data.memberId);
    if (!member) throw new Error("Member not found");

    const receiptNo = `REC-2026-${(this.contributions.length + 101).toString().padStart(5, '0')}`;
    const newContrib: Contribution = {
      id: `contrib-${Date.now()}`,
      memberId: member.id,
      memberName: member.name,
      membershipNumber: member.membershipId,
      receiptNo,
      amount: data.amount,
      purpose: data.purpose,
      paymentMode: data.paymentMode,
      transactionId: `TXN-PG-${Math.floor(10000000 + Math.random() * 90000000)}`,
      status: 'SUCCESS',
      date: new Date().toISOString().split('T')[0],
      financialYear: '2026-2027',
      remarks: data.remarks || `Online contribution for ${data.purpose}`
    };

    this.contributions.unshift(newContrib);

    // Record in fund ledger
    this.addFundTransaction({
      type: 'CREDIT',
      category: 'CONTRIBUTION',
      description: `Online ${data.purpose} contribution by ${member.name} (${member.membershipId})`,
      amount: data.amount,
      referenceNo: newContrib.transactionId,
      createdBy: member.name
    });

    this.addNotification(member.id, "Contribution Received", `Payment of ₹${data.amount} received successfully. Receipt No: ${receiptNo}`, "CONTRIBUTION");
    this.addAuditLog(member.name, member.role, "CONTRIBUTION_PAID", `Paid ₹${data.amount} for ${data.purpose} via ${data.paymentMode}`);

    return newContrib;
  }

  // --- WELFARE APPLICATIONS ---
  getWelfareApplications(memberId?: string): WelfareApplication[] {
    if (memberId) {
      return this.welfareApplications.filter(w => w.memberId === memberId);
    }
    return [...this.welfareApplications].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  submitWelfareApplication(appData: Omit<WelfareApplication, 'id' | 'status' | 'submittedAt' | 'updatedAt'>): WelfareApplication {
    const newApp: WelfareApplication = {
      ...appData,
      id: `welf-${Date.now()}`,
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    this.welfareApplications.unshift(newApp);
    this.addNotification(newApp.memberId, "Welfare Request Submitted", `Your welfare assistance application for ${newApp.type} (₹${newApp.amountRequested}) has been received.`, "WELFARE");
    this.addAuditLog(newApp.memberName, "MEMBER", "WELFARE_APPLIED", `Applied for ₹${newApp.amountRequested} ${newApp.type} assistance`);

    return newApp;
  }

  updateWelfareStatus(
    id: string,
    status: WelfareApplication['status'],
    amountApproved?: number,
    notes?: string,
    disbursedTxnRef?: string,
    actorName: string = "President"
  ): WelfareApplication {
    const app = this.welfareApplications.find(w => w.id === id);
    if (!app) throw new Error("Application not found");

    app.status = status;
    app.updatedAt = new Date().toISOString().split('T')[0];
    if (amountApproved) app.amountApproved = amountApproved;
    if (notes) app.reviewNotes = notes;

    if (status === 'DISBURSED') {
      app.disbursedDate = new Date().toISOString().split('T')[0];
      app.disbursedTxnRef = disbursedTxnRef || `NEFT-${Math.floor(100000 + Math.random() * 900000)}`;

      // Record ledger debit
      this.addFundTransaction({
        type: 'DEBIT',
        category: 'WELFARE_DISBURSED',
        description: `Welfare Grant Disbursed to ${app.memberName} (${app.membershipNumber}) for ${app.type}`,
        amount: app.amountApproved || app.amountRequested,
        referenceNo: app.disbursedTxnRef,
        createdBy: actorName
      });
    }

    this.addNotification(app.memberId, "Welfare Application Status Updated", `Status updated to ${status}. ${notes || ''}`, "WELFARE");
    this.addAuditLog(actorName, "PRESIDENT", "WELFARE_STATUS_UPDATED", `Set status of application ${app.id} to ${status}`);

    this.recalculateStats();
    return app;
  }

  // --- FUND LEDGER ---
  getFundTransactions(): FundTransaction[] {
    return [...this.fundTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  addFundTransaction(entry: Omit<FundTransaction, 'id' | 'date' | 'transactionId' | 'balanceAfter'>): FundTransaction {
    const currentBalance = this.settings.stats.welfareFundBalance;
    const balanceAfter = entry.type === 'CREDIT' ? currentBalance + entry.amount : currentBalance - entry.amount;

    const newTxn: FundTransaction = {
      ...entry,
      id: `ft-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      transactionId: `TXN-LEDGER-${Math.floor(100 + Math.random() * 900)}`,
      balanceAfter
    };

    this.fundTransactions.unshift(newTxn);
    this.recalculateStats();
    return newTxn;
  }

  // --- NOTICES ---
  getNotices(visibilityFilter?: 'ALL' | 'PUBLIC' | 'MEMBERS_ONLY'): Notice[] {
    let list = [...this.notices];
    if (visibilityFilter === 'PUBLIC') list = list.filter(n => n.visibility === 'PUBLIC');
    if (visibilityFilter === 'MEMBERS_ONLY') list = list.filter(n => n.visibility === 'MEMBERS_ONLY');
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  createNotice(noticeData: Omit<Notice, 'id' | 'date'>, actorName: string = "Admin"): Notice {
    const newNotice: Notice = {
      ...noticeData,
      id: `not-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    this.notices.unshift(newNotice);
    this.addAuditLog(actorName, "SECRETARY", "NOTICE_CREATED", `Published notice: ${newNotice.title}`);
    return newNotice;
  }

  deleteNotice(id: string, actorName: string = "Admin") {
    this.notices = this.notices.filter(n => n.id !== id);
    this.addAuditLog(actorName, "SECRETARY", "NOTICE_DELETED", `Deleted notice ID: ${id}`);
  }

  // --- EVENTS ---
  getEvents(): EventItem[] {
    return [...this.events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  registerForEvent(eventId: string, memberId: string): EventRegistration {
    const event = this.events.find(e => e.id === eventId);
    if (!event) throw new Error("Event not found");
    const member = this.getMemberById(memberId);
    if (!member) throw new Error("Member not found");

    const existing = this.registrations.find(r => r.eventId === eventId && r.memberId === member.id);
    if (existing) return existing;

    const reg: EventRegistration = {
      id: `reg-${Date.now()}`,
      eventId,
      memberId: member.id,
      memberName: member.name,
      membershipNumber: member.membershipId,
      registeredAt: new Date().toISOString()
    };

    this.registrations.push(reg);
    event.totalRegistered += 1;

    this.addNotification(member.id, "Event Registration Confirmed", `You have registered for ${event.title} on ${event.date}.`, "GENERAL");
    return reg;
  }

  getEventRegistrations(eventId: string): EventRegistration[] {
    return this.registrations.filter(r => r.eventId === eventId);
  }

  createEvent(eventData: Omit<EventItem, 'id' | 'totalRegistered'>, actorName: string = "Admin"): EventItem {
    const newEvt: EventItem = {
      ...eventData,
      id: `evt-${Date.now()}`,
      totalRegistered: 0
    };
    this.events.unshift(newEvt);
    this.addAuditLog(actorName, "SECRETARY", "EVENT_CREATED", `Created event: ${newEvt.title}`);
    return newEvt;
  }

  // --- GALLERY ---
  getGallery(): GalleryItem[] {
    return [...this.gallery];
  }

  addGalleryItem(item: Omit<GalleryItem, 'id'>, actorName: string = "Admin"): GalleryItem {
    const newItem = { ...item, id: `gal-${Date.now()}` };
    this.gallery.unshift(newItem);
    this.addAuditLog(actorName, "SECRETARY", "GALLERY_ADD", `Added photo: ${newItem.title}`);
    return newItem;
  }

  // --- NOTIFICATIONS ---
  getNotifications(memberId: string): AppNotification[] {
    return this.notifications.filter(n => n.memberId === memberId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  addNotification(memberId: string, title: string, message: string, type: AppNotification['type']) {
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      memberId,
      title,
      message,
      date: new Date().toISOString().split('T')[0],
      read: false,
      type
    });
  }

  markNotificationsRead(memberId: string) {
    this.notifications.forEach(n => {
      if (n.memberId === memberId) n.read = true;
    });
  }

  // --- AUDIT LOGS ---
  getAuditLogs(): AuditLog[] {
    return [...this.auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  private addAuditLog(userName: string, role: Member['role'], action: string, details: string) {
    this.auditLogs.unshift({
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: "usr-sys",
      userName,
      role,
      action,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ipAddress: "10.20.104." + Math.floor(10 + Math.random() * 90)
    });
  }
}

export const backendStore = new BackendStore();
