import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, ShieldAlert, Terminal, Activity, Server, Globe, Lock, Cpu, 
  AlertTriangle, Network, Database, Play, FileText, Download, 
  CheckCircle2, Flame, MapPin, ChevronLeft, ChevronRight, HardDrive, 
  RefreshCw, Key, Save, List, Router, Wifi, Users, Eye, ShieldCheck, 
  Clock, Fingerprint, Zap, Plus, Search, Filter, Settings
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// --- DATOS SIMULADOS SEGÚN LOS REQUERIMIENTOS ---
const networkTraffic = [
  { time: '00:00', normal: 120, tarpit: 10, ataques: 5 },
  { time: '04:00', normal: 200, tarpit: 45, ataques: 20 },
  { time: '08:00', normal: 850, tarpit: 320, ataques: 150 },
  { time: '12:00', normal: 450, tarpit: 120, ataques: 80 },
  { time: '16:00', normal: 1200, tarpit: 850, ataques: 400 },
  { time: '20:00', normal: 600, tarpit: 200, ataques: 90 },
  { time: '23:59', normal: 300, tarpit: 80, ataques: 30 },
];

const attacksByClient = [
  { id: 1, name: 'Mudanzas Rápidas', attacks: 850, status: 'Mitigado', firewall: 'WAF-AWS', devices: 12, uptime: '99.9%' },
  { id: 2, name: 'Clínica Dental', attacks: 120, status: 'Bajo Observación', firewall: 'WAF-Básico', devices: 5, uptime: '99.8%' },
  { id: 3, name: 'Tienda El Sol (WISP)', attacks: 4200, status: 'CRÍTICO', firewall: 'WAF-Vercel (Vulnerado)', devices: 45, uptime: '95.2%' },
  { id: 4, name: 'EWB Core', attacks: 15, status: 'Estable', firewall: 'ZeroTrust', devices: 8, uptime: '100%' },
];

const bearTraps = [
  { id: 1, name: 'Bear Trap V2 (/.env)', status: 'ACTIVA', atrapados: 145, rotationTime: '12h' },
  { id: 2, name: 'Bear Trap (/wp-config.php)', status: 'ACTIVA', atrapados: 320, rotationTime: '24h' },
  { id: 3, name: 'Bear Trap (/db_backup.sql)', status: 'EN ROTACIÓN', atrapados: 45, rotationTime: '6h' },
  { id: 4, name: 'Honeypot SSH (Puerto 22)', status: 'DESACTIVADA', atrapados: 0, rotationTime: '-' },
];

const networkDevices = [
  { id: 'dev-1', name: 'Router Principal', type: 'Router', ip: '192.168.1.1', status: 'Online', portsOpen: 4, traffic: '450 Mbps' },
  { id: 'dev-2', name: 'Switch Core', type: 'Switch', ip: '192.168.1.2', status: 'Online', portsOpen: 24, traffic: '1.2 Gbps' },
  { id: 'dev-3', name: 'Servidor ERP', type: 'Server', ip: '10.0.0.5', status: 'Warning', portsOpen: 8, traffic: '300 Mbps' },
  { id: 'dev-4', name: 'PC Admin (Marketing)', type: 'PC', ip: '192.168.1.45', status: 'Online', portsOpen: 2, traffic: '50 Mbps' },
  { id: 'dev-5', name: 'Starlink Antenna', type: 'Satellite', ip: '100.64.0.1', status: 'Online', portsOpen: 1, traffic: '200 Mbps' },
];

const initialLogs = [
  "root@sentinel-core:~$ ./start --all-modules",
  "[OK] Módulo Tarpit iniciado (Max Concurrent: 500)",
  "[OK] Base de Datos PostgreSQL conectada",
  "[WARN] Tráfico anómalo en Tienda El Sol (IP: 185.220.101.4)",
  "[BEAR TRAP] Atacante atrapado en /db_backup.sql",
];

export default function SentinelConsole() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMenuOpen, setIsMenuOpen] = useState(true);
    // Nuevos estados para modales
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  
  // Estados para Terminal
  const [terminalInput, setTerminalInput] = useState('');
  const [logs, setLogs] = useState(initialLogs);
  const terminalEndRef = useRef(null);

  // Estados para gestión de dispositivos
  const [selectedClient, setSelectedClient] = useState(attacksByClient[2]); // Tienda El Sol por defecto
  const [showAddDevice, setShowAddDevice] = useState(false);

  // Estados interactivos para Firewalls / Bear Traps
  const [traps, setTraps] = useState(bearTraps);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleCommand = (e) => {
    if (e.key === 'Enter' && terminalInput.trim() !== '') {
      const cmd = terminalInput.toLowerCase();
      let response = `[EXEC] Comando '${terminalInput}' ejecutado.`;
      
      if (cmd.includes('attack')) {
        response = "[ALERT] Simulando inyección SQL desde IP 185.220.101.4...\n[BEAR TRAP] Redirigiendo a /db_backup.sql...\n[TARPIT] Reteniendo socket (1 byte/seg)...\n[OK] Atacante atrapado.";
      } else if (cmd.includes('status')) {
        response = "[STATUS] Servidores: 124 Online. Tarpits: 3 Activos. Bear Traps: 4.";
      } else if (cmd.includes('isolate')) {
        response = "[OK] Servidor aislado. Tráfico redirigido a Honeypot.";
      }

      const newLogs = [...logs, `root@sentinel-core:~$ ${terminalInput}`];
      setTimeout(() => {
        setLogs([...newLogs, response]);
        setTerminalInput('');
      }, 500);
      setLogs(newLogs);
    }
  };

  const toggleTrapStatus = (id) => {
    setTraps(traps.map(t => {
      if (t.id === id) {
        return { ...t, status: t.status === 'ACTIVA' ? 'DESACTIVADA' : 'ACTIVA' };
      }
      return t;
    }));
  };  return (
    <div className="flex h-[calc(100vh-80px)] bg-slate-950 text-slate-200 -m-6 p-6 relative">
      
      {/* SUB-SIDEBAR COLAPSABLE */}
      <aside className={`${isMenuOpen ? 'w-56' : 'w-16'} transition-all duration-300 border-r border-slate-800 pr-2 hidden lg:flex flex-col gap-1 relative`}>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="absolute -right-3 top-2 bg-slate-800 p-1 rounded-full border border-slate-700 text-slate-400 hover:text-white z-10">
          {isMenuOpen ? <ChevronLeft size={14}/> : <ChevronRight size={14}/>}
        </button>

        <div className={`mb-6 mt-4 flex items-center ${isMenuOpen ? 'gap-2' : 'justify-center'}`}>
          <Shield className="text-rose-500 shrink-0" size={24} />
          {isMenuOpen && (
            <div className="overflow-hidden whitespace-nowrap">
              <h2 className="text-sm font-bold text-white leading-tight">Sentinel SOC</h2>
              <p className="text-[10px] text-slate-500">v2.0 Enterprise</p>
            </div>
          )}
        </div>
        
        <button onClick={() => setActiveTab('overview')} className={`flex items-center ${isMenuOpen ? 'gap-2 px-2' : 'justify-center'} p-2.5 rounded text-sm text-left ${activeTab === 'overview' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900'}`} title="Vista General">
          <Activity size={18} className="shrink-0"/> {isMenuOpen && 'Vista General'}
        </button>
        <button onClick={() => setActiveTab('network')} className={`flex items-center ${isMenuOpen ? 'gap-2 px-2' : 'justify-center'} p-2.5 rounded text-sm text-left ${activeTab === 'network' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900'}`} title="Mapa de Red">
          <Network size={18} className="shrink-0"/> {isMenuOpen && 'Mapa de Red'}
        </button>
        <button onClick={() => setActiveTab('firewall')} className={`flex items-center ${isMenuOpen ? 'gap-2 px-2' : 'justify-center'} p-2.5 rounded text-sm text-left ${activeTab === 'firewall' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900'}`} title="Bear Traps & Firewalls">
          <Flame size={18} className="shrink-0"/> {isMenuOpen && 'Bear Traps & FW'}
        </button>
        <button onClick={() => setActiveTab('clientes')} className={`flex items-center ${isMenuOpen ? 'gap-2 px-2' : 'justify-center'} p-2.5 rounded text-sm text-left ${activeTab === 'clientes' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900'}`} title="Clientes WISP">
          <Globe size={18} className="shrink-0"/> {isMenuOpen && 'Clientes / WISP'}
        </button>
        <button onClick={() => setActiveTab('dba')} className={`flex items-center ${isMenuOpen ? 'gap-2 px-2' : 'justify-center'} p-2.5 rounded text-sm text-left ${activeTab === 'dba' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900'}`} title="Base de Datos">
          <Database size={18} className="shrink-0"/> {isMenuOpen && 'Base de Datos'}
        </button>
        <button onClick={() => setActiveTab('terminal')} className={`flex items-center ${isMenuOpen ? 'gap-2 px-2' : 'justify-center'} p-2.5 rounded text-sm text-left ${activeTab === 'terminal' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900'}`} title="Terminal">
          <Terminal size={18} className="shrink-0"/> {isMenuOpen && 'Terminal'}
        </button>
        <button onClick={() => setActiveTab('reportes')} className={`flex items-center ${isMenuOpen ? 'gap-2 px-2' : 'justify-center'} p-2.5 rounded text-sm text-left ${activeTab === 'reportes' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900'}`} title="Reportes">
          <FileText size={18} className="shrink-0"/> {isMenuOpen && 'Reportes'}
        </button>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto pl-0 lg:pl-6">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white capitalize">
              {activeTab === 'overview' ? 'Monitoreo Global' : 
               activeTab === 'network' ? 'Topología de Red (Simulador)' :
               activeTab === 'firewall' ? 'Gestión de Bear Traps y Firewalls' : 
               activeTab === 'clientes' ? 'Gestión de Clientes WISP' :
               activeTab === 'dba' ? 'Gestión de Base de Datos' :
               activeTab === 'terminal' ? 'Terminal Táctica' : 'Reportes Automáticos'}
            </h1>
            <p className="text-slate-400 text-sm">Cumplimiento de Requerimientos (Ley 53-07, 172-13, Deception Eng).</p>
          </div>
          <div className="flex gap-2">
            <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/20 flex items-center gap-2 text-xs font-medium">
              <CheckCircle2 size={14} /> Uptime: 99.98%
            </span>
            <button className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-colors shadow-lg shadow-rose-900/50">
              <AlertTriangle size={14} /> 1 Alerta Crítica
            </button>
          </div>
        </header>

                {/* PESTAÑA 1: VISTA GENERAL (Mejorada con más gráficas y feeds) */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in">
            {/* KPIs superiores */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                <p className="text-slate-400 text-xs mb-1 flex items-center gap-1"><Activity size={12}/> Tráfico Limpio</p>
                <p className="text-2xl font-bold text-emerald-400">1.2 TB</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                <p className="text-slate-400 text-xs mb-1 flex items-center gap-1"><ShieldAlert size={12}/> Atrapados en Tarpit</p>
                <p className="text-2xl font-bold text-rose-400">510</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                <p className="text-slate-400 text-xs mb-1 flex items-center gap-1"><Fingerprint size={12}/> IPs Bloqueadas</p>
                <p className="text-2xl font-bold text-amber-400">2,450</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                <p className="text-slate-400 text-xs mb-1 flex items-center gap-1"><Zap size={12}/> Latencia Promedio</p>
                <p className="text-2xl font-bold text-sky-400">12 ms</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Gráfica de Tráfico */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-5">
                <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2"><Activity size={16}/> Flujo de Red (Tarpit vs Normal)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={networkTraffic}>
                      <defs>
                        <linearGradient id="colorNorm" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorTarpit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="normal" stroke="#0ea5e9" fill="url(#colorNorm)" name="Tráfico Normal" />
                      <Area type="monotone" dataKey="tarpit" stroke="#f43f5e" fill="url(#colorTarpit)" name="Retenido en Tarpit" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Feed de Ataques Recientes */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col">
                <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2"><ShieldAlert size={16} className="text-rose-400"/> Feed de Ataques (Live)</h3>
                <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold text-rose-400 px-1.5 py-0.5 bg-rose-500/10 rounded">CRITICAL_BEAR_TRAP</span>
                        <span className="text-[10px] text-slate-500">Hace {i*2} min</span>
                      </div>
                      <p className="text-xs font-mono text-slate-300">IP: 185.220.101.{i}</p>
                      <p className="text-[10px] text-slate-500 mt-1">Objetivo: Tienda El Sol (Ruta: /.env)</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
                {/* PESTAÑA 2: MAPA DE RED (Simulador Completo) */}
        {activeTab === 'network' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Controles superiores */}
            <div className="flex flex-wrap justify-between items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">Cliente:</span>
                <select 
                  className="bg-slate-950 border border-slate-700 text-white text-sm p-2 rounded focus:outline-none focus:border-sky-500"
                  onChange={(e) => setSelectedClient(attacksByClient.find(c => c.name === e.target.value))}
                >
                  {attacksByClient.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">VLAN 10 · 192.168.1.0/24</span>
              </div>
              <div className="flex gap-2">
                <button className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded text-xs font-medium flex items-center gap-2">
                  <RefreshCw size={14} /> Refrescar Mapa
                </button>
                <button onClick={() => setShowAddDevice(!showAddDevice)} className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-2 rounded text-xs font-medium flex items-center gap-2">
                  <Plus size={14} /> Añadir Dispositivo
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Lienzo del Mapa (Ocupa 3 columnas) */}
              <div className="xl:col-span-3 bg-slate-900 border border-slate-800 rounded-lg p-5 min-h-[500px] relative overflow-hidden flex flex-col">
                <h3 className="font-semibold text-slate-200 w-full mb-4 flex items-center gap-2"><Network size={16}/> Topología de Red (Cliente: {selectedClient?.name})</h3>
                
                <div className="flex-1 bg-slate-950 border border-slate-800/50 rounded-lg relative p-4 overflow-auto flex justify-center items-start">
                  {/* Simulación de Mapa Grande */}
                  <div className="relative w-full max-w-3xl flex flex-col items-center gap-8 py-8">
                    
                    {/* Router Principal */}
                    <div className="flex flex-col items-center cursor-pointer group" onClick={() => { setSelectedDevice(networkDevices[0]); setIsDeviceModalOpen(true); }}>
                      <div className="w-16 h-16 bg-slate-800 border-2 border-rose-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.3)] group-hover:scale-105 transition-transform"><Wifi size={28} className="text-rose-400"/></div>
                      <span className="text-xs text-white mt-2 font-mono bg-slate-800 px-2 py-0.5 rounded">Router Core</span>
                      <span className="text-[10px] text-rose-400 mt-1">1 Alerta</span>
                    </div>
                    
                    {/* Líneas conectoras */}
                    <div className="w-px h-12 bg-slate-700"></div>
                    <div className="w-3/4 h-px bg-slate-700"></div>
                    
                    {/* Fila de Switches y Servidores */}
                    <div className="flex gap-16 justify-center w-full relative">
                      {/* Switch 1 */}
                      <div className="flex flex-col items-center relative">
                        <div className="w-0.5 h-8 bg-slate-700 absolute -top-8"></div>
                        <div className="flex flex-col items-center cursor-pointer group" onClick={() => { setSelectedDevice(networkDevices[1]); setIsDeviceModalOpen(true); }}>
                          <div className="w-12 h-12 bg-slate-800 border border-slate-600 rounded-lg flex items-center justify-center group-hover:border-sky-500 transition-colors"><Server size={22} className="text-emerald-400"/></div>
                          <span className="text-[10px] text-slate-400 mt-1">Switch 1</span>
                        </div>
                        <div className="w-px h-6 bg-slate-700 mt-2"></div>
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center cursor-pointer" onClick={() => { setSelectedDevice(networkDevices[3]); setIsDeviceModalOpen(true); }}>
                            <div className="w-8 h-8 bg-slate-800 border border-slate-600 rounded flex items-center justify-center"><Cpu size={14} className="text-sky-400"/></div>
                            <span className="text-[9px] text-slate-500 mt-1">PC-01</span>
                          </div>
                          <div className="flex flex-col items-center cursor-pointer" onClick={() => { setSelectedDevice(networkDevices[4]); setIsDeviceModalOpen(true); }}>
                            <div className="w-8 h-8 bg-slate-800 border border-slate-600 rounded flex items-center justify-center"><Cpu size={14} className="text-sky-400"/></div>
                            <span className="text-[9px] text-slate-500 mt-1">PC-02</span>
                          </div>
                        </div>
                      </div>

                      {/* Servidor ERP */}
                      <div className="flex flex-col items-center relative">
                        <div className="w-0.5 h-8 bg-slate-700 absolute -top-8"></div>
                        <div className="flex flex-col items-center cursor-pointer group" onClick={() => { setSelectedDevice(networkDevices[2]); setIsDeviceModalOpen(true); }}>
                          <div className="w-12 h-12 bg-slate-800 border border-slate-600 rounded-lg flex items-center justify-center group-hover:border-amber-500 transition-colors"><Database size={22} className="text-amber-400"/></div>
                          <span className="text-[10px] text-slate-400 mt-1">DB Server</span>
                        </div>
                      </div>

                      {/* Router WISP / Starlink */}
                      <div className="flex flex-col items-center relative">
                        <div className="w-0.5 h-8 bg-slate-700 absolute -top-8"></div>
                        <div className="flex flex-col items-center cursor-pointer group" onClick={() => { setSelectedDevice(networkDevices[5]); setIsDeviceModalOpen(true); }}>
                          <div className="w-12 h-12 bg-slate-800 border border-slate-600 rounded-lg flex items-center justify-center group-hover:border-emerald-500 transition-colors"><Router size={22} className="text-emerald-400"/></div>
                          <span className="text-[10px] text-slate-400 mt-1">Starlink</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel de Alertas y Terminal (1 columna) */}
              <div className="flex flex-col gap-4">
                {/* Alertas del Cliente */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex-1">
                  <h3 className="font-semibold text-slate-200 mb-3 flex items-center gap-2"><ShieldAlert size={16} className="text-amber-400"/> Alertas del Cliente</h3>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded text-amber-300">
                      <p className="font-bold">Router Core</p>
                      <p className="text-[10px]">Alta latencia detectada (120ms).</p>
                    </div>
                    <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded text-rose-300">
                      <p className="font-bold">DB Server</p>
                      <p className="text-[10px]">Intento de conexión no autorizada (IP: 185.220...).</p>
                    </div>
                  </div>
                </div>

                {/* Terminal del Cliente */}
                <div className="bg-black border border-slate-800 rounded-lg p-3 h-48 flex flex-col">
                  <h3 className="text-[11px] font-mono text-slate-400 flex items-center gap-1 mb-2"><Terminal size={12}/> Terminal (Cliente: {selectedClient?.name})</h3>
                  <div className="flex-1 font-mono text-[10px] text-emerald-400 overflow-y-auto">
                    <p>{'>'} ping 192.168.1.1</p>
                    <p className="text-slate-500">Reply from 192.168.1.1: bytes=32 time=12ms</p>
                    <p>{'>'} show interfaces</p>
                    <p className="text-slate-500">GigabitEthernet0/1 is up</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

                {/* PESTAÑA 3: FIREWALLS Y BEAR TRAPS */}
        {activeTab === 'firewall' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lista de Firewalls */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-slate-200 flex items-center gap-2"><Shield size={16}/> Firewalls Activos</h3>
                  <button className="text-xs text-sky-400 hover:underline">Ver Historial</button>
                </div>
                <div className="space-y-3">
                  {attacksByClient.map(c => (
                    <div key={c.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-white">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.firewall}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] px-2 py-1 rounded font-bold ${c.firewall.includes('Vulnerado') ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {c.firewall.includes('Vulnerado') ? 'VULNERADO' : 'PROTEGIDO'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gestión de Bear Traps */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-slate-200 flex items-center gap-2"><Flame size={16}/> Bear Traps (Garras de Oso)</h3>
                  <button className="text-xs text-sky-400 hover:underline">Configurar Rotación</button>
                </div>
                <div className="space-y-3">
                  {traps.map(trap => (
                    <div key={trap.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-white">{trap.name}</p>
                        <p className="text-xs text-slate-500">Atrapados: {trap.atrapados} · Rotación: {trap.rotationTime}</p>
                      </div>
                      <button 
                        onClick={() => toggleTrapStatus(trap.id)}
                        className={`text-[10px] px-3 py-1.5 rounded font-bold transition-colors ${trap.status === 'ACTIVA' ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : trap.status === 'EN ROTACIÓN' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'}`}
                      >
                        {trap.status}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 4: CLIENTES WISP (Gestión de red, VLANs, Ancho de banda) */}
        {activeTab === 'clientes' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
              <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2"><Globe size={16} className="text-indigo-400"/> Gestión de Clientes y Red (WISP)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3">Empresa / Cliente</th>
                      <th className="px-4 py-3">Dispositivos</th>
                      <th className="px-4 py-3">Ancho de Banda</th>
                      <th className="px-4 py-3">Uptime</th>
                      <th className="px-4 py-3">Estado de Pago</th>
                      <th className="px-4 py-3 text-right">Gestión</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {attacksByClient.map((client, i) => (
                      <tr key={i} className="hover:bg-slate-800/30">
                        <td className="px-4 py-3 font-medium text-slate-200">{client.name}</td>
                        <td className="px-4 py-3 text-slate-300">{client.devices}</td>
                        <td className="px-4 py-3 text-sky-400">{client.uptime === '95.2%' ? 'Saturado (95%)' : 'Normal'}</td>
                        <td className="px-4 py-3 text-emerald-400">{client.uptime}</td>
                        <td className="px-4 py-3"><span className="text-emerald-400 text-xs">Al día</span></td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-xs text-sky-400 hover:underline">Cortar Servicio</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
                <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2"><Wifi size={16}/> Redes y VLANs</h3>
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between text-slate-300 p-2 bg-slate-950 border border-slate-800 rounded"><span>VLAN 10 (Admin)</span><span className="text-emerald-400">Protegida</span></div>
                  <div className="flex justify-between text-slate-300 p-2 bg-slate-950 border border-slate-800 rounded"><span>VLAN 20 (Clientes)</span><span className="text-amber-400">Aislamiento RLS</span></div>
                  <div className="flex justify-between text-slate-300 p-2 bg-slate-950 border border-slate-800 rounded"><span>VLAN 30 (POS Cajas)</span><span className="text-emerald-400">Prioridad QoS</span></div>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
                <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2"><Eye size={16}/> Detección de Robo de Internet</h3>
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">Dispositivos conectados no autorizados:</p>
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded flex justify-between items-center">
                    <div><p className="text-sm font-bold text-rose-400">MAC: 00:1A:2B:3C:4D:5E</p><p className="text-[10px] text-rose-300">IP: 192.168.1.99</p></div>
                    <button className="text-[10px] bg-rose-600 text-white px-2 py-1 rounded">Bloquear</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
                {/* PESTAÑA 5: BASE DE DATOS */}
        {activeTab === 'dba' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg">
                <h4 className="text-slate-400 text-xs font-bold mb-2 flex items-center gap-1"><HardDrive size={14}/> ALMACENAMIENTO</h4>
                <p className="text-2xl font-bold text-white">1.4 TB <span className="text-sm font-normal text-slate-500">/ 2 TB</span></p>
                <div className="w-full bg-slate-800 rounded-full h-2 mt-3"><div className="bg-sky-500 h-2 rounded-full" style={{width: '70%'}}></div></div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg">
                <h4 className="text-slate-400 text-xs font-bold mb-2 flex items-center gap-1"><RefreshCw size={14}/> ÚLTIMO BACKUP</h4>
                <p className="text-xl font-bold text-white">Hoy, 03:00 AM</p>
                <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1"><CheckCircle2 size={12}/> Completado (AES-256)</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg">
                <h4 className="text-slate-400 text-xs font-bold mb-2 flex items-center gap-1"><ShieldCheck size={14}/> INTEGRIDAD (FIM)</h4>
                <p className="text-xl font-bold text-white">Verificada</p>
                <p className="text-xs text-slate-500 mt-1">Sin alteraciones no autorizadas.</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
               <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2"><List size={16}/> Tablas y Registros</h3>
               <div className="space-y-2 font-mono text-xs">
                 <div className="grid grid-cols-4 text-slate-500 border-b border-slate-800 pb-2 mb-2"><span>Tabla</span><span>Registros</span><span>Tamaño</span><span>Estado</span></div>
                 <div className="grid grid-cols-4 text-slate-300 py-1"><span>erp_schema.clients</span><span>124</span><span>2.4 MB</span><span className="text-emerald-400">Óptimo</span></div>
                 <div className="grid grid-cols-4 text-slate-300 py-1"><span>erp_schema.orders</span><span>15,420</span><span>45 MB</span><span className="text-emerald-400">Óptimo</span></div>
                 <div className="grid grid-cols-4 text-slate-300 py-1"><span>nms_schema.logs (Append-only)</span><span>4,200,120</span><span>1.1 GB</span><span className="text-amber-400">Retención: 90d</span></div>
                 <div className="grid grid-cols-4 text-slate-300 py-1"><span>erp_schema.users</span><span>15</span><span>1 MB</span><span className="text-emerald-400">Óptimo</span></div>
               </div>
               <div className="mt-6 flex gap-3">
                 <button className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-2 rounded text-xs font-medium flex items-center gap-2"><Save size={14}/> Forzar Backup Manual</button>
                 <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded text-xs font-medium flex items-center gap-2"><Key size={14}/> Rotar Claves de Cifrado</button>
               </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 6: TERMINAL TÁCTICA */}
        {activeTab === 'terminal' && (
          <div className="h-[500px] bg-black border border-slate-800 rounded-lg flex flex-col shadow-2xl animate-in fade-in">
            <div className="bg-slate-900 p-2 border-b border-slate-800 flex justify-between items-center rounded-t-lg">
              <span className="text-xs text-slate-400 font-mono flex items-center gap-2"><Terminal size={14}/> root@sentinel-core:~#</span>
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>
            </div>
            <div className="flex-1 p-4 font-mono text-xs text-emerald-400 overflow-y-auto space-y-1">
              {logs.map((log, i) => (
                <p key={i} className={log.includes('[WARN]') || log.includes('[ALERT]') ? 'text-amber-400' : log.includes('[OK]') ? 'text-emerald-400' : 'text-slate-300'}>{log}</p>
              ))}
              <div ref={terminalEndRef} />
            </div>
            <div className="p-2 bg-slate-900 border-t border-slate-800 flex items-center gap-2 rounded-b-lg">
              <span className="text-emerald-500 font-mono text-sm">$</span>
              <input type="text" value={terminalInput} onChange={(e) => setTerminalInput(e.target.value)} onKeyDown={handleCommand} placeholder="Escribe 'attack', 'status' o 'isolate' y presiona Enter..." className="flex-1 bg-transparent border-none text-emerald-400 font-mono text-xs focus:outline-none placeholder-slate-600" />
            </div>
          </div>
        )}

        {/* PESTAÑA 7: REPORTES AUTOMÁTICOS Y ENTREGABLES */}
        {activeTab === 'reportes' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center mb-2">
               <h2 className="text-lg font-bold text-white">Generador de Reportes (SIEM) y Entregables</h2>
               <button className="bg-sky-600 text-white px-4 py-2 rounded text-xs font-medium flex items-center gap-2"><Download size={14}/> Exportar Reporte Global</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg">
                <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2"><FileText size={16}/> Reportes Automáticos (Ley 53-07)</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded">
                    <div><p className="text-sm font-bold text-white">Incidentes de Seguridad</p><p className="text-xs text-slate-500">Logs de Tarpit y Bear Traps (Inalterables).</p></div>
                    <button className="text-xs text-sky-400 hover:underline">Generar</button>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded">
                    <div><p className="text-sm font-bold text-white">Auditoría de Datos (Ley 172-13)</p><p className="text-xs text-slate-500">Accesos a datos personales y retención.</p></div>
                    <button className="text-xs text-sky-400 hover:underline">Generar</button>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded">
                    <div><p className="text-sm font-bold text-white">Estado de Backups</p><p className="text-xs text-slate-500">Verificación de integridad SHA-256.</p></div>
                    <button className="text-xs text-sky-400 hover:underline">Generar</button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg">
                <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2"><ShieldAlert size={16}/> Reportes para Clientes (Entregables)</h3>
                <div className="space-y-3">
                   <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                    <p className="text-sm font-bold text-white mb-2">Generar Reporte de Servicio</p>
                    <select className="w-full bg-slate-900 border border-slate-700 text-slate-300 text-xs p-2 rounded mb-2 focus:outline-none focus:border-sky-500">
                      <option>Selecciona una empresa...</option>
                      {attacksByClient.map(c => <option key={c.id}>{c.name}</option>)}
                    </select>
                    <div className="flex gap-2">
                       <select className="w-1/2 bg-slate-900 border border-slate-700 text-slate-300 text-xs p-2 rounded focus:outline-none focus:border-sky-500">
                        <option>Mes Actual</option>
                        <option>Mes Anterior</option>
                      </select>
                      <button className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium">Exportar PDF</button>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">* Estos reportes alimentan el módulo de "Entregables" en el ERP Titanium para justificar los pagos mensuales de los planes V1-V4.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      {/* MODAL DE DETALLE DE DISPOSITIVO */}
      {isDeviceModalOpen && selectedDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-950/50">
              <h3 className="font-bold text-white flex items-center gap-2"><Server size={18} className="text-sky-400"/> Detalles del Dispositivo</h3>
              <button onClick={() => setIsDeviceModalOpen(false)} className="text-slate-400 hover:text-white"><ChevronRight className="rotate-90" size={20}/></button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Nombre</p>
                  <p className="text-sm font-medium text-white">{selectedDevice.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Tipo</p>
                  <p className="text-sm font-medium text-white">{selectedDevice.type}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Dirección IP</p>
                  <p className="text-sm font-mono text-sky-400">{selectedDevice.ip}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Estado</p>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full ${selectedDevice.status === 'Online' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedDevice.status === 'Online' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                    {selectedDevice.status}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
                <p className="text-xs text-slate-500 mb-2 font-semibold">Métricas de Red</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div><p className="text-[10px] text-slate-500">Puertos</p><p className="text-sm font-bold text-white">{selectedDevice.portsOpen}</p></div>
                  <div><p className="text-[10px] text-slate-500">Tráfico</p><p className="text-sm font-bold text-emerald-400">{selectedDevice.traffic}</p></div>
                  <div><p className="text-[10px] text-slate-500">MAC</p><p className="text-[10px] font-mono text-slate-400">A1:B2:C3:D4</p></div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded transition-colors flex items-center justify-center gap-2"><Terminal size={14}/> Abrir Terminal</button>
                <button className="flex-1 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-xs font-medium rounded transition-colors">Aislar Dispositivo</button>
              </div>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}