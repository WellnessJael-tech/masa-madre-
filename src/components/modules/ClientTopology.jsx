import React, { useState } from 'react';
import { 
  ChevronLeft, Router, Server, Monitor, Shield, Wifi, 
  Database, Play, AlertTriangle, CheckCircle2, Lock, 
  Download, Activity
} from 'lucide-react';

// Datos simulados de los dispositivos del cliente
const clientDevices = [
  { id: 'rt-01', name: 'Core-RT-01', type: 'Router', ip: '192.168.10.1', mac: '00:1A:2B:3C:4D:5E', status: 'Online', os: 'Cisco IOS', agent: 'Installed', lastSeen: 'Just now' },
  { id: 'fw-01', name: 'FW-Edge-01', type: 'Firewall', ip: '10.0.0.1', mac: '00:1A:2B:3C:4D:60', status: 'Warning', os: 'pfSense 2.6', agent: 'Installed', lastSeen: '2 min ago' },
  { id: 'sw-01', name: 'L2-Switch-01', type: 'Switch', ip: '192.168.10.10', mac: '00:1A:2B:3C:4D:63', status: 'Online', os: 'Cisco IOS', agent: 'N/A', lastSeen: 'Just now' },
  { id: 'srv-01', name: 'ERP-SERVER', type: 'Server', ip: '10.0.0.5', mac: '00:1A:2B:3C:4D:61', status: 'Compromised', os: 'Ubuntu 22.04', agent: 'Not Installed', lastSeen: '5 min ago' },
  { id: 'pc-01', name: 'CLIENT-WS-01', type: 'PC', ip: '192.168.10.101', mac: '00:1A:2B:3C:4D:65', status: 'Online', os: 'Windows 11', agent: 'Installed', lastSeen: 'Just now' },
  { id: 'pc-02', name: 'CLIENT-WS-02', type: 'PC', ip: '192.168.10.102', mac: '00:1A:2B:3C:4D:66', status: 'Warning', os: 'Windows 10', agent: 'Installed', lastSeen: '10 min ago' },
];

export default function ClientTopology({ clientName, onBack }) {
  const [selectedDevice, setSelectedDevice] = useState(clientDevices[3]); // Selecciona el servidor comprometido por defecto

  // Función para pintar los colores de estado
  const getStatusColor = (status) => {
    if (status === 'Online') return 'border-emerald-500 text-emerald-400 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
    if (status === 'Warning') return 'border-amber-500 text-amber-400 bg-amber-500/10';
    if (status === 'Compromised') return 'border-rose-500 text-rose-400 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse';
    return 'border-slate-500 text-slate-400 bg-slate-800';
  };

  return (
    <div className="flex h-full gap-6">
      
      {/* MAPA DE RED (Izquierda - 70%) */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden relative">
        
        {/* Header del Mapa */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 z-10">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"><ChevronLeft size={18}/></button>
            <h2 className="text-lg font-bold text-white">Topología: {clientName}</h2>
          </div>
          <div className="flex gap-2">
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">VLAN 10 · 192.168.10.0/24</span>
          </div>
        </div>

        {/* Lienzo de Red */}
        <div className="flex-1 bg-slate-950 relative flex items-center justify-center overflow-hidden p-8">
          {/* Fondo de cuadrícula */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

          <div className="relative w-full max-w-3xl flex flex-col items-center gap-12 z-10">
            
            {/* Nivel 1: Router */}
            <div 
              onClick={() => setSelectedDevice(clientDevices[0])}
              className={`cursor-pointer flex flex-col items-center p-3 rounded-xl border-2 transition-all ${getStatusColor(clientDevices[0].status)}`}
            >
              <Router size={32}/>
              <span className="text-xs font-bold mt-2">{clientDevices[0].name}</span>
            </div>

            {/* Conectores CSS */}
            <div className="w-px h-12 bg-slate-700 absolute top-24"></div>
            <div className="w-3/4 h-px bg-slate-700 absolute top-36"></div>
            
            {/* Nivel 2: Firewall y Switch */}
            <div className="flex justify-between w-full px-16 mt-8">
              <div 
                onClick={() => setSelectedDevice(clientDevices[1])}
                className={`cursor-pointer flex flex-col items-center p-3 rounded-xl border-2 transition-all ${getStatusColor(clientDevices[1].status)}`}
              >
                <Shield size={32}/>
                <span className="text-xs font-bold mt-2">{clientDevices[1].name}</span>
              </div>
              
              <div 
                onClick={() => setSelectedDevice(clientDevices[2])}
                className={`cursor-pointer flex flex-col items-center p-3 rounded-xl border-2 transition-all ${getStatusColor(clientDevices[2].status)}`}
              >
                <Server size={32}/>
                <span className="text-xs font-bold mt-2">{clientDevices[2].name}</span>
              </div>
            </div>

            {/* Conectores CSS */}
            <div className="w-px h-8 bg-slate-700 absolute top-56 left-1/4"></div>
            <div className="w-px h-8 bg-slate-700 absolute top-56 right-1/4"></div>

            {/* Nivel 3: Servidores y PCs */}
            <div className="flex justify-between w-full px-4 mt-4">
              <div 
                onClick={() => setSelectedDevice(clientDevices[4])}
                className={`cursor-pointer flex flex-col items-center p-3 rounded-xl border-2 transition-all ${getStatusColor(clientDevices[4].status)}`}
              >
                <Monitor size={28}/>
                <span className="text-[10px] font-bold mt-2">{clientDevices[4].name}</span>
              </div>

              <div 
                onClick={() => setSelectedDevice(clientDevices[3])}
                className={`cursor-pointer flex flex-col items-center p-3 rounded-xl border-2 transition-all ${getStatusColor(clientDevices[3].status)}`}
              >
                <Database size={32}/>
                <span className="text-xs font-bold mt-2">{clientDevices[3].name}</span>
              </div>

              <div 
                onClick={() => setSelectedDevice(clientDevices[5])}
                className={`cursor-pointer flex flex-col items-center p-3 rounded-xl border-2 transition-all ${getStatusColor(clientDevices[5].status)}`}
              >
                <Monitor size={28}/>
                <span className="text-[10px] font-bold mt-2">{clientDevices[5].name}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Mini Consola CLI */}
        <div className="h-32 bg-black border-t border-slate-800 p-3 flex flex-col font-mono text-[11px]">
          <div className="text-slate-500 flex items-center gap-2 mb-1"><Terminal size={12}/> Sentinel Safe CLI</div>
          <div className="text-emerald-400 overflow-y-auto">
            <p>$ ping {selectedDevice.ip}</p>
            <p className="text-slate-400">64 bytes from {selectedDevice.ip}: icmp_seq=1 ttl=64 time=12.4 ms</p>
            <p>$ sentinel scan {selectedDevice.ip}</p>
            <p className="text-slate-400">Scanning ports... Found 3 open ports.</p>
          </div>
        </div>
      </div>

      {/* INSPECTOR DE DISPOSITIVO (Derecha - 30%) */}
      <div className="w-80 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/50">
          <h3 className="text-sm font-bold text-white flex items-center gap-2"><Activity size={16}/> Device Specifications</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-lg border ${getStatusColor(selectedDevice.status)}`}>
               {selectedDevice.type === 'Router' && <Router size={24}/>}
               {selectedDevice.type === 'Switch' && <Server size={24}/>}
               {selectedDevice.type === 'PC' && <Monitor size={24}/>}
               {selectedDevice.type === 'Firewall' && <Shield size={24}/>}
            </div>
            <div>
              <p className="text-lg font-bold text-white">{selectedDevice.name}</p>
              <p className={`text-xs font-medium ${selectedDevice.status === 'Compromised' ? 'text-rose-400' : 'text-emerald-400'}`}>{selectedDevice.status}</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-500">IP Address</span><span className="text-sky-400 font-mono">{selectedDevice.ip}</span></div>
            <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-500">MAC Address</span><span className="text-slate-300 font-mono">{selectedDevice.mac}</span></div>
            <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-500">OS</span><span className="text-slate-300">{selectedDevice.os}</span></div>
            <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-500">Last Seen</span><span className="text-slate-300">{selectedDevice.lastSeen}</span></div>
            
            <div className="flex justify-between border-b border-slate-800 pb-2 items-center">
              <span className="text-slate-500">Sentinel Agent</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedDevice.agent === 'Installed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {selectedDevice.agent}
              </span>
            </div>
          </div>

          <div className="pt-4 space-y-2">
            <button className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded transition-colors flex items-center justify-center gap-2">
              <Lock size={14}/> Aislar Dispositivo
            </button>
            <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition-colors flex items-center justify-center gap-2">
              <Download size={14}/> Exportar Reporte
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}