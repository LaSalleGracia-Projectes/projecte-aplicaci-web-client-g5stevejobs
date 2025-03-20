"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../supabaseClient";

const CreateTopicPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [topico, setTopico] = useState("Offtopic");
  const [contenido, setContenido] = useState("");
  const [error, setError] = useState(null);
  const [usuario, setUsuario] = useState("");
  const topics = ["Offtopic", "Bugs", "Anuncios", "Feedback"];

  useEffect(() => {
    const fetchUsuario = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("perfil")
          .select("usuario")
          .eq("id_perfil", user.id)
          .single();

        if (error) {
          console.error("Error fetching usuario:", error);
        } else {
          setUsuario(data.usuario);
        }
      }
    };

    fetchUsuario();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo || !contenido) {
      setError("El título y el contenido son obligatorios.");
      return;
    }

    if (!usuario) {
      setError("El nombre de usuario es obligatorio.");
      return;
    }

    const currentDate = new Date();

    const newThread = {
      titulo,
      topico,
      usuario,
      contenido,
      fecha_publicacion: currentDate,
      ultima_publicacion: currentDate,
      estatus: true, // Cambiado a true
    };

    console.log("Data to be sent:", newThread);

    try {
      const { data, error } = await supabase
        .from("publicacion")
        .insert([newThread]);

      if (error) {
        console.error("Error creando el hilo:", error);
        console.error("Detalles del error:", error.details);
        console.error("Pista del error:", error.hint);
        if (error.status === 400) {
          setError("Solicitud incorrecta. Por favor, revisa tu entrada.");
        } else {
          setError(error.message || "Ocurrió un error desconocido");
        }
      } else {
        router.push("/foro");
      }
    } catch (err) {
      console.error("Error inesperado:", err);
      setError(err.message || "Ocurrió un error inesperado");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Debes estar registrado para crear un hilo.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-850 min-h-screen text-white">
      <main className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">Crear un nuevo hilo</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-500">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-300">Título</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 focus:outline-none text-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Tema</label>
            <select
              value={topico}
              onChange={(e) => setTopico(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 focus:outline-none text-black"
            >
              {topics.map((topic) => (
                <option key={topic} value={topic} className="text-black">
                  {topic}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Contenido</label>
            <textarea
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 focus:outline-none text-black"
              rows="6"
              required
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring focus:ring-blue-300"
          >
            Crear hilo
          </button>
        </form>
      </main>
    </div>
  );
};

export default CreateTopicPage;