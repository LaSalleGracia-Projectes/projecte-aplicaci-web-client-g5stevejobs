"use client";

import React, { useState } from "react";
import Link from "next/link";
import { supabase } from "../../supabaseClient";

const SignUp = () => {
  const [usuario, setUsuario] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [error, setError] = useState(null);

  const handleSignUp = async (e) => {
    e.preventDefault();

    // Verificar si el nombre de usuario ya existe
    const { data: existingUser } = await supabase
      .from('perfil')
      .select('usuario')
      .eq('usuario', usuario)
      .single();

    if (existingUser) {
      setError('El nombre de usuario ya está en uso.');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: usuario,
      password: contraseña,
    });

    if (error) {
      setError(error.message);
    } else {
      // Guardar el nombre de usuario en la base de datos
      const { error: dbError } = await supabase
        .from('perfil')
        .insert([{ id_perfil: data.user.id, usuario }]);

      if (dbError) {
        setError(dbError.message);
      } else {
        alert("Check your email for the confirmation link!");
      }
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
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSignUp}>
          <label className="block mb-2 text-gray-300">Usuario:</label>
          <input
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="w-full border border-gray-600 rounded p-2 mb-4 bg-gray-700 text-gray-100"
          />
          <label className="block mb-2 text-gray-300">Contraseña:</label>
          <input
            type="password"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            className="w-full border border-gray-600 rounded p-2 mb-4 bg-gray-700 text-gray-100"
          />
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500">
            Regístrame
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;