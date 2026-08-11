import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { backendStore } from "./src/backend/dataStore";

const app = express();
app.use(express.json());

// --- API ROUTES ---

  // Settings & CMS
  app.get("/api/settings", (req, res) => {
    res.json(backendStore.getSettings());
  });

  app.post("/api/settings", (req, res) => {
    const { settings, actorName } = req.body;
    const updated = backendStore.updateSettings(settings, actorName);
    res.json(updated);
  });

  // Office Bearers
  app.get("/api/office-bearers", (req, res) => {
    res.json(backendStore.getOfficeBearers());
  });

  app.post("/api/office-bearers", (req, res) => {
    const { bearer, actorName } = req.body;
    const updated = backendStore.updateOfficeBearer(bearer, actorName);
    res.json(updated);
  });

  // Auth
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const member = backendStore.authenticateUser(email);
    if (!member) {
      return res.status(401).json({ error: "Invalid credentials or email not registered." });
    }

    // Basic password check for demo
    if (password !== 'password123' && password !== 'admin123' && password !== 'member123') {
      return res.status(401).json({ error: "Invalid password." });
    }

    return res.json({
      token: `jwt-token-${member.id}-${Date.now()}`,
      user: member
    });
  });

  app.post("/api/auth/register", (req, res) => {
    try {
      const member = backendStore.registerNewMember(req.body);
      res.status(201).json(member);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Failed to register member." });
    }
  });

  // Verification (Public)
  app.get("/api/verify/member/:membershipId", (req, res) => {
    const { membershipId } = req.params;
    const verification = backendStore.verifyMemberPublic(membershipId);
    if (!verification) {
      return res.status(404).json({ error: "Member not found or invalid Membership ID." });
    }
    res.json(verification);
  });

  // Members Management
  app.get("/api/members", (req, res) => {
    const { query, status, department } = req.query;
    const list = backendStore.getMembers(
      query as string,
      status as string,
      department as string
    );
    res.json(list);
  });

  app.get("/api/members/:id", (req, res) => {
    const member = backendStore.getMemberById(req.params.id);
    if (!member) return res.status(404).json({ error: "Member not found" });
    res.json(member);
  });

  app.patch("/api/members/:id/status", (req, res) => {
    const { status, actorName, notes } = req.body;
    try {
      const updated = backendStore.updateMemberStatus(req.params.id, status, actorName, notes);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.patch("/api/members/:id/profile", (req, res) => {
    const { updates, actorName } = req.body;
    try {
      const updated = backendStore.updateMemberProfile(req.params.id, updates, actorName);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Contributions & Payment Gateway
  app.get("/api/contributions", (req, res) => {
    const { memberId } = req.query;
    const list = backendStore.getContributions(memberId as string);
    res.json(list);
  });

  app.post("/api/contributions/pay", (req, res) => {
    try {
      const contrib = backendStore.processOnlineContribution(req.body);
      res.status(201).json(contrib);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Welfare Applications
  app.get("/api/welfare", (req, res) => {
    const { memberId } = req.query;
    const list = backendStore.getWelfareApplications(memberId as string);
    res.json(list);
  });

  app.post("/api/welfare/apply", (req, res) => {
    try {
      const appRecord = backendStore.submitWelfareApplication(req.body);
      res.status(201).json(appRecord);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.patch("/api/welfare/:id/status", (req, res) => {
    const { status, amountApproved, notes, disbursedTxnRef, actorName } = req.body;
    try {
      const updated = backendStore.updateWelfareStatus(
        req.params.id, status, amountApproved, notes, disbursedTxnRef, actorName
      );
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Fund Ledger
  app.get("/api/fund/ledger", (req, res) => {
    res.json(backendStore.getFundTransactions());
  });

  app.post("/api/fund/entry", (req, res) => {
    try {
      const entry = backendStore.addFundTransaction(req.body);
      res.status(201).json(entry);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Notices
  app.get("/api/notices", (req, res) => {
    const { visibility } = req.query;
    res.json(backendStore.getNotices(visibility as any));
  });

  app.post("/api/notices", (req, res) => {
    const { notice, actorName } = req.body;
    const created = backendStore.createNotice(notice, actorName);
    res.status(201).json(created);
  });

  app.delete("/api/notices/:id", (req, res) => {
    const { actorName } = req.body;
    backendStore.deleteNotice(req.params.id, actorName);
    res.json({ success: true });
  });

  // Events
  app.get("/api/events", (req, res) => {
    res.json(backendStore.getEvents());
  });

  app.post("/api/events", (req, res) => {
    const { event, actorName } = req.body;
    const created = backendStore.createEvent(event, actorName);
    res.status(201).json(created);
  });

  app.post("/api/events/:id/register", (req, res) => {
    const { memberId } = req.body;
    try {
      const reg = backendStore.registerForEvent(req.params.id, memberId);
      res.status(201).json(reg);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Gallery
  app.get("/api/gallery", (req, res) => {
    res.json(backendStore.getGallery());
  });

  app.post("/api/gallery", (req, res) => {
    const { item, actorName } = req.body;
    const added = backendStore.addGalleryItem(item, actorName);
    res.status(201).json(added);
  });

  // Notifications
  app.get("/api/notifications/:memberId", (req, res) => {
    res.json(backendStore.getNotifications(req.params.memberId));
  });

  app.post("/api/notifications/:memberId/read", (req, res) => {
    backendStore.markNotificationsRead(req.params.memberId);
    res.json({ success: true });
  });

  // Audit Logs
  app.get("/api/audit-logs", (req, res) => {
    res.json(backendStore.getAuditLogs());
  });

  // --- VITE / STATIC SERVING ---
  // Export app for Vercel Serverless environment
  export default app;

  async function startServer() {
    if (process.env.VERCEL) return; // Vercel handles serving independently
    
    const PORT = process.env.PORT || 3000;
    
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
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

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
