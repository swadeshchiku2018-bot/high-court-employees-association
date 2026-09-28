// @ts-ignore
import serverModule from '../dist/server.cjs';
const app = serverModule.app || serverModule.default || serverModule;

export default async function (req: any, res: any) {
  try {
    // Vercel automatically parses JSON bodies into req.body.
    // Setting req._body = true prevents Express's express.json() from trying to read the already-consumed stream.
    if (req.body) {
      req._body = true;
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
