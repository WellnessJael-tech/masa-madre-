import React, { useState } from 'react';
import { 
  Search, Plus, Building2, Shield, Globe, Truck, X, DollarSign, 
  Calendar, ExternalLink, Filter, Download, FileText, CheckCircle2, AlertTriangle, MessageSquare
} from 'lucide-react';

const initialClients = [
  { id: 1, name: 'Mudanzas Rápidas SRL', plan: 'V3', status: 'Activo', mrr: 15000, since: '2023-05-10', contact: 'Juan Pérez', email: 'juan@mudanzas.com', phone: '809-555-0101', incidents: 12, modules: ['Web', 'Sentinel', 'MUDON'] },
  { id: 2, name: 'Clínica Dental Sonrisa', plan: 'V1', status: 'Activo', mrr: 5000, since: '2024-01-20', contact: 'Dra. Ana Gómez', email: 'ana@sonrisa.com', phone: '809-555-0102', incidents: 2, modules: ['Web'] },
  { id: 3, name: 'Tienda El Sol', plan: 'V2', status: 'En Mora', mrr: 8500, since: '2023-11-15', contact: 'Carlos Ruiz', email: 'carlos@elsol.com', phone: '809-555-0103', incidents: 145, modules: ['Web', 'Sentinel'] },
  { id: 4, name: 'Inmobiliaria Vista', plan: 'V4', status: 'Activo', mrr: 35000, since: '2022-08-01', contact: 'Luis Martínez', email: 'luis@vista.com', phone: '809-555-0104', incidents: 0, modules: ['Web', 'Sentinel', 'MUDON', 'CRM'] },
];

export default function ClientDirectory() {
  const [clients] = useState(initialClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  // Filtrado lógico
  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.contact.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === 'ALL' || c.plan === filterPlan;
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const getPlanColor = (plan) => {
    switch(plan) {
      case 'V4': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'V3': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'V2': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* HEADER Y BOTÓN NUEVO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Building2 className="text-sky-400" /> Cartera de Clientes</h1>
          <p className="text-slate-400 text-sm mt-1">Gestiona contratos, planes y facturación de tus clientes.</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium rounded-md transition-colors shadow-sm">
          <Plus size={16} /> Nuevo Cliente
        </button>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="flex flex-col md:flex-row items-center gap-3 mb-4 bg-slate-900 border border-slate-800 p-3 rounded-lg">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Buscar por empresa o contacto..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={16} className="text-slate-500 hidden sm:block" />
          <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)} className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-md p-2 focus:outline-none focus:border-sky-500 flex-1 md:flex-none">
            <option value="ALL">Todos los Planes</option>
            <option value="V1">Plan V1</option>
            <option value="V2">Plan V2</option>
            <option value="V3">Plan V3</option>
            <option value="V4">Plan V4</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-md p-2 focus:outline-none focus:border-sky-500 flex-1 md:flex-none">
            <option value="ALL">Todos los Estados</option>
            <option value="Activo">Activos</option>
            <option value="En Mora">En Mora</option>
          </select>
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Empresa / Contacto</th>
                <th className="px-6 py-4 font-semibold">Plan</th>
                <th className="px-6 py-4 font-semibold">MRR (Mensual)</th>
                <th className="px-6 py-4 font-semibold">Incidentes Sentinel</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredClients.map(client => (
                <tr key={client.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-200">{client.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{client.contact}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold border ${getPlanColor(client.plan)}`}>PLAN {client.plan}</span>
                  </td>
                  <td className="px-6 py-4 text-emerald-400 font-medium">RD$ {client.mrr.toLocaleString('es-DO')}</td>
                  <td className="px-6 py-4 text-slate-300">
                    {client.incidents > 100 ? <span className="text-rose-400 flex items-center gap-1"><AlertTriangle size={12}/> {client.incidents}</span> : client.incidents}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs ${client.status === 'Activo' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${client.status === 'Activo' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setSelectedClient(client)} className="text-slate-400 hover:text-white px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-xs font-medium transition-colors">
                      Ver Ficha
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredClients.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">No se encontraron clientes con esos filtros.</div>}
        </div>
      </div>

      {/* FICHA 360° DEL CLIENTE (DRAWER) */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setSelectedClient(null)}></div>
          
          <div className="relative w-full max-w-2xl bg-slate-900 h-full shadow-2xl border-l border-slate-800 flex flex-col animate-slide-in">
            {/* Header Drawer */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-950/30">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedClient.name}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPlanColor(selectedClient.plan)}`}>PLAN {selectedClient.plan}</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1"><Calendar size={12}/> Cliente desde {selectedClient.since}</span>
                </div>
              </div>
              <button onClick={() => setSelectedClient(null)} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>

            {/* Pestañas */}
            <div className="flex border-b border-slate-800 px-6">
              {['general', 'servicios', 'seguridad', 'facturacion'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-3 text-sm font-medium border-b-2 capitalize transition-colors ${activeTab === tab ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Contenido de la Pestaña */}
            <div className="flex-1 overflow-y-auto p-6">
              
              {/* TAB: GENERAL */}
              {activeTab === 'general' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Contacto Principal</p>
                      <p className="text-sm font-medium text-white">{selectedClient.contact}</p>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Teléfono</p>
                      <p className="text-sm font-medium text-white">{selectedClient.phone}</p>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg col-span-2">
                      <p className="text-xs text-slate-500 mb-1">Correo Electrónico</p>
                      <p className="text-sm font-medium text-sky-400">{selectedClient.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-md text-sm font-medium flex items-center justify-center gap-2"><MessageSquare size={16}/> Enviar Mensaje</button>
                    <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-md text-sm font-medium flex items-center justify-center gap-2"><FileText size={16}/> Ver Contrato</button>
                  </div>
                </div>
              )}

              {/* TAB: SERVICIOS */}
              {activeTab === 'servicios' && (
                <div className="space-y-4 animate-in fade-in">
                  <h3 className="text-sm font-semibold text-slate-200">Módulos Contratados</h3>
                  {selectedClient.modules.map(mod => (
                    <div key={mod} className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-900 rounded-md border border-slate-800">
                          {mod === 'Web' && <Globe size={18} className="text-sky-400"/>}
                          {mod === 'Sentinel' && <Shield size={18} className="text-rose-400"/>}
                          {mod === 'MUDON' && <Truck size={18} className="text-amber-400"/>}
                          {mod === 'CRM' && <Building2 size={18} className="text-indigo-400"/>}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{mod}</p>
                          <p className="text-xs text-slate-500">Servicio Activo</p>
                        </div>
                      </div>
                      <button className="text-xs text-sky-400 hover:text-sky-300 font-medium">Gestionar</button>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB: SEGURIDAD (Sentinel) */}
              {activeTab === 'seguridad' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg text-center">
                      <p className="text-xs text-slate-500 mb-1">Incidentes Bloqueados</p>
                      <p className={`text-2xl font-bold ${selectedClient.incidents > 100 ? 'text-rose-400' : 'text-emerald-400'}`}>{selectedClient.incidents}</p>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg text-center">
                      <p className="text-xs text-slate-500 mb-1">Uptime (30 días)</p>
                      <p className="text-2xl font-bold text-emerald-400">99.9%</p>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200">Últimos Incidentes (Sentinel NMS)</h3>
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
                      <tr><th className="p-2">Fecha</th><th className="p-2">Ataque</th><th className="p-2">Severidad</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      <tr><td className="p-2 text-slate-400">Hoy, 10:45</td><td className="p-2 text-slate-300">SQL Injection</td><td className="p-2 text-rose-400 font-bold">CRÍTICA</td></tr>
                      <tr><td className="p-2 text-slate-400">Ayer, 14:20</td><td className="p-2 text-slate-300">Botnet Scan</td><td className="p-2 text-amber-400 font-bold">MEDIA</td></tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB: FACTURACIÓN */}
              {activeTab === 'facturacion' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="text-sm text-slate-400">Mensualidad (MRR)</p>
                      <p className="text-2xl font-bold text-white">RD$ {selectedClient.mrr.toLocaleString('es-DO')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Estado de Pago</p>
                      <span className={`inline-flex items-center gap-1.5 text-sm font-bold ${selectedClient.status === 'Activo' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {selectedClient.status === 'Activo' ? 'Al Día' : 'En Mora'}
                      </span>
                    </div>
                  </div>
                  <button className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-sm font-medium flex items-center justify-center gap-2"><DollarSign size={16}/> Registrar Pago</button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}