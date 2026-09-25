export default async function (req: any, res: any) {
  try {
    const module = await import('../server.js');
    const app = module.default;
    return app(req, res);
  } catch (err: any) {
    console.error("API BOOT CRASH:", err);
    res.status(500).json({ 
      error: "API BOOT CRASH: " + err.message, 
      stack: err.stack 
    });
  }
}
