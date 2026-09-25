import { pool, query } from './db';
import bcrypt from 'bcryptjs';
import {
  initialSettings,
  initialOfficeBearers,
  generateSeedMembers,
  generateSeedContributions,
  generateSeedWelfareApplications,
  generateSeedFundTransactions,
  initialNotices,
  initialEvents,
  initialGallery,
  initialAuditLogs
} from '../data/seedData';

export async function createTables(): Promise<void> {
  console.log("Creating database tables if not exist...");

  await query(`
    CREATE TABLE IF NOT EXISTS association_settings (
      id INT PRIMARY KEY DEFAULT 1,
      name TEXT NOT NULL,
      short_name TEXT NOT NULL,
      emblem_url TEXT,
      tagline TEXT,
      hero_title TEXT,
      hero_subtitle TEXT,
      address TEXT,
      phone TEXT,
      email TEXT,
      office_hours TEXT,
      high_court_location TEXT,
      mission TEXT,
      vision TEXT,
      about_text TEXT,
      welfare_rules TEXT,
      stats JSONB DEFAULT '{}'::jsonb
    );

    CREATE TABLE IF NOT EXISTS office_bearers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      designation TEXT NOT NULL,
      court_role TEXT,
      short_bio TEXT,
      photo TEXT,
      priority INT DEFAULT 0,
      phone TEXT,
      email TEXT,
      term TEXT
    );

    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL DEFAULT 'MEMBER',
      membership_id TEXT UNIQUE NOT NULL,
      employee_code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      avatar_url TEXT,
      designation TEXT NOT NULL,
      department TEXT NOT NULL,
      posting_location TEXT NOT NULL,
      dob TEXT NOT NULL,
      mobile TEXT NOT NULL,
      blood_group TEXT NOT NULL,
      address TEXT NOT NULL,
      date_of_joining TEXT NOT NULL,
      employee_category TEXT NOT NULL,
      membership_type TEXT NOT NULL,
      membership_date TEXT NOT NULL,
      monthly_contribution NUMERIC NOT NULL DEFAULT 500,
      status TEXT NOT NULL DEFAULT 'PENDING',
      verified_by TEXT,
      verified_at TEXT,
      rejection_reason TEXT,
      documents JSONB DEFAULT '[]'::jsonb,
      emergency_contact TEXT,
      password TEXT DEFAULT 'OHCEA123',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contributions (
      id TEXT PRIMARY KEY,
      member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
      member_name TEXT NOT NULL,
      membership_number TEXT NOT NULL,
      receipt_no TEXT UNIQUE NOT NULL,
      amount NUMERIC NOT NULL,
      purpose TEXT NOT NULL,
      payment_mode TEXT NOT NULL,
      transaction_id TEXT NOT NULL,
      status TEXT NOT NULL,
      date TEXT NOT NULL,
      financial_year TEXT NOT NULL,
      remarks TEXT
    );

    CREATE TABLE IF NOT EXISTS welfare_applications (
      id TEXT PRIMARY KEY,
      member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
      member_name TEXT NOT NULL,
      membership_number TEXT NOT NULL,
      type TEXT NOT NULL,
      amount_requested NUMERIC NOT NULL,
      amount_approved NUMERIC,
      reason TEXT,
      description TEXT NOT NULL,
      status TEXT NOT NULL,
      bank_details JSONB,
      supporting_docs JSONB DEFAULT '[]'::jsonb,
      submitted_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      review_notes TEXT,
      disbursed_date TEXT,
      disbursed_txn_ref TEXT
    );

    CREATE TABLE IF NOT EXISTS fund_transactions (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      transaction_id TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      amount NUMERIC NOT NULL,
      balance_after NUMERIC NOT NULL,
      reference_no TEXT NOT NULL,
      created_by TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notices (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      content TEXT NOT NULL,
      attachment_url TEXT,
      date TEXT NOT NULL,
      published_by TEXT NOT NULL,
      visibility TEXT NOT NULL DEFAULT 'PUBLIC',
      is_important BOOLEAN DEFAULT false
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      venue TEXT NOT NULL,
      description TEXT NOT NULL,
      image TEXT,
      registration_status TEXT NOT NULL DEFAULT 'OPEN',
      total_registered INT DEFAULT 0,
      max_capacity INT DEFAULT 100,
      registration_deadline TEXT NOT NULL,
      category TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS event_registrations (
      id TEXT PRIMARY KEY,
      event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
      member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
      member_name TEXT NOT NULL,
      membership_number TEXT NOT NULL,
      registered_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS gallery (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      image_url TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_name TEXT NOT NULL,
      role TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      ip_address TEXT
    );

    CREATE TABLE IF NOT EXISTS app_notifications (
      id TEXT PRIMARY KEY,
      member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      date TEXT NOT NULL,
      read BOOLEAN DEFAULT false,
      type TEXT NOT NULL
    );

    -- Ensure password column exists on members table with default 'ohcea123'
    ALTER TABLE members ADD COLUMN IF NOT EXISTS password TEXT DEFAULT 'ohcea123';
    UPDATE members SET password = 'ohcea123' WHERE password IS NULL;
    ALTER TABLE members ADD COLUMN IF NOT EXISTS gender TEXT;
    ALTER TABLE members ADD COLUMN IF NOT EXISTS cadre TEXT;
    ALTER TABLE members ADD COLUMN IF NOT EXISTS user_id TEXT;

    -- Admin accounts table (separate from member table)
    CREATE TABLE IF NOT EXISTS admin_accounts (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL DEFAULT 'System Administrator',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("All tables checked/created successfully and migrations applied.");
}

/**
 * Seeds the admin account (username: admin, password: admin) if it doesn't exist.
 * The password is bcrypt-hashed with 12 rounds.
 * Admin can change their password later via the Admin Dashboard.
 */
export async function seedAdminAccount(): Promise<void> {
  const existing = await query(`SELECT id FROM admin_accounts WHERE username = 'admin'`);
  if (existing.length > 0) {
    console.log('Admin account already exists. Skipping admin seed.');
    return;
  }
  const passwordHash = await bcrypt.hash('admin', 12);
  await query(
    `INSERT INTO admin_accounts (id, username, password_hash, display_name)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (username) DO NOTHING`,
    ['admin-001', 'admin', passwordHash, 'System Administrator']
  );
  console.log("Admin account created: username='admin', password='admin' (bcrypt hashed).");
}

export async function seedDatabase(force: boolean = false): Promise<void> {
  const memberCountRes = await query<{ count: string }>('SELECT count(*) as count FROM members');
  const count = parseInt(memberCountRes[0]?.count || '0', 10);

  if (count > 0 && !force) {
    console.log(`Database already contains ${count} members. Skipping seed.`);
    return;
  }

  console.log("Seeding database with required initial data...");

  // 1. Settings
  await query(`
    INSERT INTO association_settings (
      id, name, short_name, emblem_url, tagline, hero_title, hero_subtitle,
      address, phone, email, office_hours, high_court_location, mission,
      vision, about_text, welfare_rules, stats
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      short_name = EXCLUDED.short_name,
      emblem_url = EXCLUDED.emblem_url,
      tagline = EXCLUDED.tagline,
      hero_title = EXCLUDED.hero_title,
      hero_subtitle = EXCLUDED.hero_subtitle,
      address = EXCLUDED.address,
      phone = EXCLUDED.phone,
      email = EXCLUDED.email,
      office_hours = EXCLUDED.office_hours,
      high_court_location = EXCLUDED.high_court_location,
      mission = EXCLUDED.mission,
      vision = EXCLUDED.vision,
      about_text = EXCLUDED.about_text,
      welfare_rules = EXCLUDED.welfare_rules,
      stats = EXCLUDED.stats;
  `, [
    1,
    initialSettings.name,
    initialSettings.shortName,
    initialSettings.emblemUrl,
    initialSettings.tagline,
    initialSettings.heroTitle,
    initialSettings.heroSubtitle,
    initialSettings.address,
    initialSettings.phone,
    initialSettings.email,
    initialSettings.officeHours,
    initialSettings.highCourtLocation,
    initialSettings.mission,
    initialSettings.vision,
    initialSettings.aboutText,
    initialSettings.welfareRules,
    JSON.stringify(initialSettings.stats)
  ]);

  // 2. Office Bearers
  for (const ob of initialOfficeBearers) {
    await query(`
      INSERT INTO office_bearers (id, name, designation, court_role, short_bio, photo, priority, phone, email, term)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        designation = EXCLUDED.designation,
        court_role = EXCLUDED.court_role,
        short_bio = EXCLUDED.short_bio,
        photo = EXCLUDED.photo,
        priority = EXCLUDED.priority,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        term = EXCLUDED.term;
    `, [ob.id, ob.name, ob.designation, ob.courtRole, ob.shortBio, ob.photo, ob.priority, ob.phone, ob.email, ob.term]);
  }

  // 3. Members
  const seedMembers = generateSeedMembers();
  for (const m of seedMembers) {
    await query(`
      INSERT INTO members (
        id, email, role, membership_id, employee_code, name, avatar_url,
        designation, department, posting_location, dob, mobile, blood_group,
        address, date_of_joining, employee_category, membership_type,
        membership_date, monthly_contribution, status, verified_by, verified_at,
        rejection_reason, documents, emergency_contact
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25
      )
      ON CONFLICT (id) DO NOTHING;
    `, [
      m.id, m.email, m.role, m.membershipId, m.employeeCode, m.name, m.avatarUrl,
      m.designation, m.department, m.postingLocation, m.dob, m.mobile, m.bloodGroup,
      m.address, m.dateOfJoining, m.employeeCategory, m.membershipType,
      m.membershipDate, m.monthlyContribution, m.status, m.verifiedBy || null, m.verifiedAt || null,
      m.rejectionReason || null, JSON.stringify(m.documents || []), m.emergencyContact || null
    ]);
  }

  // 4. Contributions
  const seedContributions = generateSeedContributions(seedMembers);
  for (const c of seedContributions) {
    await query(`
      INSERT INTO contributions (
        id, member_id, member_name, membership_number, receipt_no,
        amount, purpose, payment_mode, transaction_id, status, date,
        financial_year, remarks
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (id) DO NOTHING;
    `, [
      c.id, c.memberId, c.memberName, c.membershipNumber, c.receiptNo,
      c.amount, c.purpose, c.paymentMode, c.transactionId, c.status, c.date,
      c.financialYear, c.remarks || null
    ]);
  }

  // 5. Welfare Applications
  const seedWelfare = generateSeedWelfareApplications();
  for (const w of seedWelfare) {
    await query(`
      INSERT INTO welfare_applications (
        id, member_id, member_name, membership_number, type,
        amount_requested, amount_approved, reason, description, status,
        bank_details, supporting_docs, submitted_at, updated_at, review_notes,
        disbursed_date, disbursed_txn_ref
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      ON CONFLICT (id) DO NOTHING;
    `, [
      w.id, w.memberId, w.memberName, w.membershipNumber, w.type,
      w.amountRequested, w.amountApproved || null, w.reason || null, w.description, w.status,
      JSON.stringify(w.bankDetails || {}), JSON.stringify(w.supportingDocs || []),
      w.submittedAt, w.updatedAt, w.reviewNotes || null, w.disbursedDate || null, w.disbursedTxnRef || null
    ]);
  }

  // 6. Fund Transactions
  const seedFunds = generateSeedFundTransactions();
  for (const f of seedFunds) {
    await query(`
      INSERT INTO fund_transactions (
        id, date, transaction_id, type, category, description,
        amount, balance_after, reference_no, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO NOTHING;
    `, [f.id, f.date, f.transactionId, f.type, f.category, f.description, f.amount, f.balanceAfter, f.referenceNo, f.createdBy]);
  }

  // 7. Notices
  for (const n of initialNotices) {
    await query(`
      INSERT INTO notices (
        id, title, category, description, content, attachment_url, date, published_by, visibility, is_important
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO NOTHING;
    `, [n.id, n.title, n.category, n.description, n.content, n.attachmentUrl || null, n.date, n.publishedBy, n.visibility, n.isImportant || false]);
  }

  // 8. Events
  for (const e of initialEvents) {
    await query(`
      INSERT INTO events (
        id, title, date, time, venue, description, image, registration_status, total_registered, max_capacity, registration_deadline, category
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (id) DO NOTHING;
    `, [e.id, e.title, e.date, e.time, e.venue, e.description, e.image, e.registrationStatus, e.totalRegistered, e.maxCapacity, e.registrationDeadline, e.category]);
  }

  // 9. Gallery
  for (const g of initialGallery) {
    await query(`
      INSERT INTO gallery (id, title, category, image_url, date, description)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO NOTHING;
    `, [g.id, g.title, g.category, g.imageUrl, g.date, (g as any).description || null]);
  }

  // 10. Audit Logs
  for (const a of initialAuditLogs) {
    await query(`
      INSERT INTO audit_logs (id, user_id, user_name, role, action, details, timestamp, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO NOTHING;
    `, [a.id, a.userId || null, a.userName, a.role, a.action, a.details, a.timestamp, a.ipAddress || null]);
  }

  // 11. Initial Notifications
  const initialNotifications = [
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

  for (const notif of initialNotifications) {
    await query(`
      INSERT INTO app_notifications (id, member_id, title, message, date, read, type)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO NOTHING;
    `, [notif.id, notif.memberId, notif.title, notif.message, notif.date, notif.read, notif.type]);
  }

  console.log("Database successfully seeded with all initial data!");
}

export async function initDb(): Promise<void> {
  await createTables();
  await seedDatabase();
}

// If run directly via node/tsx
if (process.argv[1]?.endsWith('initDb.ts') || process.argv[1]?.endsWith('initDb.js')) {
  initDb()
    .then(() => {
      console.log("Database initialization finished.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Database initialization failed:", err);
      process.exit(1);
    });
}
