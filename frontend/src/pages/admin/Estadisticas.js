import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import analisisService from '../../services/analisisService';

const Estadisticas = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resumen, setResumen] = useState(null);
  const [especies, setEspecies] = useState(null);
  const [muestras, setMuestras] = useState(null);
  const [dapAltura, setDapAltura] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    setLoading(true);
    try {
      const [resumenData, especiesData, muestrasData, dapAlturaData] = await Promise.all([
        analisisService.obtenerResumenGeneral(),
        analisisService.analizarEspecies(),
        analisisService.analizarMuestras(),
        analisisService.analizarDapAltura()
      ]);

      setResumen(resumenData.data);
      setEspecies(especiesData.data);
      setMuestras(muestrasData.data);
      setDapAltura(dapAlturaData.data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const descargarPDFEspecies = async () => {
    try {
      const blob = await analisisService.descargarPDFEspecies();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_especies_${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
    } catch (error) {
      alert('Error al descargar PDF');
    }
  };

  const descargarPDFGeneral = async () => {
    try {
      const blob = await analisisService.descargarPDFGeneral();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resumen_general_${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
    } catch (error) {
      alert('Error al descargar PDF');
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="dashboard-main">
          <p className="text-center">Cargando estadísticas...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="container dashboard-main">
        <h1>📈 Estadísticas del Sistema IFN</h1>
        <p>Visualiza información general sobre los brigadistas, zonas y reportes del sistema.</p>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button className="btn secondary" onClick={descargarPDFGeneral}>
            <i className="fa-solid fa-file-pdf"></i> Descargar Resumen General
          </button>
          <button className="btn secondary" onClick={descargarPDFEspecies}>
            <i className="fa-solid fa-file-pdf"></i> Descargar Reporte de Especies
          </button>
          <button className="btn secondary" onClick={cargarEstadisticas}>
            <i className="fa-solid fa-rotate"></i> Actualizar
          </button>
        </div>

        {/* Resumen General */}
        {resumen && (
          <div className="summary-cards">
            <div className="summary-card">
              <h2>{resumen.conglomerados.total}</h2>
              <p>Conglomerados</p>
            </div>
            <div className="summary-card">
              <h2>{resumen.arboles.total}</h2>
              <p>Árboles Registrados</p>
            </div>
            <div className="summary-card">
              <h2>{resumen.arboles.especies_unicas}</h2>
              <p>Especies Únicas</p>
            </div>
            <div className="summary-card">
              <h2>{resumen.muestras.total}</h2>
              <p>Muestras Totales</p>
            </div>
          </div>
        )}

        {/* Especies */}
        {especies && (
          <section className="config-section">
            <h2><i className="fa-solid fa-leaf"></i> Distribución de Especies</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>{especies.total_arboles}</h3>
                <p>Total de árboles</p>
              </div>
              <div className="stat-card">
                <h3>{especies.especies_unicas}</h3>
                <p>Especies únicas</p>
              </div>
            </div>

            <h3 style={{ marginTop: '1.5rem' }}>Top 5 Especies</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Especie</th>
                  <th>Cantidad</th>
                  <th>Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(especies.top_5_especies).map(([especie, cantidad]) => {
                  const porcentaje = ((cantidad / especies.total_arboles) * 100).toFixed(2);
                  return (
                    <tr key={especie}>
                      <td>{especie}</td>
                      <td>{cantidad}</td>
                      <td>{porcentaje}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        )}

        {/* DAP y Altura */}
        {dapAltura && (
          <section className="config-section">
            <h2><i className="fa-solid fa-ruler"></i> Análisis de DAP y Altura</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <h3>Diámetro a la Altura del Pecho (DAP)</h3>
                <table className="data-table">
                  <tbody>
                    <tr>
                      <td><strong>Promedio</strong></td>
                      <td>{dapAltura.dap.promedio.toFixed(2)} cm</td>
                    </tr>
                    <tr>
                      <td><strong>Mediana</strong></td>
                      <td>{dapAltura.dap.mediana.toFixed(2)} cm</td>
                    </tr>
                    <tr>
                      <td><strong>Mínimo</strong></td>
                      <td>{dapAltura.dap.minimo.toFixed(2)} cm</td>
                    </tr>
                    <tr>
                      <td><strong>Máximo</strong></td>
                      <td>{dapAltura.dap.maximo.toFixed(2)} cm</td>
                    </tr>
                  </tbody>
                </table>

                <h4 style={{ marginTop: '1rem' }}>Clasificación por DAP</h4>
                <table className="data-table">
                  <tbody>
                    {Object.entries(dapAltura.clasificacion_dap).map(([clase, cantidad]) => (
                      <tr key={clase}>
                        <td>{clase}</td>
                        <td>{cantidad} árboles</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h3>Altura Total</h3>
                <table className="data-table">
                  <tbody>
                    <tr>
                      <td><strong>Promedio</strong></td>
                      <td>{dapAltura.altura.promedio.toFixed(2)} m</td>
                    </tr>
                    <tr>
                      <td><strong>Mediana</strong></td>
                      <td>{dapAltura.altura.mediana.toFixed(2)} m</td>
                    </tr>
                    <tr>
                      <td><strong>Mínimo</strong></td>
                      <td>{dapAltura.altura.minimo.toFixed(2)} m</td>
                    </tr>
                    <tr>
                        <td><strong>Máximo</strong></td>
                        <td>{dapAltura.altura.maximo.toFixed(2)} m</td>
                    </tr>
                  </tbody>
                </table>
            </div>
            </div>
            </section>
        )}

        {/* Muestras */}
    {muestras && (
      <section className="config-section">
        <h2><i className="fa-solid fa-vial"></i> Análisis de Muestras</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="stat-card">
            <h3>{muestras.total_muestras}</h3>
            <p>Total de muestras</p>
          </div>
          <div className="stat-card">
            <h3>{Object.keys(muestras.por_tipo).length}</h3>
            <p>Tipos de muestra</p>
          </div>
          <div className="stat-card">
            <h3>{Object.keys(muestras.por_estado).length}</h3>
            <p>Estados registrados</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <h3>Por Tipo</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(muestras.por_tipo).map(([tipo, cantidad]) => (
                  <tr key={tipo}>
                    <td>{tipo}</td>
                    <td>{cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h3>Por Estado</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(muestras.por_estado).map(([estado, cantidad]) => (
                  <tr key={estado}>
                    <td>
                      <span className={`estado ${estado.toLowerCase()}`}>
                        {estado}
                      </span>
                    </td>
                    <td>{cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    )}
  </main>

  <footer className="dashboard-footer">
    <p>© 2025 IFN · Estadísticas del Sistema</p>
  </footer>
</div>
);
};

export default Estadisticas;