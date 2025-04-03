"use client";

import React, { useState } from "react";
import Link from "next/link";
import { supabase } from "../../supabaseClient";
import { useRouter } from "next/navigation";

const SignUp = () => {
  const router = useRouter();
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
        setError("Las contraseñas no coinciden.");
        return;
      }

      if (password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres.");
        return;
      }

      if (username.length < 3) {
        setError("El nombre de usuario debe tener al menos 3 caracteres.");
        return;
      }

      // Verificar si el nombre de usuario ya existe
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username)
        .maybeSingle();

      if (existingUser) {
        setError("El nombre de usuario ya está en uso.");
        return;
      }

      // Registrar al usuario en Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          data: {
            username: username
          }
        }
      });

      if (signUpError) {
        console.error("Error de registro:", signUpError);
        
        if (signUpError.message.includes("Email rate limit exceeded")) {
          setError("Has excedido el límite de intentos. Por favor, espera unos minutos.");
        } else if (signUpError.message.includes("User already registered")) {
          setError("Este email ya está registrado. Por favor, inicia sesión.");
        } else {
          setError(`Error de registro: ${signUpError.message}`);
        }
        return;
      }

      if (authData?.user) {
        alert("¡Usuario registrado! Por favor, verifica tu correo electrónico para confirmar tu cuenta.");
        router.push('/login');
      } else {
        setError("Error al crear el usuario. Por favor, intenta de nuevo.");
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
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-100">Regístrate</h1>
        
        <p className="text-center mb-4 text-gray-300">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="text-blue-500">
            ¡Inicia sesión!
          </Link>
        </p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block mb-2 text-gray-300">Nombre de usuario:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-600 rounded p-2 bg-gray-700 text-gray-100"
              required
              minLength={3}
            />
          </div>
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
              minLength={6}
            />
          </div>
          <div>
            <label className="block mb-2 text-gray-300">Confirmar Contraseña:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-600 rounded p-2 bg-gray-700 text-gray-100"
              required
              minLength={6}
            />
          </div>
          <button 
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Registrando..." : "Regístrame"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;