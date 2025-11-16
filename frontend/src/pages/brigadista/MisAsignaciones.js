import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import asignacionService from '../../services/asignacionService';
import { useAuth } from '../../context/AuthContext';

// Fix para iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MisAsignaciones = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [selectedAsignacion, setSelectedAsignacion] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { usuario } = useAuth();

  useEffect(() => {
    cargarAsignaciones();
  }, []);

  const cargarAsignaciones = async () => {
    setLoading(true);
    try {
      const data = await asignacionService.getMisAsignaciones();
      setAsignaciones(data);
    } catch (error) {
      console.error('Error al cargar asignaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtrarAsignaciones = () => {
    return asignaciones.filter(a => {
      const estadoOK = filtroEstado ? a.estado === filtroEstado : true;
      const tipoOK = filtroTipo ? a.tipo === filtroTipo : true;
      return estadoOK && tipoOK;
    });
  };

  const actualizarProgreso = async (id, nuevoProgreso) => {
    try {
      await asignacionService.update(id, { progreso: nuevoProgreso });
      cargarAsignaciones();
    } catch (error) {
      alert('Error al actualizar progreso');
    }
  };

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      const updateData = { estado: nuevoEstado };
      
      if (nuevoEstado === 'En Proceso' && !asignaciones.find(a => a._id === id).fecha_inicio) {
        updateData.fecha_inicio = new Date().toISOString();
      }
      
      if (nuevoEstado === 'Completado') {
        updateData.fecha_finalizacion = new Date().toISOString();
        updateData.progreso = 100;
      }

      await asignacionService.update(id, updateData);
      cargarAsignaciones();
    } catch (error) {
      alert('Error al actualizar estado');
    }
  };

  const verDetalle = (asignacion) => {
    setSelectedAsignacion(asignacion);
    setShowModal(true);
  };

  const obtenerUbicacion = (asignacion) => {
    if (asignacion.tipo === 'conglomerado' && asignacion.conglomerado) {
      return {
        lat: asignacion.conglomerado.latitud,
        lng: asignacion.conglomerado.longitud,
        nombre: asignacion.conglomerado.codigo
      };
    } else if (asignacion.tipo === 'subparcela' && asignacion.subparcela) {
      return {
        lat: asignacion.subparcela.latitud,
        lng: asignacion.subparcela.longitud,
        nombre: asignacion.subparcela.codigoCong + ' - ' + asignacion.subparcela.numeroSub
      };
    } else if (asignacion.tipo === 'zona' && asignacion.zonaData) {
      return {
        lat: asignacion.zonaData.LATITUD || asignacion.zonaData.latitud,
        lng: asignacion.zonaData.LONGITUD || asignacion.zonaData.longitud,
        nombre: asignacion.zonaData.NOMBRE || asignacion.zonaData.nombre
      };
    }
    return null;
  };

  const exportarCSV = () => {
    const csvRows = [];
    csvRows.push('Tipo,Referencia,Estado,Prioridad,Brigada,Progreso,Fecha Asignación,Fecha Límite');
    
    filtrarAsignaciones().forEach(a => {
      const referencia = a.tipo === 'conglomerado' ? a.conglomerado?.codigo :
                        a.tipo === 'subparcela' ? a.subparcela?.codigoCong :
                        a.zonaData?.NOMBRE || a.zonaData?.nombre || 'N/A';
      
      csvRows.push(
        `${a.tipo},${referencia},${a.estado},${a.prioridad},${a.brigada || 'N/A'},${a.progreso}%,${new Date(a.fecha_asignacion).toLocaleDateString()},${a.fecha_limite ? new Date(a.fecha_limite).toLocaleDateString() : 'N/A'}`
      );
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mis_asignaciones_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const asignacionesFiltradas = filtrarAsignaciones();
  const ubicaciones = asignacionesFiltradas.map(a => obtenerUbicacion(a)).filter(u => u !== null);

  // Calcular estadísticas
  const stats = {
    total: asignaciones.length,
    pendientes: asignaciones.filter(a => a.estado === 'Pendiente').length,
    enProceso: asignaciones.filter(a => a.estado === 'En Proceso').length,
    completadas: asignaciones.filter(a => a.estado === 'Completado').length,
    progresoPromedio: asignaciones.length > 0 
      ? Math.round(asignaciones.reduce((sum, a) => sum + a.progreso, 0) / asignaciones.length)
      : 0
  };

  return (
    <div className="dashboard">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="dashboard-main">
        <h2>📋 Mis Asignaciones</h2>
        <p className="muted">Visualiza y gestiona las tareas y zonas asignadas a tu cargo.</p>

        {/* Estadísticas */}
        <div className="summary-cards" style={{ marginBottom: '2rem' }}>
          <div className="summary-card">
            <h2>{stats.total}</h2>
            <p>Total Asignaciones</p>
          </div>
          <div className="summary-card" style={{ borderTop: '4px solid #f1c40f' }}>
            <h2>{stats.pendientes}</h2>
            <p>Pendientes</p>
          </div>
          <div className="summary-card" style={{ borderTop: '4px solid #3498db' }}>
            <h2>{stats.enProceso}</h2>
            <p>En Proceso</p>
          </div>
          <div className="summary-card" style={{ borderTop: '4px solid #2ecc71' }}>
            <h2>{stats.completadas}</h2>
            <p>Completadas</p>
          </div>
          <div className="summary-card" style={{ borderTop: '4px solid #9b59b6' }}>
            <h2>{stats.progresoPromedio}%</h2>
            <p>Progreso Promedio</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="filter-bar">
          <label>
            Estado:
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="">Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Completado">Completado</option>
              <option value="Pausado">Pausado</option>
            </select>
          </label>

          <label>
            Tipo:
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
              <option value="">Todos</option>
              <option value="conglomerado">Conglomerado</option>
              <option value="subparcela">Subparcela</option>
              <option value="zona">Zona</option>
            </select>
          </label>

          <button className="btn secondary" onClick={() => { setFiltroEstado(''); setFiltroTipo(''); }}>
            <i className="fa-solid fa-rotate-right"></i> Limpiar
          </button>
          <button className="btn secondary" onClick={exportarCSV}>
            <i className="fa-solid fa-file-csv"></i> Exportar CSV
          </button>
        </div>

        {/* Vista de Grid y Mapa */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
          {/* Lista de Asignaciones */}
          <div>
            {loading ? (
              <p className="text-center muted">Cargando asignaciones...</p>
            ) : asignacionesFiltradas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--surface)', borderRadius: '12px' }}>
                <i className="fa-solid fa-inbox" style={{ fontSize: '3rem', color: 'var(--muted)', marginBottom: '1rem' }}></i>
                <p className="muted">No tienes asignaciones {filtroEstado || filtroTipo ? 'con estos filtros' : 'aún'}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {asignacionesFiltradas.map((asignacion) => {
                  const referencia = asignacion.tipo === 'conglomerado' ? asignacion.conglomerado?.codigo :
                                    asignacion.tipo === 'subparcela' ? `${asignacion.subparcela?.codigoCong} - SP ${asignacion.subparcela?.numeroSub}` :
                                    asignacion.zonaData?.NOMBRE || asignacion.zonaData?.nombre || 'Zona';
                  
                  const ubicacion = asignacion.tipo === 'conglomerado' 
                    ? `${asignacion.conglomerado?.municipio}, ${asignacion.conglomerado?.departamento}`
                    : asignacion.tipo === 'subparcela'
                    ? `Subparcela ${asignacion.subparcela?.numeroSub}`
                    : asignacion.zonaData?.TIPO || asignacion.zonaData?.tipo || '';

                  return (
                    <div
                      key={asignacion._id}
                      className="card"
                      style={{
                        borderLeft: `4px solid ${
                          asignacion.estado === 'Completado' ? '#2ecc71' :
                          asignacion.estado === 'En Proceso' ? '#3498db' :
                          asignacion.estado === 'Pausado' ? '#95a5a6' : '#f1c40f'
                        }`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span style={{
                              background: 'var(--primary)',
                              color: '#fff',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              textTransform: 'uppercase'
                            }}>
                              {asignacion.tipo}
                            </span>
                            <span className={`estado ${asignacion.prioridad.toLowerCase()}`}>
                              {asignacion.prioridad}
                            </span>
                          </div>
                          
                          <h3 style={{ margin: '0.5rem 0', fontSize: '1.2rem' }}>{referencia}</h3>
                          <p className="muted" style={{ margin: '0.3rem 0', fontSize: '0.9rem' }}>
                            <i className="fa-solid fa-location-dot"></i> {ubicacion}
                          </p>
                          
                          {asignacion.brigada && (
                            <p className="muted" style={{ margin: '0.3rem 0', fontSize: '0.9rem' }}>
                              <i className="fa-solid fa-users"></i> Brigada: {asignacion.brigada}
                            </p>
                          )}

                          {/* Progreso */}
                          <div style={{ marginTop: '0.8rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                              <span style={{ fontSize: '0.85rem' }}>Progreso</span>
                              <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{asignacion.progreso}%</span>
                            </div>
                            <div style={{
                              height: '8px',
                              background: 'rgba(255,255,255,0.1)',
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                height: '100%',
                                width: `${asignacion.progreso}%`,
                                background: asignacion.progreso === 100 ? '#2ecc71' : 'var(--primary)',
                                transition: 'width 0.3s ease'
                              }}></div>
                            </div>
                          </div>

                          {/* Fechas */}
                          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.8rem', fontSize: '0.85rem' }}>
                            <div>
                              <span className="muted">Asignado: </span>
                              {new Date(asignacion.fecha_asignacion).toLocaleDateString()}
                            </div>
                            {asignacion.fecha_limite && (
                              <div style={{
                                color: new Date(asignacion.fecha_limite) < new Date() ? '#e74c3c' : 'inherit'
                              }}>
                                <span className="muted">Límite: </span>
                                {new Date(asignacion.fecha_limite).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                </div>
                {/* Estado */}
                    <div style={{ textAlign: 'right' }}>
                      <span className={`estado ${asignacion.estado.toLowerCase().replace(' ', '-')}`}>
                        {asignacion.estado}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                    <button
                      className="btn small"
                      onClick={() => verDetalle(asignacion)}
                    >
                      <i className="fa-solid fa-eye"></i> Ver Detalle
                    </button>

                    {asignacion.estado !== 'Completado' && (
                      <>
                        <select
                          value={asignacion.estado}
                          onChange={(e) => actualizarEstado(asignacion._id, e.target.value)}
                          style={{
                            padding: '0.4rem 0.6rem',
                            borderRadius: '6px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.05)',
                            color: 'white',
                            fontSize: '0.85rem'
                          }}
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="En Proceso">En Proceso</option>
                          <option value="Completado">Completado</option>
                          <option value="Pausado">Pausado</option>
                        </select>

                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={asignacion.progreso}
                          onChange={(e) => actualizarProgreso(asignacion._id, parseInt(e.target.value))}
                          style={{ flex: 1, minWidth: '100px' }}
                          title={`Progreso: ${asignacion.progreso}%`}
                        />
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mapa */}
      <div style={{ position: 'sticky', top: '100px' }}>
        <div style={{
          background: 'var(--surface)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>
            <i className="fa-solid fa-map-location-dot"></i> Ubicaciones
          </h3>
          <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
            {ubicaciones.length} ubicaciones en el mapa
          </p>
        </div>

        <div style={{
          height: '500px',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow)'
        }}>
          {ubicaciones.length > 0 ? (
            <MapContainer
              center={[ubicaciones[0].lat, ubicaciones[0].lng]}
              zoom={8}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              {ubicaciones.map((ubicacion, index) => (
                <Marker key={index} position={[ubicacion.lat, ubicacion.lng]}>
                  <Popup>
                    <strong>{ubicacion.nombre}</strong>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <div style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--surface)'
            }}>
              <p className="muted">No hay ubicaciones para mostrar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </main>

  {/* Modal de Detalle */}
  {showModal && selectedAsignacion && (
    <div
      className="modal"
      style={{ display: 'flex' }}
      onClick={(e) => {
        if (e.target.className === 'modal') setShowModal(false);
      }}
    >
      <div className="modal-dialog" style={{ maxWidth: '600px' }}>
        <button
          className="modal-close"
          onClick={() => setShowModal(false)}
        >
          ✕
        </button>

        <div className="modal-body">
          <h2>
            <i className="fa-solid fa-circle-info"></i> Detalle de Asignación
          </h2>

          <div style={{ marginTop: '1.5rem' }}>
            {/* Información General */}
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <h3 style={{ margin: '0 0 0.8rem', fontSize: '1rem', color: 'var(--accent)' }}>
                Información General
              </h3>
              
              <table style={{ width: '100%', fontSize: '0.9rem' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.3rem 0', color: 'var(--muted)' }}><strong>Tipo:</strong></td>
                    <td style={{ padding: '0.3rem 0' }}>
                      <span style={{
                        background: 'var(--primary)',
                        color: '#fff',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}>
                        {selectedAsignacion.tipo}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.3rem 0', color: 'var(--muted)' }}><strong>Estado:</strong></td>
                    <td style={{ padding: '0.3rem 0' }}>
                      <span className={`estado ${selectedAsignacion.estado.toLowerCase().replace(' ', '-')}`}>
                        {selectedAsignacion.estado}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.3rem 0', color: 'var(--muted)' }}><strong>Prioridad:</strong></td>
                    <td style={{ padding: '0.3rem 0' }}>
                      <span className={`estado ${selectedAsignacion.prioridad.toLowerCase()}`}>
                        {selectedAsignacion.prioridad}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.3rem 0', color: 'var(--muted)' }}><strong>Progreso:</strong></td>
                    <td style={{ padding: '0.3rem 0' }}>{selectedAsignacion.progreso}%</td>
                  </tr>
                  {selectedAsignacion.brigada && (
                    <tr>
                      <td style={{ padding: '0.3rem 0', color: 'var(--muted)' }}><strong>Brigada:</strong></td>
                      <td style={{ padding: '0.3rem 0' }}>{selectedAsignacion.brigada}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Referencia */}
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <h3 style={{ margin: '0 0 0.8rem', fontSize: '1rem', color: 'var(--accent)' }}>
                Referencia
              </h3>

              {selectedAsignacion.tipo === 'conglomerado' && selectedAsignacion.conglomerado && (
                <div>
                  <p><strong>Código:</strong> {selectedAsignacion.conglomerado.codigo}</p>
                  <p><strong>Departamento:</strong> {selectedAsignacion.conglomerado.departamento}</p>
                  <p><strong>Municipio:</strong> {selectedAsignacion.conglomerado.municipio}</p>
                  <p><strong>Vereda:</strong> {selectedAsignacion.conglomerado.vereda}</p>
                  <p><strong>Coordenadas:</strong> {selectedAsignacion.conglomerado.latitud.toFixed(5)}, {selectedAsignacion.conglomerado.longitud.toFixed(5)}</p>
                </div>
              )}

              {selectedAsignacion.tipo === 'subparcela' && selectedAsignacion.subparcela && (
                <div>
                  <p><strong>Conglomerado:</strong> {selectedAsignacion.subparcela.codigoCong}</p>
                  <p><strong>Número:</strong> Subparcela {selectedAsignacion.subparcela.numeroSub}</p>
                  <p><strong>Coordenadas:</strong> {selectedAsignacion.subparcela.latitud.toFixed(5)}, {selectedAsignacion.subparcela.longitud.toFixed(5)}</p>
                </div>
              )}

              {selectedAsignacion.tipo === 'zona' && selectedAsignacion.zonaData && (
                <div>
                  <p><strong>Nombre:</strong> {selectedAsignacion.zonaData.NOMBRE || selectedAsignacion.zonaData.nombre}</p>
                  <p><strong>Tipo:</strong> {selectedAsignacion.zonaData.TIPO || selectedAsignacion.zonaData.tipo}</p>
                  <p><strong>Estado:</strong> {selectedAsignacion.zonaData.ESTADO || selectedAsignacion.zonaData.estado}</p>
                  {selectedAsignacion.zonaData.DESCRIPCION && (
                    <p><strong>Descripción:</strong> {selectedAsignacion.zonaData.DESCRIPCION}</p>
                  )}
                </div>
              )}
            </div>

            {/* Fechas */}
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <h3 style={{ margin: '0 0 0.8rem', fontSize: '1rem', color: 'var(--accent)' }}>
                Fechas
              </h3>

              <table style={{ width: '100%', fontSize: '0.9rem' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.3rem 0', color: 'var(--muted)' }}><strong>Asignado:</strong></td>
                    <td style={{ padding: '0.3rem 0' }}>
                      {new Date(selectedAsignacion.fecha_asignacion).toLocaleString()}
                    </td>
                  </tr>
                  {selectedAsignacion.fecha_inicio && (
                    <tr>
                      <td style={{ padding: '0.3rem 0', color: 'var(--muted)' }}><strong>Inicio:</strong></td>
                      <td style={{ padding: '0.3rem 0' }}>
                        {new Date(selectedAsignacion.fecha_inicio).toLocaleString()}
                      </td>
                    </tr>
                  )}
                  {selectedAsignacion.fecha_limite && (
                    <tr>
                      <td style={{ padding: '0.3rem 0', color: 'var(--muted)' }}><strong>Límite:</strong></td>
                      <td style={{
                        padding: '0.3rem 0',
                        color: new Date(selectedAsignacion.fecha_limite) < new Date() ? '#e74c3c' : 'inherit'
                      }}>
                        {new Date(selectedAsignacion.fecha_limite).toLocaleString()}
                        {new Date(selectedAsignacion.fecha_limite) < new Date() && (
                          <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem' }}>
                            ⚠️ Vencida
                          </span>
                        )}
                      </td>
                    </tr>
                  )}
                  {selectedAsignacion.fecha_finalizacion && (
                    <tr>
                      <td style={{ padding: '0.3rem 0', color: 'var(--muted)' }}><strong>Finalizado:</strong></td>
                      <td style={{ padding: '0.3rem 0' }}>
                        {new Date(selectedAsignacion.fecha_finalizacion).toLocaleString()}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Notas */}
            {selectedAsignacion.notas && (
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                padding: '1rem',
                borderRadius: '8px'
              }}>
                <h3 style={{ margin: '0 0 0.8rem', fontSize: '1rem', color: 'var(--accent)' }}>
                  Notas
                </h3>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{selectedAsignacion.notas}</p>
              </div>
            )}

            {/* Asignado por */}
            {selectedAsignacion.asignado_por && (
              <div style={{
                marginTop: '1rem',
                padding: '0.8rem',
                background: 'rgba(87, 194, 122, 0.1)',
                borderRadius: '8px',
                fontSize: '0.85rem'
              }}>
                <i className="fa-solid fa-user-check"></i> Asignado por: <strong>{selectedAsignacion.asignado_por.nombre}</strong>
              </div>
            )}
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn secondary"
              onClick={() => setShowModal(false)}
              style={{ flex: 1 }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )}

  <footer className="dashboard-footer">
    <p>© 2025 IFN · Mis Asignaciones</p>
  </footer>
</div>
);
};

export default MisAsignaciones;