// @ts-ignore
import serverModule from '../dist/server.cjs';
const app = serverModule.app || serverModule.default || serverModule;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function (req: any, res: any) {
  try {
    return app(req, res);
  } catch (err: any) {
    console.error("API BOOT CRASH:", err);
    res.status(500).json({ 
      error: "API BOOT CRASH: " + err.message, 
      stack: err.stack 
    });
  }
}
