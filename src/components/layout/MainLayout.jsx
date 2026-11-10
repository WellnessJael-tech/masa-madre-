import React, { useState } from 'react';
import { 
  Home, Shield, Database, Activity, Settings, ChevronLeft, 
  ChevronRight, Search, Bell, Plus, ChevronDown, Server, 
  Folder, FolderOpen, Table, Lock, FileCode, DownloadCloud,
  Briefcase, DollarSign, Users
} from 'lucide-react';

export default function MainLayout({ children, activeModule, onNavigate }) {
  const [isPrimaryOpen, setIsPrimaryOpen] = useState(true);
  const [isTreeOpen, setIsTreeOpen] = useState(true);

  // Árbol de Kronos
  const kronosTree = [
    { id: 'overview', label: 'Overview & Metrics', icon: <Activity size={14} />, isOpen: false, children: [] },
    { 
      id: 'db-engines', label: 'Databases (Engines)', icon: <Database size={14} />, isOpen: true, 
      children: [
        { id: 'postgres', label: 'PostgreSQL (titan_db)', icon: <Folder size={14} />, isOpen: true, 
          children: [
            { id: 'erp_schema', label: 'erp_schema', icon: <FolderOpen size={14} />, isOpen: true,
              children: [
                { id: 'clients', label: 'clients (Table)', icon: <Table size={14} /> },
                { id: 'orders', label: 'orders (Table)', icon: <Table size={14} /> },
                { id: 'employees', label: 'employees (Table)', icon: <Table size={14} /> },
              ]
            },
          ]
        },
        { id: 'mongodb', label: 'MongoDB Cluster', icon: <Folder size={14} />, isOpen: false, children: [] },
      ]
    },
    { id: 'backups', label: 'Backup & Recovery Vault', icon: <DownloadCloud size={14} />, isOpen: false, children: [] },
  ];

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-300 overflow-hidden relative">
      
      {/* 1. PRIMARY RAIL (Barra Ultra-Fina) */}
      <aside className={`${isPrimaryOpen ? 'w-16' : 'w-0'} bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 transition-all duration-300 overflow-hidden relative z-30`}>
        <div className="mb-6 flex items-center justify-center text-sky-400 font-bold">
           <Activity size={28} />
        </div>
        
        <div className="flex flex-col gap-3 w-full px-2">
          <button onClick={() => onNavigate('dashboard')} className={`p-2.5 rounded-lg flex justify-center ${activeModule === 'dashboard' ? 'bg-slate-800 text-sky-400' : 'hover:bg-slate-800/50'}`} title="Dashboard"><Home size={20}/></button>
          <button onClick={() => onNavigate('erp')} className={`p-2.5 rounded-lg flex justify-center ${activeModule === 'erp' ? 'bg-slate-800 text-blue-400' : 'hover:bg-slate-800/50'}`} title="Titanium ERP"><Briefcase size={20}/></button>
          <button onClick={() => onNavigate('sentinel')} className={`p-2.5 rounded-lg flex justify-center ${activeModule === 'sentinel' ? 'bg-slate-800 text-rose-400' : 'hover:bg-slate-800/50'}`} title="Sentinel"><Shield size={20}/></button>
          <button onClick={() => onNavigate('kronos')} className={`p-2.5 rounded-lg flex justify-center ${activeModule === 'kronos' ? 'bg-slate-800 text-emerald-400' : 'hover:bg-slate-800/50'}`} title="Kronos (Bases de Datos)"><Database size={20}/></button>
          <button onClick={() => onNavigate('finance')} className={`p-2.5 rounded-lg flex justify-center ${activeModule === 'finance' ? 'bg-slate-800 text-amber-400' : 'hover:bg-slate-800/50'}`} title="Finanzas"><DollarSign size={20}/></button>
        </div>

        <div className="mt-auto w-full px-2 flex flex-col gap-4">
          <button className="p-2.5 rounded-lg flex justify-center hover:bg-slate-800/50" title="Ajustes"><Settings size={20}/></button>
        </div>
      </aside>

      {/* BOTÓN PARA ABRIR/CERRAR PRIMARY RAIL */}
      <button onClick={() => setIsPrimaryOpen(!isPrimaryOpen)} className="absolute left-0 top-1/2 -translate-y-1/2 z-40 bg-slate-800 p-1 rounded-r-md border border-l-0 border-slate-700 text-slate-400 hover:text-white">
        {isPrimaryOpen ? <ChevronLeft size={14}/> : <ChevronRight size={14}/>}
      </button>

      {/* 2. SECONDARY TREE SIDEBAR (Solo para Kronos) */}
      {activeModule === 'kronos' && (
        <>
          {/* Botón para reabrir el árbol si está cerrado */}
          {!isTreeOpen && (
            <button onClick={() => setIsTreeOpen(true)} className="absolute left-16 top-4 z-40 bg-slate-800 p-2 rounded-r-md border border-l-0 border-slate-700 text-slate-400 hover:text-white">
              <ChevronRight size={16}/>
            </button>
          )}
          
          {isTreeOpen && (
            <aside className="w-64 bg-slate-900/80 border-r border-slate-800 flex flex-col relative z-20">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <h2 className="text-sm font-semibold text-white">Kronos Matrix</h2>
                <button onClick={() => setIsTreeOpen(false)} className="text-slate-500 hover:text-white"><ChevronLeft size={16}/></button>
              </div>
              <div className="flex-1 overflow-y-auto py-2">
                {kronosTree.map(node => <TreeNode key={node.id} node={node} level={0} />)}
              </div>
            </aside>
          )}
        </>
      )}

      {/* 3. CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* HEADER GLOBAL */}
        <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Titanium ERP
            </div>
            <div className="relative hidden md:block w-96">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
              <input type="text" placeholder="Search customers, projects, network nodes..." className="w-full bg-slate-950 border border-slate-800 rounded-md pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> 99.98% SLA</span>
            <button className="p-1.5 text-slate-400 hover:text-white"><Bell size={18}/></button>
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-white">WN</div>
            <button className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium px-3 py-1.5 rounded-md flex items-center gap-1"><Plus size={14}/> New</button>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}

function TreeNode({ node, level }) {
  const [isOpen, setIsOpen] = useState(node.isOpen || false);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div 
        onClick={() => hasChildren && setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-slate-800/50 text-xs ${level === 0 ? 'text-slate-200 font-medium' : 'text-slate-400'}`}
        style={{ paddingLeft: `${(level * 12) + 12}px` }}
      >
        {hasChildren ? (isOpen ? <ChevronDown size={12}/> : <ChevronRight size={12}/>) : <span className="w-3"></span>}
        <span className="text-sky-500">{node.icon}</span>
        <span className="truncate">{node.label}</span>
      </div>
      {hasChildren && isOpen && (
        <div>
          {node.children.map(child => <TreeNode key={child.id} node={child} level={level + 1} />)}
        </div>
      )}
    </div>
  );
}