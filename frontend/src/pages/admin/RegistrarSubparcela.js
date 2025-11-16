import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import subparcelaService from '../../services/subparcelaService';

const RegistrarSubparcela = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subparcelas, setSubparcelas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    codigoCong: '',
    numeroSub: '',
    latitud: '',
    longitud: '',
    altitud: '',
    pendiente: '',
    exposicion: '',
    cobertura: '',
    observaciones: ''
  });

  useEffect(() => {
    cargarSubparcelas();
  }, []);

  const cargarSubparcelas = async () => {
    try {
      const data = await subparcelaService.getAll();
      setSubparcelas(data);
    } catch (error) {
      console.error('Error al cargar Parcelas:', error);
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
      await subparcelaService.create({
        ...formData,
        latitud: parseFloat(formData.latitud),
        longitud: parseFloat(formData.longitud),
        altitud: parseFloat(formData.altitud),
        pendiente: parseFloat(formData.pendiente),
        exposicion: parseFloat(formData.exposicion)
      });

      setMessage({ type: 'success', text: '✅ Parcela registrada correctamente' });
      setFormData({
        codigoCong: '',
        numeroSub: '',
        latitud: '',
        longitud: '',
        altitud: '',
        pendiente: '',
        exposicion: '',
        cobertura: '',
        observaciones: ''
      });
      cargarSubparcelas();
    } catch (error) {
      setMessage({ type: 'error', text: `❌ ${error}` });
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Deseas eliminar esta Parcela?')) return;

    try {
      await subparcelaService.delete(id);
      setMessage({ type: 'success', text: '✅ Parcela eliminada' });
      cargarSubparcelas();
    } catch (error) {
      setMessage({ type: 'error', text: `❌ ${error}` });
    }
  };

  return (
    <div className="dashboard">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="container">
        <h1>📐 Registrar Parcela</h1>
        <p className="muted">Formulario basado en el Manual de Campo IFN v5.2 (Formato F2).</p>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form">
          <label>
            Código de conglomerado asociado
            <input
              type="text"
              name="codigoCong"
              value={formData.codigoCong}
              onChange={handleChange}
              placeholder="CG-0001"
              pattern="^CG-\d{4}$"
              title="Formato: CG-####"
              required
            />
          </label>

          <label>
            Número de subparcela
            <select name="numeroSub" value={formData.numeroSub} onChange={handleChange} required>
              <option value="">Selecciona...</option>
              <option value="1">Subparcela 1</option>
              <option value="2">Subparcela 2</option>
              <option value="3">Subparcela 3</option>
              <option value="4">Subparcela 4</option>
            </select>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <label>
              Latitud (°)
              <input
                type="number"
                name="latitud"
                value={formData.latitud}
                onChange={handleChange}
                placeholder="7.1234"
                step="any"
                required
              />
            </label>

            <label>
              Longitud (°)
              <input
                type="number"
                name="longitud"
                value={formData.longitud}
                onChange={handleChange}
                placeholder="-73.1234"
                step="any"
                required
              />
            </label>
          </div>

          <label>
            Altitud (msnm)
            <input
              type="number"
              name="altitud"
              value={formData.altitud}
              onChange={handleChange}
              placeholder="Ej: 1750"
              min="0"
              required
            />
          </label>

          <label>
            Pendiente (%)
            <input
              type="number"
              name="pendiente"
              value={formData.pendiente}
              onChange={handleChange}
              placeholder="Ej: 25"
              min="0"
              max="100"
              required
            />
          </label>

          <label>
            Exposición (°)
            <input
              type="number"
              name="exposicion"
              value={formData.exposicion}
              onChange={handleChange}
              placeholder="Ej: 180"
              min="0"
              max="360"
              required
            />
          </label>

          <label>
            Tipo de cobertura
            <select name="cobertura" value={formData.cobertura} onChange={handleChange} required>
              <option value="">Selecciona...</option>
              <option value="Bosque natural">Bosque natural</option>
              <option value="Plantación forestal">Plantación forestal</option>
              <option value="Matorral">Matorral</option>
              <option value="Pastizal">Pastizal</option>
              <option value="Agrícola">Agrícola</option>
              <option value="Otro">Otro</option>
            </select>
          </label>

          <label>
            Observaciones
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Condiciones del terreno, accesos, vegetación dominante..."
            />
          </label>

          <div className="form-actions">
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar parcela'}
            </button>
          </div>
        </form>

        <h2>📋 Parcelas / Subparcerlas registradas</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Código Conglomerado</th>
              <th>Subparcela</th>
              <th>Coordenadas</th>
              <th>Cobertura</th>
              <th>Altitud</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {subparcelas.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: '#999' }}>
                  No hay parcelas registradas
                </td>
              </tr>
            ) : (
              subparcelas.map((sub) => (
                <tr key={sub._id}>
                  <td>{sub.codigoCong}</td>
                  <td>{sub.numeroSub}</td>
                  <td>{sub.latitud.toFixed(5)}, {sub.longitud.toFixed(5)}</td>
                  <td>{sub.cobertura}</td>
                  <td>{sub.altitud} msnm</td>
                  <td>
                    <button
                      className="btn small danger"
                      onClick={() => handleEliminar(sub._id)}
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
        <p>© 2025 IFN — Registro de Subparcelas</p>
      </footer>
    </div>
  );
};

export default RegistrarSubparcela;