"use client";

import React, { useState } from "react";
import Link from "next/link";
import { supabase } from "../../supabaseClient";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../context/LanguageContext";

const SignUp = () => {
  const router = useRouter();
  const { t } = useLanguage(); // Get translations
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (password !== confirmPassword) {
        setError(t.passwordsDoNotMatch || "Las contraseñas no coinciden.");
        return;
      }

      if (password.length < 6) {
        setError(t.passwordMinLength || "La contraseña debe tener al menos 6 caracteres.");
        return;
      }

      if (username.length < 3) {
        setError(t.usernameMinLength || "El nombre de usuario debe tener al menos 3 caracteres.");
        return;
      }

      // Registrar al usuario en Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username, // Guardamos el username en los metadatos
          },
        },
      });

      if (signUpError) {
        console.error("Error de registro:", signUpError);

        if (signUpError.message.includes("Email rate limit exceeded")) {
          setError(t.rateLimitExceeded || "Has excedido el límite de intentos. Por favor, espera unos minutos.");
        } else if (signUpError.message.includes("User already registered")) {
          setError(t.emailAlreadyRegistered || "Este email ya está registrado. Por favor, inicia sesión.");
        } else {
          setError(`${t.error || "Error"}: ${signUpError.message}`);
        }
        return;
      }

      if (authData?.user) {
        // Crear el perfil en la tabla perfil
        const { error: profileError } = await supabase
          .from("perfil")
          .insert({
            id_perfil: authData.user.id,
            usuario: username,
            email: email,
            rol: "usuario",
          });

        if (profileError) {
          if (profileError.code === "23505") {
            if (profileError.message.includes("usuario")) {
              setError(t.usernameInUse || "El nombre de usuario ya está en uso.");
            } else if (profileError.message.includes("email")) {
              setError(t.emailInUse || "Este email ya está registrado.");
            } else {
              setError(t.userOrEmailInUse || "Este usuario o email ya está registrado.");
            }
          } else {
            console.error("Error al crear el perfil:", profileError);
            setError(`${t.profileError || "Error al crear el perfil"}: ${profileError.message || t.unknownError || "Error desconocido"}`);
          }
          return;
        }

        alert(t.registrationSuccess || "¡Usuario registrado! Por favor, verifica tu correo electrónico para confirmar tu cuenta.");
        router.push("/login");
      } else {
        setError(t.userCreationError || "Error al crear el usuario. Por favor, intenta de nuevo.");
      }
    } catch (err) {
      console.error("Error inesperado:", err);
      setError(t.unexpectedError || "Ocurrió un error inesperado. Por favor, intenta de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-850 text-white py-12">
      <div className="max-w-xl mx-auto px-4">
        <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-2xl p-8 md:p-10 shadow-xl border border-gray-700">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{t.register || "Regístrate"}</h1>
            <p className="text-blue-200 text-lg">
              {t.joinCommunity || "Únete a nuestra comunidad y comienza a explorar"}
            </p>
          </div>
          
          {error && (
            <div className="bg-red-900/20 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="username">
                {t.username || "Nombre de usuario"}:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 w-full border border-gray-600 rounded-lg p-3 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  minLength={3}
                />
              </div>
            </div>
            
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
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="password">
                {t.password || "Contraseña"}:
              </label>
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
                  minLength={6}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{t.passwordMinLengthHint || "La contraseña debe tener al menos 6 caracteres"}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="confirmPassword">
                {t.confirmPassword || "Confirmar Contraseña"}:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 w-full border border-gray-600 rounded-lg p-3 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  minLength={6}
                />
              </div>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-500 transition-all duration-300 shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2 ${
                  loading ? "opacity-70 cursor-not-allowed" : "hover:shadow-lg hover:shadow-blue-600/20"
                }`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t.registering || "Registrando..."}
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    {t.register || "Crear cuenta"}
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center border-t border-gray-700 pt-6">
            <p className="text-gray-300">
              {t.haveAccount || "¿Ya tienes una cuenta?"}{" "}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                {t.login || "Iniciar sesión"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SignUp;