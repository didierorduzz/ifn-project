import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, usuario } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'green');
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    // Aplicar tema
    document.body.classList.remove('theme-blue');
    if (theme === 'blue') {
      document.body.classList.add('theme-blue');
    }
  }, [theme]);

  const handleThemeToggle = () => {
    const newTheme = theme === 'green' ? 'blue' : 'green';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleLoginClick = () => {
    if (isAuthenticated) {
      // Redirigir al dashboard correspondiente
      if (usuario?.rol === 'admin') {
        navigate('/admin');
      } else {
        navigate('/brigadista');
      }
    } else {
      navigate('/login');
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-container">
      {/* Header */}
      <header className="site-header">
        <div className="container header-inner">
          <div className="brand">
            <span className="logo">IFN</span>
            <span className="brand-text">Inventario Forestal</span>
          </div>

          <div className="header-actions">
            <button className="theme-toggle" onClick={handleThemeToggle}>
              <span className="dot"></span>
              <span className="label">Tema</span>
            </button>

            <button className="btn login-btn" onClick={handleLoginClick}>
              {isAuthenticated ? 'Panel' : 'Acceder'}
            </button>
          </div>

          <nav className="nav">
            <ul>
              <li><a href="#inicio" onClick={() => scrollToSection('inicio')}>Inicio</a></li>
              <li><a href="#gestion" onClick={() => scrollToSection('gestion')}>Gestión</a></li>
              <li><a href="#muestras" onClick={() => scrollToSection('muestras')}>Muestras</a></li>
              <li><a href="#reportes" onClick={() => scrollToSection('reportes')}>Reportes</a></li>
              <li><a href="#contacto" onClick={() => scrollToSection('contacto')}>Contacto</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section id="inicio" className="hero">
          <div className="container hero-inner">
            <div className="hero-copy">
              <h1>Gestión Ágil del Inventario Forestal</h1>
              <p className="hero-description">
                Registra conglomerados, subparcelas, árboles y muestras con evidencia fotográfica. 
                Exporta reportes en minutos.
              </p>
              <button className="btn btn-primary" onClick={handleLoginClick}>
                {isAuthenticated ? 'Ir al Dashboard' : 'Comenzar Ahora'}
              </button>
            </div>

            <div className="hero-media">
              <div className="hero-icon">🌲</div>
            </div>
          </div>
        </section>

        {/* Gestión Section */}
        <section id="gestion" className="section">
          <div className="container">
            <h2 className="section-title">Gestión de Conglomerados y Subparcelas</h2>
            <p className="section-lead">
              Estructura los puntos de muestreo y sus unidades internas para garantizar trazabilidad.
            </p>

            <div className="cards">
              <article className="card">
                <h3>Conglomerados</h3>
                <p>Código único, ubicación (municipio / departamento), coordenadas y observaciones.</p>
              </article>

              <article className="card">
                <h3>Subparcelas</h3>
                <p>Referencia local y asociación al conglomerado para una captura ordenada.</p>
              </article>

              <article className="card">
                <h3>Especies</h3>
                <p>Catálogo taxonómico con nombre científico, común, familia y notas.</p>
              </article>
            </div>
          </div>
        </section>

        {/* Muestras Section */}
        <section id="muestras" className="section section-alt">
          <div className="container">
            <h2 className="section-title">Árboles y Muestras</h2>
            <p className="section-lead">Captura DAP, altura y asocia muestras con evidencia fotográfica.</p>

            <div className="features">
              <div className="feature">
                <div className="feature-icon">🌳</div>
                <div>
                  <h3>Árboles</h3>
                  <p>Registra DAP (cm), altura (m) y observaciones de campo.</p>
                </div>
              </div>

              <div className="feature">
                <div className="feature-icon">🧪</div>
                <div>
                  <h3>Muestras con imagen</h3>
                  <p>Código único, tipo (hoja, corteza, suelo) y al menos una imagen adjunta.</p>
                </div>
              </div>

              <div className="feature">
                <div className="feature-icon">👤</div>
                <div>
                  <h3>Usuarios</h3>
                  <p>Registro por roles: Administrador / Brigada para control y trazabilidad.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reportes Section */}
        <section id="reportes" className="section">
          <div className="container">
            <h2 className="section-title">Reportes y Exportación</h2>
            <p className="section-lead">
              Genera listados por conglomerado, árbol o periodo y exporta en PDF/CSV.
            </p>

            <div className="cards">
              <article className="card">
                <h3>Análisis Estadístico</h3>
                <p>Análisis automático de especies, DAP, altura y distribución de muestras.</p>
              </article>

              <article className="card">
                <h3>Descarga CSV</h3>
                <p>Exporta para análisis rápido o integración con otras herramientas.</p>
              </article>

              <article className="card">
                <h3>Resumen PDF</h3>
                <p>Formato limpio para compartir en informes de avance.</p>
              </article>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contacto" className="site-footer">
        <div className="container footer-grid">
          <div>
            <h3>Instituto de Hidrología, Meteorología y Estudios Ambientales</h3>
            <h4>Sede principal</h4>
            <p>Dirección: Calle 25 D No. 96 B - 70 Bogotá D.C.</p>
            <p>Código Postal: 110911</p>
            <p>Horario: Lunes a Viernes 8:00 am - 5:00 pm</p>
          </div>

          <div>
            <h4>Créditos</h4>
            <p>Proyecto Integrador II – 5LA · 2025-II</p>
            <p>Equipo: Didier Orduz, Cristian Aranguren, Nemrod Romero</p>
          </div>
        </div>

        <div className="legal">© 2025 IFN · Todos los derechos reservados.</div>
      </footer>
    </div>
  );
};

export default Home;