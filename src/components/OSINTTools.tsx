import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, 
  Search, 
  User, 
  Map as MapIcon, 
  Terminal as TerminalIcon, 
  Database, 
  Hash, 
  Link as LinkIcon,
  Shield,
  Activity,
  ChevronRight,
  Loader2,
  ExternalLink,
  Info,
  Layers,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { GoogleGenAI } from "@google/genai";

// Fix for default Leaflet icon paths - Use CDN to avoid import errors
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Types
type Log = {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warn';
  timestamp: Date;
};

// --- Sub-components ---

export const Terminal = ({ logs }: { logs: Log[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-[#0f1115] border-t border-slate-800 h-24 flex flex-col font-mono text-[9px] overflow-hidden shrink-0">
      <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.02] border-b border-slate-800 text-slate-500 uppercase tracking-tighter shrink-0">
        <TerminalIcon size={10} />
        <span>Console Log // spectre.sh</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 terminal-scroll space-y-0.5">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2">
            <span className="text-slate-600">[{log.timestamp.toLocaleTimeString()}]</span>
            <span className={
              log.type === 'error' ? 'text-rose-500' : 
              log.type === 'success' ? 'text-emerald-500' : 
              log.type === 'warn' ? 'text-amber-500' : 
              'text-cyan-500'
            }>
              {log.type === 'error' && 'FAIL'}
              {log.type === 'success' && 'PASS'}
              {log.type === 'warn' && 'WARN'}
              {log.type === 'info' && 'INFO'}
            </span>
            <span className="text-slate-400 tracking-tight">{log.message}</span>
          </div>
        ))}
        {logs.length === 0 && <div className="text-slate-700 italic">No active data streams...</div>}
      </div>
    </div>
  );
};

// --- Domain Tool ---
export const DomainTool = ({ addLog }: { addLog: (m: string, t: Log['type']) => void }) => {
  const [domain, setDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<{ whois: any, dns: any } | null>(null);

  const handleSearch = async () => {
    if (!domain) return;
    setIsLoading(true);
    addLog(`Initiating sequence scan: ${domain}`, 'info');
    try {
      const [whoisRes, dnsRes] = await Promise.all([
        fetch('/api/whois', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain })
        }).then(r => r.json()),
        fetch('/api/dns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain })
        }).then(r => r.json())
      ]);
      
      setData({ whois: whoisRes, dns: dnsRes });
      addLog(`Recon complete: ${domain}`, 'success');
    } catch (error) {
      addLog(`Scan faulted for ${domain}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-px bg-slate-800 p-px rounded-sm shadow-lg overflow-hidden max-w-2xl">
        <div className="bg-panel flex items-center px-4 text-slate-500">
           <Globe size={18} />
        </div>
        <input 
          type="text" 
          placeholder="ENTER TARGET DOMAIN..." 
          className="flex-1 bg-panel border-hidden px-4 py-3 focus:outline-none text-xs font-mono text-cyan-400 placeholder:text-slate-700"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button 
          onClick={handleSearch}
          disabled={isLoading}
          className="bg-brand hover:bg-cyan-700 px-8 text-white flex items-center gap-2 transition-all disabled:opacity-50 text-[10px] font-bold uppercase tracking-[0.2em]"
        >
          {isLoading ? <Loader2 className="animate-spin" size={14} /> : 'Execute'}
        </button>
      </div>

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-800 p-px">
          <div className="bg-panel p-6 space-y-6">
            <div className="flex justify-between items-end">
              <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Database size={12} /> WHOIS_REGISTRY
              </h3>
              <span className="text-[9px] text-cyan-500/50 font-mono">RECORDS: {Object.keys(data.whois).length}</span>
            </div>
            <div className="text-[11px] font-mono space-y-2 overflow-x-auto">
              {Object.entries(data.whois).slice(0, 15).map(([key, val]: [string, any]) => (
                <div key={key} className="flex justify-between p-2 bg-surface/50 border-l-2 border-slate-700 hover:border-brand transition-all">
                  <span className="text-slate-500 italic uppercase text-[9px]">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="text-cyan-400 truncate ml-4">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-panel p-6 space-y-6">
            <div className="flex justify-between items-end">
              <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Activity size={12} /> DNS_TOPOLOGY
              </h3>
              <span className="text-[9px] text-cyan-500/50 font-mono">STATUS: RESOLVED</span>
            </div>
            <div className="space-y-4">
              {Object.entries(data.dns).map(([type, records]: [string, any]) => (
                <div key={type} className="space-y-1">
                  <div className="text-[9px] font-mono text-slate-600 font-bold uppercase tracking-tighter px-1">[{type}] SET</div>
                  <div className="space-y-1">
                    {Array.isArray(records) && records.length > 0 ? records.map((r: any, idx) => (
                      <div key={idx} className="bg-surface/50 p-2 text-[10px] font-mono border-l-2 border-cyan-800 text-cyan-500/80">
                        {typeof r === 'string' ? r : JSON.stringify(r)}
                      </div>
                    )) : <div className="text-[10px] italic text-slate-800 px-2 mt-1">NO DATA_SEGMENT FOUND</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Web Scraper Tool ---
export const ScrapeTool = ({ addLog }: { addLog: (m: string, t: Log['type']) => void }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleScrape = async () => {
    if (!url) return;
    setIsLoading(true);
    setData(null);
    setAnalysis('');
    addLog(`Crawling protocol: ${url}`, 'info');
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      }).then(r => r.json());
      
      setData(res);
      const linksCount = res?.links?.length || 0;
      const imagesCount = res?.images?.length || 0;
      addLog(`Segmented ${linksCount} pointers and ${imagesCount} assets`, 'success');
    } catch (error) {
      addLog(`Crawl aborted for ${url}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!data) return;
    setIsAnalyzing(true);
    addLog(`Bypassing static layers... neural scan active`, 'info');
    try {
      const apiKey = (process.env.GEMINI_API_KEY as string);
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        throw new Error("Gemini API key not configured");
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this OSINT data and identify potential security risks, corporate connections, or notable patterns:\n\n${JSON.stringify(data)}`
      });
      
      setAnalysis(response.text || "No analysis generated.");
      addLog(`Neural scan complete`, 'success');
    } catch (error) {
      console.error(error);
      addLog(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex gap-px bg-slate-800 p-px rounded-sm shadow-lg overflow-hidden max-w-2xl">
        <div className="bg-panel flex items-center px-4 text-slate-500">
           <Search size={18} />
        </div>
        <input 
          type="text" 
          placeholder="ENTER TARGET URL..." 
          className="flex-1 bg-panel border-hidden px-4 py-3 focus:outline-none text-xs font-mono text-cyan-400 placeholder:text-slate-700"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
        />
        <button 
          onClick={handleScrape}
          disabled={isLoading}
          className="bg-brand hover:bg-cyan-700 px-8 text-white flex items-center gap-2 transition-all disabled:opacity-50 text-[10px] font-bold uppercase tracking-[0.2em]"
        >
          {isLoading ? <Loader2 className="animate-spin" size={14} /> : 'Crawl'}
        </button>
      </div>

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-slate-800 p-px">
          <div className="lg:col-span-2 space-y-px flex flex-col h-full">
            <div className="bg-panel p-6 space-y-2 border-b border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 bg-brand" />
                <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-500">Target Resolution</h2>
              </div>
              <h3 className="text-lg font-bold text-slate-200 tracking-tight">{data.title || 'NULL_TITLE'}</h3>
              <p className="text-[11px] text-slate-500 font-mono leading-relaxed">{data.description || 'NO_DESCRIPTION_STRING'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 flex-1 min-h-[400px]">
              <div className="bg-panel p-6 border-r border-slate-800 overflow-y-auto max-h-[500px]">
                <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2 sticky top-0 bg-panel pb-2 border-b border-slate-800/50">
                  <LinkIcon size={12} className="text-brand" /> OUTBOUND_PTRS ({data?.links?.length || 0})
                </h3>
                <div className="space-y-4">
                  {(data?.links || []).map((link: any, i: number) => (
                    <div key={i} className="text-[10px] font-mono text-slate-500 bg-surface/30 p-2 border-l border-slate-700 hover:border-brand transition-all cursor-pointer">
                      <div className="text-cyan-400 mb-1 truncate font-bold">{link.text || 'UNTITLED_NODE'}</div>
                      <div className="opacity-30 truncate">{link.href}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-panel p-6 overflow-y-auto max-h-[500px]">
                <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2 sticky top-0 bg-panel pb-2 border-b border-slate-800/50">
                  <Hash size={12} className="text-brand" /> HEADER_NODES
                </h3>
                <div className="space-y-3">
                  {(data?.h1 || []).map((h: string, i: number) => (
                    <div key={i} className="text-[11px] font-mono p-3 bg-cyan-950/20 border-l-2 border-brand text-cyan-400 shadow-inner">
                      {h}
                    </div>
                  ))}
                  {(!data?.h1 || data.h1.length === 0) && <div className="text-[10px] italic text-slate-800 p-2">NO_HEADERS_RESOLVED</div>}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0a0a0c] p-6 border-l border-slate-800 flex flex-col h-full dot-grid">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-[10px] font-mono text-brand uppercase tracking-[0.2em] flex items-center gap-2">
                <Cpu size={12} /> NEURAL_INSIGHT
              </h3>
              {!analysis && (
                 <button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="text-[9px] bg-brand/10 hover:bg-brand/20 text-brand px-3 py-1.5 rounded-sm border border-brand/20 flex items-center gap-1 uppercase font-bold tracking-widest transition-all"
                >
                  {isAnalyzing ? <Loader2 size={10} className="animate-spin" /> : <Activity size={10} />}
                  INIT_SCAN
                </button>
              )}
            </div>
            
            <div className="flex-1 text-[11px] font-mono leading-relaxed overflow-y-auto">
              {analysis ? (
                <div className="whitespace-pre-wrap text-slate-300 bg-panel/50 p-4 border border-slate-800/50 backdrop-blur-sm rounded-sm">
                  {analysis}
                  <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between opacity-30 text-[9px]">
                    <span>CRC: 0x99FA2</span>
                    <span>SIG: VERIFIED</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-10 space-y-4">
                  <Shield size={48} strokeWidth={1} />
                  <p className="text-[9px] uppercase tracking-widest">Awaiting Neural Link...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Map Tool ---
export const MapTool = ({ addLog }: { addLog: (m: string, t: Log['type']) => void }) => {
  const [query, setQuery] = useState('');
  const [markers, setMarkers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setIsLoading(true);
    addLog(`Geocoding sequence: ${query}`, 'info');
    try {
      const isIP = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(query);
      
      if (isIP) {
        const res = await fetch(`/api/geoip/${query}`).then(r => r.json());
        if (res.lat) {
          setMarkers([{
            id: 'geoip',
            lat: res.lat,
            lon: res.lon,
            title: `IP: ${query}`,
            details: `${res.city}, ${res.country} // ISP: ${res.isp}`
          }]);
          addLog(`Target locked: ${res.city}, ${res.country}`, 'success');
        }
      } else {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`).then(r => r.json());
        if (res.length > 0) {
          setMarkers(res.map((r: any) => ({
            id: r.place_id,
            lat: parseFloat(r.lat),
            lon: parseFloat(r.lon),
            title: r.display_name.split(',')[0],
            details: r.display_name
          })));
          addLog(`Intersection identified: ${res[0].display_name}`, 'success');
        }
      }
    } catch (error) {
      addLog(`GEOINT FAILURE`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex gap-px bg-slate-800 p-px rounded-sm shadow-lg overflow-hidden max-w-2xl shrink-0">
        <div className="bg-panel flex items-center px-4 text-slate-500">
           <MapIcon size={18} />
        </div>
        <input 
          type="text" 
          placeholder="ENTER IP OR GEO-LOC..." 
          className="flex-1 bg-panel border-hidden px-4 py-3 focus:outline-none text-xs font-mono text-cyan-400 placeholder:text-slate-700"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button 
          onClick={handleSearch}
          disabled={isLoading}
          className="bg-brand hover:bg-cyan-700 px-8 text-white flex items-center gap-2 transition-all disabled:opacity-50 text-[10px] font-bold uppercase tracking-[0.2em]"
        >
          {isLoading ? <Loader2 className="animate-spin" size={14} /> : 'Fix'}
        </button>
      </div>

      <div className="flex-1 bg-[#0d0e12] border border-slate-800 rounded-sm overflow-hidden relative shadow-2xl min-h-[500px]">
        <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none z-10" />
        <MapContainer 
          center={[20, 0]} 
          zoom={2} 
          style={{ height: '100%', width: '100%', background: '#0d0e12' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="map-tiles"
          />
          {markers.map(m => (
            <Marker key={m.id} position={[m.lat, m.lon]}>
              <Popup>
                <div className="font-mono text-[10px]">
                  <div className="font-bold text-slate-800 uppercase tracking-tighter border-b border-slate-200 mb-1">{m.title}</div>
                  <div className="text-slate-600 italic">{m.details}</div>
                </div>
              </Popup>
            </Marker>
          ))}
          <MapController markers={markers} />
        </MapContainer>
        
        {/* Map Overlays */}
        <div className="absolute top-4 left-4 z-[1000] p-4 bg-panel/80 border border-slate-800 rounded-sm backdrop-blur-md shadow-2xl pointer-events-none">
          <h3 className="text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-[0.2em]">Active Geofence</h3>
          <div className="flex items-center gap-4">
            <div className="text-xl font-mono text-brand tracking-tighter">{markers[0] ? `${markers[0].lat.toFixed(4)}, ${markers[0].lon.toFixed(4)}` : '00.0000, 00.0000'}</div>
            <div className="px-2 py-0.5 bg-brand/10 text-brand text-[9px] border border-brand/20 rounded uppercase font-bold tracking-widest">{markers.length > 0 ? 'LOCKED' : 'WAITING'}</div>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 z-[1000] flex gap-2 pointer-events-none opacity-60">
          <div className="px-3 py-1.5 bg-panel border border-slate-800 text-[10px] font-mono text-slate-500 rounded-sm">ZOOM: {markers.length > 0 ? 'DYNAMIC' : 'STATIC'}</div>
          <div className="px-3 py-1.5 bg-panel border border-slate-800 text-[10px] font-mono text-slate-500 rounded-sm uppercase tracking-tighter">Nodes: {markers.length}</div>
        </div>
      </div>
    </div>
  );
};

const MapController = ({ markers }: { markers: any[] }) => {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lon]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [markers, map]);
  return null;
};
