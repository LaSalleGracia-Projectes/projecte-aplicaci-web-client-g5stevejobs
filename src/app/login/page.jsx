"use client";

import React, { useState } from "react";
import Link from "next/link";
import { supabase } from "../../supabaseClient";
import { useRouter } from "next/navigation";

const Login = () => {
  const router = useRouter();
  const [identifier, setIdentifier] = useState(""); // Puede ser email o username
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Primero intentamos obtener el email si el usuario ingresó un username
      let email = identifier;
      if (!identifier.includes('@')) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("email")
          .eq("username", identifier)
          .single();

        if (profileError || !profile) {
          setError("Usuario o contraseña incorrectos.");
          return;
        }
        email = profile.email;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error("Error de inicio de sesión:", signInError);
        setError("Usuario o contraseña incorrectos.");
        return;
      }

      if (data?.user) {
        router.push('/dashboard');
      } else {
        setError("Error al iniciar sesión. Por favor, intenta de nuevo.");
      }
    } catch (err) {
      console.error("Error inesperado:", err);
      setError("Ocurrió un error inesperado. Por favor, intenta de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
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
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-2 text-gray-300">Email o nombre de usuario:</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
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
          <button 
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;