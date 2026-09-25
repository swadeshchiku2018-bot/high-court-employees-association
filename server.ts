import express from "express";
import path from "path";
import bcrypt from "bcryptjs";
import { postgresStore } from "./src/backend/postgresStore.js";
import { initDb, seedAdminAccount } from "./src/backend/initDb.js";
import { query } from "./src/backend/db.js";

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --- HEALTH & STATUS ---
app.get("/api/health", async (req, res) => {
  try {
    const settings = await postgresStore.getSettings();
    res.json({
      status: "OK",
      database: "PostgreSQL Connected",
      association: settings.name,
      stats: settings.stats
    });
  } catch (err: any) {
    res.status(500).json({ status: "ERROR", error: err.message });
  }
});

// --- SETTINGS & CMS ---
app.get("/api/settings", async (req, res) => {
  try {
    const settings = await postgresStore.getSettings();
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/settings", async (req, res) => {
  try {
    const { settings, actorName } = req.body;
    const updated = await postgresStore.updateSettings(settings, actorName);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- OFFICE BEARERS ---
app.get("/api/office-bearers", async (req, res) => {
  try {
    const list = await postgresStore.getOfficeBearers();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/office-bearers", async (req, res) => {
  try {
    const bearer = req.body.bearer || req.body;
    const actorName = req.body.actorName || "Admin";
    const updated = await postgresStore.updateOfficeBearer(bearer, actorName);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/office-bearers/:id", async (req, res) => {
  try {
    const bearer = req.body.bearer || req.body;
    bearer.id = req.params.id;
    const actorName = req.body.actorName || "Admin";
    const updated = await postgresStore.updateOfficeBearer(bearer, actorName);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/office-bearers/:id", async (req, res) => {
  try {
    const { actorName } = req.body || {};
    const updated = await postgresStore.deleteOfficeBearer(req.params.id, actorName || "Admin");
    res.json({ success: true, officeBearers: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- AUTH ---

// Admin-specific login (username + password, checks admin_accounts table)
app.post("/api/auth/admin-login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }
    const rows = await query<any>(`SELECT * FROM admin_accounts WHERE LOWER(username) = LOWER($1)`, [username.trim()]);
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid admin credentials." });
    }
    const admin = rows[0];
    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid admin credentials." });
    }
    return res.json({
      token: `admin-jwt-${admin.id}-${Date.now()}`,
      user: {
        id: admin.id,
        name: admin.display_name,
        username: admin.username,
        role: 'SUPER_ADMIN',
        email: `${admin.username}@system.local`,
        membershipId: 'ADMIN',
        employeeCode: 'SYS-ADMIN',
        designation: 'System Administrator',
        department: 'Administration',
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.display_name)}&background=003366&color=fff`,
        status: 'ACTIVE',
        isAdmin: true,
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin credentials change
app.post("/api/auth/admin/change-credentials", async (req, res) => {
  try {
    const { username, currentPassword, newUsername, newPassword } = req.body;
    if (!username || !currentPassword) {
      return res.status(400).json({ error: "Current username and password are required." });
    }
    const rows = await query<any>(`SELECT * FROM admin_accounts WHERE LOWER(username) = LOWER($1)`, [username.trim()]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Admin account not found." });
    }
    const admin = rows[0];
    const isCurrentValid = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!isCurrentValid) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    let updateQuery = `UPDATE admin_accounts SET updated_at = CURRENT_TIMESTAMP`;
    const params: any[] = [];
    let paramIndex = 1;

    if (newUsername && newUsername.trim() !== '') {
      // Check if username already taken by another admin
      const existing = await query(`SELECT id FROM admin_accounts WHERE LOWER(username) = LOWER($1) AND id != $2`, [newUsername.trim(), admin.id]);
      if (existing.length > 0) {
        return res.status(400).json({ error: "Username is already taken." });
      }
      updateQuery += `, username = $${paramIndex++}`;
      params.push(newUsername.trim());
    }

    if (newPassword && newPassword.trim() !== '') {
      if (newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters." });
      }
      const newHash = await bcrypt.hash(newPassword, 12);
      updateQuery += `, password_hash = $${paramIndex++}`;
      params.push(newHash);
    }

    if (params.length === 0) {
      return res.status(400).json({ error: "Nothing to update." });
    }

    updateQuery += ` WHERE id = $${paramIndex}`;
    params.push(admin.id);

    await query(updateQuery, params);

    return res.json({ 
      success: true, 
      message: "Admin credentials updated successfully. Please log in again with your new credentials." 
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, identifier, username, password } = req.body;
    const loginId = identifier || email || username;
    if (!loginId) {
      return res.status(400).json({ error: "Email, Employee Code, User ID, or Membership ID is required." });
    }
    if (!password) {
      return res.status(400).json({ error: "Password is required." });
    }

    // authenticateUser now handles bcrypt comparison internally
    const member = await postgresStore.authenticateUser(loginId, password);
    if (!member) {
      return res.status(401).json({ error: "Invalid credentials. Please check your User ID and password." });
    }

    return res.json({
      token: `jwt-token-${member.id}-${Date.now()}`,
      user: member
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


app.post("/api/auth/register", async (req, res) => {
  try {
    const member = await postgresStore.registerNewMember(req.body);
    res.status(201).json(member);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to register member." });
  }
});

// --- PUBLIC VERIFICATION ---
app.get("/api/verify/member/:membershipId", async (req, res) => {
  try {
    const { membershipId } = req.params;
    const verification = await postgresStore.verifyMemberPublic(membershipId);
    if (!verification) {
      return res.status(404).json({ error: "Member not found or invalid Membership ID." });
    }
    res.json(verification);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- MEMBERS MANAGEMENT ---
app.get("/api/members", async (req, res) => {
  try {
    const { query, status, department } = req.query;
    const list = await postgresStore.getMembers(
      query as string,
      status as string,
      department as string
    );
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/members/:id", async (req, res) => {
  try {
    const member = await postgresStore.getMemberById(req.params.id);
    if (!member) return res.status(404).json({ error: "Member not found" });
    res.json(member);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/members/:id/status", async (req, res) => {
  try {
    const { status, actorName, notes } = req.body;
    const updated = await postgresStore.updateMemberStatus(req.params.id, status, actorName, notes);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin verify member
app.post("/api/members/:id/verify", async (req, res) => {
  try {
    const { verifiedBy, actorName } = req.body;
    const updated = await postgresStore.updateMemberStatus(req.params.id, 'ACTIVE', verifiedBy || actorName || 'Secretariat');
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin reject member
app.post("/api/members/:id/reject", async (req, res) => {
  try {
    const { notes, actorName } = req.body;
    const updated = await postgresStore.updateMemberStatus(req.params.id, 'REJECTED', actorName || 'Secretariat', notes || 'Application rejected by Secretariat');
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin delete member
app.delete("/api/members/:id", async (req, res) => {
  try {
    const { actorName } = req.body || {};
    await postgresStore.deleteMember(req.params.id, actorName || 'Admin');
    res.json({ success: true, message: "Member record deleted successfully" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin reset member password to default (ohcea123)
app.post("/api/members/:id/reset-password", async (req, res) => {
  try {
    const { actorName } = req.body || {};
    const result = await postgresStore.resetPasswordToDefault(req.params.id, actorName || "Admin");
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Employee / Admin change User ID or Password
app.post("/api/members/:id/change-credentials", async (req, res) => {
  try {
    const { employeeCode, email, currentPassword, newPassword, actorName, isAdmin } = req.body;
    const result = await postgresStore.changeUserCredentials(
      req.params.id,
      { employeeCode, email, currentPassword, newPassword },
      actorName || "Employee",
      !!isAdmin
    );
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.patch("/api/members/:id/profile", async (req, res) => {
  try {
    const { updates, actorName } = req.body;
    const updated = await postgresStore.updateMemberProfile(req.params.id, updates, actorName);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Full Member update (used by Admin Dashboard and profile edit)
app.patch("/api/members/:id", async (req, res) => {
  try {
    const updates = req.body.updates || req.body;
    const updated = await postgresStore.updateMemberAdmin(req.params.id, updates, req.body.actorName || "Admin");
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/members/:id", async (req, res) => {
  try {
    const updates = req.body.updates || req.body;
    const updated = await postgresStore.updateMemberAdmin(req.params.id, updates, req.body.actorName || "Admin");
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- CONTRIBUTIONS & RECEIPTS ---
app.get("/api/contributions", async (req, res) => {
  try {
    const { memberId } = req.query;
    const list = await postgresStore.getContributions(memberId as string);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/members/:id/contributions", async (req, res) => {
  try {
    const list = await postgresStore.getContributions(req.params.id);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/contributions/pay", async (req, res) => {
  try {
    const contrib = await postgresStore.processOnlineContribution(req.body);
    res.status(201).json(contrib);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Manual contribution by Admin
app.post("/api/contributions", async (req, res) => {
  try {
    const contrib = await postgresStore.addManualContribution(req.body);
    res.status(201).json(contrib);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- WELFARE APPLICATIONS ---
app.get("/api/welfare", async (req, res) => {
  try {
    const { memberId } = req.query;
    const list = await postgresStore.getWelfareApplications(memberId as string);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/members/:id/welfare", async (req, res) => {
  try {
    const list = await postgresStore.getWelfareApplications(req.params.id);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/welfare/apply", async (req, res) => {
  try {
    const appRecord = await postgresStore.submitWelfareApplication(req.body);
    res.status(201).json(appRecord);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/welfare", async (req, res) => {
  try {
    const appRecord = await postgresStore.submitWelfareApplication(req.body);
    res.status(201).json(appRecord);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.patch("/api/welfare/:id/status", async (req, res) => {
  try {
    const { status, amountApproved, amountSanctioned, notes, disbursedTxnRef, actorName } = req.body;
    const updated = await postgresStore.updateWelfareStatus(
      req.params.id, status, amountApproved ?? amountSanctioned, notes, disbursedTxnRef, actorName
    );
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.patch("/api/welfare/:id", async (req, res) => {
  try {
    const { status, amountApproved, amountSanctioned, notes, disbursedTxnRef, actorName } = req.body;
    const updated = await postgresStore.updateWelfareStatus(
      req.params.id, status, amountApproved ?? amountSanctioned, notes, disbursedTxnRef, actorName
    );
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- FUND LEDGER ---
app.get("/api/fund/ledger", async (req, res) => {
  try {
    const transactions = await postgresStore.getFundTransactions();
    res.json(transactions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/fund/entry", async (req, res) => {
  try {
    const entry = await postgresStore.addFundTransaction(req.body);
    res.status(201).json(entry);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- NOTICES ---
app.get("/api/notices", async (req, res) => {
  try {
    const { visibility } = req.query;
    const list = await postgresStore.getNotices(visibility as any);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/notices/:id", async (req, res) => {
  try {
    const notice = await postgresStore.getNoticeById(req.params.id);
    if (!notice) return res.status(404).json({ error: "Notice not found" });
    res.json(notice);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Stream raw PDF or redirect for direct browser viewing in a new tab
app.get("/api/notices/:id/pdf", async (req, res) => {
  try {
    const notice = await postgresStore.getNoticeById(req.params.id);
    if (!notice) return res.status(404).send("Notice circular not found.");

    if (notice.attachmentUrl && notice.attachmentUrl.startsWith('data:application/pdf')) {
      const base64Index = notice.attachmentUrl.indexOf('base64,');
      const base64Data = base64Index !== -1 ? notice.attachmentUrl.substring(base64Index + 7) : notice.attachmentUrl;
      const pdfBuffer = Buffer.from(base64Data, 'base64');
      const safeTitle = (notice.title || 'Official_Notice').replace(/[^a-zA-Z0-9_\-]/g, '_').substring(0, 80);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${safeTitle}.pdf"`);
      return res.send(pdfBuffer);
    } else if (notice.attachmentUrl && (notice.attachmentUrl.startsWith('http://') || notice.attachmentUrl.startsWith('https://'))) {
      return res.redirect(notice.attachmentUrl);
    } else {
      // If no uploaded PDF file, redirect to the official letterhead document viewer
      return res.redirect(`/notice/${notice.id}`);
    }
  } catch (err: any) {
    res.status(500).send("Error streaming PDF: " + err.message);
  }
});

app.post("/api/notices", async (req, res) => {
  try {
    const notice = req.body.notice || req.body;
    const created = await postgresStore.createNotice(notice, req.body.actorName);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/notices/:id", async (req, res) => {
  try {
    const { actorName } = req.body;
    await postgresStore.deleteNotice(req.params.id, actorName);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- EVENTS ---
app.get("/api/events", async (req, res) => {
  try {
    const list = await postgresStore.getEvents();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/events", async (req, res) => {
  try {
    const event = req.body.event || req.body;
    const created = await postgresStore.createEvent(event, req.body.actorName);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/events/:id/register", async (req, res) => {
  try {
    const { memberId } = req.body;
    const reg = await postgresStore.registerForEvent(req.params.id, memberId);
    res.status(201).json(reg);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- GALLERY ---
app.get("/api/gallery", async (req, res) => {
  try {
    const items = await postgresStore.getGallery();
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/gallery", async (req, res) => {
  try {
    const item = req.body.item || req.body;
    const added = await postgresStore.addGalleryItem(item, req.body.actorName);
    res.status(201).json(added);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- NOTIFICATIONS ---
app.get("/api/notifications/:memberId", async (req, res) => {
  try {
    const notifs = await postgresStore.getNotifications(req.params.memberId);
    res.json(notifs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/notifications/:memberId/read", async (req, res) => {
  try {
    await postgresStore.markNotificationsRead(req.params.memberId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- AUDIT LOGS ---
app.get("/api/audit-logs", async (req, res) => {
  try {
    const logs = await postgresStore.getAuditLogs();
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Export app for Vercel Serverless environment
export default app;

async function startServer() {
  if (process.env.VERCEL) return;

  const PORT = Number(process.env.PORT) || 3000;

  // Initialize and verify database tables and required seed data
  try {
    console.log("Connecting to PostgreSQL database and verifying schema...");
    await initDb();
    await seedAdminAccount();
    console.log("PostgreSQL database successfully connected and verified.");
  } catch (dbErr) {
    console.error("Warning: Database initialization encountered an error:", dbErr);
  }

  if (process.env.VERCEL) {
    // Vercel handles routing and listening, we don't need Vite middleware in production
    console.log("Running in Vercel Serverless environment");
  } else {
    if (process.env.NODE_ENV !== "production") {
      const viteModule = await import("vite");
      const vite = await viteModule.createServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`High Court Employees' Association Server running on http://0.0.0.0:${PORT}`);
    });
  }
}

// Start the server if running locally
if (!process.env.VERCEL) {
  startServer().catch(err => {
    console.error("Failed to start server:", err);
  });
} else {
  // DB initialization is skipped on Vercel cold starts.
  console.log("Vercel environment detected. Skipping top-level DB init.");
}

export default app;
