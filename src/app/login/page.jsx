"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isBanned, banReason, banExpiration, getBanTimeLeft } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [banInfo, setBanInfo] = useState(null);

  useEffect(() => {
    // Verificar si hay información de ban en los parámetros de la URL
    const banned = searchParams.get('banned');
    const reason = searchParams.get('reason');
    const expiration = searchParams.get('expiration');

    if (banned === 'true' && reason && expiration) {
      console.log('Ban info from URL:', { banned, reason, expiration });
      setBanInfo({
        reason,
        expiration: new Date(expiration)
      });
    }
  }, [searchParams]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Verificar si el usuario está baneado
      if (data?.user) {
        const { data: profile } = await supabase
          .from('perfil')
          .select('ban_expiration, ban_reason')
          .eq('id_perfil', data.user.id)
          .single();

        if (profile?.ban_expiration) {
          const expirationDate = new Date(profile.ban_expiration);
          const now = new Date();
          
          if (expirationDate > now) {
            await supabase.auth.signOut();
            setBanInfo({
              reason: profile.ban_reason || 'No se proporcionó razón',
              expiration: expirationDate
            });
            setError('Tu cuenta está baneada');
            setLoading(false);
            return;
          }
        }
        
        // Si llegamos aquí, el usuario no está baneado y la autenticación fue exitosa
        console.log('Login exitoso, redirigiendo a home');
        router.push('/');
      }
    } catch (error) {
      console.error('Error en login:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const formatTimeLeft = (expiration) => {
    if (!expiration) return null;
    
    const now = new Date();
    const diff = expiration - now;
    
    if (diff <= 0) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days} días, ${hours} horas y ${minutes} minutos`;
  };

  // Formatear la fecha de expiración para mostrarla
  const formatExpirationDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-850">
      <div className="bg-gray-800 p-8 rounded shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-100">Iniciar Sesión</h1>
        
        <p className="text-center mb-4 text-gray-300">
          ¿No tienes una cuenta?{" "}
          <Link href="/signup" className="text-blue-500">
            ¡Regístrate!
          </Link>
        </p>
        
        {(banInfo || isBanned) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">¡Cuenta baneada!</strong>
            <span className="block sm:inline">
              {banInfo?.reason || banReason}
            </span>
            <span className="block sm:inline mt-2">
              Tiempo restante: {formatTimeLeft(banInfo?.expiration || banExpiration)}
            </span>
            <span className="block sm:inline mt-2">
              Fecha de desbaneo: {formatExpirationDate(banInfo?.expiration || banExpiration)}
            </span>
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-2 text-gray-300">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-600 rounded p-2 bg-gray-700 text-gray-100"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-gray-300">Contraseña:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-600 rounded p-2 bg-gray-700 text-gray-100"
              required
            />
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <button 
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500 disabled:opacity-50"
            disabled={loading || isBanned}
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;