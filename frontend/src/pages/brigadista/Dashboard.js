import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import '../../styles/Dashboard.css';

const DashboardBrigadista = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Registrar Árbol',
      description: 'Registra los datos dasométricos (DAP, altura, especie, etc.).',
      icon: 'fa-tree',
      path: '/brigadista/arbol',
      color: '#7ad3b7'
    },
    {
      title: 'Registrar Muestra',
      description: 'Captura una muestra (hoja, corteza, semilla, suelo) con fotografía.',
      icon: 'fa-vial',
      path: '/brigadista/muestra',
      color: '#e0a95d'
    },
    {
      title: 'Mis asignaciones',
      description: 'Consulta informacion de tus zonas, brigadas y conglomerados asignados.',
      icon: 'fa-list-check',
      path: '/brigadista/asignaciones',
      color: '#c484d8ff'
    },
    {
      title: 'Reportes',
      description: 'Consulta los reportes enviados y su estado de revisión.',
      icon: 'fa-clipboard-list',
      path: '/brigadista/reportes',
      color: '#8884d8'
    },
    {
      title: 'Actualizar Perfil',
      description: 'Modifica tu información personal o cambia tu contraseña.',
      icon: 'fa-user-gear',
      path: '/brigadista/perfil',
      color: '#c27a57'
    }
  ];

  return (
    <div className="dashboard">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="dashboard-main">
        <section className="welcome-card">
          <h1>👷 Bienvenido, {usuario?.nombre}</h1>
          <p>Desde este panel podrás registrar datos de campo, consultar tus reportes y revisar tus zonas asignadas.</p>
        </section>

        <section className="cards-grid">
          {cards.map((card, index) => (
            <div key={index} className="card" style={{ borderTop: `4px solid ${card.color}` }}>
              <div className="card-icon" style={{ color: card.color }}>
                <i className={`fa-solid ${card.icon}`}></i>
              </div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <button 
                className="btn card-btn" 
                onClick={() => navigate(card.path)}
              >
                Abrir
              </button>
            </div>
          ))}
        </section>
      </main>

      <footer className="dashboard-footer">
        <p>© 2025 IFN · Panel Brigadista</p>
      </footer>
    </div>
  );
};

export default DashboardBrigadista;