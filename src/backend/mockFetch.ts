import { backendStore } from './dataStore';

const originalFetch = window.fetch;

export const initMockFetch = () => {
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const urlStr = typeof input === 'string' ? input : (input instanceof Request ? input.url : input.toString());
    const method = init?.method || (input instanceof Request ? input.method : 'GET');
    
    // Only intercept /api/ requests
    if (!urlStr.includes('/api/')) {
      return originalFetch(input, init);
    }
    
    // Parse URL and body
    const url = new URL(urlStr, window.location.origin);
    const path = url.pathname;
    let body: any = null;
    if (init?.body) {
      try { body = JSON.parse(init.body as string); } catch (e) {}
    }

    // Simulate slight network delay
    await new Promise(r => setTimeout(r, 200));

    const jsonRes = (data: any, status = 200) => {
      return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' }
      });
    };

    try {
      // 1. Auth
      if (path === '/api/auth/login' && method === 'POST') {
        const member = backendStore.authenticateUser(body.email);
        if (!member) return jsonRes({ error: "Invalid credentials." }, 401);
        if (body.password !== 'password123' && body.password !== 'admin123' && body.password !== 'member123') return jsonRes({ error: "Invalid password." }, 401);
        return jsonRes({ token: `jwt-mock-${member.id}`, user: member });
      }
      if (path === '/api/auth/register' && method === 'POST') {
        return jsonRes(backendStore.registerNewMember(body), 201);
      }

      // 2. Settings
      if (path === '/api/settings' && method === 'GET') return jsonRes(backendStore.getSettings());
      if (path === '/api/settings' && method === 'POST') return jsonRes(backendStore.updateSettings(body.settings, body.actorName));

      // 3. Office Bearers
      if (path === '/api/office-bearers' && method === 'GET') return jsonRes(backendStore.getOfficeBearers());
      if (path === '/api/office-bearers' && method === 'POST') return jsonRes(backendStore.updateOfficeBearer(body.bearer, body.actorName));

      // 4. Members
      if (path === '/api/members' && method === 'GET') return jsonRes(backendStore.getMembers(url.searchParams.get('query') || undefined, url.searchParams.get('status') || undefined, url.searchParams.get('department') || undefined));
      if (path.match(/^\/api\/members\/([^\/]+)$/) && method === 'GET') {
        const m = backendStore.getMemberById(path.split('/')[3]);
        if (!m) return jsonRes({ error: "Not found" }, 404);
        return jsonRes(m);
      }
      if (path.match(/^\/api\/members\/([^\/]+)\/status$/) && method === 'PATCH') {
        return jsonRes(backendStore.updateMemberStatus(path.split('/')[3], body.status, body.actorName, body.notes));
      }
      if (path.match(/^\/api\/members\/([^\/]+)\/profile$/) && method === 'PATCH') {
        return jsonRes(backendStore.updateMemberProfile(path.split('/')[3], body.updates, body.actorName));
      }

      // 5. Verify Member
      if (path.match(/^\/api\/verify\/member\/([^\/]+)$/) && method === 'GET') {
        const v = backendStore.verifyMemberPublic(decodeURIComponent(path.split('/')[4]));
        if (!v) return jsonRes({ error: "Not found" }, 404);
        return jsonRes(v);
      }

      // 6. Contributions
      if (path === '/api/contributions' && method === 'GET') return jsonRes(backendStore.getContributions(url.searchParams.get('memberId') || undefined));
      if (path === '/api/contributions/pay' && method === 'POST') return jsonRes(backendStore.processOnlineContribution(body), 201);

      // 7. Welfare
      if (path === '/api/welfare' && method === 'GET') return jsonRes(backendStore.getWelfareApplications(url.searchParams.get('memberId') || undefined));
      if (path === '/api/welfare/apply' && method === 'POST') return jsonRes(backendStore.submitWelfareApplication(body), 201);
      if (path.match(/^\/api\/welfare\/([^\/]+)\/status$/) && method === 'PATCH') {
        return jsonRes(backendStore.updateWelfareStatus(path.split('/')[3], body.status, body.amountApproved, body.notes, body.disbursedTxnRef, body.actorName));
      }

      // 8. Notices
      if (path === '/api/notices' && method === 'GET') return jsonRes(backendStore.getNotices(url.searchParams.get('visibility') as any));
      if (path === '/api/notices' && method === 'POST') return jsonRes(backendStore.createNotice(body.notice, body.actorName), 201);
      if (path.match(/^\/api\/notices\/([^\/]+)$/) && method === 'DELETE') {
        backendStore.deleteNotice(path.split('/')[3], body.actorName);
        return jsonRes({ success: true });
      }

      // 9. Events
      if (path === '/api/events' && method === 'GET') return jsonRes(backendStore.getEvents());
      if (path === '/api/events' && method === 'POST') return jsonRes(backendStore.createEvent(body.event, body.actorName), 201);
      if (path.match(/^\/api\/events\/([^\/]+)\/register$/) && method === 'POST') {
        return jsonRes(backendStore.registerForEvent(path.split('/')[3], body.memberId), 201);
      }

      // 10. Gallery
      if (path === '/api/gallery' && method === 'GET') return jsonRes(backendStore.getGallery());
      if (path === '/api/gallery' && method === 'POST') return jsonRes(backendStore.addGalleryItem(body.item, body.actorName), 201);

      // 11. Notifications
      if (path.match(/^\/api\/notifications\/([^\/]+)$/) && method === 'GET') {
        return jsonRes(backendStore.getNotifications(path.split('/')[3]));
      }
      if (path.match(/^\/api\/notifications\/([^\/]+)\/read$/) && method === 'POST') {
        backendStore.markNotificationsRead(path.split('/')[3]);
        return jsonRes({ success: true });
      }

      // 12. Audit Logs
      if (path === '/api/audit-logs' && method === 'GET') return jsonRes(backendStore.getAuditLogs());

      // 13. Fund
      if (path === '/api/fund/ledger' && method === 'GET') return jsonRes(backendStore.getFundTransactions());
      if (path === '/api/fund/entry' && method === 'POST') return jsonRes(backendStore.addFundTransaction(body), 201);

    } catch (err: any) {
      console.error('Mock API Error:', err);
      return jsonRes({ error: err.message || 'Server error' }, 400);
    }

    console.warn("Unmatched mock endpoint:", path);
    return jsonRes({ error: 'Endpoint not found' }, 404);
  };
};
