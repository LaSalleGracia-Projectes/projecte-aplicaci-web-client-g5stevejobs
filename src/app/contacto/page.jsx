"use client";

import React, { useState } from "react";

const ContactoPage = () => {
  const [email, setEmail] = useState("");
  const [tema, setTema] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !tema || !descripcion) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email con formato inválido.");
      return;
    }

    // Aquí puedes agregar la lógica para enviar el formulario
    setSuccess("Formulario enviado con éxito.");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-850">
      <div className="bg-gray-800 p-8 rounded shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-100">Contacto</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-gray-300">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-600 rounded p-2 mb-4 bg-gray-700 text-gray-100"
          />
          <label className="block mb-2 text-gray-300">Tema:</label>
          <input
            type="text"
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            className="w-full border border-gray-600 rounded p-2 mb-4 bg-gray-700 text-gray-100"
          />
          <label className="block mb-2 text-gray-300">Descripción del problema/sugerencia:</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full border border-gray-600 rounded p-2 mb-4 bg-gray-700 text-gray-100"
            rows="6"
          />
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500">
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactoPage;
