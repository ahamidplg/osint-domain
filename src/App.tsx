/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
  Menu,
  Settings,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, DomainTool, ScrapeTool, MapTool } from './components/OSINTTools';

type ToolType = 'domain' | 'scrape' | 'social' | 'map' | 'settings';

type Log = {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warn';
  timestamp: Date;
};

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolType>('domain');
  const [logs, setLogs] = useState<Log[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const addLog = (message: string, type: Log['type'] = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: new Date()
    }]);
  };

  useEffect(() => {
    addLog("System initialized. Welcome to OSINT Dashboard v1.0.4", "success");
    addLog("Ready for deep reconnaissance ops.", "info");
  }, []);

  const tools = [
    { id: 'domain', icon: Globe, label: 'Domain Research', desc: 'WHOIS & DNS lookup' },
    { id: 'scrape', icon: Search, label: 'Web Scraper', desc: 'Structure & content analysis' },
    { id: 'social', icon: User, label: 'Social Recon', desc: 'Profile & footprint tracing' },
    { id: 'map', icon: MapIcon, label: 'Geo Mapping', desc: 'IP & location tracking' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-surface text-slate-400 font-sans selection:bg-brand/30 selection:text-white">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 240 : 64 }}
        className="bg-panel border-r border-slate-800 flex flex-col z-20"
      >
        <div className="h-14 border-b border-slate-800 flex items-center px-4 overflow-hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-brand flex items-center justify-center text-white font-bold italic shadow-[0_0_15px_rgba(8,145,178,0.3)]">
              S
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col whitespace-nowrap">
                <span className="text-[10px] font-mono tracking-widest text-brand uppercase">Spectre OSINT</span>
                <span className="text-[9px] text-slate-600 font-mono">v4.2.0-STABLE</span>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-2 py-6 space-y-4 overflow-y-auto overflow-x-hidden flex flex-col items-center">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as ToolType)}
              className={`w-full flex items-center gap-3 p-2 rounded-sm transition-all group ${
                activeTool === tool.id 
                ? 'text-brand border-l-2 border-brand bg-brand-muted' 
                : 'text-slate-600 hover:text-slate-400 border-l-2 border-transparent'
              }`}
            >
              <tool.icon size={22} className="shrink-0" />
              {isSidebarOpen && (
                <div className="text-left overflow-hidden">
                  <div className="text-xs font-bold uppercase tracking-wider whitespace-nowrap">{tool.label}</div>
                </div>
              )}
            </button>
          ))}
          
          <div className="mt-auto w-full">
            <button
              onClick={() => setActiveTool('settings')}
              className={`w-full flex items-center gap-3 p-2 rounded-sm transition-all group ${
                activeTool === 'settings' 
                ? 'text-brand border-l-2 border-brand bg-brand-muted' 
                : 'text-slate-600 hover:text-slate-400 border-l-2 border-transparent'
              }`}
            >
              <Settings size={22} className="shrink-0" />
              {isSidebarOpen && <span className="text-xs font-bold uppercase tracking-wider">System Config</span>}
            </button>
          </div>
        </nav>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full bg-surface relative">
        {/* Header Bar */}
        <header className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-panel shrink-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">Active Node</span>
            <ChevronRight size={12} className="text-slate-800" />
            <span className="text-[10px] font-mono text-brand truncate max-w-[240px] uppercase">
              // {tools.find(t => t.id === activeTool)?.label || activeTool}
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-[#1a1d23] border border-slate-700 px-3 py-1.5 rounded">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Status:</span>
              <span className="text-[10px] font-mono text-brand animate-pulse">ENCRYPTED_LINK_ACTIVE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">System Live</span>
            </div>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTool}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-6xl mx-auto h-full"
            >
              {activeTool === 'domain' && <DomainTool addLog={addLog} />}
              {activeTool === 'scrape' && <ScrapeTool addLog={addLog} />}
              {activeTool === 'map' && <MapTool addLog={addLog} />}
              {activeTool === 'social' && (
                <div className="flex flex-col items-center justify-center p-20 glass-panel border-dashed h-full">
                  <User size={48} className="mb-4 opacity-10" />
                  <h2 className="text-xl font-bold text-white mb-2">Social Recon Module</h2>
                  <p className="text-gray-500 text-center max-w-sm mb-6">
                    This module utilizes digital footprints to map user activity across platforms. 
                    Search for usernames, emails, or aliases.
                  </p>
                  <div className="w-full max-w-md flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Username, Email, or Full Name" 
                      className="flex-1 bg-white/5 border border-white/10 rounded-md px-4 py-2 focus:outline-none focus:border-brand/40 text-sm font-mono"
                    />
                    <button 
                      onClick={() => addLog("Searching social registries...", "info")}
                      className="bg-brand/20 hover:bg-brand/30 text-brand px-6 rounded-md text-sm font-bold border border-brand/20 transition-all shadow-[0_0_15px_rgba(0,255,0,0.1)]"
                    >
                      Search
                    </button>
                  </div>
                </div>
              )}
              {activeTool === 'settings' && (
                <div className="space-y-6">
                   <h2 className="text-2xl font-bold text-white">System Configuration</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="glass-panel p-6 space-y-4">
                        <h3 className="font-bold flex items-center gap-2">API Authentication</h3>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-xs text-gray-500 uppercase font-bold tracking-tighter">Gemini API Key</label>
                            <input type="password" value="••••••••••••••••" readOnly className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs font-mono text-brand/50" />
                            <p className="text-[10px] text-gray-600 italic">Key injected from system environment.</p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-gray-500 uppercase font-bold tracking-tighter">Google Maps API Key</label>
                            <input type="text" placeholder="Optional for full interactive maps" className="w-full bg-black/40 border border-white/5 rounded px-3 py-2 text-xs font-mono" />
                          </div>
                        </div>
                      </div>
                      <div className="glass-panel p-6 space-y-4">
                        <h3 className="font-bold flex items-center gap-2">Preferences</h3>
                        <div className="space-y-2">
                           <div className="flex items-center justify-between p-3 bg-white/5 rounded-md">
                              <span className="text-sm">Auto-analyze findings</span>
                              <div className="w-8 h-4 bg-brand rounded-full relative">
                                <div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full" />
                              </div>
                           </div>
                           <div className="flex items-center justify-between p-3 bg-white/5 rounded-md">
                              <span className="text-sm">Verbose terminal logging</span>
                              <div className="w-8 h-4 bg-brand rounded-full relative">
                                <div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full" />
                              </div>
                           </div>
                        </div>
                      </div>
                   </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Terminal */}
        <Terminal logs={logs} />
        
        {/* Navigation Status Bar */}
        <footer className="h-8 bg-[#0f1115] border-t border-slate-800 px-4 flex items-center justify-between text-[9px] font-mono tracking-tighter shrink-0 z-20">
          <div className="flex gap-6 items-center text-slate-500">
            <div className="flex gap-2 items-center">
              <span className="text-emerald-500 uppercase">Gateway:</span>
              <span>DE-BER-4-SOCKS5 [CONNECTED]</span>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-brand uppercase">Task:</span>
              <span>{logs[logs.length-1]?.message.substring(0, 30) || 'IDLE'}</span>
            </div>
          </div>
          <div className="flex gap-4 items-center text-slate-600">
            <span>MEM: 1.4GB / 8GB</span>
            <span className="text-slate-400">{new Date().toUTCString().split(' ')[4]} UTC</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
