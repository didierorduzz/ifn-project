import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = ({ onMenuClick }) => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('¿Deseas cerrar sesión?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button className="hamburger-fixed" onClick={onMenuClick}>
          <i className="fa-solid fa-bars"></i>
        </button>
      </div>
      <div className="header-right">
        <span className="user-name">{usuario?.nombre || 'Usuario'}</span>
        <div className="logo">🌲</div>
        <button className="btn logout-btn" onClick={handleLogout}>
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;