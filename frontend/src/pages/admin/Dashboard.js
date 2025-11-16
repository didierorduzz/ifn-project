import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import usuarioService from '../../services/usuarioService';
import muestraService from '../../services/muestraService';

const DashboardAdmin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    brigadistas: 0,
    reportes: 0,
    zonas: 8
  });
  const { usuario } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const brigadistas = await usuarioService.getBrigadistas();
      const reportes = await muestraService.getAll();
      
      setStats({
        brigadistas: brigadistas.length,
        reportes: reportes.length,
        zonas: 8 // Esto se puede calcular si tienes el servicio de zonas
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const cards = [
    {
      title: 'Gestión de Brigadistas',
      description: 'Agrega, edita o elimina brigadistas registrados en el sistema.',
      icon: 'fa-users',
      path: '/admin/brigadistas',
      color: '#57c27a'
    },
    {
      title: 'Gestión de Zonas',
      description: 'Administra las zonas asignadas, conglomerados y parcelas de trabajo.',
      icon: 'fa-map',
      path: '/admin/zonas',
      color: '#4aa3ff'
    },
    {
      title: 'Registrar Conglomerado',
      description: 'Registra las coordenadas y metadatos del conglomerado de muestreo.',
      icon: 'fa-layer-group',
      path: '/admin/conglomerado',
      color: '#57c27a'
    },
    {
      title: 'Registrar Parcela',
      description: 'Registra parcelas ligadas al conglomerado.',
      icon: 'fa-draw-polygon',
      path: '/admin/subparcela',
      color: '#4aa3ff'
    },
    {
      title: 'Reportes',
      description: 'Revisa los reportes enviados por los brigadistas y su estado actual.',
      icon: 'fa-clipboard-list',
      path: '/admin/reportes',
      color: '#7ad3b7'
    },
    {
      title: 'Estadísticas',
      description: 'Consulta visualizaciones generales del progreso y resultados.',
      icon: 'fa-chart-line',
      path: '/admin/estadisticas',
      color: '#e0a95d'
    },
    {
      title: 'Configuración',
      description: 'Actualiza tu perfil y las opciones generales del sistema IFN.',
      icon: 'fa-gear',
      path: '/admin/configuracion',
      color: '#8884d8'
    }
  ];

  return (
    <div className="dashboard">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="dashboard-main">
        <section className="welcome-card">
          <h1>⚙️ Bienvenido, {usuario?.nombre}</h1>
          <p>Desde este panel puedes gestionar brigadistas, conglomerados, reportes, zonas y la configuración general del sistema IFN.</p>
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

        <section className="stats-section">
          <h2>📊 Resumen General</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{stats.brigadistas}</h3>
              <p>Brigadistas activos</p>
            </div>
            <div className="stat-card">
              <h3>{stats.reportes}</h3>
              <p>Reportes registrados</p>
            </div>
            <div className="stat-card">
              <h3>{stats.zonas}</h3>
              <p>Zonas en monitoreo</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="dashboard-footer">
        <p>© 2025 IFN · Panel Administrador</p>
      </footer>
    </div>
  );
};

export default DashboardAdmin;