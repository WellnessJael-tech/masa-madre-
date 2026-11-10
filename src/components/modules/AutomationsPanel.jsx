import React, { useState } from 'react';
import { Zap, Plus, ChevronRight, Play, Bell, Shield, UserPlus } from 'lucide-react';

export default function AutomationsPanel() { // <--- EL EXPORT DEFAULT ESTÁ AQUÍ
  const [automations] = useState([
    { id: 1, trigger: 'Nuevo Cliente Creado', action: 'Asignar al Agente de Marketing', icon: <UserPlus size={16} className="text-sky-400"/>, active: true, runs: 12 },
    { id: 2, trigger: 'Sentinel detecta Ataque Crítico', action: 'Notificar al Super Admin por SMS', icon: <Shield size={16} className="text-rose-400"/>, active: true, runs: 4 },
    { id: 3, trigger: 'Tarea pasa a QA', action: 'Notificar al Gerente de Calidad', icon: <Bell size={16} className="text-amber-400"/>, active: false, runs: 0 },
  ]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-slate-200 flex items-center gap-2">
            <Zap size={18} className="text-sky-400"/> Automatizaciones Activas
          </h3>
          <p className="text-xs text-slate-500 mt-1">Procesos que el sistema ejecuta en segundo plano por ti.</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 rounded-md text-xs font-medium transition-colors">
          <Plus size={14} /> Crear Regla
        </button>
      </div>

      <div className="space-y-3">
        {automations.map(auto => (
          <div key={auto.id} className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg group hover:border-sky-500/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-900 rounded-md border border-slate-800">
                {auto.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200 flex items-center gap-2">
                  <span className="text-slate-500 text-xs uppercase">Cuando</span> {auto.trigger}
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <ChevronRight size={12}/> <span className="text-slate-500 text-[10px] uppercase">Entonces</span> {auto.action}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  auto.active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${auto.active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></span>
                  {auto.active ? 'Activa' : 'Pausada'}
                </span>
                <p className="text-[10px] text-slate-500 mt-1">{auto.runs} ejecuciones este mes</p>
              </div>
              <button className="p-2 text-slate-500 hover:text-sky-400 transition-colors">
                <Play size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}