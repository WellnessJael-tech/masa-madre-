import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import OverviewDashboard from '../components/modules/OverviewDashboard';
import ClientDirectory from '../components/modules/ClientDirectory';
import EmpleadosEnterprise from '../components/modules/EmpleadosEnterprise';
import ClientTopology from '../components/modules/ClientTopology';
import SentinelDefenseSOC from '../components/modules/SentinelDefenseSOC';
import FortressDB from '../components/modules/FortressDB'; // Si no lo has renombrado aún y se llama "Fortress DB.jsx", usa: import FortressDB from '../components/modules/Fortress DB';
import AutomationsPanel from '../components/modules/AutomationsPanel';
import KanbanBoard from '../components/modules/KanbanBoard';

export default function TestApp() {
  // ESTADO GLOBAL DE NAVEGACIÓN
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedClientName, setSelectedClientName] = useState('Mudanzas Rápidas');

  const navigateToTopology = (clientName) => {
    setSelectedClientName(clientName);
    setCurrentView('client-topology');
  };

  return (
    <MainLayout activeModule={currentView} onNavigate={setCurrentView}>
      
      {/* 1. DASHBOARD GENERAL */}
      {currentView === 'dashboard' && <OverviewDashboard />}

      {/* 2. TITANIUM ERP (Hub Central) */}
      {currentView === 'erp' && (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-2">Titanium Core ERP</h2>
          <p className="text-slate-400 mb-6">Selecciona un módulo para gestionar.</p>
          <div className="flex gap-4">
             <button onClick={() => setCurrentView('clients')} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-sm transition-colors">Gestión de Clientes</button>
             <button onClick={() => setCurrentView('employees')} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium shadow-sm transition-colors">Gestión de Empleados</button>
          </div>
        </div>
      )}

      {/* 3. LISTA DE CLIENTES */}
      {currentView === 'clients' && (
        <div className="p-6">
          <ClientDirectory onViewTopology={navigateToTopology} />
        </div>
      )}

      {/* 4. TOPOLOGÍA DEL CLIENTE */}
      {currentView === 'client-topology' && (
        <div className="p-6">
          <ClientTopology clientName={selectedClientName} onBack={() => setCurrentView('clients')} />
        </div>
      )}

      {/* 5. EMPLEADOS ENTERPRISE */}
      {(currentView === 'employees' || currentView === 'empleados') && (
        <EmpleadosEnterprise />
      )}

      {/* 6. SENTINEL NMS SOC */}
      {currentView === 'sentinel' && <SentinelDefenseSOC />}

      {/* 7. FORTRESS DB */}
      {(currentView === 'kronos' || currentView === 'hyperion' || currentView === 'fortress') && <FortressDB />}

      {/* 8. AUTOMATIZACIONES / VORTEX */}
      {currentView === 'vortex' && <AutomationsPanel />}

      {/* 9. KANBAN LOGÍSTICA */}
      {currentView === 'kanban' && <KanbanBoard />}

    </MainLayout>
  );
}