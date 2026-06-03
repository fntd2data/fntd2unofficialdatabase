export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Missing URL parameter" });
  }

  const allowedDomains = [
    "https://fntd2.com/",
    "https://cold-rice-a39a.callofdutyblackops2prueba.workers.dev/"
  ];

  const isAllowed = allowedDomains.some(domain => url.startsWith(domain));
  if (!isAllowed) {
    return res.status(403).json({ error: "Target domain not authorised." });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch from target" });
    }

    const text = await response.text();
    const contentType = response.headers.get("content-type") || "text/plain";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.send(text);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
