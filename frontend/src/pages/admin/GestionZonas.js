import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import zonaService from '../../services/asignacionService';

// Fix para los iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const GestionZonas = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [zonas, setZonas] = useState([]);
  const [newMarkerPosition, setNewMarkerPosition] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: '',
    descripcion: '',
    estado: 'Activa'
  });

  useEffect(() => {
    cargarZonas();
  }, []);

  const cargarZonas = async () => {
    try {
      const data = await zonaService.getAll();
      setZonas(data);
    } catch (error) {
      console.error('Error al cargar zonas:', error);
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        setNewMarkerPosition(e.latlng);
        setMessage({ type: 'info', text: '📍 Ubicación seleccionada. Completa el formulario y guarda.' });
      },
    });

    return newMarkerPosition ? <Marker position={newMarkerPosition} /> : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newMarkerPosition) {
      setMessage({ type: 'error', text: '❌ Selecciona una ubicación en el mapa' });
      return;
    }

    try {
      await zonaService.create({
        nombre: formData.nombre,
        tipo: formData.tipo,
        latitud: newMarkerPosition.lat,
        longitud: newMarkerPosition.lng,
        descripcion: formData.descripcion,
        estado: formData.estado
      });

      setMessage({ type: 'success', text: '✅ Zona creada exitosamente' });
      setFormData({ nombre: '', tipo: '', descripcion: '', estado: 'Activa' });
      setNewMarkerPosition(null);
      cargarZonas();
    } catch (error) {
      setMessage({ type: 'error', text: `❌ ${error}` });
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta zona?')) return;

    try {
      await zonaService.delete(id);
      setMessage({ type: 'success', text: '✅ Zona eliminada' });
      cargarZonas();
    } catch (error) {
      setMessage({ type: 'error', text: `❌ ${error}` });
    }
  };

  return (
    <div className="dashboard">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="container dashboard-main">
        <h1>🌿 Gestión de Zonas</h1>
        <p>Agrega y administra las zonas asignadas en el mapa del sistema IFN.</p>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '1.5rem' }}>
          {/* Mapa */}
          <section className="config-section">
            <h2><i className="fa-solid fa-map"></i> Mapa de zonas</h2>
            <p className="muted">Haz clic en el mapa para establecer la ubicación de la nueva zona</p>
            
            <div style={{ height: '500px', borderRadius: '10px', overflow: 'hidden', marginTop: '1rem' }}>
              <MapContainer
                center={[4.6, -74.1]}
                zoom={6}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                {zonas.map((zona) => {
                  const lat = zona.LATITUD || zona.latitud;
                  const lng = zona.LONGITUD || zona.longitud;
                  return (
                    <Marker key={zona.ID || zona.id} position={[lat, lng]} />
                  );
                })}
                <MapClickHandler />
              </MapContainer>
            </div>
          </section>

          {/* Formulario */}
          <section className="config-section">
            <h2><i className="fa-solid fa-plus"></i> Nueva Zona</h2>
            <form onSubmit={handleSubmit} className="form">
              <label>
                Nombre de la zona
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Conglomerado El Cedral"
                  required
                />
              </label>

              <label>
                Tipo de zona
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  required
                >
                  <option value="">Selecciona...</option>
                  <option value="Conglomerado">Conglomerado</option>
                  <option value="Subparcela">Subparcela</option>
                  <option value="Zona de Muestreo">Zona de Muestreo</option>
                  <option value="Reserva">Reserva</option>
                  <option value="Otro">Otro</option>
                </select>
              </label>

              <label>
                Descripción
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Características y observaciones de la zona..."
                />
              </label>

              <label>
                Estado
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  required
                >
                  <option value="Activa">Activa</option>
                  <option value="Inactiva">Inactiva</option>
                  <option value="En Proceso">En Proceso</option>
                </select>
              </label>

              {newMarkerPosition && (
                <div style={{ 
                  background: 'rgba(87, 194, 122, 0.1)', 
                  padding: '0.8rem', 
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}>
                  <strong>Coordenadas seleccionadas:</strong><br />
                  Lat: {newMarkerPosition.lat.toFixed(6)}<br />
                  Lng: {newMarkerPosition.lng.toFixed(6)}
                </div>
              )}

              <button type="submit" className="btn primary">
                <i className="fa-solid fa-save"></i> Guardar Zona
              </button>
            </form>
          </section>
        </div>

        {/* Tabla de zonas */}
        <section className="config-section" style={{ marginTop: '2rem' }}>
          <h2><i className="fa-solid fa-list"></i> Zonas registradas</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Coordenadas</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {zonas.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#999' }}>
                    No hay zonas registradas
                  </td>
                </tr>
              ) : (
                zonas.map((zona) => {
                  const id = zona.ID || zona.id;
                  const nombre = zona.NOMBRE || zona.nombre;
                  const tipo = zona.TIPO || zona.tipo;
                  const lat = zona.LATITUD || zona.latitud;
                  const lng = zona.LONGITUD || zona.longitud;
                  const estado = zona.ESTADO || zona.estado;
                  
                  return (
                    <tr key={id}>
                      <td>{nombre}</td>
                      <td>{tipo}</td>
                      <td>{lat?.toFixed(4)}, {lng?.toFixed(4)}</td>
                      <td>
                        <span className={`estado ${estado?.toLowerCase()}`}>
                          {estado}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn small danger"
                          onClick={() => handleEliminar(id)}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </section>
      </main>

      <footer className="dashboard-footer">
        <p>© 2025 IFN · Gestión de Zonas</p>
      </footer>
    </div>
  );
};

export default GestionZonas;