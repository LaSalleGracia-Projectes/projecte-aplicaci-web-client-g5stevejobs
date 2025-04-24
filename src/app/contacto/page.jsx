"use client";

import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { supabase } from "../../supabaseClient";

const ContactoPage = () => {
  const [email, setEmail] = useState("");
  const [tema, setTema] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('perfil')
            .select('usuario')
            .eq('id_perfil', user.id)
            .single();

          if (error) throw error;
          setUserProfile(data);
        } catch (error) {
          console.error('Error al obtener el perfil:', error);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !tema || !descripcion) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email con formato inválido.");
      return;
    }

    setIsSubmitting(true);

    try {
      const ticketData = {
        email,
        tema,
        descripcion,
        estado: "pendiente",
        fecha_creacion: new Date(),
        id_usuario: user?.id || null,
        usuario: userProfile?.usuario || null
      };

      await addDoc(collection(db, "tickets_contacto"), ticketData);

      // Limpiar el formulario
      setEmail("");
      setTema("");
      setDescripcion("");
      
      toast.success("Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.");
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      setError("Error al enviar el mensaje. Por favor, inténtalo de nuevo.");
      toast.error("Error al enviar el mensaje");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-850">
      <div className="bg-gray-800 p-8 rounded shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-100">Contacto</h1>
        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-gray-300">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-600 rounded p-2 bg-gray-700 text-gray-100 focus:outline-none focus:border-blue-500"
              disabled={isSubmitting}
              placeholder="tu@email.com"
            />
          </div>
          
          <div>
            <label className="block mb-2 text-gray-300">Tema:</label>
            <input
              type="text"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              className="w-full border border-gray-600 rounded p-2 bg-gray-700 text-gray-100 focus:outline-none focus:border-blue-500"
              disabled={isSubmitting}
              placeholder="Asunto de tu mensaje"
            />
          </div>
          
          <div>
            <label className="block mb-2 text-gray-300">Descripción:</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full border border-gray-600 rounded p-2 bg-gray-700 text-gray-100 focus:outline-none focus:border-blue-500"
              rows="6"
              disabled={isSubmitting}
              placeholder="Describe tu consulta, problema o sugerencia..."
            />
          </div>

          <button 
            type="submit"
            className={`w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 transition-colors ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </span>
            ) : (
              "Enviar mensaje"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactoPage;
