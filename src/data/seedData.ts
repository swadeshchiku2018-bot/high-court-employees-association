import { Member, OfficeBearer, Contribution, WelfareApplication, FundTransaction, Notice, EventItem, GalleryItem, AuditLog, AssociationSettings, AppNotification } from '../types';

export const initialSettings: AssociationSettings = {
  name: "High Court Employees' Association",
  shortName: "HCEA",
  emblemUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=300&q=80",
  tagline: "Serving Employees. Strengthening Unity. Supporting Welfare.",
  heroTitle: "High Court Employees' Association",
  heroSubtitle: "Dedicated to the dignity, professional growth, welfare, and unity of High Court staff.",
  address: "High Court Complex, Block A - Executive Wing, Sector 1, Pin - 753002",
  phone: "+91 (0671) 230-4821 / 230-4822",
  email: "contact@hcea.gov.in",
  officeHours: "Monday - Saturday: 9:30 AM to 5:30 PM (Closed on High Court Holidays)",
  highCourtLocation: "High Court Campus, Main Secretariat Wing",
  mission: "To foster fraternity, preserve staff rights, provide financial & welfare aid, and maintain high standards of court administrative excellence.",
  vision: "An empowered, united, and technologically adept High Court cadre working in exemplary harmony for judicial efficiency.",
  aboutText: "The High Court Employees' Association (HCEA) represents over 1,200 dedicated judicial administrative officers, section officers, court masters, stenographers, translators, and staff members across all wings of the High Court. Established in 1978, HCEA works indefatigably to safeguard employment rights, provide emergency medical & educational welfare grants, and promote professional camaraderie.",
  welfareRules: "1. All active regular members with 6+ months continuous subscription are eligible for welfare grants.\n2. Emergency medical assistance grants up to ₹1,00,000 are sanctioned within 24 hours.\n3. Higher education assistance grants up to ₹25,00,00 available annually per child.",
  stats: {
    totalMembers: 1248,
    activeMembers: 1180,
    welfareFundBalance: 14850000,
    membersSupported: 342,
    yearsOfService: 48,
    activitiesConducted: 186
  }
};

export const initialOfficeBearers: OfficeBearer[] = [
  {
    id: "ob-1",
    name: "Sri Rajeshwar Prasad Sharma",
    designation: "President",
    courtRole: "Senior Section Officer (Judicial Wing)",
    shortBio: "Serving the High Court for 26 years. Passionate advocate for judicial staff automation, pension streamlining, and medical insurance reform.",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    priority: 1,
    phone: "+91 94370 12345",
    email: "president@hcea.gov.in",
    term: "2024 - 2026"
  },
  {
    id: "ob-2",
    name: "Smt. Sunita Mohanty",
    designation: "Vice President",
    courtRole: "Court Master, Bench No. 3",
    shortBio: "Leading gender inclusivity initiatives, staff welfare housing committees, and legal literacy workshops for court auxiliary staff.",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    priority: 2,
    phone: "+91 94370 23456",
    email: "vicepresident@hcea.gov.in",
    term: "2024 - 2026"
  },
  {
    id: "ob-3",
    name: "Sri Manoranjan Patnaik",
    designation: "General Secretary",
    courtRole: "Chief Translator (Translation Wing)",
    shortBio: "Coordinates executive correspondence, government liaison, employee grievance redressal cell, and annual sports events.",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    priority: 3,
    phone: "+91 94370 34567",
    email: "secretary@hcea.gov.in",
    term: "2024 - 2026"
  },
  {
    id: "ob-4",
    name: "Sri Debashish Mishra",
    designation: "Joint Secretary",
    courtRole: "System Analyst (IT Cell)",
    shortBio: "Pioneered the digitization of High Court association records, online membership ID portal, and automated receipt processing.",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    priority: 4,
    phone: "+91 94370 45678",
    email: "jointsecretary@hcea.gov.in",
    term: "2024 - 2026"
  },
  {
    id: "ob-5",
    name: "Sri Ashutosh Swain",
    designation: "Treasurer",
    courtRole: "Senior Accounts Officer",
    shortBio: "Chartered finance expert managing HCEA Welfare Corpus Fund, audit reports, online payment reconciliations, and tax compliance.",
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
    priority: 5,
    phone: "+91 94370 56789",
    email: "treasurer@hcea.gov.in",
    term: "2024 - 2026"
  },
  {
    id: "ob-6",
    name: "Smt. Priyanka Jena",
    designation: "Executive Member",
    courtRole: "Principal Personal Assistant",
    shortBio: "Coordinates cultural programs, women employee grievance desk, and children's education merit awards.",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    priority: 6,
    phone: "+91 94370 67890",
    email: "priyanka.jena@hcea.gov.in",
    term: "2024 - 2026"
  }
];

// Helper to generate 50 members
const departments = ["Bench Section", "Filing & Registry", "Judicial Accounts", "Translation Wing", "IT & Digitization Cell", "Copying Department", "Protocol & Security", "Administrative Wing", "Establishment Section"];
const designations = ["Senior Section Officer", "Court Master", "Personal Assistant", "Translator Grade-I", "Assistant Registrar", "Data Entry Inspector", "Senior Clerk", "Bench Clerk", "Record Officer"];
const categories: ("JUDICIAL" | "EXECUTIVE" | "ADMINISTRATIVE" | "TECHNICAL" | "SUPPORT")[] = ["JUDICIAL", "EXECUTIVE", "ADMINISTRATIVE", "TECHNICAL", "SUPPORT"];
const bloodGroups = ["A+", "B+", "O+", "AB+", "A-", "B-", "O-"];

const namesList = [
  "Rajeshwar Prasad Sharma", "Sunita Mohanty", "Manoranjan Patnaik", "Debashish Mishra", "Ashutosh Swain",
  "Priyanka Jena", "Birendra Kumar Dash", "Sanjib Kumar Rout", "Subhashree Pradhan", "Alok Chandra Mohapatra",
  "Ananta Charan Behera", "Meenakshi Sundaram", "Ramesh Chandra Das", "Pravat Kumar Tripathy", "Smita Rani Sahoo",
  "Deepak Kumar Biswal", "Ankita Nayak", "Tapan Kumar Samal", "Bibhuti Bhusan Parida", "Kalyani Panda",
  "Sudhir Ranjan Mohanty", "Bhabani Shankar Senapati", "Rashmi Rekha Barik", "Girija Shankar Ray", "Lipika Sahoo",
  "Jagannath Prasad Das", "Manoj Kumar Swain", "Sweta Rani Tripathy", "Pradeep Kumar Panda", "Rudra Narayan Jena",
  "Tanmay Kumar Behera", "Padmalaya Das", "Satyabrata Kar", "Kishore Chandra Pradhan", "Sasmita Mohapatra",
  "Chittaranjan Sahoo", "Amrita Preeti Das", "Gyanaranjan Mallick", "Kshirod Chandra Nath", "Sandhya Rani Mishra",
  "Prasanta Kumar Rout", "Sailendra Mohan Ray", "Devika Rani Nayak", "Abhimanya Charan Dash", "Archana Kumari Pati",
  "Rabindra Nath Behera", "Sujata Rani Tripathy", "Niranjan Prasad Sahoo", "Kabita Rani Mohanty", "Soumya Ranjan Kar"
];

export function generateSeedMembers(): Member[] {
  return namesList.map((name, index) => {
    const num = (index + 1).toString().padStart(4, '0');
    const isPresident = index === 0;
    const isSecretary = index === 2;
    const isTreasurer = index === 4;
    const isPending = index === 48 || index === 49;
    
    let role: Member['role'] = 'MEMBER';
    if (isPresident) role = 'PRESIDENT';
    else if (isSecretary) role = 'SECRETARY';
    else if (isTreasurer) role = 'TREASURER';

    let email = `member${index + 1}@hcea.gov.in`;
    if (isPresident) email = 'president@hcea.gov.in';
    if (isSecretary) email = 'secretary@hcea.gov.in';
    if (isTreasurer) email = 'treasurer@hcea.gov.in';
    if (index === 7) email = 'member@hcea.gov.in'; // Test member
    if (isPending) email = `pending${index - 47}@hcea.gov.in`;

    return {
      id: `mem-${index + 1}`,
      email,
      role,
      membershipId: `HCEA-2026-${num}`,
      employeeCode: `HC-EMP-${1000 + index}`,
      name,
      avatarUrl: `https://i.pravatar.cc/300?img=${(index % 70) + 1}`,
      designation: designations[index % designations.length],
      department: departments[index % departments.length],
      postingLocation: index % 3 === 0 ? "Main High Court Building, Cuttack" : "High Court Annex Wing, Block B",
      dob: `198${(index % 10)}-0${(index % 8) + 1}-15`,
      mobile: `+91 9437${(100000 + index * 1234).toString().substring(0, 6)}`,
      bloodGroup: bloodGroups[index % bloodGroups.length],
      address: `Qtr No. ${index + 12}, Judicial Colony, High Court Road, Pin 753002`,
      dateOfJoining: `201${(index % 9)}-0${(index % 9) + 1}-10`,
      employeeCategory: categories[index % categories.length],
      membershipType: index % 4 === 0 ? "LIFE_MEMBER" : "REGULAR_MEMBER",
      membershipDate: `2020-01-${(index % 25 + 1).toString().padStart(2, '0')}`,
      monthlyContribution: 500,
      status: isPending ? 'PENDING' : 'ACTIVE',
      verifiedBy: isPending ? undefined : "Sri R. K. Sharma (President)",
      verifiedAt: isPending ? undefined : "2020-01-20",
      documents: [
        { id: `doc-1-${index}`, title: "High Court Employee ID Card", url: "#", uploadedAt: "2020-01-15" },
        { id: `doc-2-${index}`, title: "Passport Photo", url: "#", uploadedAt: "2020-01-15" }
      ],
      emergencyContact: `Spouse: +91 9861${(200000 + index * 4321).toString().substring(0, 6)}`
    };
  });
}

export function generateSeedContributions(members: Member[]): Contribution[] {
  const contributions: Contribution[] = [];
  let count = 1;

  members.filter(m => m.status === 'ACTIVE').slice(0, 25).forEach((m) => {
    // 3 historical contributions per member
    const months = ["2026-06", "2026-07", "2026-08"];
    months.forEach((mStr) => {
      const receiptNo = `REC-2026-${count.toString().padStart(5, '0')}`;
      const amount = 500;
      contributions.push({
        id: `contrib-${count}`,
        memberId: m.id,
        memberName: m.name,
        membershipNumber: m.membershipId,
        receiptNo,
        amount,
        purpose: 'MONTHLY',
        paymentMode: count % 2 === 0 ? 'ONLINE' : 'SALARY_DEDUCTION',
        transactionId: `TXN9842${count}026`,
        status: 'SUCCESS',
        date: `${mStr}-05`,
        financialYear: '2026-2027',
        remarks: 'Monthly Subscription for HCEA Welfare Fund'
      });
      count++;
    });
  });

  // Add a few special welfare donations
  contributions.push({
    id: `contrib-${count}`,
    memberId: members[0].id,
    memberName: members[0].name,
    membershipNumber: members[0].membershipId,
    receiptNo: `REC-2026-${count.toString().padStart(5, '0')}`,
    amount: 10000,
    purpose: 'DONATION',
    paymentMode: 'ONLINE',
    transactionId: `TXN-DONATE-101`,
    status: 'SUCCESS',
    date: '2026-07-15',
    financialYear: '2026-2027',
    remarks: 'Voluntary contribution towards Special Flood Relief Welfare Fund'
  });

  return contributions;
}

export function generateSeedWelfareApplications(): WelfareApplication[] {
  return [
    {
      id: "welf-1",
      memberId: "mem-8",
      memberName: "Sanjib Kumar Rout",
      membershipNumber: "HCEA-2026-0008",
      type: "MEDICAL",
      amountRequested: 75000,
      amountApproved: 75000,
      reason: "Emergency Cardiac Surgery Support",
      description: "Underwent emergency angioplasty at Apollo Hospitals. Requesting medical relief grant as per HCEA Clause 4(b).",
      status: "DISBURSED",
      bankDetails: {
        accountName: "Sanjib Kumar Rout",
        accountNumber: "389201928301",
        bankName: "State Bank of India (High Court Branch)",
        ifsc: "SBIN0002034"
      },
      supportingDocs: [
        { id: "s-1", title: "Hospital Discharge Summary & Bills", url: "#", uploadedAt: "2026-07-10" }
      ],
      submittedAt: "2026-07-10",
      updatedAt: "2026-07-12",
      reviewNotes: "Verified by Welfare Committee. Sanctioned full amount.",
      disbursedDate: "2026-07-14",
      disbursedTxnRef: "CMS-NEFT-982103"
    },
    {
      id: "welf-2",
      memberId: "mem-10",
      memberName: "Alok Chandra Mohapatra",
      membershipNumber: "HCEA-2026-0010",
      type: "EDUCATION",
      amountRequested: 25000,
      amountApproved: 25000,
      reason: "Higher Technical Education Assistance",
      description: "Daughter admitted to B.Tech Computer Science (IIT Bhubaneswar). Applying for annual merit education incentive.",
      status: "APPROVED",
      bankDetails: {
        accountName: "Alok Chandra Mohapatra",
        accountNumber: "20192837411",
        bankName: "UCO Bank High Court Campus",
        ifsc: "UCBA0001002"
      },
      supportingDocs: [
        { id: "s-2", title: "IIT Admission Letter & Fee Receipt", url: "#", uploadedAt: "2026-08-01" }
      ],
      submittedAt: "2026-08-01",
      updatedAt: "2026-08-05",
      reviewNotes: "Approved by Treasurer & President. Scheduled for disbursement."
    },
    {
      id: "welf-3",
      memberId: "mem-15",
      memberName: "Smita Rani Sahoo",
      membershipNumber: "HCEA-2026-0015",
      type: "EMERGENCY",
      amountRequested: 50000,
      reason: "Residential Storm Damage Repairs",
      description: "Severe storm damage to family ancestral residence roof during severe weather event.",
      status: "UNDER_REVIEW",
      bankDetails: {
        accountName: "Smita Rani Sahoo",
        accountNumber: "50293810293",
        bankName: "Punjab National Bank",
        ifsc: "PUNB0192000"
      },
      supportingDocs: [
        { id: "s-3", title: "Damage Assessment Certificate & Photos", url: "#", uploadedAt: "2026-08-08" }
      ],
      submittedAt: "2026-08-08",
      updatedAt: "2026-08-09",
      reviewNotes: "Under physical verification by Section Inspector."
    }
  ];
}

export function generateSeedFundTransactions(): FundTransaction[] {
  return [
    {
      id: "ft-101",
      date: "2026-08-01",
      transactionId: "TXN-LEDGER-001",
      type: "CREDIT",
      category: "CONTRIBUTION",
      description: "Monthly Salary Deduction Bulk Subscription Credit (August 2026)",
      amount: 450000,
      balanceAfter: 14850000,
      referenceNo: "TREASURY-CHQ-9812",
      createdBy: "Sri Ashutosh Swain (Treasurer)"
    },
    {
      id: "ft-102",
      date: "2026-07-14",
      transactionId: "TXN-LEDGER-002",
      type: "DEBIT",
      category: "WELFARE_DISBURSED",
      description: "Medical Welfare Disbursement to Sri Sanjib Kumar Rout (HCEA-2026-0008)",
      amount: 75000,
      balanceAfter: 14400000,
      referenceNo: "CMS-NEFT-982103",
      createdBy: "Sri Ashutosh Swain (Treasurer)"
    },
    {
      id: "ft-103",
      date: "2026-07-05",
      transactionId: "TXN-LEDGER-003",
      type: "CREDIT",
      category: "DONATION",
      description: "Voluntary Contribution from Senior Advocates & Office Bearers",
      amount: 150000,
      balanceAfter: 14475000,
      referenceNo: "NEFT-DON-8812",
      createdBy: "Sri Ashutosh Swain (Treasurer)"
    },
    {
      id: "ft-104",
      date: "2026-06-20",
      transactionId: "TXN-LEDGER-004",
      type: "DEBIT",
      category: "EVENT_EXPENSE",
      description: "Annual High Court Staff Badminton Tournament & Cultural Day Expenses",
      amount: 85000,
      balanceAfter: 14325000,
      referenceNo: "BILL-2026-441",
      createdBy: "Sri Manoranjan Patnaik (Gen Secretary)"
    }
  ];
}

export const initialNotices: Notice[] = [
  {
    id: "not-1",
    title: "Annual General Body Meeting (AGBM 2026) Schedule & Agenda Notice",
    category: "CIRCULAR",
    description: "Notice regarding the upcoming Annual General Body Meeting scheduled at the High Court Auditorium.",
    content: "Notice is hereby given that the 48th Annual General Body Meeting (AGBM) of the High Court Employees' Association will be held on Saturday, 29th August 2026 at 3:30 PM in the New High Court Auditorium.\n\nAgenda:\n1. Confirmation of Previous AGM Minutes\n2. Presentation of Annual Activity Report 2025-26 by General Secretary\n3. Audited Financial Statement & Welfare Corpus Report by Treasurer\n4. Resolution on Group Medical Insurance Expansion\n5. Election Schedule for Term 2026-28.",
    date: "2026-08-05",
    publishedBy: "General Secretary",
    visibility: "PUBLIC",
    isImportant: true
  },
  {
    id: "not-2",
    title: "Enhanced Health Insurance Reimbursement & Emergency Medical Welfare Scheme",
    category: "WELFARE",
    description: "Revised limits for emergency medical assistance and cashless empaneled hospital list.",
    content: "The Executive Committee in its meeting dated 1st August 2026 has enhanced the instant emergency medical welfare grant from ₹50,000 to ₹1,00,000 for critical surgeries. Members are requested to submit applications along with original discharge summaries.",
    date: "2026-08-02",
    publishedBy: "President, HCEA",
    visibility: "MEMBERS_ONLY",
    isImportant: true
  },
  {
    id: "not-3",
    title: "Distribution of New Smart Digital Membership Cards & Barcode Scanners",
    category: "GENERAL",
    description: "Members can download their verified digital ID cards or request physical cards at the HCEA Office.",
    content: "All active members can now access their official High Court Employees' Association Digital ID Cards via the Member Portal. Physical card printing is available at Block A Room 104.",
    date: "2026-07-28",
    publishedBy: "IT Cell Head",
    visibility: "PUBLIC",
    isImportant: false
  }
];

export const initialEvents: EventItem[] = [
  {
    id: "evt-1",
    title: "Annual High Court Judicial Staff Badminton & Chess Championship 2026",
    date: "2026-08-22",
    time: "09:00 AM - 05:00 PM",
    venue: "High Court Officers' Club & Indoor Sports Complex",
    description: "Inter-departmental badminton singles/doubles and chess tournament. Cash prizes and trophies for winners.",
    image: "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=800&q=80",
    registrationStatus: "OPEN",
    totalRegistered: 48,
    maxCapacity: 100,
    registrationDeadline: "2026-08-18",
    category: "SPORTS"
  },
  {
    id: "evt-2",
    title: "Special Workshop on AI & Digital Case Workflow Management in High Courts",
    date: "2026-09-05",
    time: "10:30 AM - 01:30 PM",
    venue: "Conference Hall 2, Judicial Academy",
    description: "Training seminar for Section Officers and Court Masters on e-Filing 3.0, digital cause lists, and speech-to-text tools.",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
    registrationStatus: "OPEN",
    totalRegistered: 85,
    maxCapacity: 120,
    registrationDeadline: "2026-09-01",
    category: "WORKSHOP"
  },
  {
    id: "evt-3",
    title: "HCEA Foundation Day & Cultural Evening Celebration",
    date: "2026-09-18",
    time: "05:00 PM - 09:00 PM",
    venue: "High Court Main Lawn",
    description: "Celebration of 48 years of service, honoring retired court staff, cultural performances by court staff families, and gala dinner.",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
    registrationStatus: "OPEN",
    totalRegistered: 210,
    maxCapacity: 500,
    registrationDeadline: "2026-09-12",
    category: "CULTURAL"
  }
];

export const initialGallery: GalleryItem[] = [
  {
    id: "gal-1",
    title: "High Court Staff Welfare Health Camp 2026",
    category: "WELFARE",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
    date: "2026-06-15",
    description: "Free comprehensive health checkup camp organized in collaboration with AIIMS."
  },
  {
    id: "gal-2",
    title: "Felicitation of Outstanding Children of Court Employees",
    category: "EVENTS",
    imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
    date: "2026-05-20",
    description: "Honoring 10th and 12th board exam toppers with merit scholarship certificates."
  },
  {
    id: "gal-3",
    title: "High Court Administrative Wing General Assembly",
    category: "MEETINGS",
    imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
    date: "2026-04-10",
    description: "Executive discussion on staff pay matrix anomalies and promotions."
  },
  {
    id: "gal-4",
    title: "Annual Sports Day Championship Finals",
    category: "SOCIAL",
    imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
    date: "2026-02-28",
    description: "Winners receiving trophies from the Chief Justice during sports prize distribution."
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: "aud-1",
    userId: "mem-1",
    userName: "Sri Rajeshwar Prasad Sharma",
    role: "PRESIDENT",
    action: "MEMBERSHIP_APPROVED",
    details: "Approved membership application for Sri Sanjib Kumar Rout (HCEA-2026-0008)",
    timestamp: "2026-08-11 08:20:12",
    ipAddress: "10.20.104.12"
  },
  {
    id: "aud-2",
    userId: "mem-5",
    userName: "Sri Ashutosh Swain",
    role: "TREASURER",
    action: "WELFARE_GRANT_DISBURSED",
    details: "Disbursed ₹75,000 medical assistance grant to member HCEA-2026-0008",
    timestamp: "2026-08-10 14:15:00",
    ipAddress: "10.20.104.18"
  },
  {
    id: "aud-3",
    userId: "mem-3",
    userName: "Sri Manoranjan Patnaik",
    role: "SECRETARY",
    action: "NOTICE_PUBLISHED",
    details: "Published notice 'AGBM 2026 Schedule & Agenda Notice'",
    timestamp: "2026-08-05 11:30:45",
    ipAddress: "10.20.104.15"
  }
];
