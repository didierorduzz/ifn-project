import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import conglomeradoService from '../../services/conglomeradoService';
import { useAuth } from '../../context/AuthContext';

const RegistrarConglomerado = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conglomerados, setConglomerados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { usuario } = useAuth();

  const [formData, setFormData] = useState({
    codigo: '',
    departamento: '',
    municipio: '',
    vereda: '',
    latitud: '',
    longitud: '',
    datum: '',
    zonaUTM: '',
    precision: '',
    fecha: '',
    observaciones: ''
  });

  useEffect(() => {
    cargarConglomerados();
  }, []);

  const cargarConglomerados = async () => {
    try {
      const data = await conglomeradoService.getAll();
      setConglomerados(data);
    } catch (error) {
      console.error('Error al cargar conglomerados:', error);
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
      await conglomeradoService.create({
        ...formData,
        latitud: parseFloat(formData.latitud),
        longitud: parseFloat(formData.longitud),
        precision: parseFloat(formData.precision)
      });

      setMessage({ type: 'success', text: '✅ Conglomerado registrado correctamente' });
      setFormData({
        codigo: '',
        departamento: '',
        municipio: '',
        vereda: '',
        latitud: '',
        longitud: '',
        datum: '',
        zonaUTM: '',
        precision: '',
        fecha: '',
        observaciones: ''
      });
      cargarConglomerados();
    } catch (error) {
      setMessage({ type: 'error', text: `❌ ${error}` });
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Deseas eliminar este conglomerado?')) return;

    try {
      await conglomeradoService.delete(id);
      setMessage({ type: 'success', text: '✅ Conglomerado eliminado' });
      cargarConglomerados();
    } catch (error) {
      setMessage({ type: 'error', text: `❌ ${error}` });
    }
  };

  return (
    <div className="dashboard">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="container">
        <h1>📍 Registrar Conglomerado</h1>
        <p className="muted">Completa los datos según el Manual de Campo del IFN (Formato F1).</p>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form">
          <label>
            Código del conglomerado
            <input
              type="text"
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              placeholder="CG-0001"
              pattern="^CG-\d{4}$"
              title="Formato: CG-####"
              required
            />
          </label>

          <label>
            Departamento
            <input
              type="text"
              name="departamento"
              value={formData.departamento}
              onChange={handleChange}
              placeholder="Santander"
              required
            />
          </label>

          <label>
            Municipio
            <input
              type="text"
              name="municipio"
              value={formData.municipio}
              onChange={handleChange}
              placeholder="Bucaramanga"
              required
            />
          </label>

          <label>
            Vereda o Sector
            <input
              type="text"
              name="vereda"
              value={formData.vereda}
              onChange={handleChange}
              placeholder="La Malaña"
              required
            />
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <label>
              Datum
              <select name="datum" value={formData.datum} onChange={handleChange} required>
                <option value="">Selecciona...</option>
                <option value="WGS84">WGS84</option>
                <option value="MAGNA-SIRGAS">MAGNA-SIRGAS</option>
              </select>
            </label>

            <label>
              Zona UTM
              <input
                type="text"
                name="zonaUTM"
                value={formData.zonaUTM}
                onChange={handleChange}
                placeholder="Ej: 18N"
                required
              />
            </label>
          </div>

          <label>
            Precisión GPS (m)
            <input
              type="number"
              name="precision"
              value={formData.precision}
              onChange={handleChange}
              placeholder="±5"
              min="1"
              required
            />
          </label>

          <label>
            Fecha de registro
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
            Observaciones generales
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Condiciones del terreno, acceso, campamento..."
            />
          </label>

          <div className="form-actions">
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar conglomerado'}
            </button>
          </div>
        </form>

        <h2>📋 Conglomerados registrados</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Ubicación</th>
              <th>Coordenadas</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {conglomerados.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: '#999' }}>
                  No hay conglomerados registrados
                </td>
              </tr>
            ) : (
              conglomerados.map((cong) => (
                <tr key={cong._id}>
                  <td>{cong.codigo}</td>
                  <td>{cong.departamento} — {cong.municipio}</td>
                  <td>{cong.latitud.toFixed(5)}, {cong.longitud.toFixed(5)}</td>
                  <td>{new Date(cong.fecha).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn small danger"
                      onClick={() => handleEliminar(cong._id)}
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
        <p>© 2025 IFN — Registro de Conglomerados</p>
      </footer>
    </div>
  );
};

export default RegistrarConglomerado;