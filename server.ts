import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Unofficial FNTD2 Database scraper proxy endpoint to cleanly avoid client-side CORS blocks
  app.get("/api/proxy", async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      if (!targetUrl) {
         return res.status(400).json({ error: "Missing URL query parameter." });
      }
      
      const allowedDomains = [
        "https://fntd2.com/",
        "https://cold-rice-a39a.callofdutyblackops2prueba.workers.dev/"
      ];
      const isAllowed = allowedDomains.some(domain => targetUrl.startsWith(domain));
      if (!isAllowed) {
         return res.status(403).json({ error: "Target domain not authorised." });
      }

      // Perform node-side server fetch to the allowed address
      const response = await fetch(targetUrl, {
         headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
         }
      });

      if (!response.ok) {
         return res.status(response.status).json({ error: `Backend API server responded with code ${response.status}` });
      }

      const text = await response.text();
      const targetContentType = response.headers.get("content-type") || "text/plain";
      res.setHeader("Content-Type", targetContentType);
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.send(text);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Unknown proxy error details." });
    }
  });

  // Serve development flow with Vite middleware, or production bundle serving
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
    console.log(`Server actively running on port ${PORT}`);
  });
}

startServer();
