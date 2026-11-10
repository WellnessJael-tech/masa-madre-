// src/components/modules/EmpleadoModal.jsx
import React, { useState } from 'react';
import { X, User, DollarSign, Shield, Clock, FileText, Save, Lock } from 'lucide-react';

export const EmpleadoModal = ({ isOpen, onClose, onSave, initialData = null }) => {
  const [activeTab, setActiveTab] = useState('datos');

  const [formData, setFormData] = useState(initialData || {
    id: `EMP-${Math.floor(100 + Math.random() * 900)}`,
    name: '',
    role: '',
    department: 'Ciberseguridad & Redes',
    avatar: '',
    email: '',
    phone: '',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'Activo',
    securityClearance: 'Nivel 2 (Operativo)',
    targetDop: 400000,
    achievedDop: 0,
    sentinelSolved: 0,
    winRate: 100,
    // Nómina y Leyes RD
    baseSalaryDop: 50000,
    bonusDop: 0,
    deductionsDop: 0,
    paymentMethod: 'Transferencia Banreservas',
    // Asistencia y Horarios
    shift: '08:00 AM - 05:00 PM (L-V)',
    workType: 'Presencial SOC',
    documents: []
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      avatar: name === 'name' ? value.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : prev.avatar
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  // Cálculos de Deducciones Leyes Dominicanas (TSS: 3.04% SFS + 2.87% AFP = 5.91%)
  const sfs = (formData.baseSalaryDop * 0.0304);
  const afp = (formData.baseSalaryDop * 0.0287);
  const totalTss = sfs + afp;
  const netSalary = (Number(formData.baseSalaryDop) + Number(formData.bonusDop)) - totalTss - Number(formData.deductionsDop);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Cabecera del Modal */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-500/20 to-purple-500/20 border border-sky-500/30">
              <User className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {initialData ? 'Editar Expediente de Colaborador' : 'Alta de Nuevo Empleado Enterprise'}
              </h2>
              <p className="text-xs text-slate-400">Titanium Core ERP • Registro Unificado Ley 172-13 & TSS</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas Internas del Formulario */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 pt-2 space-x-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('datos')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl font-bold transition ${activeTab === 'datos' ? 'bg-slate-900 text-sky-400 border-t border-x border-slate-800' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Datos Personales</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('nomina')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl font-bold transition ${activeTab === 'nomina' ? 'bg-slate-900 text-emerald-400 border-t border-x border-slate-800' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Nómina & TSS</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('turnos')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl font-bold transition ${activeTab === 'turnos' ? 'bg-slate-900 text-purple-400 border-t border-x border-slate-800' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Horarios & Turnos</span>
          </button>
        </div>

        {/* Cuerpo del Formulario */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* TAB 1: DATOS PERSONALES Y ROLES */}
          {activeTab === 'datos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Nombre Completo *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej. Carlos Mendoza"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Correo Corporativo *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="c.mendoza@telecom.do"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Cargo / Rol Operativo *</label>
                <input
                  type="text"
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="Ej. Analista NOC Tier II"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Departamento *</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="Ciberseguridad & Redes">Ciberseguridad & Redes</option>
                  <option value="Operaciones de Red">Operaciones de Red (WISP)</option>
                  <option value="Comercial & Cuentas">Comercial & Cuentas Enterprise</option>
                  <option value="Soporte Técnico Tier I/II">Soporte Técnico Tier I/II</option>
                  <option value="Administración & Finanzas">Administración & Finanzas</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Teléfono Directo</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (809) 555-0000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Nivel de Seguridad (Clearance)</label>
                <select
                  name="securityClearance"
                  value={formData.securityClearance}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="Nivel 1 (Básico)">Nivel 1 (Básico - Lectura)</option>
                  <option value="Nivel 2 (Operativo)">Nivel 2 (Operativo / Comercial)</option>
                  <option value="Nivel 3 (SysAdmin)">Nivel 3 (SysAdmin Infraestructura)</option>
                  <option value="Nivel 4 (SuperAdmin - Ley 53-07)">Nivel 4 (SuperAdmin / Ley 53-07)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Estado Laboral</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="Activo">Activo (SOC/Oficina)</option>
                  <option value="En Campo">En Campo (Despliegue)</option>
                  <option value="Licencia">Licencia / Vacaciones</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Fecha de Ingreso</label>
                <input
                  type="date"
                  name="joinDate"
                  value={formData.joinDate}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          )}

          {/* TAB 2: NÓMINA, COMPENSACIÓN Y DEDUCCIONES TSS */}
          {activeTab === 'nomina' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Salario Base Mensual (RD$)</label>
                  <input
                    type="number"
                    name="baseSalaryDop"
                    value={formData.baseSalaryDop}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Bonificaciones / Horas Extra</label>
                  <input
                    type="number"
                    name="bonusDop"
                    value={formData.bonusDop}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Otras Deducciones</label>
                  <input
                    type="number"
                    name="deductionsDop"
                    value={formData.deductionsDop}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Panel Informativo de Descuentos Ley 87-01 */}
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-2">
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Seguro Familiar de Salud (SFS - 3.04%):</span>
                  <span className="font-mono text-red-400">- RD$ {sfs.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Fondo de Pensiones (AFP - 2.87%):</span>
                  <span className="font-mono text-red-400">- RD$ {afp.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between items-center font-bold text-sm">
                  <span className="text-white">Salario Neto Estimado a Cobrar:</span>
                  <span className="text-emerald-400 font-mono">RD$ {netSalary.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Método de Pago</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="Transferencia Banreservas">Nomina Banreservas</option>
                  <option value="Transferencia Banco Popular">Banco Popular Dominicano</option>
                  <option value="Transferencia BHD">Banco BHD León</option>
                  <option value="Cheque Corporativo">Cheque Corporativo</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 3: HORARIOS Y ASISTENCIA */}
          {activeTab === 'turnos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Jornada y Horario de Trabajo</label>
                <select
                  name="shift"
                  value={formData.shift}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="08:00 AM - 05:00 PM (L-V)">08:00 AM - 05:00 PM (L-V)</option>
                  <option value="09:00 AM - 06:00 PM (L-V)">09:00 AM - 06:00 PM (L-V)</option>
                  <option value="Turno Nocturno SOC (10:00 PM - 06:00 AM)">Turno Nocturno SOC (10 PM - 6 AM)</option>
                  <option value="Rotativo 24/7 (Guardias M/T/N)">Rotativo 24/7 (Guardias SOC)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Modalidad de Trabajo</label>
                <select
                  name="workType"
                  value={formData.workType}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="Presencial SOC">Presencial SOC / Edificio Principal</option>
                  <option value="Remoto / Guardián SOC">Remoto / Guardián SOC</option>
                  <option value="Híbrido (3x2)">Híbrido (3 Días Oficina / 2 Remoto)</option>
                  <option value="Técnico de Campo WISP">Técnico de Campo / Torque WISP</option>
                </select>
              </div>
            </div>
          )}

          {/* Pie de Acciones */}
          <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg transition"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Expediente</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};