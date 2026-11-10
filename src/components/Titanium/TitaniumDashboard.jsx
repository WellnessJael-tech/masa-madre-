import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Shield, Package, ShoppingCart, Users,
  TrendingUp, AlertTriangle, RefreshCw,
  ArrowUpRight, ArrowDownRight, Activity, Clock, Truck
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip as RTooltip, Legend
} from 'recharts';

// ==========================================
// DATOS SIMULADOS (Mock Data)
// ==========================================

const MOCK_METRICS = {
  salesTodayRD: 84500,
  salesTodayDelta: 12.3,
  ordersToday: 47,
  ordersTodayDelta: -3.1,
  newClientsToday: 8,
  newClientsTodayDelta: 5.0,
  criticalAlerts: 2,
};

const MOCK_SERIES = [
  { day: 'Lun', ventas: 62000, pedidos: 38 },
  { day: 'Mar', ventas: 71000, pedidos: 42 },
  { day: 'Mié', ventas: 58000, pedidos: 35 },
  { day: 'Jue', ventas: 89000, pedidos: 51 },
  { day: 'Vie', ventas: 95000, pedidos: 58 },
  { day: 'Sáb', ventas: 110000, pedidos: 65 },
  { day: 'Dom', ventas: 84500, pedidos: 47 },
];

const MOCK_MODULES = [
  { id: 'erp', name: 'Titanium ERP', status: 'ONLINE', uptime: 99.98, icon: <LayoutDashboard size={14} /> },
  { id: 'sentinel', name: 'Sentinel NMS', status: 'ONLINE', uptime: 99.92, icon: <Shield size={14} /> },
  { id: 'mudon', name: 'MUDON Logística', status: 'DEGRADED', uptime: 97.4, icon: <Truck size={14} /> },
  { id: 'masa-madre', name: 'Masa Madre', status: 'ONLINE', uptime: 99.99, icon: <Package size={14} /> },
];

const MOCK_ORDERS = [
  { id: '#1024', customer: 'María López', totalRD: 3450, status: 'NEW' },
  { id: '#1023', customer: 'Carlos Pérez', totalRD: 12500, status: 'PROCESSING' },
  { id: '#1022', customer: 'Ana Rodríguez', totalRD: 8900, status: 'SHIPPING' },
  { id: '#1021', customer: 'Luis Martínez', totalRD: 4200, status: 'DELIVERED' },
  { id: '#1020', customer: 'Elena Gómez', totalRD: 6700, status: 'CANCELLED' },
];

const MOCK_ALERTS = [
  { id: 'al_1', severity: 'HIGH', module: 'Sentinel', message: 'Pico de intentos de login fallidos detectado', timestamp: new Date().toISOString() },
  { id: 'al_2', severity: 'MEDIUM', module: 'MUDON', message: 'Chofer #4 sin actualizar estado de ruta', timestamp: new Date().toISOString() },
  { id: 'al_3', severity: 'CRITICAL', module: 'Sentinel', message: 'Ataque DDoS mitigado en tienda-cliente-01', timestamp: new Date().toISOString() },
];

// ==========================================
// COMPONENTES UI
// ==========================================

const KpiCard = ({ label, value, delta, icon, accent = 'text-sky-400', hint }) => {
  const positive = delta !== undefined && delta >= 0;
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-md p-3 flex flex-col gap-1 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">{label}</span>
        <span className={accent}>{icon}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-slate-100 leading-none">{value}</span>
        {delta !== undefined && (
          <span className={`inline-flex items-center text-[10px] font-medium ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {positive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      {hint && <span className="text-[10px] text-slate-500">{hint}</span>}
    </div>
  );
};

const ModuleChip = ({ m }) => {
  const color =
    m.status === 'ONLINE' ? 'border-emerald-500/30 text-emerald-400' :
    m.status === 'DEGRADED' ? 'border-amber-500/30 text-amber-400' :
    'border-rose-500/30 text-rose-400';
  return (
    <div className={`flex items-center justify-between gap-2 px-3 py-2 bg-slate-950 border rounded-md ${color}`}>
      <div className="flex items-center gap-2">
        <span className="text-slate-400">{m.icon}</span>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-200">{m.name}</span>
          <span className="text-[10px] text-slate-500">uptime {m.uptime.toFixed(1)}%</span>
        </div>
      </div>
      <span className={`w-2 h-2 rounded-full ${
        m.status === 'ONLINE' ? 'bg-emerald-400' :
        m.status === 'DEGRADED' ? 'bg-amber-400 animate-pulse' : 'bg-rose-400'
      }`} />
    </div>
  );
};

const OrderStatusBadge = ({ s }) => {
  const map = {
    NEW: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    PROCESSING: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    SHIPPING: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    DELIVERED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    CANCELLED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  };
  return (
    <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-bold border rounded ${map[s]}`}>
      {s}
    </span>
  );
};

const AlertSeverityBadge = ({ s }) => {
  const map = {
    CRITICAL: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    LOW: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
  };
  return (
    <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-bold border rounded ${map[s]}`}>
      {s}
    </span>
  );
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function TitaniumDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin text-sky-400 mx-auto mb-3" size={32} />
          <p className="text-slate-400 text-sm">Cargando Titanium ERP...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/10 rounded-lg">
              <LayoutDashboard className="text-sky-400" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100">Titanium ERP</h1>
              <p className="text-xs text-slate-400">Dashboard Operativo Central</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
              <Clock size={14} /> {new Date().toLocaleTimeString('es-DO')}
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors">
              <RefreshCw size={14} /> Actualizar
            </button>
          </div>
        </header>

        {/* KPIs */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard label="Ventas Hoy" value={`RD$ ${MOCK_METRICS.salesTodayRD.toLocaleString('es-DO')}`} delta={MOCK_METRICS.salesTodayDelta} icon={<TrendingUp size={16} />} hint="vs ayer" />
          <KpiCard label="Pedidos Hoy" value={MOCK_METRICS.ordersToday} delta={MOCK_METRICS.ordersTodayDelta} icon={<ShoppingCart size={16} />} accent="text-emerald-400" hint="vs ayer" />
          <KpiCard label="Clientes Nuevos" value={MOCK_METRICS.newClientsToday} delta={MOCK_METRICS.newClientsTodayDelta} icon={<Users size={16} />} accent="text-indigo-400" hint="vs ayer" />
          <KpiCard label="Alertas Críticas" value={MOCK_METRICS.criticalAlerts} icon={<Shield size={16} />} accent="text-rose-400" hint="Sentinel · 24h" />
        </section>

        {/* MÓDULOS + GRÁFICA */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 lg:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-300">Módulos Conectados</h2>
              <Activity size={14} className="text-slate-500" />
            </div>
            <div className="space-y-2">
              {MOCK_MODULES.map(m => <ModuleChip key={m.id} m={m} />)}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-300">Ventas y Pedidos · Últimos 7 días</h2>
              <TrendingUp size={14} className="text-slate-500" />
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_SERIES}>
                  <defs>
                    <linearGradient id="ventasGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="pedidosGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <RTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }} labelStyle={{ color: '#94a3b8' }} />
                  <Legend wrapperStyle={{ fontSize: 10, color: '#94a3b8' }} />
                  <Area type="monotone" dataKey="ventas" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#ventasGrad)" name="Ventas (RD$)" />
                  <Area type="monotone" dataKey="pedidos" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#pedidosGrad)" name="Pedidos" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* ALERTAS + PEDIDOS */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <h2 className="text-sm font-semibold text-slate-300">Alertas del Sistema</h2>
              <AlertTriangle size={14} className="text-amber-400" />
            </div>
            <ul className="divide-y divide-slate-800/50">
              {MOCK_ALERTS.map(a => (
                <li key={a.id} className="px-4 py-3 flex items-start gap-3 hover:bg-slate-800/30 transition-colors">
                  <AlertSeverityBadge s={a.severity} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-200 truncate">{a.message}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{a.module} · {new Date(a.timestamp).toLocaleTimeString('es-DO')}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <h2 className="text-sm font-semibold text-slate-300">Pedidos Recientes</h2>
              <Package size={14} className="text-slate-500" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/50 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-2 font-semibold">#</th>
                    <th className="px-4 py-2 font-semibold">Cliente</th>
                    <th className="px-4 py-2 font-semibold">Total</th>
                    <th className="px-4 py-2 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {MOCK_ORDERS.map(o => (
                    <tr key={o.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-2 font-mono text-slate-300">{o.id}</td>
                      <td className="px-4 py-2 text-slate-200 truncate max-w-[140px]">{o.customer}</td>
                      <td className="px-4 py-2 text-slate-200">RD$ {o.totalRD.toLocaleString('es-DO')}</td>
                      <td className="px-4 py-2"><OrderStatusBadge s={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <footer className="text-center text-[10px] text-slate-600 pt-4">
          Titanium ERP v1.0 · Dashboard unificado · Sentinel NMS · MUDON · Masa Madre
        </footer>
      </div>
    </div>
  );
}