import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import muestraService from '../../services/muestraService';

const ReportesAdmin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [muestras, setMuestras] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroBrigadista, setFiltroBrigadista] = useState('');

  useEffect(() => {
    cargarReportes();
  }, []);

  const cargarReportes = async () => {
    try {
      const data = await muestraService.getAll();
      setMuestras(data);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
    }
  };

  const filtrarReportes = () => {
    return muestras.filter(m => {
      const tipoOK = filtroTipo ? m.tipo === filtroTipo : true;
      const estadoOK = filtroEstado ? m.estado === filtroEstado : true;
      const brigOK = filtroBrigadista
        ? m.usuario?.nombre?.toLowerCase().includes(filtroBrigadista.toLowerCase()) ||
          m.usuario?.correo?.toLowerCase().includes(filtroBrigadista.toLowerCase())
        : true;
      return tipoOK && estadoOK && brigOK;
    });
  };

  const limpiarFiltros = () => {
    setFiltroTipo('');
    setFiltroEstado('');
    setFiltroBrigadista('');
  };

  const exportarCSV = () => {
    const csvRows = [];
    csvRows.push('Código,Brigadista,Fecha,Tipo,Estado');
    
    filtrarReportes().forEach(m => {
      csvRows.push(
        `${m.codigo},${m.usuario?.nombre || 'Desconocido'},${new Date(m.fecha).toLocaleDateString()},${m.tipo},${m.estado}`
      );
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'reportes_IFN.csv';
    link.click();
  };

  const verDetalle = (muestra) => {
    alert(
      `📄 Detalles del reporte:\n\n` +
      `Código: ${muestra.codigo}\n` +
      `Brigadista: ${muestra.usuario?.nombre || 'Desconocido'}\n` +
      `Fecha: ${new Date(muestra.fecha).toLocaleDateString()}\n` +
      `Tipo: ${muestra.tipo}\n` +
      `Estado: ${muestra.estado}\n` +
      `Cantidad: ${muestra.cantidad}\n` +
      `Condición: ${muestra.condicion}\n\n` +
      `Descripción:\n${muestra.observaciones || 'Sin observaciones'}`
    );
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await muestraService.update(id, { estado: nuevoEstado });
      cargarReportes();
    } catch (error) {
      alert(`Error al cambiar estado: ${error}`);
    }
  };

  const reportesFiltrados = filtrarReportes();

  return (
    <div className="dashboard">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="container dashboard-main">
        <h1>📋 Gestión de Reportes</h1>
        <p>Administra los reportes enviados por los brigadistas del sistema IFN.</p>

        <section className="filter-bar">
          <label>
            Tipo:
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
              <option value="">Todos</option>
              <option value="Hoja">Hoja</option>
              <option value="Corteza">Corteza</option>
              <option value="Suelo">Suelo</option>
              <option value="Semilla">Semilla</option>
              <option value="Fruto">Fruto</option>
            </select>
          </label>

          <label>
            Estado:
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="">Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Procesado">Procesado</option>
              <option value="Rechazado">Rechazado</option>
            </select>
          </label>

          <label>
            Brigadista:
            <input
              type="text"
              value={filtroBrigadista}
              onChange={(e) => setFiltroBrigadista(e.target.value)}
              placeholder="Nombre o correo..."
            />
          </label>

          <button className="btn secondary" onClick={limpiarFiltros}>
            <i className="fa-solid fa-broom"></i> Limpiar
          </button>
          <button className="btn secondary" onClick={exportarCSV}>
            <i className="fa-solid fa-file-csv"></i> Exportar CSV
          </button>
        </section>

        <table className="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Brigadista</th>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reportesFiltrados.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: '#999' }}>
                  No hay reportes registrados
                </td>
              </tr>
            ) : (
              reportesFiltrados.map((m) => (
                <tr key={m._id}>
                  <td>{m.codigo}</td>
                  <td>{m.usuario?.nombre || 'Desconocido'}</td>
                  <td>{new Date(m.fecha).toLocaleDateString()}</td>
                  <td>{m.tipo}</td>
                  <td>
                    <select
                      value={m.estado}
                      onChange={(e) => cambiarEstado(m._id, e.target.value)}
                      className="estado-select"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Procesado">Procesado</option>
                      <option value="Rechazado">Rechazado</option>
                    </select>
                  </td>
                  <td>
                    <button className="btn small edit" onClick={() => verDetalle(m)}>
                      <i className="fa-solid fa-eye"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </main>

      <footer className="dashboard-footer">
        <p>© 2025 IFN · Gestión de Reportes</p>
      </footer>
    </div>
  );
};

export default ReportesAdmin;