import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import muestraService from '../../services/muestraService';
import { useAuth } from '../../context/AuthContext';

const MisReportes = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [muestras, setMuestras] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const { usuario } = useAuth();

  useEffect(() => {
    cargarMisReportes();
  }, []);

  const cargarMisReportes = async () => {
    try {
      const data = await muestraService.getByUsuario(usuario.id);
      setMuestras(data);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
    }
  };

  const filtrarMuestras = () => {
    return muestras.filter(m => {
      const tipoOK = filtroTipo ? m.tipo === filtroTipo : true;
      const estadoOK = filtroEstado ? m.estado === filtroEstado : true;
      return tipoOK && estadoOK;
    });
  };

  const exportarCSV = () => {
    const csvRows = [];
    csvRows.push('Código,Tipo,Árbol,Fecha,Estado');
    
    filtrarMuestras().forEach(m => {
      csvRows.push(`${m.codigo},${m.tipo},${m.codigoArbol},${new Date(m.fecha).toLocaleDateString()},${m.estado}`);
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'mis_reportes_IFN.csv';
    link.click();
  };

  const verDetalle = (muestra) => {
    alert(
      `📄 Detalle del reporte:\n\n` +
      `Código: ${muestra.codigo}\n` +
      `Tipo: ${muestra.tipo}\n` +
      `Árbol: ${muestra.codigoArbol}\n` +
      `Fecha: ${new Date(muestra.fecha).toLocaleDateString()}\n` +
      `Estado: ${muestra.estado}\n` +
      `Observaciones: ${muestra.observaciones || 'Sin observaciones'}`
    );
  };

  const muestrasFiltradas = filtrarMuestras();

  return (
    <div className="dashboard">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="container">
        <h1>📋 Reportes del Brigadista</h1>
        <p>Consulta el estado y detalle de los reportes que has enviado desde campo.</p>

        <div className="filter-bar">
          <label>
            Tipo de muestra
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
              <option value="">Todos</option>
              <option value="Hoja">Hoja</option>
              <option value="Corteza">Corteza</option>
              <option value="Suelo">Suelo</option>
              <option value="Semilla">Semilla</option>
            </select>
          </label>

          <label>
            Estado
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="">Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Procesado">Procesado</option>
              <option value="Rechazado">Rechazado</option>
            </select>
          </label>

          <button className="btn secondary" onClick={() => { setFiltroTipo(''); setFiltroEstado(''); }}>
            <i className="fa-solid fa-rotate-right"></i> Reiniciar
          </button>
          <button className="btn secondary" onClick={exportarCSV}>
            <i className="fa-solid fa-file-csv"></i> Exportar CSV
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Tipo</th>
              <th>Árbol</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {muestrasFiltradas.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: '#999' }}>
                  No hay reportes registrados
                </td>
              </tr>
            ) : (
              muestrasFiltradas.map((m) => (
                <tr key={m._id}>
                  <td>{m.codigo}</td>
                  <td>{m.tipo}</td>
                  <td>{m.codigoArbol}</td>
                  <td>{new Date(m.fecha).toLocaleDateString()}</td>
                  <td>
                    <span className={`estado ${m.estado.toLowerCase()}`}>
                      {m.estado}
                    </span>
                  </td>
                  <td>
                    <button className="btn small" onClick={() => verDetalle(m)}>
                      <i className="fa-solid fa-eye"></i> Ver
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </main>

      <footer className="dashboard-footer">
        <p>© 2025 IFN · Reportes del Brigadista</p>
      </footer>
    </div>
  );
};

export default MisReportes;