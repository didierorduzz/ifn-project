import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import usuarioService from '../../services/usuarioService';
import authService from '../../services/authService';

const GestionBrigadistas = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [brigadistas, setBrigadistas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editando, setEditando] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    password: '',
    ubicacion: '',
    zona: '',
    estado: 'Activo'
  });

  useEffect(() => {
    cargarBrigadistas();
  }, []);

  const cargarBrigadistas = async () => {
    try {
      const data = await usuarioService.getBrigadistas();
      setBrigadistas(data);
    } catch (error) {
      console.error('Error al cargar brigadistas:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (editando) {
        // Actualizar
        const dataToUpdate = { ...formData };
        if (!dataToUpdate.password) {
          delete dataToUpdate.password; // No actualizar password si está vacío
        }
        await usuarioService.update(editando, dataToUpdate);
        setMessage({ type: 'success', text: '✅ Brigadista actualizado correctamente' });
        setEditando(null);
      } else {
        // Crear nuevo
        await authService.register({
          ...formData,
          rol: 'brigadista'
        });
        setMessage({ type: 'success', text: '✅ Brigadista registrado correctamente' });
      }

      setFormData({
        nombre: '',
        correo: '',
        password: '',
        ubicacion: '',
        zona: '',
        estado: 'Activo'
      });
      cargarBrigadistas();
    } catch (error) {
      setMessage({ type: 'error', text: `❌ ${error}` });
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (brigadista) => {
    setEditando(brigadista._id);
    setFormData({
      nombre: brigadista.nombre,
      correo: brigadista.correo,
      password: '',
      ubicacion: brigadista.ubicacion,
      zona: brigadista.zona,
      estado: brigadista.estado
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelar = () => {
    setEditando(null);
    setFormData({
      nombre: '',
      correo: '',
      password: '',
      ubicacion: '',
      zona: '',
      estado: 'Activo'
    });
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este brigadista?')) return;

    try {
      await usuarioService.delete(id);
      setMessage({ type: 'success', text: '✅ Brigadista eliminado' });
      cargarBrigadistas();
    } catch (error) {
      setMessage({ type: 'error', text: `❌ ${error}` });
    }
  };

  return (
    <div className="dashboard">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="container">
        <h1>👷‍♂️ Gestión de Brigadistas</h1>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <section className="config-section">
          <h2>
            <i className="fa-solid fa-user-plus"></i> 
            {editando ? ' Editar Brigadista' : ' Registrar Brigadista'}
          </h2>
          <form onSubmit={handleSubmit} className="form">
            <label>
              Nombre completo *
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej. Juan Pérez"
                required
              />
            </label>

            <label>
              Correo electrónico *
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
              Contraseña {editando && '(dejar vacío para no cambiar)'}
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required={!editando}
              />
            </label>

            <label>
              Ubicación *
              <input
                type="text"
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleChange}
                placeholder="Ej. Catatumbo, Norte de Santander"
                required
              />
            </label>

            <label>
              Zona asignada *
              <select name="zona" value={formData.zona} onChange={handleChange} required>
                <option value="">Selecciona una zona…</option>
                <option value="Zona Norte">Zona Norte</option>
                <option value="Zona Sur">Zona Sur</option>
                <option value="Zona Oriental">Zona Oriental</option>
                <option value="Zona Occidental">Zona Occidental</option>
              </select>
            </label>

            <label>
              Estado
              <select name="estado" value={formData.estado} onChange={handleChange} required>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </label>

            <div className="form-actions">
              <button type="submit" className="btn primary" disabled={loading}>
                <i className="fa-solid fa-save"></i> 
                {loading ? ' Guardando...' : (editando ? ' Actualizar' : ' Guardar')}
              </button>
              {editando && (
                <button type="button" className="btn secondary" onClick={handleCancelar}>
                  <i className="fa-solid fa-times"></i> Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="config-section">
          <h2><i className="fa-solid fa-users"></i> Brigadistas Registrados</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Ubicacion</th>
                <th>Zona</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {brigadistas.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#999' }}>
                    No hay brigadistas registrados
                  </td>
                </tr>
              ) : (
                brigadistas.map((b) => (
                  <tr key={b._id}>
                    <td>{b.nombre}</td>
                    <td>{b.correo}</td>
                    <td>{b.ubicacion}</td>
                    <td>{b.zona}</td>
                    <td>
                      <span className={`estado ${b.estado.toLowerCase()}`}>
                        {b.estado}
                      </span>
                    </td>
                    <td>
                      <button className="btn small edit" onClick={() => handleEditar(b)}>
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button className="btn small danger" onClick={() => handleEliminar(b._id)}>
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </main>

      <footer className="dashboard-footer">
        <p>© 2025 IFN · Administración de Brigadistas</p>
      </footer>
    </div>
  );
};

export default GestionBrigadistas;