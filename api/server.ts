import express from "express";
import * as cheerio from "cheerio";
import axios from "axios";
import whois from "whois-json";
import dns from "dns/promises";

const app = express();

app.use(express.json());

// API Routes

// WHOIS lookup
app.post("/api/whois", async (req, res) => {
  const { domain } = req.body;
  if (!domain) return res.status(400).json({ error: "Domain is required" });
  try {
    const result = await whois(domain);
    res.json(result);
  } catch (error) {
    console.error("WHOIS error:", error);
    res.status(500).json({ error: "WHOIS lookup failed" });
  }
});

// DNS lookup
app.post("/api/dns", async (req, res) => {
  const { domain } = req.body;
  if (!domain) return res.status(400).json({ error: "Domain is required" });
  try {
    const records: any = {};
    try { records.A = await dns.resolve4(domain); } catch(e) {}
    try { records.AAAA = await dns.resolve6(domain); } catch(e) {}
    try { records.MX = await dns.resolveMx(domain); } catch(e) {}
    try { records.TXT = await dns.resolveTxt(domain); } catch(e) {}
    try { records.NS = await dns.resolveNs(domain); } catch(e) {}
    res.json(records);
  } catch (error) {
    console.error("DNS error:", error);
    res.status(500).json({ error: "DNS lookup failed" });
  }
});

// Web Scraping
app.post("/api/scrape", async (req, res) => {
  let { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });
  
  // Simple normalization
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  try {
    // Validate URL format
    new URL(url);
  } catch (e) {
    return res.status(400).json({ error: "Invalid URL format. Please include protocol (http/https)." });
  }

  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
      timeout: 10000
    });
    const $ = cheerio.load(data);
    
    const result = {
      title: $("title").text(),
      description: $("meta[name='description']").attr("content") || "",
      h1: $("h1").map((i, el) => $(el).text()).get(),
      links: $("a").map((i, el) => ({ text: $(el).text()?.trim(), href: $(el).attr("href") })).get().filter(l => l.href).slice(0, 50),
      images: $("img").map((i, el) => $(el).attr("src")).get().filter(s => s).slice(0, 20),
      text: $("body").text().replace(/\s+/g, ' ').substring(0, 5000), 
    };
    res.json(result);
  } catch (error) {
    console.error("Scrape error:", error);
    res.status(500).json({ error: "Scraping failed" });
  }
});

// IP Geolocation
app.get("/api/geoip/:ip", async (req, res) => {
  try {
    const { ip } = req.params;
    const { data } = await axios.get(`http://ip-api.com/json/${ip}`);
    res.json(data);
  } catch (error) {
    console.error("GeoIP error:", error);
    res.status(500).json({ error: "GeoIP failed" });
  }
});

// Export the Express app as a serverless function for Vercel
export default app;
