import React from 'react';
import { 
  TrendingUp, DollarSign, Shield, Database, Users, ArrowUpRight, 
  CheckCircle2, AlertTriangle, Activity, Briefcase
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const revenueData = [
  { month: 'Jan', value: 4000 }, { month: 'Feb', value: 3000 }, { month: 'Mar', value: 5000 },
  { month: 'Apr', value: 4500 }, { month: 'May', value: 6000 }, { month: 'Jun', value: 5500 },
];

export default function OverviewDashboard() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-in fade-in">
      
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">Command Center</h1>
        <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* TARJETA 1: TITANIUM ERP (Con Borde Neón Azul) */}
        <div className="border-neon-blue shadow-lg">
          <div className="border-neon-inner p-5">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-blue-400 flex items-center gap-2"><Briefcase size={16}/> Titanium Core ERP</h2>
              <button className="text-xs text-slate-400 hover:text-white transition-colors">Gestionar →</button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase">MRR RD$</p>
                <p className="text-xl font-bold text-emerald-400 mt-1">431K</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">Clients</p>
                  <p className="text-xl font-bold text-white mt-1">124</p>
                </div>
                <div className="w-8 h-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[{value: 60}, {value: 40}]} innerRadius={10} outerRadius={16} dataKey="value" stroke="none">
                        <Cell fill="#0ea5e9" /><Cell fill="#8b5cf6" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase">Empleados</p>
                <p className="text-xl font-bold text-white mt-1">15</p>
              </div>
            </div>
          </div>
        </div>

        {/* TARJETA 2: SENTINEL (Con Borde Neón Rojo/Púrpura) */}
        <div className="border-neon-purple shadow-lg">
          <div className="border-neon-inner p-5">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-purple-400 flex items-center gap-2"><Shield size={16}/> Sentinel Defense</h2>
              <button className="text-xs text-slate-400 hover:text-white transition-colors">Ver Alertas →</button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase">Ataques Mitigados</p>
                <p className="text-xl font-bold text-rose-400 mt-1">4,192</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase">Trampas Activas</p>
                <p className="text-xl font-bold text-purple-400 mt-1">12</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase">Sockets Tarpit</p>
                <p className="text-xl font-bold text-sky-400 mt-1">108/500</p>
              </div>
            </div>
          </div>
        </div>

        {/* TARJETA 3: GRÁFICA DE INGRESOS */}
        <div className="lg:col-span-2 card-premium p-5">
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-sm font-bold text-slate-300">Revenue Overview</h2>
             <span className="text-xs text-emerald-400 flex items-center gap-1"><TrendingUp size={14}/> +12% YoY</span>
           </div>
           <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="value" stroke="#10b981" fill="url(#colorRev)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* TARJETA 4: EWB MOTORS (KRONOS) */}
        <div className="lg:col-span-2 card-premium p-5">
          <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2"><Database size={16}/> EWB Kronos Data Matrix</h2>
            <button className="text-xs text-slate-400 hover:text-white transition-colors">Abrir Gestor →</button>
          </div>
          <div className="grid grid-cols-3 gap-4">
             {/* Motores */}
             <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 border-t-2 border-t-emerald-500">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-white">PostgreSQL</span>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">100%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full"><div className="progress-bar-neon h-1.5 rounded-full" style={{width: '100%'}}></div></div>
             </div>
             <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 border-t-2 border-t-sky-500">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-white">MongoDB</span>
                  <span className="text-[9px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded">100%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full"><div className="progress-bar-neon h-1.5 rounded-full" style={{width: '100%'}}></div></div>
             </div>
             <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 border-t-2 border-t-amber-500">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-white">MySQL</span>
                  <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded">98%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full"><div className="progress-bar-neon h-1.5 rounded-full" style={{width: '98%'}}></div></div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}