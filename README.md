# Spectre OSINT Dashboard (v4.2.0-STABLE)

Spectre is a comprehensive Open Source Intelligence (OSINT) reconnaissance framework designed for deep digital investigation, domain analysis, and geospatial tracking. Built with a "Geometric Balance" design philosophy, it provides a high-performance, terminal-inspired interface for intelligence analysts.

## 🚀 Features

### 1. Domain Reconnaissance
- **WHOIS Deep Scan**: Full registry interrogation for domain ownership and history.
- **DNS Topology**: Resolution of A, AAAA, MX, NS, and TXT records to map infrastructure.

### 2. Neural Web Scraper
- **Automated Crawl**: Extraction of title, meta-descriptions, header hierarchy (H1), and outgoing links.
- **AI Intelligence**: Integrated **Gemini 1.5 Flash** neural analysis that scans scraped content for security risks, corporate connections, and notable patterns.

### 3. GEOINT Mapping
- **IP Geolocation**: Visual identification of server locations and ISPs.
- **Address Resolution**: Global search functionality with dynamic map centering and multi-node visualization.
- **Dark Mode Maps**: Custom-styled Leaflet implementation integrated with the "Nebula" aesthetic.

### 4. Operations Console
- **Real-time Terminal**: Persistent logging of all background operations with status indicators (PASS/FAIL/WARN).
- **System Status**: Integrated monitoring of gateway connections and memory usage.

## 🛠 Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS 4.0 
- **Animations**: Motion (framer-motion)
- **Maps**: Leaflet & React-Leaflet
- **Icons**: Lucide React

### Backend (Full-Stack)
- **Server**: Node.js with Express
- **Scraping**: Cheerio & Axios
- **Intelligence**: Google Gemini API (@google/genai)
- **Data**: whois-json & native DNS promises

## 🛠 Setup & Requirements

### Environment Variables
The application requires a Gemini API key for the "Neural Insight" feature to function. Create a `.env` file or use the AI Studio Secrets panel:
```env
GEMINI_API_KEY="your_api_key_here"
```

### Installation
```bash
npm install
npm run dev
```
The application will be accessible at `http://localhost:3000`.

## 🛡 Security Note
This tool is designed for authorized reconnaissance and open-source intelligence gathering. Users are responsible for ensuring their scans comply with target `robots.txt` policies and local digital privacy laws.

---
**Nebula Framework // v4.2.0-STABLE**
*Digital Footprint Reconstruction Suite*
