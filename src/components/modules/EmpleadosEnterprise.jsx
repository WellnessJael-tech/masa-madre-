// src/components/modules/EmpleadosEnterprise.jsx
import React, { useState } from 'react';
import { 
  Trophy, 
  Search, 
  Plus, 
  FileText, 
  Upload, 
  Download, 
  CheckCircle2, 
  ShieldAlert, 
  ExternalLink,
  Kanban,
  ListFilter,
  DollarSign,
  User,
  Clock,
  MoreHorizontal,
  ChevronRight,
  X,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  AlertCircle,
  UserPlus,
  Edit3,
  Trash2,
  Lock,
  Building,
  CheckCircle,
  Clock3
} from 'lucide-react';
import { EmpleadoModal } from './EmpleadoModal';

// Datos Iniciales de Ejemplo
const initialEmployees = [
  { 
    id: 'EMP-001', 
    name: 'Wellington Pérez', 
    role: 'Administrador Principal / SOC Lead', 
    department: 'Ciberseguridad & Redes', 
    avatar: 'WP', 
    targetDop: 600000, 
    achievedDop: 535000, 
    sentinelSolved: 184, 
    winRate: 92, 
    status: 'Activo',
    email: 'w.perez@telecom.do',
    phone: '+1 (809) 555-0192',
    joinDate: '2022-03-15',
    securityClearance: 'Nivel 4 (SuperAdmin - Ley 53-07)',
    baseSalaryDop: 125000,
    bonusDop: 15000,
    deductionsDop: 0,
    paymentMethod: 'Transferencia Banreservas',
    shift: '08:00 AM - 05:00 PM (L-V)',
    workType: 'Presencial SOC',
    documents: [
      { id: 'DOC-101', name: 'Contrato_Laboral_Firmado.pdf', size: '2.4 MB', date: '2022-03-15', hash: 'a8f9c2...88e' },
      { id: 'DOC-102', name: 'Certificacion_Sentinel_SOC.pdf', size: '1.8 MB', date: '2023-11-10', hash: 'e3b1a0...91f' }
    ]
  },
  { 
    id: 'EMP-002', 
    name: 'David Ulloa', 
    role: 'Ingeniero de Infraestructura WISP', 
    department: 'Operaciones de Red', 
    avatar: 'DU', 
    targetDop: 450000, 
    achievedDop: 410000, 
    sentinelSolved: 142, 
    winRate: 88, 
    status: 'Activo',
    email: 'd.ulloa@telecom.do',
    phone: '+1 (809) 555-0143',
    joinDate: '2022-08-01',
    securityClearance: 'Nivel 3 (SysAdmin)',
    baseSalaryDop: 85000,
    bonusDop: 8000,
    deductionsDop: 0,
    paymentMethod: 'Banco Popular Dominicano',
    shift: '08:00 AM - 05:00 PM (L-V)',
    workType: 'Técnico de Campo WISP',
    documents: [
      { id: 'DOC-103', name: 'Contrato_Servicios_WISP.pdf', size: '3.1 MB', date: '2022-08-01', hash: '7c4d11...32a' }
    ]
  },
  { 
    id: 'EMP-003', 
    name: 'Joana Rosario', 
    role: 'Especialista de Ventas Enterprise', 
    department: 'Comercial & Cuentas', 
    avatar: 'JR', 
    targetDop: 500000, 
    achievedDop: 390000, 
    sentinelSolved: 45, 
    winRate: 79, 
    status: 'En Campo',
    email: 'j.rosario@telecom.do',
    phone: '+1 (809) 555-0188',
    joinDate: '2023-01-10',
    securityClearance: 'Nivel 2 (Operativo)',
    baseSalaryDop: 65000,
    bonusDop: 25000,
    deductionsDop: 0,
    paymentMethod: 'Banco BHD León',
    shift: '09:00 AM - 06:00 PM (L-V)',
    workType: 'Híbrido (3x2)',
    documents: []
  }
];

// Registros de Asistencia Simulados
const initialAttendance = [
  { id: 'ATT-01', empId: 'EMP-001', empName: 'Wellington Pérez', date: '2026-11-07', checkIn: '07:54 AM', checkOut: '—', status: 'Puntual' },
  { id: 'ATT-02', empId: 'EMP-002', empName: 'David Ulloa', date: '2026-11-07', checkIn: '08:12 AM', checkOut: '—', status: 'Tardanza' },
  { id: 'ATT-03', empId: 'EMP-003', empName: 'Joana Rosario', date: '2026-11-07', checkIn: '08:58 AM', checkOut: '—', status: 'Puntual' },
];

// Tareas Kanban
const initialTasks = [
  { id: 'TSK-101', title: 'Despliegue Enlace Microondas Zona Franca', client: 'Banco BHD', assignee: 'EMP-002', status: 'por_iniciar', amountDop: 125000, progress: 10, priority: 'Alta' },
  { id: 'TSK-102', title: 'Auditoría Criptográfica FIM (Ley 53-07)', client: 'Supermercados Bravo', assignee: 'EMP-001', status: 'en_progreso', amountDop: 85000, progress: 65, priority: 'Crítica' },
  { id: 'TSK-103', title: 'Migración Servidores Cloud Aegis', client: 'Grupo Ramos', assignee: 'EMP-001', status: 'en_progreso', amountDop: 210000, progress: 40, priority: 'Media' },
  { id: 'TSK-104', title: 'Cotización Fibra Óptica Dedicada V4', client: 'Clínica Abreu', assignee: 'EMP-003', status: 'revision', amountDop: 95000, progress: 90, priority: 'Alta' },
  { id: 'TSK-105', title: 'Instalación Tarpit & Bear Traps SOC', client: 'Hotel El Embajador', assignee: 'EMP-002', status: 'completado', amountDop: 180000, progress: 100, priority: 'Normal' },
];

export const EmpleadosEnterprise = () => {
  const [employees, setEmployees] = useState(initialEmployees);
  const [tasks, setTasks] = useState(initialTasks);
  const [attendance, setAttendance] = useState(initialAttendance);
  const [activeTab, setActiveTab] = useState('leaderboard'); // 'leaderboard' | 'kanban' | 'asistencia' | 'nomina' | 'quotes'
  const [sortBy, setSortBy] = useState('attainment');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  // Estados para Modal CRUD de Empleados
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Abrir Modal para Crear
  const handleOpenCreateModal = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  // Abrir Modal para Editar
  const handleOpenEditModal = (emp) => {
    setEditingEmployee(emp);
    setIsModalOpen(true);
  };

  // Guardar Empleado (Crear o Actualizar)
  const handleSaveEmployee = (empData) => {
    if (editingEmployee) {
      setEmployees(prev => prev.map(e => e.id === empData.id ? { ...e, ...empData } : e));
      if (selectedEmployee?.id === empData.id) {
        setSelectedEmployee(prev => ({ ...prev, ...empData }));
      }
    } else {
      setEmployees(prev => [...prev, empData]);
    }
  };

  // Eliminar Empleado
  const handleDeleteEmployee = (id) => {
    if (window.confirm('¿Está seguro de dar de baja este colaborador?')) {
      setEmployees(prev => prev.filter(e => e.id !== id));
      if (selectedEmployee?.id === id) setSelectedEmployee(null);
    }
  };

  // Arrastrar y Soltar en Kanban
  const handleDragStart = (taskId) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (newStatus) => {
    if (!draggedTaskId) return;
    setTasks(prev => prev.map(task => {
      if (task.id === draggedTaskId) {
        const newProgress = newStatus === 'completado' ? 100 : newStatus === 'por_iniciar' ? 0 : 50;
        return { ...task, status: newStatus, progress: newProgress };
      }
      return task;
    }));
    setDraggedTaskId(null);
  };

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTasks = tasks.filter(t => 
    (selectedAssignee === 'all' || t.assignee === selectedAssignee) &&
    (t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.client.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="h-full w-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden relative font-sans">
      
      {/* ─── ENCABEZADO PRINCIPAL Y NAVEGACIÓN ─── */}
      <div className="p-6 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-sky-500/20 via-purple-500/20 to-emerald-500/20 border border-sky-500/30">
              <Trophy className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">Gestión Operativa de Personal & Proyectos</h1>
              <p className="text-xs text-slate-400">Titanium Core ERP • Control Unificado 360°, Asistencia, Nómina TSS y Kanban Ley 172-13</p>
            </div>
          </div>
        </div>

        {/* Botones de Vista e Integración de Funcionalidades */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 text-xs shadow-inner">
          <button 
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'leaderboard' 
                ? 'bg-gradient-to-r from-emerald-500 to-sky-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Leaderboard</span>
          </button>

          <button 
            onClick={() => setActiveTab('kanban')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'kanban' 
                ? 'bg-gradient-to-r from-sky-500 to-purple-500 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Proyectos</span>
          </button>

          <button 
            onClick={() => setActiveTab('asistencia')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'asistencia' 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Asistencia & Turnos</span>
          </button>

          <button 
            onClick={() => setActiveTab('nomina')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'nomina' 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Nómina & TSS</span>
          </button>

          <button 
            onClick={() => setActiveTab('quotes')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'quotes' 
                ? 'bg-gradient-to-r from-purple-500 to-amber-500 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Cotizaciones</span>
          </button>
        </div>

        {/* Botón Acción Alta Empleado */}
        <button 
          onClick={handleOpenCreateModal}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition transform active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Registrar Colaborador</span>
        </button>
      </div>

      {/* ─── VISTA 1: LEADERBOARD DE RENDIMIENTO ─── */}
      {activeTab === 'leaderboard' && (
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input 
                type="text"
                placeholder="Buscar colaborador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button onClick={() => setSortBy('attainment')} className={`px-3 py-1 rounded-lg transition ${sortBy === 'attainment' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400'}`}>% Alcanzado</button>
              <button onClick={() => setSortBy('booked')} className={`px-3 py-1 rounded-lg transition ${sortBy === 'booked' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}>Facturado (RD$)</button>
              <button onClick={() => setSortBy('sentinel')} className={`px-3 py-1 rounded-lg transition ${sortBy === 'sentinel' ? 'bg-purple-500 text-white font-bold' : 'text-slate-400'}`}>SOC Resueltos</button>
            </div>
          </div>

          {filteredEmployees.map((emp, index) => {
            const pct = Math.round((emp.achievedDop / emp.targetDop) * 100);
            return (
              <div 
                key={emp.id}
                onClick={() => setSelectedEmployee(emp)}
                className="group flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/80 hover:border-sky-500/40 rounded-2xl cursor-pointer transition shadow-sm hover:shadow-lg gap-4"
              >
                <div className="flex items-center space-x-4 md:w-1/3">
                  <span className="font-bold text-slate-500 text-sm">#{index + 1}</span>
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-sky-400 flex items-center justify-center font-bold text-sky-400 shadow-md">
                    {emp.avatar}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-sky-400 transition">{emp.name}</h3>
                    <p className="text-xs text-slate-400">{emp.role}</p>
                  </div>
                </div>

                <div className="md:w-1/3 px-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{pct}% Alcanzado</span>
                    <span className="font-bold text-emerald-400">RD$ {(emp.achievedDop/1000).toFixed(0)}k</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-gradient-to-r from-emerald-400 to-sky-400 h-full transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>

                <div className="flex items-center space-x-4 md:w-1/3 justify-end text-xs">
                  <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 font-semibold border border-purple-500/20">{emp.sentinelSolved} SOC</span>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleOpenEditModal(emp); }} 
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-500/20 hover:text-sky-400 text-slate-400 transition"
                    title="Editar Registro"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteEmployee(emp.id); }} 
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition"
                    title="Dar de baja"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── VISTA 2: TABLERO KANBAN DE PROYECTOS ARRASTRABLE ─── */}
      {activeTab === 'kanban' && (
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          
          <div className="flex items-center justify-between mb-4 bg-slate-900/60 p-3 rounded-2xl border border-slate-800 overflow-x-auto">
            <div className="flex items-center space-x-2 min-w-max">
              <span className="text-xs font-semibold text-slate-400">Filtrar por Asignado:</span>
              <button 
                onClick={() => setSelectedAssignee('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${selectedAssignee === 'all' ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                Todos
              </button>
              {employees.map(e => (
                <button
                  key={e.id}
                  onClick={() => setSelectedAssignee(e.id)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-xl text-xs font-bold transition ${selectedAssignee === e.id ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                  <span className="w-4 h-4 rounded-full bg-slate-950 text-sky-400 text-[10px] flex items-center justify-center font-black">{e.avatar}</span>
                  <span>{e.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto pb-2">
            
            {/* Columna Por Iniciar */}
            <div onDragOver={handleDragOver} onDrop={() => handleDrop('por_iniciar')} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Por Iniciar</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 font-mono text-slate-400">
                  {filteredTasks.filter(t => t.status === 'por_iniciar').length}
                </span>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto">
                {filteredTasks.filter(t => t.status === 'por_iniciar').map(t => (
                  <div key={t.id} draggable onDragStart={() => handleDragStart(t.id)} className="p-3.5 bg-slate-900 border border-slate-800 hover:border-amber-400/50 rounded-xl cursor-grab active:cursor-grabbing transition group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">{t.priority}</span>
                      <span className="text-[10px] font-mono text-slate-500">{t.id}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition mb-1">{t.title}</h4>
                    <p className="text-[11px] text-slate-400 mb-3">{t.client}</p>
                    <div className="flex justify-between items-center text-[10px] border-t border-slate-800/80 pt-2 text-slate-400">
                      <span>RD$ {t.amountDop.toLocaleString()}</span>
                      <span className="font-semibold text-slate-300">Asignado: {t.assignee}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna En Progreso */}
            <div onDragOver={handleDragOver} onDrop={() => handleDrop('en_progreso')} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  <span>En Progreso</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 font-mono text-slate-400">
                  {filteredTasks.filter(t => t.status === 'en_progreso').length}
                </span>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto">
                {filteredTasks.filter(t => t.status === 'en_progreso').map(t => (
                  <div key={t.id} draggable onDragStart={() => handleDragStart(t.id)} className="p-3.5 bg-slate-900 border border-slate-800 hover:border-sky-400/50 rounded-xl cursor-grab active:cursor-grabbing transition group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded-md border border-sky-400/20">{t.priority}</span>
                      <span className="text-[10px] font-mono text-slate-500">{t.id}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-sky-300 transition mb-1">{t.title}</h4>
                    <p className="text-[11px] text-slate-400 mb-2">{t.client}</p>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mb-3 border border-slate-800">
                      <div className="bg-gradient-to-r from-sky-400 to-purple-400 h-full" style={{ width: `${t.progress}%` }} />
                    </div>
                    <div className="flex justify-between items-center text-[10px] border-t border-slate-800/80 pt-2 text-slate-400">
                      <span>{t.progress}% Avance</span>
                      <span className="font-semibold text-slate-300">RD$ {t.amountDop.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna Auditoría */}
            <div onDragOver={handleDragOver} onDrop={() => handleDrop('revision')} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span>En Auditoría</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 font-mono text-slate-400">
                  {filteredTasks.filter(t => t.status === 'revision').length}
                </span>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto">
                {filteredTasks.filter(t => t.status === 'revision').map(t => (
                  <div key={t.id} draggable onDragStart={() => handleDragStart(t.id)} className="p-3.5 bg-slate-900 border border-slate-800 hover:border-purple-400/50 rounded-xl cursor-grab active:cursor-grabbing transition group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-md border border-purple-400/20">Revisión Ley 53-07</span>
                      <span className="text-[10px] font-mono text-slate-500">{t.id}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-purple-300 transition mb-1">{t.title}</h4>
                    <p className="text-[11px] text-slate-400 mb-3">{t.client}</p>
                    <div className="flex justify-between items-center text-[10px] border-t border-slate-800/80 pt-2 text-slate-400">
                      <span>RD$ {t.amountDop.toLocaleString()}</span>
                      <span className="font-semibold text-purple-400">Auditoría Pendiente</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna Completado */}
            <div onDragOver={handleDragOver} onDrop={() => handleDrop('completado')} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Completado</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 font-mono text-slate-400">
                  {filteredTasks.filter(t => t.status === 'completado').length}
                </span>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto">
                {filteredTasks.filter(t => t.status === 'completado').map(t => (
                  <div key={t.id} draggable onDragStart={() => handleDragStart(t.id)} className="p-3.5 bg-slate-900/60 border border-slate-800/80 hover:border-emerald-400/50 rounded-xl cursor-grab active:cursor-grabbing transition group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/20">Finalizado</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-200 line-through decoration-emerald-500/50 mb-1">{t.title}</h4>
                    <p className="text-[11px] text-slate-400 mb-3">{t.client}</p>
                    <div className="flex justify-between items-center text-[10px] border-t border-slate-800/80 pt-2 text-slate-400">
                      <span className="text-emerald-400 font-bold">RD$ {t.amountDop.toLocaleString()}</span>
                      <span className="font-semibold text-slate-400">100% Entregado</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ─── VISTA 3: CONTROL DE ASISTENCIA Y TURNOS ─── */}
      {activeTab === 'asistencia' && (
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          <div className="flex justify-between items-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>Registro de Entradas & Marcas Biométricas SOC</span>
              </h3>
              <p className="text-xs text-slate-400">Supervisión en Tiempo Real de Asistencia y Turnos Asignados</p>
            </div>
            <button className="px-3.5 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold rounded-xl text-xs transition">
              + Registrar Marcaje Manual
            </button>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Colaborador</th>
                  <th className="p-3.5">Fecha</th>
                  <th className="p-3.5">Hora Entrada</th>
                  <th className="p-3.5">Hora Salida</th>
                  <th className="p-3.5">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {attendance.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-bold text-white">{att.empName}</td>
                    <td className="p-3.5 font-mono">{att.date}</td>
                    <td className="p-3.5 font-mono text-emerald-400">{att.checkIn}</td>
                    <td className="p-3.5 font-mono text-slate-500">{att.checkOut}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        att.status === 'Puntual' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {att.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── VISTA 4: NÓMINA Y COMPENSACIÓN (TSS & LEYES RD) ─── */}
      {activeTab === 'nomina' && (
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          <div className="flex justify-between items-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Nómina Consolidada & Retenciones de Ley (TSS / DGII)</span>
              </h3>
              <p className="text-xs text-slate-400">Cálculo de SFS (3.04%), AFP (2.87%) y Salarios Netos Mensuales</p>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-slate-950 font-bold rounded-xl text-xs shadow-md">
              Generar Reporte TSS (Excel/PDF)
            </button>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Empleado</th>
                  <th className="p-3.5">Salario Base</th>
                  <th className="p-3.5">Bonos</th>
                  <th className="p-3.5">Desc. TSS</th>
                  <th className="p-3.5">Neto a Pagar</th>
                  <th className="p-3.5">Método de Pago</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {employees.map((emp) => {
                  const sfs = (emp.baseSalaryDop || 0) * 0.0304;
                  const afp = (emp.baseSalaryDop || 0) * 0.0287;
                  const totalTss = sfs + afp;
                  const neto = ((emp.baseSalaryDop || 0) + (emp.bonusDop || 0)) - totalTss - (emp.deductionsDop || 0);
                  
                  return (
                    <tr key={emp.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-bold text-white">
                        <div>{emp.name}</div>
                        <div className="text-[10px] text-slate-500">{emp.role}</div>
                      </td>
                      <td className="p-3.5 font-mono text-emerald-400">RD$ {(emp.baseSalaryDop || 0).toLocaleString()}</td>
                      <td className="p-3.5 font-mono text-sky-400">RD$ {(emp.bonusDop || 0).toLocaleString()}</td>
                      <td className="p-3.5 font-mono text-red-400">- RD$ {totalTss.toLocaleString('es-DO', { maximumFractionDigits: 0 })}</td>
                      <td className="p-3.5 font-mono font-bold text-emerald-300">RD$ {neto.toLocaleString('es-DO', { maximumFractionDigits: 0 })}</td>
                      <td className="p-3.5 text-slate-400">{emp.paymentMethod || 'Nomina Banreservas'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── VISTA 5: COTIZACIONES ─── */}
      {activeTab === 'quotes' && (
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center">
            <FileText className="w-12 h-12 text-purple-400 mx-auto mb-3 animate-bounce" />
            <h3 className="text-base font-bold text-white mb-1">Bóveda de Cotizaciones & Presupuestos Enterprise</h3>
            <p className="text-xs text-slate-400 max-w-lg mx-auto mb-4">
              Gestión centralizada de presupuestos técnicos firmados criptográficamente bajo el estándar SHA-256 para clientes V1-V4.
            </p>
            <button className="px-5 py-2 bg-gradient-to-r from-purple-500 to-sky-500 text-white font-bold rounded-xl text-xs shadow-lg">
              + Crear Nueva Cotización NMS
            </button>
          </div>
        </div>
      )}

      {/* ─── SLIDE-OVER DRAWER DETALLE DE EMPLEADO (360°) ─── */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
                <h2 className="font-bold text-white text-base flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-sky-400" />
                  <span>Expediente de Empleado</span>
                </h2>
                <button onClick={() => setSelectedEmployee(null)} className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center mb-6 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-sky-400 mx-auto flex items-center justify-center font-bold text-xl text-sky-400 mb-2">
                  {selectedEmployee.avatar}
                </div>
                <h3 className="text-base font-bold text-white">{selectedEmployee.name}</h3>
                <p className="text-xs text-sky-400">{selectedEmployee.role}</p>
                <span className="inline-block mt-2 px-3 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 border border-slate-700">
                  {selectedEmployee.department}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-slate-300 space-y-1">
                  <p className="text-[10px] text-slate-500 uppercase font-mono">Contacto Directo</p>
                  <p className="flex items-center space-x-2 text-slate-200"><Mail className="w-3.5 h-3.5 text-sky-400" /> <span>{selectedEmployee.email}</span></p>
                  <p className="flex items-center space-x-2 text-slate-200"><Phone className="w-3.5 h-3.5 text-emerald-400" /> <span>{selectedEmployee.phone}</span></p>
                </div>

                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-slate-300 space-y-1">
                  <p className="text-[10px] text-slate-500 uppercase font-mono">Condiciones Laborales</p>
                  <p className="flex justify-between"><span>Horario:</span> <span className="text-white font-semibold">{selectedEmployee.shift}</span></p>
                  <p className="flex justify-between"><span>Modalidad:</span> <span className="text-purple-400 font-semibold">{selectedEmployee.workType}</span></p>
                  <p className="flex justify-between"><span>Clearance:</span> <span className="text-amber-400 font-semibold">{selectedEmployee.securityClearance}</span></p>
                </div>

                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-slate-300 space-y-1">
                  <p className="text-[10px] text-slate-500 uppercase font-mono">Proyectos Asignados</p>
                  <p className="font-bold text-white">{tasks.filter(t => t.assignee === selectedEmployee.id).length} Proyectos en Tablero</p>
                </div>

                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-slate-300">
                  <p className="text-[10px] text-slate-500 uppercase font-mono mb-2">Bóveda Documental Criptográfica</p>
                  {selectedEmployee.documents && selectedEmployee.documents.length > 0 ? (
                    selectedEmployee.documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-2 bg-slate-950 rounded-lg border border-slate-800 mb-1">
                        <div className="truncate">
                          <p className="text-slate-200 font-bold truncate">{doc.name}</p>
                          <p className="text-[9px] font-mono text-slate-500">{doc.hash}</p>
                        </div>
                        <Download className="w-3.5 h-3.5 text-sky-400 hover:text-white cursor-pointer" />
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">No hay documentos cargados en el expediente.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <button 
                onClick={() => { const emp = selectedEmployee; setSelectedEmployee(null); handleOpenEditModal(emp); }}
                className="w-full py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold rounded-xl text-xs transition flex items-center justify-center space-x-2"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Expediente</span>
              </button>
              <button 
                onClick={() => setSelectedEmployee(null)} 
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
              >
                Cerrar Expediente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL UNIFICADO ALTA / EDICIÓN EMPLEADO */}
      <EmpleadoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEmployee}
        initialData={editingEmployee}
      />

    </div>
  );
}; 

export default EmpleadosEnterprise;