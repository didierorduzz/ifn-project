import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import arbolService from '../../services/arbolService';

const RegistrarArbol = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [arboles, setArboles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    codigoSubparcela: '',
    codigoArbol: '',
    numIndividuo: '',
    especie: '',
    dap: '',
    altura: '',
    alturaCom: '',
    condicion: '',
    sanitario: '',
    observaciones: ''
  });

  useEffect(() => {
    cargarArboles();
  }, []);

  const cargarArboles = async () => {
    try {
      const data = await arbolService.getAll();
      setArboles(data);
    } catch (error) {
      console.error('Error al cargar árboles:', error);
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
      await arbolService.create({
        ...formData,
        numIndividuo: parseInt(formData.numIndividuo),
        dap: parseFloat(formData.dap),
        altura: parseFloat(formData.altura),
        alturaCom: parseFloat(formData.alturaCom) || 0
      });

      setMessage({ type: 'success', text: '✅ Árbol registrado correctamente' });
      setFormData({
        codigoSubparcela: '',
        codigoArbol: '',
        numIndividuo: '',
        especie: '',
        dap: '',
        altura: '',
        alturaCom: '',
        condicion: '',
        sanitario: '',
        observaciones: ''
      });
      cargarArboles();
    } catch (error) {
      setMessage({ type: 'error', text: `❌ ${error}` });
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este registro de árbol?')) return;

    try {
      await arbolService.delete(id);
      setMessage({ type: 'success', text: '✅ Árbol eliminado' });
      cargarArboles();
    } catch (error) {
      setMessage({ type: 'error', text: `❌ ${error}` });
    }
  };

  return (
    <div className="dashboard">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="container">
        <h1>🌳 Registrar Árbol</h1>
        <p className="muted">Formulario basado en el Manual de Campo IFN v5.2 (Formato F3).</p>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form">
          <label>
            Código de subparcela asociada
            <input
              type="text"
              name="codigoSubparcela"
              value={formData.codigoSubparcela}
              onChange={handleChange}
              placeholder="SP-0001"
              pattern="^SP-\d{4}$"
              title="Formato: SP-####"
              required
            />
          </label>

          <label>
            ID del árbol
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
            Número de individuo en subparcela
            <input
              type="number"
              name="numIndividuo"
              value={formData.numIndividuo}
              onChange={handleChange}
              placeholder="Ej: 1, 2, 3..."
              min="1"
              required
            />
          </label>

          <label>
            Especie
            <input
              type="text"
              name="especie"
              value={formData.especie}
              onChange={handleChange}
              placeholder="Nombre científico o común"
              required
            />
          </label>

          <label>
            Diámetro a la altura del pecho (DAP, cm)
            <input
              type="number"
              name="dap"
              value={formData.dap}
              onChange={handleChange}
              placeholder="Ej: 23.5"
              step="0.1"
              min="0"
              required
            />
          </label>

          <label>
            Altura total (m)
            <input
              type="number"
              name="altura"
              value={formData.altura}
              onChange={handleChange}
              placeholder="Ej: 15.2"
              step="0.1"
              min="0"
              required
            />
          </label>

          <label>
            Altura comercial (m)
            <input
              type="number"
              name="alturaCom"
              value={formData.alturaCom}
              onChange={handleChange}
              placeholder="Ej: 8.5"
              step="0.1"
              min="0"
            />
          </label>

          <label>
            Condición del árbol
            <select name="condicion" value={formData.condicion} onChange={handleChange} required>
              <option value="">Selecciona...</option>
              <option value="Vivo">Vivo</option>
              <option value="Muerto en pie">Muerto en pie</option>
              <option value="Tumbado">Tumbado</option>
              <option value="Cepa">Cepa</option>
            </select>
          </label>

          <label>
            Estado sanitario
            <select name="sanitario" value={formData.sanitario} onChange={handleChange}>
              <option value="">Selecciona...</option>
              <option value="Bueno">Bueno</option>
              <option value="Regular">Regular</option>
              <option value="Malo">Malo</option>
            </select>
          </label>

          <label>
            Observaciones
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Observaciones sobre el árbol, daño, especie dudosa, etc."
            />
          </label>

          <div className="form-actions">
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Árbol'}
            </button>
          </div>
        </form>

        <h2>📋 Árboles registrados</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID Árbol</th>
              <th>Subparcela</th>
              <th>Especie</th>
              <th>DAP (cm)</th>
              <th>Altura (m)</th>
              <th>Condición</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {arboles.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', color: '#999' }}>
                  No hay árboles registrados
                </td>
              </tr>
            ) : (
              arboles.map((arbol) => (
                <tr key={arbol._id}>
                  <td>{arbol.codigoArbol}</td>
                  <td>{arbol.codigoSubparcela}</td>
                  <td>{arbol.especie}</td>
                  <td>{arbol.dap}</td>
                  <td>{arbol.altura}</td>
                  <td>{arbol.condicion}</td>
                  <td>
                    <button
                      className="btn small danger"
                      onClick={() => handleEliminar(arbol._id)}
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
        <p>© 2025 IFN — Registro de Árboles</p>
      </footer>
    </div>
  );
};

export default RegistrarArbol;