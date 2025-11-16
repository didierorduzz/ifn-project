import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { usuario } = useAuth();
  const location = useLocation();

  const brigadistaLinks = [
    { path: '/brigadista', icon: 'fa-house', label: 'Inicio' },
    { path: '/brigadista/arbol', icon: 'fa-tree', label: 'Árbol' },
    { path: '/brigadista/muestra', icon: 'fa-vial', label: 'Muestra' },
    { path: '/brigadista/asignaciones', icon: 'fa-list-check', label: 'Asignaciones' },
    { path: '/brigadista/reportes', icon: 'fa-clipboard-list', label: 'Reportes' },
    { path: '/brigadista/perfil', icon: 'fa-user-gear', label: 'Perfil' }
  ];

  const adminLinks = [
    { path: '/admin', icon: 'fa-house', label: 'Inicio' },
    { path: '/admin/brigadistas', icon: 'fa-users', label: 'Brigadistas' },
    { path: '/admin/zonas', icon: 'fa-map', label: 'Zonas' },
    { path: '/admin/conglomerado', icon: 'fa-layer-group', label: 'Conglomerado' },
    { path: '/admin/subparcela', icon: 'fa-draw-polygon', label: 'Subparcela' },
    { path: '/admin/reportes', icon: 'fa-clipboard-list', label: 'Reportes' },
    { path: '/admin/estadisticas', icon: 'fa-chart-line', label: 'Estadísticas' },
    { path: '/admin/configuracion', icon: 'fa-gear', label: 'Configuración' }
  ];

  const links = usuario?.rol === 'admin' ? adminLinks : brigadistaLinks;

  return (
    <>
      {/* Overlay para cerrar al hacer clic fuera */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      
      <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={onClose}>✕</button>
        
        <div className="sidebar-header">
          <div className="avatar">
            {usuario?.foto ? (
              <img src={usuario.foto} alt="Avatar" />
            ) : (
              <i className="fa-solid fa-user"></i>
            )}
          </div>
          <div className="sidebar-user">
            <p>{usuario?.nombre || 'Usuario'}</p>
            <small>{usuario?.rol === 'admin' ? 'Administrador' : 'Brigadista'}</small>
          </div>
        </div>

        <ul>
          {links.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={location.pathname === link.path ? 'active' : ''}
                onClick={onClose}
              >
                <i className={`fa-solid ${link.icon}`}></i> {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default Sidebar;