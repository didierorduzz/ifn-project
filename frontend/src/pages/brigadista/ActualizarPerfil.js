import React, { useState } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import usuarioService from '../../services/usuarioService';
import { useAuth } from '../../context/AuthContext';

const ActualizarPerfil = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { usuario, updateUsuario } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    correo: usuario?.correo || '',
    password: '',
    foto: usuario?.foto || ''
  });

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

  return (
    <div className="dashboard">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="dashboard-main">
        <h2>Actualizar Perfil</h2>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="config-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <section className="config-section">
            <h2>👤 Información Personal</h2>
            <form onSubmit={handleSubmit} className="form">
              <label>
                Correo electrónico
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="brigadista@udi.edu.co"
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
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </section>

          <aside className="config-section" style={{ textAlign: 'center' }}>
            <h2>🔎 Vista previa</h2>
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
            <p className="accent">Brigadista</p>
          </aside>
        </div>
      </main>

      <footer className="dashboard-footer">
        <p>© 2025 IFN — Módulo Brigadista</p>
      </footer>
    </div>
  );
};

export default ActualizarPerfil;