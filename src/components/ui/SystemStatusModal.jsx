import React from 'react';
import { X, Database, Shield, Globe, Server, Activity, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function SystemStatusModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const systems = [
    { id: 'db', name: 'Base de Datos (PostgreSQL)', status: 'ONLINE', uptime: '99.99%', icon: <Database size={18} className="text-emerald-400" />, detail: 'Latencia: 12ms · CPU: 24%' },
    { id: 'masa', name: 'Masa Madre (Core Engine)', status: 'ONLINE', uptime: '99.90%', icon: <Server size={18} className="text-indigo-400" />, detail: 'Nodos activos: 4 · Caché: 85%' },
    { id: 'sentinel', name: 'Sentinel (IDS/IPS)', status: 'PROTECTED', uptime: '100%', icon: <Shield size={18} className="text-rose-400" />, detail: 'Reglas activas: 1,492 · Bloqueos hoy: 84' },
    { id: 'web', name: 'EWB Storefronts (CDN)', status: 'ONLINE', uptime: '99.95%', icon: <Globe size={18} className="text-sky-400" />, detail: 'Webs alojadas: 124 · Tráfico: 45K/h' },
    { id: 'billing', name: 'Pasarela de Pagos (Azul)', status: 'DEGRADED', uptime: '97.20%', icon: <AlertTriangle size={18} className="text-amber-400" />, detail: 'Mantenimiento programado por el banco' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
        
        {/* Header del Modal */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <Activity className="text-sky-400" size={24} />
            <div>
              <h2 className="text-lg font-bold text-white">Estado de la Infraestructura</h2>
              <p className="text-xs text-slate-400">Monitoreo en tiempo real de servicios EWB</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Lista de Sistemas */}
        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {systems.map(sys => (
            <div key={sys.id} className="bg-slate-950 border border-slate-800/80 p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  {sys.icon}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">{sys.name}</h4>
                  <p className="text-xs text-slate-500">{sys.detail}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border
                  ${sys.status === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    sys.status === 'PROTECTED' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                    'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                  {sys.status === 'ONLINE' && <CheckCircle2 size={12} />}
                  {sys.status}
                </span>
                <p className="text-[10px] text-slate-500 mt-1">Uptime: {sys.uptime}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer del Modal */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-md transition-colors">
            Cerrar
          </button>
          <button className="px-4 py-2 text-sm bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-md transition-colors">
            Ver Logs de Servidor
          </button>
        </div>
      </div>
    </div>
  );
}