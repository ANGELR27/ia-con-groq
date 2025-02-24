import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.user) {
        navigate('/');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="night-container">
      {/* Efecto de estrellas */}
      <div className="stars" />
      
      <div className="content-container">
        {/* Logo */}
        <div className="lunar-logo">
          <div className="lunar-circle" />
        </div>

        {/* Título y descripción */}
        <h1 className="title">
          Lunar<span style={{ color: '#7aa2f7' }}>Vim</span>
        </h1>
        <p className="subtitle">El IDE que está más allá</p>
        <p className="description">
          Un IDE con configuración sensata. Completamente libre y dirigido por la comunidad.
        </p>

        {/* Formulario */}
        <div className="form-container">
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="input-field"
              required
            />
            
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="input-field"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </span>
              ) : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-8 text-[#9aa5ce]">
            ¿No tienes una cuenta?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-[#7aa2f7] hover:underline"
            >
              Regístrate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
