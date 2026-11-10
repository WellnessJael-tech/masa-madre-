import React, { useState } from 'react';
import { 
  Database, Activity, Download, Upload, Play, AlertTriangle, 
  CheckCircle2, X, FileCode, Lock, HardDrive, Search
} from 'lucide-react';

const engines = [
  { name: 'PostgreSQL', status: 'Healthy', color: 'emerald', value: 100 },
  { name: 'MongoDB', status: 'Active', color: 'sky', value: 100 },
  { name: 'MySQL', status: 'Active', color: 'sky', value: 100 },
  { name: 'Oracle', status: 'Healthy', color: 'emerald', value: 100 },
];

const tablesData = [
  { name: 'erp_schema.clients', engine: 'Postgres', records: '24,953', size: '55.3 MB', status: 'OPTIMO' },
  { name: 'erp_schema.orders', engine: 'Postgres', records: '353', size: '32.62 MB', status: 'OPTIMO' },
  { name: 'nms_schema.logs', engine: 'Mongo', records: '33', size: '23.10 KB', status: 'APPEND-ONLY' },
  { name: 'erp_schema.users', engine: 'Postgres', records: '24,368', size: '5.32 MB', status: 'OPTIMO' },
];

export default function KronosDataMatrix() {
  const [isVaultOpen, setIsVaultOpen] = useState(true);
  const [query, setQuery] = useState("-- Select a query or write your own\nSELECT * FROM erp_schema.clients LIMIT 10;\n\n-- Run Migration\n[Ejecutar Migración]");

  return (
    <div className="p-6 h-full flex flex-col gap-4">
      
            {/* HEADER TÁCTICO (Tarjetas de Motores) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {engines.map((eng, i) => (
          <div key={i} className={`bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden shadow-lg border-t-2 ${eng.color === 'emerald' ? 'border-t-emerald-500' : 'border-t-sky-500'}`}>
            <div className="flex justify-between items-start mb-2 z-10">
              <div>
                <h3 className="text-sm font-bold text-white">{eng.name}</h3>
                <p className={`text-[10px] font-medium mt-1 flex items-center gap-1 ${eng.color === 'emerald' ? 'text-emerald-400' : 'text-sky-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${eng.color === 'emerald' ? 'bg-emerald-400' : 'bg-sky-400'}`}></span>{eng.status}
                </p>
              </div>
              <span className="text-[10px] text-slate-500">Active</span>
            </div>
            
            {/* Medidor semicircular simulado */}
            <div className="flex justify-center mt-2 z-10">
              <div className="w-24 h-12 relative overflow-hidden">
                 <div className="absolute inset-0 rounded-t-full border-[6px] border-slate-800 border-b-0"></div>
                 <div className={`absolute inset-0 rounded-t-full border-[6px] ${eng.color === 'emerald' ? 'border-emerald-500' : 'border-sky-500'} border-b-0`} style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}></div>
                 <span className="absolute bottom-0 w-full text-center text-lg font-bold text-white">{eng.value}%</span>
              </div>
            </div>
            {/* Brillo de fondo sutil */}
            <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 ${eng.color === 'emerald' ? 'bg-emerald-500' : 'bg-sky-500'}`}></div>
          </div>
        ))}
      </div>

      {/* ÁREA CENTRAL (Tabla + Consola + Vault) */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        
        {/* Tabla de Tablas */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl flex-1 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-white">Tables & Schemas</h3>
              <div className="relative">
                <Search size={12} className="absolute left-2 top-1.5 text-slate-500" />
                <input type="text" placeholder="Search tables..." className="bg-slate-950 border border-slate-800 text-[10px] text-slate-300 rounded pl-7 pr-2 py-1 focus:outline-none focus:border-sky-500" />
              </div>
            </div>
            <div className="overflow-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/50 text-slate-500 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Table Name</th>
                    <th className="px-4 py-2 font-semibold">Engine Type</th>
                    <th className="px-4 py-2 font-semibold">Count</th>
                    <th className="px-4 py-2 font-semibold">Size</th>
                    <th className="px-4 py-2 font-semibold">FIM Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {tablesData.map((t, i) => (
                    <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 text-slate-200 font-medium">{t.name}</td>
                      <td className="px-4 py-3 text-slate-400">{t.engine}</td>
                      <td className="px-4 py-3 text-slate-300">{t.records}</td>
                      <td className="px-4 py-3 text-slate-300">{t.size}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${t.status === 'APPEND-ONLY' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Consola SQL/NoSQL */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl h-48 flex flex-col overflow-hidden">
             <div className="p-2 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
               <span className="text-xs font-semibold text-white">Multi-engine SQL/NoSQL CLI</span>
               <button className="bg-sky-600 hover:bg-sky-500 text-white text-[10px] px-3 py-1 rounded flex items-center gap-1"><Play size={10}/> Run Query</button>
             </div>
             <textarea 
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               className="flex-1 bg-slate-950 text-emerald-400 font-mono text-xs p-3 resize-none focus:outline-none"
             />
          </div>
        </div>

        {/* Panel Lateral (Vault de Backups) */}
        {isVaultOpen && (
          <div className="w-80 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
            <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Download size={14}/> File Vault</h3>
              <button onClick={() => setIsVaultOpen(false)} className="text-slate-500 hover:text-white"><X size={14}/></button>
            </div>
            <div className="flex border-b border-slate-800">
               <button className="flex-1 py-2 text-xs font-medium text-sky-400 border-b-2 border-sky-400">Workflow Insights</button>
               <button className="flex-1 py-2 text-xs font-medium text-slate-500 hover:text-slate-300">Backups</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Zona Drag & Drop */}
              <div className="border-2 border-dashed border-slate-700 rounded-lg p-4 text-center cursor-pointer hover:border-sky-500 transition-colors">
                <Upload className="mx-auto text-slate-500 mb-2" size={20}/>
                <p className="text-xs text-slate-400">Drag & Drop upload zone</p>
                <p className="text-[10px] text-slate-600 mt-1">.sql / .json / files</p>
              </div>

              {/* Lista de Backups */}
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Downloadable Backups</p>
                <div className="space-y-2">
                  {[
                    { name: 'backup_pg_core_2024-05-15.sql', size: '2.4 MB', date: '2024-05-15' },
                    { name: 'export_mongo_logs_2024-05-15.json', size: '45 MB', date: '2024-05-15' },
                    { name: 'schema_oracle_sales.sql', size: '1.1 MB', date: '2024-05-14' },
                  ].map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded-lg group">
                      <div className="flex items-center gap-2">
                        <FileCode size={14} className="text-sky-400"/>
                        <div>
                          <p className="text-[10px] text-slate-200 truncate w-40">{file.name}</p>
                          <p className="text-[9px] text-slate-500">{file.size} · SHA-256 Verified</p>
                        </div>
                      </div>
                      <button className="p-1.5 text-slate-500 group-hover:text-sky-400"><Download size={14}/></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-950">
              <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded transition-colors flex items-center justify-center gap-2">
                <Upload size={14}/> Backup Vault (Upload)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}