import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    correo: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(formData.correo, formData.password);
      
      // Redirigir según el rol
      if (data.usuario.rol === 'admin') {
        navigate('/admin');
      } else {
        navigate('/brigadista');
      }
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="logo">IFN</div>
          <h2>Inventario Forestal Nacional</h2>
          <p>Inicia sesión para acceder al sistema</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="alert alert-error">
              <i className="fa-solid fa-circle-exclamation"></i>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="correo">
              <i className="fa-solid fa-envelope"></i>
              Correo electrónico
            </label>
            <input
              type="email"
              id="correo"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              placeholder="ejemplo@ifn.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <i className="fa-solid fa-lock"></i>
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i> Iniciando sesión...
              </>
            ) : (
              <>
                <i className="fa-solid fa-right-to-bracket"></i> Iniciar sesión
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="demo-info">
            <i className="fa-solid fa-circle-info"></i>
            <strong>Credenciales de prueba:</strong>
          </p>
          <ul className="demo-credentials">
            <li>Admin: admin@ifn.com / admin123</li>
            <li>Brigadista: demo@ifn.com / demo321</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;