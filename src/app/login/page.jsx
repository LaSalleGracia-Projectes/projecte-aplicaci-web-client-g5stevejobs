"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

// Función para crear un timeout que rechace el Promise después de un tiempo
const createTimeout = (ms) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Timeout: La solicitud tardó demasiado tiempo'));
    }, ms);
  });
};

const Login = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isBanned, banReason, banExpiration, getBanTimeLeft } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [banInfo, setBanInfo] = useState(null);
  const [authSuccess, setAuthSuccess] = useState(false); // Para rastrear cuando la autenticación fue exitosa
  const [redirected, setRedirected] = useState(false); // Para evitar redirecciones múltiples

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
    
    // Si el usuario ya está autenticado, redirigir a la página de inicio
    if (user && !loading && !authSuccess && !redirected) {
      console.log('Usuario ya autenticado, redirigiendo a home');
      setRedirected(true); // Marcar como redirigido para evitar bucles
      router.push('/');
    }
  }, [searchParams, user, loading, authSuccess, router, redirected]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setAuthSuccess(false);
    setRedirected(false);

    try {
      // Usar Promise.race para establecer un timeout en la autenticación
      const authResult = await Promise.race([
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        createTimeout(15000) // 15 segundos timeout
      ]);

      if (authResult.error) throw authResult.error;

      // Verificar si el usuario está baneado
      if (authResult.data?.user) {
        try {
          // Timeout para la verificación de ban
          const banCheckResult = await Promise.race([
            supabase
              .from('perfil')
              .select('ban_expiration, ban_reason')
              .eq('id_perfil', authResult.data.user.id)
              .single(),
            createTimeout(8000) // 8 segundos timeout
          ]);

          if (banCheckResult.error) {
            console.error('Error al verificar ban:', banCheckResult.error);
            // Continuamos de todas formas ya que es mejor permitir el acceso que bloquear por error
          } else if (banCheckResult.data?.ban_expiration) {
            const expirationDate = new Date(banCheckResult.data.ban_expiration);
            const now = new Date();
            
            if (expirationDate > now) {
              await supabase.auth.signOut();
              setBanInfo({
                reason: banCheckResult.data.ban_reason || t.noReasonProvided || 'No se proporcionó razón',
                expiration: expirationDate
              });
              setError(t.accountBanned || 'Tu cuenta está baneada');
              setLoading(false);
              return;
            }
          }
        } catch (banCheckError) {
          console.error('Error durante la verificación de ban:', banCheckError);
          // Continuamos de todas formas
        }
        
        // Si llegamos aquí, el usuario no está baneado y la autenticación fue exitosa
        console.log('Login exitoso, redirigiendo a home');
        setAuthSuccess(true);
        setRedirected(true);
        
        // Redirigimos después de un breve retraso para asegurar que todo se complete
        setTimeout(() => {
          router.push('/');
        }, 200);
      }
    } catch (error) {
      console.error('Error en login:', error);
      
      if (error.message.includes('Timeout')) {
        setError('La conexión está tardando demasiado. Por favor, inténtalo nuevamente.');
      } else if (error.message.includes('Invalid login credentials')) {
        setError(t.invalidCredentials || 'Email o contraseña incorrectos');
      } else {
        setError(error.message);
      }
    } finally {
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
    
    return `${days} ${t.days || 'días'}, ${hours} ${t.hours || 'horas'} ${t.and || 'y'} ${minutes} ${t.minutes || 'minutos'}`;
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

  // Handle forgot password
  const handleForgotPassword = () => {
    router.push('/reset-password');
  };

  return (
    <main className="min-h-screen bg-gray-850 text-white py-12">
      <div className="max-w-xl mx-auto px-4">
        <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-2xl p-8 md:p-10 shadow-xl border border-gray-700">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{t.login || "Iniciar Sesión"}</h1>
            <p className="text-blue-200 text-lg">
              {t.welcomeBack || "Bienvenido de nuevo a nuestra comunidad"}
            </p>
          </div>
          
          {(banInfo || isBanned) && (
            <div className="bg-red-900/20 border border-red-600 text-red-200 px-6 py-4 rounded-lg mb-6">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <strong className="font-semibold text-red-300">{t.accountBanned || "¡Cuenta baneada!"}</strong>
              </div>
              <div className="ml-8">
                <p className="mb-2">{banInfo?.reason || banReason}</p>
                <p className="text-sm text-red-300">
                  <span className="block">{t.timeLeft || "Tiempo restante"}: {formatTimeLeft(banInfo?.expiration || banExpiration)}</span>
                  <span className="block mt-1">{t.unbanDate || "Fecha de desbaneo"}: {formatExpirationDate(banInfo?.expiration || banExpiration)}</span>
                </p>
              </div>
            </div>
          )}
          
          {error && !banInfo && !isBanned && (
            <div className="bg-red-900/20 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="email">
                {t.email || "Email"}:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full border border-gray-600 rounded-lg p-3 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  disabled={loading || isBanned}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-300" htmlFor="password">
                  {t.password || "Contraseña"}:
                </label>
                <Link href="/reset-password" className="text-sm text-blue-400 hover:text-blue-300">
                  {t.forgotPassword || "¿Olvidaste tu contraseña?"}
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full border border-gray-600 rounded-lg p-3 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  disabled={loading || isBanned}
                />
              </div>
            </div>
            
            <div className="pt-4">
              <button 
                type="submit"
                className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-500 transition-all duration-300 shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2 ${
                  (loading || isBanned) ? "opacity-70 cursor-not-allowed" : "hover:shadow-lg hover:shadow-blue-600/20"
                }`}
                disabled={loading || isBanned}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{t.loggingIn || "Iniciando sesión..."}</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    {t.login || "Iniciar Sesión"}
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center border-t border-gray-700 pt-6">
            <p className="text-gray-300">
              {t.noAccount || "¿No tienes una cuenta?"}{" "}
              <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium">
                {t.signUp || "Regístrate ahora"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;