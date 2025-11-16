import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import muestraService from '../../services/muestraService';

const RegistrarMuestra = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [muestras, setMuestras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    codigo: '',
    codigoArbol: '',
    fecha: '',
    tipo: '',
    cantidad: '',
    condicion: '',
    imagen: '',
    observaciones: ''
  });

  useEffect(() => {
    cargarMuestras();
  }, []);

  const cargarMuestras = async () => {
    try {
      const data = await muestraService.getAll();
      setMuestras(data);
    } catch (error) {
      console.error('Error al cargar muestras:', error);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'imagen' && e.target.files) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          imagen: reader.result
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
      await muestraService.create({
        ...formData,
        cantidad: parseInt(formData.cantidad)
      });

      setMessage({ type: 'success', text: '✅ Muestra registrada correctamente' });
      setFormData({
        codigo: '',
        codigoArbol: '',
        fecha: '',
        tipo: '',
        cantidad: '',
        condicion: '',
        imagen: '',
        observaciones: ''
      });
      cargarMuestras();
    } catch (error) {
      setMessage({ type: 'error', text: `❌ ${error}` });
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta muestra?')) return;

    try {
      await muestraService.delete(id);
      setMessage({ type: 'success', text: '✅ Muestra eliminada' });
      cargarMuestras();
    } catch (error) {
      setMessage({ type: 'error', text: `❌ ${error}` });
    }
  };

  return (
    <div className="dashboard">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="container">
        <h1>🧪 Registrar Muestra</h1>
        <p className="muted">Formulario basado en el Manual de Campo IFN v5.2 (Formato F4).</p>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form">
          <label>
            Código de árbol asociado
            <input
              type="text"
              name="codigoArbol"
              value={formData.codigoArbol}
              onChange={handleChange}
              placeholder="AR-0001"
              pattern="^AR-\d{4}$"
              title="Formato: AR-####"
              required
            />
          </label>

          <label>
            Código de muestra
            <input
              type="text"
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              placeholder="MS-0001"
              pattern="^MS-\d{4}$"
              title="Formato: MS-####"
              required
            />
          </label>

          <label>
            Fecha de recolección
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </label>

          <label>
            Tipo de muestra
            <select name="tipo" value={formData.tipo} onChange={handleChange} required>
              <option value="">Selecciona…</option>
              <option value="Hoja">Hoja</option>
              <option value="Corteza">Corteza</option>
              <option value="Suelo">Suelo</option>
              <option value="Semilla">Semilla</option>
              <option value="Fruto">Fruto</option>
            </select>
          </label>

          <label>
            Cantidad (gramos o unidades)
            <input
              type="number"
              name="cantidad"
              value={formData.cantidad}
              onChange={handleChange}
              placeholder="Ej: 25"
              min="1"
              required
            />
          </label>

          <label>
            Condición de la muestra
            <select name="condicion" value={formData.condicion} onChange={handleChange} required>
              <option value="">Selecciona…</option>
              <option value="Fresca">Fresca</option>
              <option value="Seca">Seca</option>
              <option value="Preservada">Preservada</option>
            </select>
          </label>

          <label>
            Imagen de la muestra
            <input
              type="file"
              name="imagen"
              onChange={handleChange}
              accept="image/*"
            />
            {formData.imagen && (
              <img src={formData.imagen} alt="Preview" style={{ maxWidth: '200px', marginTop: '10px', borderRadius: '8px' }} />
            )}
          </label>

          <label>
            Observaciones
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Ej. Muestra colectada a 1.5 m de altura, sin daño visible."
            />
          </label>

          <div className="form-actions">
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar muestra'}
            </button>
          </div>
        </form>

        <h2>📋 Muestras registradas</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Árbol</th>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>Condición</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {muestras.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', color: '#999' }}>
                  No hay muestras registradas
                </td>
              </tr>
            ) : (
              muestras.map((muestra) => (
                <tr key={muestra._id}>
                  <td>{muestra.codigo}</td>
                  <td>{muestra.codigoArbol}</td>
                  <td>{new Date(muestra.fecha).toLocaleDateString()}</td>
                  <td>{muestra.tipo}</td>
                  <td>{muestra.cantidad}</td>
                  <td>{muestra.condicion}</td>
                  <td>
                    <button
                      className="btn small danger"
                      onClick={() => handleEliminar(muestra._id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </main>

      <footer className="dashboard-footer">
        <p>© 2025 IFN · Registro de Muestras</p>
      </footer>
    </div>
  );
};

export default RegistrarMuestra;