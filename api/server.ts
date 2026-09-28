import { app } from '../server.js';
import { initDb, seedAdminAccount } from '../src/backend/initDb.js';

let isDbInitialized = false;

export default async function (req: any, res: any) {
  try {
    if (!isDbInitialized) {
      console.log("Vercel Cold Start: Initializing Database...");
      await initDb();
      await seedAdminAccount();
      isDbInitialized = true;
      console.log("Database initialized on Vercel.");
    }

    return app(req, res);
  } catch (err: any) {
    console.error("API BOOT CRASH:", err);
    res.status(500).json({ 
      error: "API BOOT CRASH: " + err.message, 
      stack: err.stack 
    });
  }
}
