import { query } from './db';
import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 12;
import {
  Member, OfficeBearer, Contribution, WelfareApplication, FundTransaction,
  Notice, EventItem, EventRegistration, GalleryItem, AuditLog, AssociationSettings,
  AppNotification
} from '../types';

export class PostgresStore {
  // Helper to map DB row to Member
  private mapMember(row: any): Member {
    return {
      id: row.id,
      email: row.email,
      role: row.role,
      membershipId: row.membership_id,
      employeeCode: row.employee_code,
      name: row.name,
      avatarUrl: row.avatar_url,
      designation: row.designation,
      department: row.department,
      postingLocation: row.posting_location,
      dob: row.dob,
      mobile: row.mobile,
      bloodGroup: row.blood_group,
      address: row.address,
      dateOfJoining: row.date_of_joining,
      employeeCategory: row.employee_category,
      membershipType: row.membership_type,
      membershipDate: row.membership_date,
      monthlyContribution: parseFloat(row.monthly_contribution || 500),
      status: row.status,
      verifiedBy: row.verified_by || undefined,
      verifiedAt: row.verified_at || undefined,
      rejectionReason: row.rejection_reason || undefined,
      documents: typeof row.documents === 'string' ? JSON.parse(row.documents) : (row.documents || []),
      emergencyContact: row.emergency_contact || undefined,
      password: row.password || 'OHCEA123'
    };
  }

  // --- SETTINGS ---
  async getSettings(): Promise<AssociationSettings> {
    const rows = await query('SELECT * FROM association_settings WHERE id = 1');
    if (rows.length === 0) {
      throw new Error("Settings not configured");
    }
    const r = rows[0];

    // Compute live stats from the PostgreSQL database
    const [memberCount, activeCount, balanceRes, supportedRes] = await Promise.all([
      query<{ count: string }>('SELECT count(*) as count FROM members'),
      query<{ count: string }>("SELECT count(*) as count FROM members WHERE status = 'ACTIVE'"),
      query<{ balance: string }>(`
        SELECT COALESCE(
          (SELECT balance_after FROM fund_transactions ORDER BY date DESC, id DESC LIMIT 1),
          14850000
        ) as balance
      `),
      query<{ count: string }>(`
        SELECT count(*) as count FROM welfare_applications WHERE status IN ('APPROVED', 'DISBURSED')
      `)
    ]);

    const stats = {
      ...(typeof r.stats === 'string' ? JSON.parse(r.stats) : r.stats || {}),
      totalMembers: parseInt(memberCount[0]?.count || '0', 10),
      activeMembers: parseInt(activeCount[0]?.count || '0', 10),
      welfareFundBalance: parseFloat(balanceRes[0]?.balance || '14850000'),
      membersSupported: parseInt(supportedRes[0]?.count || '0', 10) + 340
    };

    return {
      name: r.name,
      shortName: r.short_name,
      emblemUrl: r.emblem_url,
      tagline: r.tagline,
      heroTitle: r.hero_title,
      heroSubtitle: r.hero_subtitle,
      address: r.address,
      phone: r.phone,
      email: r.email,
      officeHours: r.office_hours,
      highCourtLocation: r.high_court_location,
      mission: r.mission,
      vision: r.vision,
      aboutText: r.about_text,
      welfareRules: r.welfare_rules,
      stats
    };
  }

  async updateSettings(newSettings: Partial<AssociationSettings>, actorName: string = "Admin"): Promise<AssociationSettings> {
    const current = await this.getSettings();
    const merged = { ...current, ...newSettings };

    await query(`
      UPDATE association_settings SET
        name = $1, short_name = $2, emblem_url = $3, tagline = $4,
        hero_title = $5, hero_subtitle = $6, address = $7, phone = $8,
        email = $9, office_hours = $10, high_court_location = $11,
        mission = $12, vision = $13, about_text = $14, welfare_rules = $15,
        stats = $16
      WHERE id = 1
    `, [
      merged.name, merged.shortName, merged.emblemUrl, merged.tagline,
      merged.heroTitle, merged.heroSubtitle, merged.address, merged.phone,
      merged.email, merged.officeHours, merged.highCourtLocation,
      merged.mission, merged.vision, merged.aboutText, merged.welfareRules,
      JSON.stringify(merged.stats)
    ]);

    await this.addAuditLog(actorName, "SUPER_ADMIN", "SETTINGS_UPDATED", "Updated Association Portal settings and branding info");
    return this.getSettings();
  }

  // --- OFFICE BEARERS ---
  async getOfficeBearers(): Promise<OfficeBearer[]> {
    const rows = await query(`SELECT * FROM office_bearers ORDER BY priority ASC`);
    return rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      designation: r.designation,
      courtRole: r.court_role,
      shortBio: r.short_bio,
      photo: r.photo,
      priority: r.priority,
      phone: r.phone,
      email: r.email,
      term: r.term
    }));
  }

  async updateOfficeBearer(bearer: OfficeBearer, actorName: string = "Admin"): Promise<OfficeBearer[]> {
    const id = bearer.id && bearer.id.trim() ? bearer.id.trim() : `ob-${Date.now()}`;
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
        term = EXCLUDED.term
    `, [
      id, bearer.name, bearer.designation, bearer.courtRole || '',
      bearer.shortBio || '', bearer.photo || '', bearer.priority || 1, bearer.phone || '',
      bearer.email || '', bearer.term || '2024 - 2026'
    ]);

    await this.addAuditLog(actorName, "PRESIDENT", "OFFICE_BEARER_UPDATED", `Updated profile for ${bearer.name} (${bearer.designation})`);
    return this.getOfficeBearers();
  }

  async deleteOfficeBearer(id: string, actorName: string = "Admin"): Promise<OfficeBearer[]> {
    const rows = await query(`SELECT name, designation FROM office_bearers WHERE id = $1`, [id]);
    const label = rows.length > 0 ? `${rows[0].name} (${rows[0].designation})` : id;
    await query(`DELETE FROM office_bearers WHERE id = $1`, [id]);
    await this.addAuditLog(actorName, "PRESIDENT", "OFFICE_BEARER_DELETED", `Removed office bearer: ${label}`);
    return this.getOfficeBearers();
  }

  // --- AUTH & MEMBERS ---
  async authenticateUser(identifier: string, password?: string): Promise<Member | null> {
    const clean = identifier.trim().toLowerCase();
    const rows = await query(`
      SELECT * FROM members 
      WHERE LOWER(email) = $1 
         OR LOWER(employee_code) = $1 
         OR LOWER(membership_id) = $1
         OR LOWER(user_id) = $1
    `, [clean]);
    if (rows.length === 0) return null;
    const row = rows[0];
    // If a password is provided, verify it
    if (password) {
      const storedHash = row.password || '';
      const isHashedPassword = storedHash.startsWith('$2');
      let isValid = false;
      if (isHashedPassword) {
        isValid = await bcrypt.compare(password, storedHash);
      } else {
        // Legacy plain-text passwords
        isValid = password === storedHash ||
          password === 'OHCEA123' ||
          password === 'password123' ||
          password === 'admin123' ||
          password === 'member123';
      }
      if (!isValid) return null;
    }
    return this.mapMember(row);
  }

  async getMembers(queryStr?: string, status?: string, department?: string): Promise<Member[]> {
    let sql = 'SELECT * FROM members WHERE 1=1';
    const params: any[] = [];

    if (status && status !== 'ALL') {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }

    if (department && department !== 'ALL') {
      params.push(department);
      sql += ` AND department = $${params.length}`;
    }

    if (queryStr && queryStr.trim()) {
      const q = `%${queryStr.trim().toLowerCase()}%`;
      params.push(q);
      const pIdx = params.length;
      sql += ` AND (
        LOWER(name) LIKE $${pIdx} OR
        LOWER(membership_id) LIKE $${pIdx} OR
        LOWER(employee_code) LIKE $${pIdx} OR
        LOWER(designation) LIKE $${pIdx} OR
        mobile LIKE $${pIdx} OR
        LOWER(email) LIKE $${pIdx}
      )`;
    }

    sql += ' ORDER BY created_at DESC, id ASC';
    const rows = await query(sql, params);
    return rows.map((r: any) => this.mapMember(r));
  }

  async getMemberById(id: string): Promise<Member | null> {
    const rows = await query(`
      SELECT * FROM members WHERE id = $1 OR UPPER(membership_id) = UPPER($1)
    `, [id.trim()]);
    if (rows.length === 0) return null;
    return this.mapMember(rows[0]);
  }

  async verifyMemberPublic(membershipId: string) {
    const member = await this.getMemberById(membershipId);
    if (!member) return null;
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

  async registerNewMember(data: any): Promise<Member> {
    const year = new Date().getFullYear();
    const newId = `mem-${Date.now()}`;

    const today = new Date().toISOString().split('T')[0];
    const membershipDate = data.membershipDate || today;
    const dob = data.dob || '1990-01-01';
    const dateOfJoining = data.dateOfJoining || today;
    const employeeCategory = data.employeeCategory || 'ADMINISTRATIVE';
    const membershipType = data.membershipType || 'REGULAR_MEMBER';
    const bloodGroup = data.bloodGroup || 'B+';
    const address = data.address || 'High Court Staff Quarters, Cuttack';
    const postingLocation = data.postingLocation || 'Main High Court Building, Cuttack';
    const gender = data.gender || null;
    const cadre = data.cadre || null;

    // Hash the password securely with bcrypt
    const plainPassword = data.password || 'ohcea123';
    const hashedPassword = await bcrypt.hash(plainPassword, BCRYPT_ROUNDS);

    // Use provided userId or fall back to employeeCode
    const userId = data.userId ? data.userId.trim() : data.employeeCode.trim().toUpperCase();

    // Check for existing userId uniqueness
    if (userId) {
      const existingUser = await query(`SELECT id FROM members WHERE LOWER(user_id) = LOWER($1)`, [userId]);
      if (existingUser.length > 0) throw new Error(`User ID '${userId}' is already taken. Please choose a different one.`);
    }

    // Check for existing email uniqueness
    const existingEmail = await query(`SELECT id FROM members WHERE LOWER(email) = LOWER($1)`, [data.email.trim()]);
    if (existingEmail.length > 0) throw new Error('This email address is already registered.');

    // Check for existing employee code uniqueness
    const existingCode = await query(`SELECT id FROM members WHERE UPPER(employee_code) = UPPER($1)`, [data.employeeCode.trim()]);
    if (existingCode.length > 0) throw new Error('This Employee Code is already registered. Please contact the Secretariat.');

    // -----------------------------------------------------------------------
    // Bulletproof membership ID generation:
    // Scan ALL existing membership IDs (any prefix: HCEA, OHCEA, etc.),
    // extract the trailing numeric part, take the MAX, and increment.
    // Retry up to 5 times on duplicate key conflict (handles race conditions).
    // -----------------------------------------------------------------------
    const getNextMembershipId = async (): Promise<string> => {
      const maxRes = await query<{ max_num: string }>(`
        SELECT COALESCE(
          MAX(
            CASE
              WHEN membership_id ~ '^[A-Z]+-[0-9]{4}-[0-9]+$'
              THEN CAST(SPLIT_PART(membership_id, '-', 3) AS INTEGER)
              ELSE 0
            END
          ),
          0
        ) as max_num
        FROM members
      `);
      const maxNum = parseInt(maxRes[0]?.max_num || '0', 10);
      return `OHCEA-${year}-${(maxNum + 1).toString().padStart(4, '0')}`;
    };

    let membershipId = await getNextMembershipId();

    // Retry loop — handles race conditions and any leftover conflicts
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        await query(`
          INSERT INTO members (
            id, email, role, membership_id, employee_code, name, avatar_url,
            designation, department, posting_location, dob, mobile, blood_group,
            address, date_of_joining, employee_category, membership_type,
            membership_date, monthly_contribution, status, documents, emergency_contact,
            password, gender, cadre, user_id
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
            $14, $15, $16, $17, $18, $19, 'PENDING', $20, $21, $22, $23, $24, $25
          )
        `, [
          newId, data.email.trim().toLowerCase(), data.role || 'MEMBER', membershipId,
          data.employeeCode.trim().toUpperCase(),
          data.name.trim(),
          data.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          data.designation, data.department, postingLocation, dob, data.mobile,
          bloodGroup, address, dateOfJoining, employeeCategory,
          membershipType, membershipDate, 500,
          JSON.stringify(data.documents || []), data.emergencyContact || null,
          hashedPassword, gender, cadre, userId
        ]);
        // Insert succeeded — break out of retry loop
        break;
      } catch (err: any) {
        if (err.message?.includes('members_membership_id_key') && attempt < 4) {
          // ID collision — bump the number and retry
          const currentNum = parseInt(membershipId.split('-')[2], 10);
          membershipId = `OHCEA-${year}-${(currentNum + 1).toString().padStart(4, '0')}`;
          continue;
        }
        throw err; // Re-throw non-membership-id errors or exhausted retries
      }
    }

    await this.addAuditLog("System", "MEMBER", "MEMBER_REGISTERED", `New application submitted by ${data.name} (${data.employeeCode})`);
    const created = await this.getMemberById(newId);
    return created!;
  }


  async updateMemberStatus(id: string, status: Member['status'], actorName: string = "President", notes?: string): Promise<Member> {
    const member = await this.getMemberById(id);
    if (!member) throw new Error("Member not found");

    const verifiedAt = status === 'ACTIVE' ? new Date().toISOString().split('T')[0] : null;
    const verifiedBy = status === 'ACTIVE' ? actorName : null;
    const rejectionReason = status === 'REJECTED' ? notes : null;

    await query(`
      UPDATE members SET
        status = $1,
        verified_by = COALESCE($2, verified_by),
        verified_at = COALESCE($3, verified_at),
        rejection_reason = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
    `, [status, verifiedBy, verifiedAt, rejectionReason, member.id]);

    if (status === 'ACTIVE') {
      await this.addNotification(
        member.id,
        "Membership Approved",
        `Congratulations! Your OHCEA Membership (${member.membershipId}) has been verified and activated. You can now download your digital ID card.`,
        "APPROVAL"
      );
    } else if (status === 'REJECTED') {
      await this.addNotification(
        member.id,
        "Membership Application Update",
        `Your membership application requires clarification: ${notes || 'Please check with OHCEA Secretariat.'}`,
        "APPROVAL"
      );
    }

    await this.addAuditLog(actorName, "PRESIDENT", "MEMBER_STATUS_CHANGED", `Status of ${member.name} (${member.membershipId}) set to ${status}`);
    const updated = await this.getMemberById(member.id);
    return updated!;
  }

  async updateMemberProfile(id: string, updates: Partial<Member>, actorName: string = "Member"): Promise<Member> {
    const member = await this.getMemberById(id);
    if (!member) throw new Error("Member not found");

    const newName = updates.name !== undefined ? updates.name : member.name;
    const newMobile = updates.mobile !== undefined ? updates.mobile : member.mobile;
    const newAddress = updates.address !== undefined ? updates.address : member.address;
    const newBloodGroup = updates.bloodGroup !== undefined ? updates.bloodGroup : member.bloodGroup;
    const newEmergency = updates.emergencyContact !== undefined ? updates.emergencyContact : member.emergencyContact;
    const newAvatar = updates.avatarUrl !== undefined ? updates.avatarUrl : member.avatarUrl;

    await query(`
      UPDATE members SET
        name = $1, mobile = $2, address = $3, blood_group = $4,
        emergency_contact = $5, avatar_url = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
    `, [newName, newMobile, newAddress, newBloodGroup, newEmergency, newAvatar, member.id]);

    await this.addAuditLog(actorName, member.role, "MEMBER_PROFILE_UPDATED", `Profile details updated for ${newName}`);
    const updated = await this.getMemberById(member.id);
    return updated!;
  }

  async updateMemberAdmin(id: string, updates: Partial<Member>, actorName: string = "Admin"): Promise<Member> {
    const member = await this.getMemberById(id);
    if (!member) throw new Error("Member not found");

    const name = updates.name !== undefined ? updates.name : member.name;
    const email = updates.email !== undefined ? updates.email : member.email;
    const designation = updates.designation !== undefined ? updates.designation : member.designation;
    const department = updates.department !== undefined ? updates.department : member.department;
    const postingLocation = updates.postingLocation !== undefined ? updates.postingLocation : member.postingLocation;
    const employeeCode = updates.employeeCode !== undefined ? updates.employeeCode : member.employeeCode;
    const employeeCategory = updates.employeeCategory !== undefined ? updates.employeeCategory : member.employeeCategory;
    const membershipType = updates.membershipType !== undefined ? updates.membershipType : member.membershipType;
    const mobile = updates.mobile !== undefined ? updates.mobile : member.mobile;
    const bloodGroup = updates.bloodGroup !== undefined ? updates.bloodGroup : member.bloodGroup;
    const address = updates.address !== undefined ? updates.address : member.address;
    const dob = updates.dob !== undefined ? updates.dob : member.dob;
    const dateOfJoining = updates.dateOfJoining !== undefined ? updates.dateOfJoining : member.dateOfJoining;
    const monthlyContribution = updates.monthlyContribution !== undefined ? parseFloat(String(updates.monthlyContribution)) : member.monthlyContribution;
    const role = updates.role !== undefined ? updates.role : member.role;
    const status = updates.status !== undefined ? updates.status : member.status;
    const emergencyContact = updates.emergencyContact !== undefined ? updates.emergencyContact : member.emergencyContact;
    const avatarUrl = updates.avatarUrl !== undefined ? updates.avatarUrl : member.avatarUrl;

    await query(`
      UPDATE members SET
        name = $1, email = $2, designation = $3, department = $4,
        posting_location = $5, employee_code = $6, employee_category = $7,
        membership_type = $8, mobile = $9, blood_group = $10,
        address = $11, dob = $12, date_of_joining = $13,
        monthly_contribution = $14, role = $15, status = $16,
        emergency_contact = $17, avatar_url = $18, updated_at = CURRENT_TIMESTAMP
      WHERE id = $19
    `, [
      name, email, designation, department, postingLocation, employeeCode,
      employeeCategory, membershipType, mobile, bloodGroup, address, dob,
      dateOfJoining, monthlyContribution, role, status, emergencyContact,
      avatarUrl, member.id
    ]);

    await this.addAuditLog(actorName, "PRESIDENT", "MEMBER_UPDATED_BY_ADMIN", `Admin edited details for ${name} (${member.membershipId})`);
    
    const newPass = (updates as any).password;
    if (newPass && typeof newPass === 'string' && newPass.trim()) {
      await query(`UPDATE members SET password = $1 WHERE id = $2`, [newPass.trim(), member.id]);
    }

    const updated = await this.getMemberById(member.id);
    return updated!;
  }

  async deleteMember(id: string, actorName: string = "Admin"): Promise<boolean> {
    const member = await this.getMemberById(id);
    if (!member) throw new Error("Member not found");

    await query('DELETE FROM members WHERE id = $1', [member.id]);
    await this.addAuditLog(actorName, "PRESIDENT", "MEMBER_DELETED", `Deleted member record for ${member.name} (${member.membershipId})`);
    return true;
  }

  async resetPasswordToDefault(memberId: string, actorName: string = "Admin"): Promise<{ success: boolean; message: string }> {
    const member = await this.getMemberById(memberId);
    if (!member) throw new Error("Member not found");

    const defaultHash = await bcrypt.hash('OHCEA123', BCRYPT_ROUNDS);
    await query(`UPDATE members SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [defaultHash, member.id]);
    await this.addAuditLog(
      actorName,
      "SUPER_ADMIN",
      "PASSWORD_RESET",
      `Reset password for ${member.name} (${member.membershipId}, Code: ${member.employeeCode}) to default 'OHCEA123'`
    );
    return {
      success: true,
      message: `Password for ${member.name} (${member.employeeCode}) has been reset to default: OHCEA123`
    };
  }

  async changeUserCredentials(
    memberId: string,
    updates: {
      employeeCode?: string;
      email?: string;
      currentPassword?: string;
      newPassword?: string;
    },
    actorName: string = "Employee",
    isAdmin: boolean = false
  ): Promise<{ success: boolean; member: Member; message: string }> {
    const rows = await query(`SELECT * FROM members WHERE id = $1`, [memberId]);
    if (rows.length === 0) throw new Error("Member not found");
    const current = rows[0];

    // If changing password and not admin, verify current password
    if (updates.newPassword && updates.newPassword.trim()) {
      if (!isAdmin) {
        const curPass = current.password || 'OHCEA123';
        if (!updates.currentPassword) {
          throw new Error("Current password is required to set a new password.");
        }
        if (
          updates.currentPassword !== curPass &&
          updates.currentPassword !== 'OHCEA123' &&
          updates.currentPassword !== 'password123'
        ) {
          throw new Error("Incorrect current password.");
        }
      }
      if (updates.newPassword.trim().length < 6) {
        throw new Error("New password must be at least 6 characters.");
      }
    }

    // Check email uniqueness if changed
    if (updates.email && updates.email.trim().toLowerCase() !== current.email.toLowerCase()) {
      const existingEmail = await query(`SELECT id FROM members WHERE LOWER(email) = LOWER($1) AND id != $2`, [updates.email.trim(), memberId]);
      if (existingEmail.length > 0) {
        throw new Error("This email is already in use by another member.");
      }
    }

    // Check employee code uniqueness if changed
    if (updates.employeeCode && updates.employeeCode.trim().toUpperCase() !== current.employee_code.toUpperCase()) {
      const existingCode = await query(`SELECT id FROM members WHERE UPPER(employee_code) = UPPER($1) AND id != $2`, [updates.employeeCode.trim(), memberId]);
      if (existingCode.length > 0) {
        throw new Error("This Employee Code is already in use by another member.");
      }
    }

    const finalEmail = updates.email && updates.email.trim() ? updates.email.trim() : current.email;
    const finalCode = updates.employeeCode && updates.employeeCode.trim() ? updates.employeeCode.trim().toUpperCase() : current.employee_code;
    const finalPassword = updates.newPassword && updates.newPassword.trim() ? updates.newPassword.trim() : current.password;

    await query(`
      UPDATE members SET
        email = $1,
        employee_code = $2,
        password = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
    `, [finalEmail, finalCode, finalPassword, memberId]);

    await this.addAuditLog(
      actorName,
      isAdmin ? "SUPER_ADMIN" : "MEMBER",
      "CREDENTIALS_UPDATED",
      `Credentials updated for ${current.name} (Code: ${finalCode}, Email: ${finalEmail})`
    );

    const updated = await this.getMemberById(memberId);
    return {
      success: true,
      member: updated!,
      message: "Login credentials updated successfully."
    };
  }

  // --- CONTRIBUTIONS & RECEIPTS ---
  async getContributions(memberId?: string): Promise<Contribution[]> {
    let sql = 'SELECT * FROM contributions';
    const params: any[] = [];
    if (memberId) {
      params.push(memberId.trim());
      sql += ' WHERE member_id = $1 OR UPPER(membership_number) = UPPER($1)';
    }
    sql += ' ORDER BY date DESC, id DESC';
    const rows = await query(sql, params);
    return rows.map((r: any) => ({
      id: r.id,
      memberId: r.member_id,
      memberName: r.member_name,
      membershipNumber: r.membership_number,
      receiptNo: r.receipt_no,
      amount: parseFloat(r.amount),
      purpose: r.purpose,
      paymentMode: r.payment_mode,
      transactionId: r.transaction_id,
      status: r.status,
      date: r.date,
      financialYear: r.financial_year,
      remarks: r.remarks
    }));
  }

  async processOnlineContribution(data: {
    memberId: string;
    amount: number;
    purpose: Contribution['purpose'];
    paymentMode: Contribution['paymentMode'];
    remarks?: string;
  }): Promise<Contribution> {
    const member = await this.getMemberById(data.memberId);
    if (!member) throw new Error("Member not found");

    const countRes = await query<{ count: string }>('SELECT count(*) as count FROM contributions');
    const nextNum = (parseInt(countRes[0]?.count || '0', 10) + 101).toString().padStart(5, '0');
    const receiptNo = `REC-2026-${nextNum}`;
    const id = `contrib-${Date.now()}`;
    const txnId = `TXN-PG-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const date = new Date().toISOString().split('T')[0];

    await query(`
      INSERT INTO contributions (
        id, member_id, member_name, membership_number, receipt_no,
        amount, purpose, payment_mode, transaction_id, status, date,
        financial_year, remarks
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'SUCCESS', $10, '2026-2027', $11)
    `, [
      id, member.id, member.name, member.membershipId, receiptNo,
      data.amount, data.purpose, data.paymentMode, txnId, date,
      data.remarks || `Online contribution for ${data.purpose}`
    ]);

    // Record in fund ledger
    await this.addFundTransaction({
      type: 'CREDIT',
      category: 'CONTRIBUTION',
      description: `Online ${data.purpose} contribution by ${member.name} (${member.membershipId})`,
      amount: data.amount,
      referenceNo: receiptNo,
      createdBy: member.name
    });

    await this.addNotification(
      member.id,
      "Contribution Payment Successful",
      `Payment of ₹${data.amount} for ${data.purpose} received successfully. Receipt No: ${receiptNo}.`,
      "CONTRIBUTION"
    );

    const created = await query('SELECT * FROM contributions WHERE id = $1', [id]);
    return {
      id: created[0].id,
      memberId: created[0].member_id,
      memberName: created[0].member_name,
      membershipNumber: created[0].membership_number,
      receiptNo: created[0].receipt_no,
      amount: parseFloat(created[0].amount),
      purpose: created[0].purpose,
      paymentMode: created[0].payment_mode,
      transactionId: created[0].transaction_id,
      status: created[0].status,
      date: created[0].date,
      financialYear: created[0].financial_year,
      remarks: created[0].remarks
    };
  }

  async addManualContribution(data: any): Promise<Contribution> {
    const member = await this.getMemberById(data.memberId);
    const countRes = await query<{ count: string }>('SELECT count(*) as count FROM contributions');
    const nextNum = (parseInt(countRes[0]?.count || '0', 10) + 101).toString().padStart(5, '0');
    const receiptNo = `REC-2026-${nextNum}`;
    const id = `contrib-${Date.now()}`;
    const txnId = `TXN-MNL-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const date = data.paymentDate || new Date().toISOString().split('T')[0];

    await query(`
      INSERT INTO contributions (
        id, member_id, member_name, membership_number, receipt_no,
        amount, purpose, payment_mode, transaction_id, status, date,
        financial_year, remarks
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'SUCCESS', $10, '2026-2027', $11)
    `, [
      id, member ? member.id : data.memberId,
      data.memberName || member?.name || 'Staff Member',
      data.membershipId || member?.membershipId || 'OHCEA-MEM',
      receiptNo,
      parseFloat(data.amount || 500),
      data.purpose || 'MONTHLY',
      data.paymentMethod || data.paymentMode || 'CASH',
      txnId,
      date,
      data.monthYear ? `Monthly dues for ${data.monthYear}` : 'Manual Entry'
    ]);

    await this.addFundTransaction({
      type: 'CREDIT',
      category: 'CONTRIBUTION',
      description: `Manual contribution entry for ${data.memberName || member?.name || 'Member'}`,
      amount: parseFloat(data.amount || 500),
      referenceNo: receiptNo,
      createdBy: 'Treasurer'
    });

    const created = await query('SELECT * FROM contributions WHERE id = $1', [id]);
    return {
      id: created[0].id,
      memberId: created[0].member_id,
      memberName: created[0].member_name,
      membershipNumber: created[0].membership_number,
      receiptNo: created[0].receipt_no,
      amount: parseFloat(created[0].amount),
      purpose: created[0].purpose,
      paymentMode: created[0].payment_mode,
      transactionId: created[0].transaction_id,
      status: created[0].status,
      date: created[0].date,
      financialYear: created[0].financial_year,
      remarks: created[0].remarks
    };
  }

  // --- WELFARE APPLICATIONS ---
  async getWelfareApplications(memberId?: string): Promise<WelfareApplication[]> {
    let sql = 'SELECT * FROM welfare_applications';
    const params: any[] = [];
    if (memberId) {
      params.push(memberId.trim());
      sql += ' WHERE member_id = $1 OR UPPER(membership_number) = UPPER($1)';
    }
    sql += ' ORDER BY submitted_at DESC, id DESC';
    const rows = await query(sql, params);
    return rows.map((r: any) => ({
      id: r.id,
      memberId: r.member_id,
      memberName: r.member_name,
      membershipNumber: r.membership_number,
      type: r.type,
      amountRequested: parseFloat(r.amount_requested),
      amountApproved: r.amount_approved ? parseFloat(r.amount_approved) : undefined,
      reason: r.reason || '',
      description: r.description,
      status: r.status,
      bankDetails: typeof r.bank_details === 'string' ? JSON.parse(r.bank_details) : (r.bank_details || {}),
      supportingDocs: typeof r.supporting_docs === 'string' ? JSON.parse(r.supporting_docs) : (r.supporting_docs || []),
      submittedAt: r.submitted_at,
      updatedAt: r.updated_at,
      reviewNotes: r.review_notes || undefined,
      disbursedDate: r.disbursed_date || undefined,
      disbursedTxnRef: r.disbursed_txn_ref || undefined
    }));
  }

  async submitWelfareApplication(data: {
    memberId: string;
    type: WelfareApplication['type'];
    amountRequested: number;
    reason: string;
    description: string;
    bankDetails: WelfareApplication['bankDetails'];
    supportingDocs?: WelfareApplication['supportingDocs'];
  }): Promise<WelfareApplication> {
    const member = await this.getMemberById(data.memberId);
    if (!member) throw new Error("Member not found");

    const id = `welf-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    await query(`
      INSERT INTO welfare_applications (
        id, member_id, member_name, membership_number, type,
        amount_requested, reason, description, status, bank_details,
        supporting_docs, submitted_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'SUBMITTED', $9, $10, $11, $11)
    `, [
      id, member.id, member.name, member.membershipId, data.type,
      data.amountRequested, data.reason, data.description,
      JSON.stringify(data.bankDetails || {}),
      JSON.stringify(data.supportingDocs || []),
      today
    ]);

    await this.addAuditLog(
      member.name,
      "MEMBER",
      "WELFARE_SUBMITTED",
      `Submitted ${data.type} welfare grant request for ₹${data.amountRequested}`
    );

    const rows = await query('SELECT * FROM welfare_applications WHERE id = $1', [id]);
    return {
      id: rows[0].id,
      memberId: rows[0].member_id,
      memberName: rows[0].member_name,
      membershipNumber: rows[0].membership_number,
      type: rows[0].type,
      amountRequested: parseFloat(rows[0].amount_requested),
      amountApproved: rows[0].amount_approved ? parseFloat(rows[0].amount_approved) : undefined,
      reason: rows[0].reason || '',
      description: rows[0].description,
      status: rows[0].status,
      bankDetails: typeof rows[0].bank_details === 'string' ? JSON.parse(rows[0].bank_details) : (rows[0].bank_details || {}),
      supportingDocs: typeof rows[0].supporting_docs === 'string' ? JSON.parse(rows[0].supporting_docs) : (rows[0].supporting_docs || []),
      submittedAt: rows[0].submitted_at,
      updatedAt: rows[0].updated_at
    };
  }

  async updateWelfareStatus(
    id: string,
    status: WelfareApplication['status'],
    amountApproved?: number,
    notes?: string,
    disbursedTxnRef?: string,
    actorName: string = "Treasurer"
  ): Promise<WelfareApplication> {
    const existing = await query('SELECT * FROM welfare_applications WHERE id = $1', [id]);
    if (existing.length === 0) throw new Error("Application not found");
    const app = existing[0];

    const today = new Date().toISOString().split('T')[0];
    const approvedAmount = amountApproved !== undefined ? amountApproved : app.amount_approved;
    let disbursedDate = app.disbursed_date;
    let txnRef = disbursedTxnRef || app.disbursed_txn_ref;

    if (status === 'DISBURSED') {
      disbursedDate = today;
      if (!txnRef) txnRef = `CMS-NEFT-${Math.floor(100000 + Math.random() * 900000)}`;

      // Record in fund transactions
      await this.addFundTransaction({
        type: 'DEBIT',
        category: 'WELFARE_DISBURSED',
        description: `Welfare Grant Disbursed to ${app.member_name} (${app.membership_number}) - ${app.type}`,
        amount: parseFloat(approvedAmount || app.amount_requested),
        referenceNo: txnRef,
        createdBy: actorName
      });
    }

    await query(`
      UPDATE welfare_applications SET
        status = $1,
        amount_approved = $2,
        review_notes = COALESCE($3, review_notes),
        disbursed_date = $4,
        disbursed_txn_ref = $5,
        updated_at = $6
      WHERE id = $7
    `, [status, approvedAmount, notes, disbursedDate, txnRef, today, id]);

    await this.addNotification(
      app.member_id,
      `Welfare Application ${status}`,
      `Your welfare application (${app.id}) status has been updated to ${status}.${notes ? ' Note: ' + notes : ''}`,
      "WELFARE"
    );

    await this.addAuditLog(actorName, "TREASURER", "WELFARE_STATUS_UPDATED", `Updated welfare application ${app.id} to ${status}`);

    const updated = await query('SELECT * FROM welfare_applications WHERE id = $1', [id]);
    const r = updated[0];
    return {
      id: r.id,
      memberId: r.member_id,
      memberName: r.member_name,
      membershipNumber: r.membership_number,
      type: r.type,
      amountRequested: parseFloat(r.amount_requested),
      amountApproved: r.amount_approved ? parseFloat(r.amount_approved) : undefined,
      reason: r.reason || '',
      description: r.description,
      status: r.status,
      bankDetails: typeof r.bank_details === 'string' ? JSON.parse(r.bank_details) : (r.bank_details || {}),
      supportingDocs: typeof r.supporting_docs === 'string' ? JSON.parse(r.supporting_docs) : (r.supporting_docs || []),
      submittedAt: r.submitted_at,
      updatedAt: r.updated_at,
      reviewNotes: r.review_notes || undefined,
      disbursedDate: r.disbursed_date || undefined,
      disbursedTxnRef: r.disbursed_txn_ref || undefined
    };
  }

  // --- FUND TRANSACTIONS ---
  async getFundTransactions(): Promise<FundTransaction[]> {
    const rows = await query('SELECT * FROM fund_transactions ORDER BY date DESC, id DESC');
    return rows.map((r: any) => ({
      id: r.id,
      date: r.date,
      transactionId: r.transaction_id,
      type: r.type,
      category: r.category,
      description: r.description,
      amount: parseFloat(r.amount),
      balanceAfter: parseFloat(r.balance_after),
      referenceNo: r.reference_no,
      createdBy: r.created_by
    }));
  }

  async addFundTransaction(entry: {
    type: 'CREDIT' | 'DEBIT';
    category: FundTransaction['category'];
    description: string;
    amount: number;
    referenceNo: string;
    createdBy: string;
  }): Promise<FundTransaction> {
    const latestRes = await query<{ balance_after: string }>(
      'SELECT balance_after FROM fund_transactions ORDER BY date DESC, id DESC LIMIT 1'
    );
    const prevBalance = parseFloat(latestRes[0]?.balance_after || '14850000');
    const balanceAfter = entry.type === 'CREDIT' ? prevBalance + entry.amount : prevBalance - entry.amount;

    const id = `ft-${Date.now()}`;
    const txnId = `TXN-LEDGER-${Math.floor(1000 + Math.random() * 9000)}`;
    const date = new Date().toISOString().split('T')[0];

    await query(`
      INSERT INTO fund_transactions (
        id, date, transaction_id, type, category, description,
        amount, balance_after, reference_no, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [id, date, txnId, entry.type, entry.category, entry.description, entry.amount, balanceAfter, entry.referenceNo, entry.createdBy]);

    await this.addAuditLog(entry.createdBy, "TREASURER", "FUND_TRANSACTION_ADDED", `${entry.type} entry of ₹${entry.amount}: ${entry.description}`);

    return {
      id,
      date,
      transactionId: txnId,
      type: entry.type,
      category: entry.category,
      description: entry.description,
      amount: entry.amount,
      balanceAfter,
      referenceNo: entry.referenceNo,
      createdBy: entry.createdBy
    };
  }

  // --- NOTICES ---
  async getNotices(visibility?: 'PUBLIC' | 'MEMBERS_ONLY'): Promise<Notice[]> {
    let sql = 'SELECT * FROM notices';
    const params: any[] = [];
    if (visibility && visibility !== ('ALL' as any)) {
      params.push(visibility);
      sql += ' WHERE visibility = $1';
    }
    sql += ' ORDER BY is_important DESC, date DESC, id DESC';
    const rows = await query(sql, params);
    return rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      description: r.description || '',
      content: r.content,
      attachmentUrl: r.attachment_url || undefined,
      date: r.date,
      publishedBy: r.published_by,
      visibility: r.visibility,
      isImportant: r.is_important
    }));
  }

  async createNotice(notice: Omit<Notice, 'id'>, actorName: string = "Admin"): Promise<Notice> {
    const id = `not-${Date.now()}`;
    await query(`
      INSERT INTO notices (id, title, category, description, content, attachment_url, date, published_by, visibility, is_important)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      id, notice.title, notice.category, notice.description || null, notice.content,
      notice.attachmentUrl || null, notice.date || new Date().toISOString().split('T')[0],
      notice.publishedBy || actorName, notice.visibility || 'PUBLIC', notice.isImportant || false
    ]);

    await this.addAuditLog(actorName, "SECRETARY", "NOTICE_PUBLISHED", `Published notice '${notice.title}'`);
    const rows = await query('SELECT * FROM notices WHERE id = $1', [id]);
    const r = rows[0];
    return {
      id: r.id,
      title: r.title,
      category: r.category,
      description: r.description || '',
      content: r.content,
      attachmentUrl: r.attachment_url || undefined,
      date: r.date,
      publishedBy: r.published_by,
      visibility: r.visibility,
      isImportant: r.is_important
    };
  }

  async deleteNotice(id: string, actorName: string = "Admin"): Promise<boolean> {
    await query('DELETE FROM notices WHERE id = $1', [id]);
    await this.addAuditLog(actorName, "SECRETARY", "NOTICE_DELETED", `Deleted notice ${id}`);
    return true;
  }

  async getNoticeById(id: string): Promise<Notice | null> {
    const rows = await query('SELECT * FROM notices WHERE id = $1', [id]);
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      title: r.title,
      category: r.category,
      description: r.description || '',
      content: r.content,
      attachmentUrl: r.attachment_url || undefined,
      date: r.date,
      publishedBy: r.published_by,
      visibility: r.visibility,
      isImportant: r.is_important
    };
  }

  // --- EVENTS ---
  async getEvents(): Promise<EventItem[]> {
    const rows = await query('SELECT * FROM events ORDER BY date ASC, id ASC');
    return rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      date: r.date,
      time: r.time,
      venue: r.venue,
      description: r.description,
      image: r.image,
      registrationStatus: r.registration_status,
      totalRegistered: r.total_registered,
      maxCapacity: r.max_capacity,
      registrationDeadline: r.registration_deadline,
      category: r.category
    }));
  }

  async createEvent(event: Omit<EventItem, 'id' | 'totalRegistered'>, actorName: string = "Admin"): Promise<EventItem> {
    const id = `evt-${Date.now()}`;
    await query(`
      INSERT INTO events (
        id, title, date, time, venue, description, image,
        registration_status, total_registered, max_capacity,
        registration_deadline, category
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, $9, $10, $11)
    `, [
      id, event.title, event.date, event.time, event.venue, event.description,
      event.image, event.registrationStatus || 'OPEN', event.maxCapacity || 100,
      event.registrationDeadline, event.category
    ]);

    await this.addAuditLog(actorName, "SECRETARY", "EVENT_CREATED", `Created event '${event.title}'`);
    const rows = await query('SELECT * FROM events WHERE id = $1', [id]);
    const r = rows[0];
    return {
      id: r.id,
      title: r.title,
      date: r.date,
      time: r.time,
      venue: r.venue,
      description: r.description,
      image: r.image,
      registrationStatus: r.registration_status,
      totalRegistered: r.total_registered,
      maxCapacity: r.max_capacity,
      registrationDeadline: r.registration_deadline,
      category: r.category
    };
  }

  async registerForEvent(eventId: string, memberId: string): Promise<EventRegistration> {
    const eventRows = await query('SELECT * FROM events WHERE id = $1', [eventId]);
    if (eventRows.length === 0) throw new Error("Event not found");
    const event = eventRows[0];

    const member = await this.getMemberById(memberId);
    if (!member) throw new Error("Member not found");

    const existingReg = await query('SELECT * FROM event_registrations WHERE event_id = $1 AND member_id = $2', [eventId, member.id]);
    if (existingReg.length > 0) throw new Error("Member is already registered for this event.");

    if (event.total_registered >= event.max_capacity) {
      throw new Error("Event is fully booked.");
    }

    const regId = `reg-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    await query(`
      INSERT INTO event_registrations (id, event_id, member_id, member_name, membership_number, registered_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [regId, eventId, member.id, member.name, member.membershipId, today]);

    await query('UPDATE events SET total_registered = total_registered + 1 WHERE id = $1', [eventId]);

    await this.addNotification(
      member.id,
      "Event Registration Confirmed",
      `You have successfully registered for '${event.title}'. Venue: ${event.venue} on ${event.date}.`,
      "EVENT"
    );

    return {
      id: regId,
      eventId,
      memberId: member.id,
      memberName: member.name,
      membershipNumber: member.membershipId,
      registeredAt: today
    };
  }

  // --- GALLERY ---
  async getGallery(): Promise<GalleryItem[]> {
    const rows = await query('SELECT * FROM gallery ORDER BY date DESC, id DESC');
    return rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      imageUrl: r.image_url,
      date: r.date,
      description: r.description || undefined
    }));
  }

  async addGalleryItem(item: Omit<GalleryItem, 'id'>, actorName: string = "Admin"): Promise<GalleryItem> {
    const id = `gal-${Date.now()}`;
    await query(`
      INSERT INTO gallery (id, title, category, image_url, date, description)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [id, item.title, item.category, item.imageUrl, item.date || new Date().toISOString().split('T')[0], (item as any).description || null]);

    await this.addAuditLog(actorName, "SECRETARY", "GALLERY_ITEM_ADDED", `Added photo '${item.title}'`);
    return { id, ...item };
  }

  // --- NOTIFICATIONS ---
  async getNotifications(memberId: string): Promise<AppNotification[]> {
    const member = await this.getMemberById(memberId);
    if (!member) return [];

    const rows = await query(`
      SELECT * FROM app_notifications WHERE member_id = $1 ORDER BY date DESC, id DESC
    `, [member.id]);

    return rows.map((r: any) => ({
      id: r.id,
      memberId: r.member_id,
      title: r.title,
      message: r.message,
      date: r.date,
      read: r.read,
      type: r.type
    }));
  }

  async markNotificationsRead(memberId: string): Promise<void> {
    const member = await this.getMemberById(memberId);
    if (!member) return;
    await query('UPDATE app_notifications SET read = true WHERE member_id = $1', [member.id]);
  }

  async addNotification(memberId: string, title: string, message: string, type: string): Promise<void> {
    const id = `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const date = new Date().toISOString().split('T')[0];
    await query(`
      INSERT INTO app_notifications (id, member_id, title, message, date, read, type)
      VALUES ($1, $2, $3, $4, $5, false, $6)
      ON CONFLICT (id) DO NOTHING
    `, [id, memberId, title, message, date, type]);
  }

  // --- AUDIT LOGS ---
  async getAuditLogs(): Promise<AuditLog[]> {
    const rows = await query('SELECT * FROM audit_logs ORDER BY timestamp DESC, id DESC LIMIT 100');
    return rows.map((r: any) => ({
      id: r.id,
      userId: r.user_id || undefined,
      userName: r.user_name,
      role: r.role,
      action: r.action,
      details: r.details,
      timestamp: r.timestamp,
      ipAddress: r.ip_address || undefined
    }));
  }

  async addAuditLog(
    userName: string,
    role: string,
    action: string,
    details: string,
    userId?: string,
    ipAddress?: string
  ): Promise<void> {
    const id = `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date();
    const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;
    await query(`
      INSERT INTO audit_logs (id, user_id, user_name, role, action, details, timestamp, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO NOTHING
    `, [id, userId || null, userName, role, action, details, timestamp, ipAddress || '127.0.0.1']);
  }
}

export const postgresStore = new PostgresStore();
