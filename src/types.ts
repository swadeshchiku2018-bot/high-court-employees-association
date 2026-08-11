export type UserRole = 'MEMBER' | 'PRESIDENT' | 'SECRETARY' | 'TREASURER' | 'SUPER_ADMIN';

export type MembershipStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'REJECTED';

export interface DocumentAttachment {
  id: string;
  title: string;
  url: string;
  uploadedAt: string;
  type?: string;
}

export interface Member {
  id: string;
  email: string;
  role: UserRole;
  membershipId: string; // e.g. HCEA-2026-0001
  employeeCode: string;
  name: string;
  avatarUrl: string;
  designation: string;
  department: string;
  postingLocation: string;
  dob: string;
  mobile: string;
  bloodGroup: string;
  address: string;
  dateOfJoining: string;
  employeeCategory: 'JUDICIAL' | 'EXECUTIVE' | 'ADMINISTRATIVE' | 'TECHNICAL' | 'SUPPORT';
  membershipType: 'LIFE_MEMBER' | 'REGULAR_MEMBER' | 'HONORARY_MEMBER';
  membershipDate: string;
  monthlyContribution: number;
  status: MembershipStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  documents: DocumentAttachment[];
  emergencyContact?: string;
}

export interface OfficeBearer {
  id: string;
  name: string;
  designation: string;
  courtRole: string;
  shortBio: string;
  photo: string;
  priority: number;
  phone: string;
  email: string;
  term: string;
}

export interface Contribution {
  id: string;
  memberId: string;
  memberName: string;
  membershipNumber: string;
  receiptNo: string;
  amount: number;
  purpose: 'MONTHLY' | 'WELFARE' | 'GENERAL' | 'DONATION' | 'SPECIAL';
  paymentMode: 'ONLINE' | 'BANK_TRANSFER' | 'CASH' | 'SALARY_DEDUCTION';
  transactionId: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  date: string;
  financialYear: string;
  remarks?: string;
}

export interface WelfareApplication {
  id: string;
  memberId: string;
  memberName: string;
  membershipNumber: string;
  type: 'MEDICAL' | 'EDUCATION' | 'EMERGENCY' | 'RETIREMENT' | 'DEPENDENT' | 'OTHER';
  amountRequested: number;
  amountApproved?: number;
  reason: string;
  description: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'ADDITIONAL_INFO_REQUIRED' | 'APPROVED' | 'REJECTED' | 'DISBURSED';
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    ifsc: string;
  };
  supportingDocs: DocumentAttachment[];
  submittedAt: string;
  updatedAt: string;
  reviewNotes?: string;
  disbursedDate?: string;
  disbursedTxnRef?: string;
}

export interface FundTransaction {
  id: string;
  date: string;
  transactionId: string;
  type: 'CREDIT' | 'DEBIT';
  category: 'CONTRIBUTION' | 'WELFARE_DISBURSED' | 'EVENT_EXPENSE' | 'ADMIN_EXPENSE' | 'DONATION' | 'INTEREST';
  description: string;
  amount: number;
  balanceAfter: number;
  referenceNo: string;
  createdBy: string;
}

export interface Notice {
  id: string;
  title: string;
  category: 'GENERAL' | 'CIRCULAR' | 'EVENT' | 'WELFARE' | 'URGENT';
  description: string;
  content: string;
  attachmentUrl?: string;
  date: string;
  publishedBy: string;
  visibility: 'PUBLIC' | 'MEMBERS_ONLY';
  isImportant?: boolean;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  image: string;
  registrationStatus: 'OPEN' | 'CLOSED' | 'FULL';
  totalRegistered: number;
  maxCapacity: number;
  registrationDeadline: string;
  category: 'ANNUAL' | 'CULTURAL' | 'SPORTS' | 'WORKSHOP' | 'GENERAL_BODY';
}

export interface EventRegistration {
  id: string;
  eventId: string;
  memberId: string;
  memberName: string;
  membershipNumber: string;
  registeredAt: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'EVENTS' | 'MEETINGS' | 'WELFARE' | 'SOCIAL' | 'CELEBRATIONS';
  imageUrl: string;
  date: string;
  description: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

export interface AssociationSettings {
  name: string;
  shortName: string;
  emblemUrl: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  address: string;
  phone: string;
  email: string;
  officeHours: string;
  highCourtLocation: string;
  mission: string;
  vision: string;
  aboutText: string;
  welfareRules: string;
  stats: {
    totalMembers: number;
    activeMembers: number;
    welfareFundBalance: number;
    membersSupported: number;
    yearsOfService: number;
    activitiesConducted: number;
  };
}

export interface AppNotification {
  id: string;
  memberId: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'APPROVAL' | 'CONTRIBUTION' | 'WELFARE' | 'NOTICE' | 'GENERAL';
  link?: string;
}
