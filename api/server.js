const app = require('../dist/server.cjs');

module.exports = function (req, res) {
  try {
    const expressApp = app.default || app;
    return expressApp(req, res);
  } catch (err) {
    console.error("API BOOT CRASH:", err);
    res.status(500).json({ 
      error: "API BOOT CRASH: " + err.message, 
      stack: err.stack 
    });
  }
};
