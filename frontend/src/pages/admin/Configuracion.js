import React, { useState } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import usuarioService from '../../services/usuarioService';
import { useAuth } from '../../context/AuthContext';

const Configuracion = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { usuario, updateUsuario } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    correo: usuario?.correo || '',
    password: '',
    foto: usuario?.foto || ''
  });

  const [tema, setTema] = useState(localStorage.getItem('theme') || 'green');

  const handleChange = (e) => {
    if (e.target.name === 'foto' && e.target.files) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          foto: reader.result
        });
      };
      reader.readAsDataURL(file);
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const dataToUpdate = {
        correo: formData.correo,
        foto: formData.foto
      };

      if (formData.password) {
        dataToUpdate.password = formData.password;
      }

      await usuarioService.update(usuario.id, dataToUpdate);
      updateUsuario(dataToUpdate);

      setMessage({ type: 'success', text: '✅ Cambios guardados correctamente' });
      setFormData({ ...formData, password: '' });
    } catch (error) {
      setMessage({ type: 'error', text: `❌ ${error}` });
    } finally {
      setLoading(false);
    }
  };

  const aplicarTema = () => {
    document.body.classList.remove('theme-blue');
    if (tema === 'blue') {
      document.body.classList.add('theme-blue');
    }
    localStorage.setItem('theme', tema);
    setMessage({ type: 'success', text: '✅ Tema actualizado correctamente' });
  };

  const limpiarDatosLocales = () => {
    if (window.confirm('¿Deseas borrar todos los datos locales (caché)? Esto no afectará la base de datos.')) {
      const theme = localStorage.getItem('theme');
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('usuario');
      
      localStorage.clear();
      
      // Restaurar datos de sesión
      if (token) localStorage.setItem('token', token);
      if (user) localStorage.setItem('usuario', user);
      if (theme) localStorage.setItem('theme', theme);
      
      alert('🧹 Caché local limpiado');
    }
  };

  return (
    <div className="dashboard">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="dashboard-main">
        <h1>⚙️ Configuración del Sistema</h1>
        <p>Administra el tema y tus datos personales del sistema IFN.</p>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Apariencia */}
        <section className="config-section">
          <h2><i className="fa-solid fa-palette"></i> Apariencia</h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
            <label style={{ flex: 1 }}>
              Tema actual:
              <select value={tema} onChange={(e) => setTema(e.target.value)} style={{ marginTop: '0.5rem' }}>
                <option value="green">Verde (predeterminado)</option>
                <option value="blue">Azul oscuro</option>
              </select>
            </label>
            <button className="btn secondary" onClick={aplicarTema}>
              Aplicar tema
            </button>
          </div>
        </section>

        {/* Perfil del administrador */}
        <section className="config-section">
          <h2><i className="fa-solid fa-user-gear"></i> Actualiza tu información</h2>
          <div className="config-grid">
            <form onSubmit={handleSubmit} className="form">
              <label>
                Correo electrónico
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="admin@ifn.com"
                  required
                />
              </label>

              <label>
                Nueva contraseña
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Deja vacío para no cambiar"
                />
              </label>

              <label>
                Foto de perfil (opcional)
                <input
                  type="file"
                  name="foto"
                  onChange={handleChange}
                  accept="image/*"
                />
              </label>

              <div className="form-actions">
                <button type="submit" className="btn primary" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>

            {/* Vista previa */}
            <aside style={{ textAlign: 'center' }}>
              <h3>Vista previa</h3>
              {formData.foto && (
                <img
                  src={formData.foto}
                  alt="Foto de perfil"
                  style={{
                    width: '130px',
                    height: '130px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    boxShadow: '0 0 10px rgba(0,0,0,.3)',
                    marginBottom: '1rem'
                  }}
                />
              )}
              <h3>{usuario?.nombre}</h3>
              <p className="muted">{formData.correo}</p>
              <p className="accent">Administrador</p>
            </aside>
          </div>
        </section>

        {/* Datos locales */}
        <section className="config-section">
          <h2><i className="fa-solid fa-database"></i> Datos locales</h2>
          <p>Estas acciones solo afectan la información almacenada en tu navegador.</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button className="btn danger" onClick={limpiarDatosLocales}>
              <i className="fa-solid fa-trash"></i> Limpiar caché local
            </button>
          </div>
        </section>

        {/* Información del Sistema */}
        <section className="config-section">
          <h2><i className="fa-solid fa-info-circle"></i> Información del Sistema</h2>
          <table className="data-table">
            <tbody>
              <tr>
                <td><strong>Versión del Sistema</strong></td>
                <td>1.0.0</td>
              </tr>
              <tr>
                <td><strong>Backend Principal</strong></td>
                <td>Node.js + Express + MongoDB</td>
              </tr>
              <tr>
                <td><strong>Microservicio de Análisis</strong></td>
                <td>Python + Flask + Oracle</td>
              </tr>
              <tr>
                <td><strong>Microservicio de Zonas</strong></td>
                <td>Node.js + Express + Oracle</td>
              </tr>
              <tr>
                <td><strong>Frontend</strong></td>
                <td>React 18</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>

      <footer className="dashboard-footer">
        <p>© 2025 IFN · Panel Administrador</p>
      </footer>
    </div>
  );
};

export default Configuracion;