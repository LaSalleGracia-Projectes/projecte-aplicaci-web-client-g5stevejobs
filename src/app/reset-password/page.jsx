"use client";

import React, { useState } from "react";
import { supabase } from "../../supabaseClient";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Se ha enviado un enlace de restablecimiento de contraseña a tu correo electrónico.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-850">
      <div className="bg-gray-800 p-8 rounded shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-100">Restablecer Contraseña</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}
        <form onSubmit={handleResetPassword}>
          <label className="block mb-2 text-gray-300">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-600 rounded p-2 mb-4 bg-gray-700 text-gray-100"
            required
          />
          <label className="block mb-2 text-gray-300">Nueva Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-600 rounded p-2 mb-4 bg-gray-700 text-gray-100"
            required
          />
          <label className="block mb-2 text-gray-300">Confirmar Nueva Contraseña:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-600 rounded p-2 mb-4 bg-gray-700 text-gray-100"
            required
          />
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500">
            Enviar enlace de restablecimiento
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
