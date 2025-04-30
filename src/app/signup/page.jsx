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
    <div className="flex items-center justify-center min-h-screen bg-gray-850">
      <div className="bg-gray-800 p-8 rounded shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-100">{t.register || "Regístrate"}</h1>

        <p className="text-center mb-4 text-gray-300">
          {t.haveAccount || "¿Ya tienes una cuenta?"}{" "}
          <Link href="/login" className="text-blue-500">
            {t.login || "¡Inicia sesión!"}
          </Link>
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">{t.error || "Error"}: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block mb-2 text-gray-300">{t.username || "Nombre de usuario"}:</label>
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
            <label className="block mb-2 text-gray-300">{t.email || "Email"}:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-600 rounded p-2 bg-gray-700 text-gray-100"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-gray-300">{t.password || "Contraseña"}:</label>
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
            <label className="block mb-2 text-gray-300">{t.confirmPassword || "Confirmar Contraseña"}:</label>
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
            {loading ? (t.registering || "Registrando...") : (t.register || "Regístrame")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;