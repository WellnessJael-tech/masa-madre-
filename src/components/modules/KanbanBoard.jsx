import React, { useState } from 'react';
import { 
  MoreHorizontal, Plus, MessageSquare, Paperclip, 
  CheckCircle2, Clock, AlertCircle, PlayCircle, 
  Filter, FileText, Calendar, X, Save
} from 'lucide-react';

const initialTasks = [
  { id: 'TSK-001', title: 'Rediseño Home Mudanzas Rápidas', client: 'Mudanzas Rápidas', status: 'backlog', priority: 'Alta', team: 'Diseño', assignee: 'David', difficulty: 'Media', value: 'RD$ 5,000', sender: 'Wellington', timeEst: '4h', recurring: false, dueDate: '2026-10-30', description: 'Rediseñar el hero section y la sección de servicios.', comments: 3, attachments: 2 },
  { id: 'TSK-002', title: 'Integración Pasarela Azul (Plan V3)', client: 'Tienda El Sol', status: 'backlog', priority: 'Media', team: 'Desarrollo', assignee: 'Sarah', difficulty: 'Alta', value: 'RD$ 12,000', sender: 'Cliente', timeEst: '8h', recurring: false, dueDate: '2026-11-05', description: 'Integrar API de pagos de Azul.', comments: 0, attachments: 1 },
  { id: 'TSK-003', title: 'Configurar Sentinel Firewall', client: 'Clínica Dental', status: 'in_progress', priority: 'Crítica', team: 'Seguridad', assignee: 'Wellington', difficulty: 'Alta', value: 'RD$ 8,000', sender: 'Sistema', timeEst: '2h', recurring: false, dueDate: '2026-10-28', description: 'Activar reglas de WAF y Bear Traps.', comments: 5, attachments: 0 },
  { id: 'TSK-004', title: 'Maquetación Catálogo E-commerce', client: 'Mudanzas Rápidas', status: 'in_progress', priority: 'Alta', team: 'Desarrollo', assignee: 'David', difficulty: 'Media', value: 'RD$ 6,500', sender: 'Wellington', timeEst: '6h', recurring: false, dueDate: '2026-11-02', description: 'Crear el componente de grid para el catálogo.', comments: 1, attachments: 4 },
  { id: 'TSK-005', title: 'Campaña 3 Posts IG (Semanal)', client: 'Tienda El Sol', status: 'qa', priority: 'Media', team: 'Marketing', assignee: 'Ana', difficulty: 'Baja', value: 'RD$ 3,000', sender: 'Cliente', timeEst: '2h', recurring: true, dueDate: '2026-10-29', description: 'Diseñar y subir 3 posts para Instagram.', comments: 2, attachments: 0 },
  { id: 'TSK-006', title: 'Despliegue BlueGreen a Producción', client: 'EWB Core', status: 'done', priority: 'Alta', team: 'Desarrollo', assignee: 'Wellington', difficulty: 'Alta', value: 'RD$ 0', sender: 'Sistema', timeEst: '1h', recurring: false, dueDate: '2026-10-27', description: 'Subir la nueva versión a producción.', comments: 8, attachments: 1 },
];

const columns = [
  { id: 'backlog', title: 'Por Hacer', icon: <AlertCircle size={16} className="text-slate-400" /> },
  { id: 'in_progress', title: 'En Desarrollo', icon: <PlayCircle size={16} className="text-sky-400" /> },
  { id: 'qa', title: 'En QA (Calidad)', icon: <Clock size={16} className="text-amber-400" /> },
  { id: 'done', title: 'Entregado', icon: <CheckCircle2 size={16} className="text-emerald-400" /> },
];

const TEAMS = ['Todos', 'Desarrollo', 'Diseño', 'Marketing', 'Seguridad'];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState(initialTasks); // Estado mutable
  const [selectedTeam, setSelectedTeam] = useState('Todos');
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Estados para el Formulario (Crear/Editar)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '', client: '', team: 'Desarrollo', priority: 'Media', assignee: '', description: '', dueDate: '', value: '', recurring: false
  });

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'Crítica': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Alta': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Media': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const filteredTasks = selectedTeam === 'Todos' ? tasks : tasks.filter(t => t.team === selectedTeam);

  // Lógica para abrir el formulario de creación
  const handleCreateNew = () => {
    setEditingTask(null);
    setFormData({ title: '', client: '', team: 'Desarrollo', priority: 'Media', assignee: '', description: '', dueDate: '', value: '', recurring: false });
    setIsFormOpen(true);
  };

  // Lógica para abrir el formulario de edición
  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData(task);
    setIsFormOpen(true);
    setSelectedTask(null); // Cierra el modal de vista previa
  };

  // Lógica para guardar (Crear o Actualizar)
  const handleSave = (e) => {
    e.preventDefault();
    if (editingTask) {
      // Actualizar
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...formData } : t));
    } else {
      // Crear
      const newId = `TSK-00${tasks.length + 1}`;
      const newTask = { 
        ...formData, 
        id: newId, 
        status: 'backlog', 
        comments: 0, 
        attachments: 0, 
        difficulty: 'Media', 
        sender: 'Wellington', 
        timeEst: '2h' 
      };
      setTasks([newTask, ...tasks]);
    }
    setIsFormOpen(false);
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* HEADER DEL TABLERO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Proyectos</h1>
          <p className="text-slate-400 text-sm mt-1">Flujo de trabajo ágil y entregables por cliente.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-lg">
            <Filter size={14} className="text-slate-500 ml-2" />
            <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} className="bg-transparent text-sm text-slate-300 focus:outline-none">
              {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button onClick={handleCreateNew} className="flex items-center gap-2 px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium rounded-md transition-colors shadow-sm whitespace-nowrap">
            <Plus size={16} /> Nueva Tarea
          </button>
        </div>
      </div>

      {/* COLUMNAS DEL KANBAN */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex gap-4 h-full min-w-[1000px]">
          {columns.map(col => (
            <div key={col.id} className="flex-1 flex flex-col bg-slate-900/50 border border-slate-800/60 rounded-xl overflow-hidden">
              <div className="p-3 border-b border-slate-800/60 flex items-center justify-between bg-slate-900/80">
                <div className="flex items-center gap-2 font-semibold text-sm text-slate-200">
                  {col.icon} {col.title}
                  <span className="ml-2 bg-slate-800 text-slate-400 text-xs py-0.5 px-2 rounded-full">{filteredTasks.filter(t => t.status === col.id).length}</span>
                </div>
              </div>
              <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px]">
                {filteredTasks.filter(t => t.status === col.id).map(task => (
                  <div key={task.id} onClick={() => setSelectedTask(task)} className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-sm hover:border-slate-600 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPriorityStyle(task.priority)}`}>{task.priority}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{task.id}</span>
                    </div>
                    <h4 className="text-sm text-slate-200 font-medium mb-1 leading-snug group-hover:text-sky-400 transition-colors">{task.title}</h4>
                    <p className="text-xs text-slate-500 mb-2">{task.client}</p>
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-700/50">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-[10px] font-bold border border-slate-600">{task.assignee ? task.assignee.charAt(0) : '?'}</div>
                        <span className="text-[10px] text-slate-400">{task.team}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 text-xs">
                        <span className="flex items-center gap-1"><MessageSquare size={12}/> {task.comments}</span>
                        <span className="flex items-center gap-1"><Paperclip size={12}/> {task.attachments}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: VER DETALLE DE TAREA */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex justify-between items-start bg-slate-950/30">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-slate-500">{selectedTask.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPriorityStyle(selectedTask.priority)}`}>{selectedTask.priority}</span>
                </div>
                <h2 className="text-xl font-bold text-white">{selectedTask.title}</h2>
                <p className="text-sm text-sky-400 mt-1">{selectedTask.client}</p>
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full"><X size={18}/></button>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1"><FileText size={14}/> Especificaciones</h3>
                  <p className="text-sm text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">{selectedTask.description}</p>
                </div>
              </div>
              <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div><p className="text-[10px] text-slate-500 uppercase font-bold">Asignado a</p><p className="text-sm text-white">{selectedTask.assignee || 'Sin asignar'}</p></div>
                <div><p className="text-[10px] text-slate-500 uppercase font-bold">Valor</p><p className="text-sm text-emerald-400 font-medium">{selectedTask.value || 'N/A'}</p></div>
                <div><p className="text-[10px] text-slate-500 uppercase font-bold">Fecha Límite</p><p className="text-sm text-amber-400 flex items-center gap-1"><Calendar size={12}/> {selectedTask.dueDate || 'Sin fecha'}</p></div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end gap-3">
              <button onClick={() => handleEdit(selectedTask)} className="px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-md transition-colors border border-slate-700">Editar Tarea</button>
              <button className="px-4 py-2 text-sm bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-md transition-colors flex items-center gap-2"><CheckCircle2 size={16}/> Completada</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREAR / EDITAR TAREA (FORMULARIO) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
              <h2 className="text-lg font-bold text-white">{editingTask ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-white"><X size={18}/></button>
            </div>
            
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Título de la tarea</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-sm text-white focus:border-sky-500 focus:outline-none" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Cliente</label>
                  <input required type="text" value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-sm text-white focus:border-sky-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Asignado a</label>
                  <input type="text" value={formData.assignee} onChange={e => setFormData({...formData, assignee: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-sm text-white focus:border-sky-500 focus:outline-none" placeholder="Ej. David" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Equipo</label>
                  <select value={formData.team} onChange={e => setFormData({...formData, team: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-sm text-white focus:border-sky-500 focus:outline-none">
                    <option>Desarrollo</option><option>Diseño</option><option>Marketing</option><option>Seguridad</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Prioridad</label>
                  <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-sm text-white focus:border-sky-500 focus:outline-none">
                    <option>Baja</option><option>Media</option><option>Alta</option><option>Crítica</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Descripción / Especificaciones</label>
                <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-sm text-white focus:border-sky-500 focus:outline-none"></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-md">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-md flex items-center gap-2"><Save size={16}/> Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}