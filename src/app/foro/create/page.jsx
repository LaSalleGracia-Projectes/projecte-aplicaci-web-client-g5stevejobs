"use client";

import { useState } from "react";
import { supabase } from "../../../supabaseClient";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../../context/LanguageContext";
import { toast } from "react-hot-toast";

// Función para crear un timeout
const createTimeout = (ms) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Timeout: La solicitud tardó demasiado tiempo'));
    }, ms);
  });
};

// Constantes de configuración
const TIMEOUT_MS = 12000; // 12 segundos de timeout para creación

export default function CreatePost() {
  const router = useRouter();
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);

  const topics = [
    "General",
    "Bugs",
    "Sugerencias",
    "Ayuda",
    "Guías",
    "Discusión"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!title.trim() || !content.trim() || !topic) {
      setError(t?.completeAllFields || 'Por favor, completa todos los campos requeridos.');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      // Obtener el usuario actual con timeout
      const userResult = await Promise.race([
        supabase.auth.getUser(),
        createTimeout(TIMEOUT_MS)
      ]);
      
      if (userResult.error) throw userResult.error;
      
      const user = userResult.data.user;
      if (!user) {
        router.push('/login');
        return;
      }

      const now = new Date().toISOString();

      // Intentar crear la publicación con timeout
      setRetrying(false);
      const postResult = await Promise.race([
        supabase
          .from('publicacion')
          .insert([
            {
              titulo: title,
              contenido: content,
              topico: topic,
              id_perfil: user.id,
              estatus: true,
              fecha_publicacion: now,
              ultima_publicacion: now
            }
          ])
          .select(`
            *,
            perfil:perfil!publicacion_id_perfil_fkey (
              usuario,
              avatar
            )
          `)
          .single(),
        createTimeout(TIMEOUT_MS)
      ]);

      if (postResult.error) throw postResult.error;

      // Mostrar notificación de éxito
      toast.success(t?.postCreated || 'Publicación creada con éxito');
      
      // Redirigir a la página de la publicación
      router.push(`/foro/${postResult.data.id_publicacion}`);
    } catch (err) {
      console.error('Error al crear publicación:', err);
      
      // Manejar diferentes tipos de errores
      if (err.message.includes('Timeout')) {
        setError(t?.connectionTimeout || 'La conexión está tardando demasiado. Por favor, inténtalo nuevamente.');
      } else if (err.code === '23505') {
        // Error de duplicado en PostgreSQL
        setError(t?.duplicatePost || 'Ya existe una publicación con ese título. Por favor, usa otro título.');
      } else if (err.code === '23503') {
        // Error de clave foránea
        setError(t?.authError || 'Error de autenticación. Por favor, inicia sesión nuevamente.');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError(err.message || t?.postCreationError || 'Error al crear la publicación. Por favor, intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-850 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h1 className="text-2xl font-bold text-white mb-6">{t?.createNewPost || "Crear Nueva Publicación"}</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              <strong className="font-bold">{t?.error || "Error"}: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300">
                {t?.title || "Título"}
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={3}
                maxLength={100}
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                placeholder={t?.titlePlaceholder || "Escribe un título descriptivo"}
              />
            </div>

            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-300">
                {t?.topic || "Tópico"}
              </label>
              <select
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              >
                <option value="">{t?.selectTopic || "Selecciona un tópico"}</option>
                {topics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-300">
                {t?.content || "Contenido"}
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={10}
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                placeholder={t?.contentPlaceholder || "Escribe el contenido de tu publicación"}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors"
              >
                {t?.cancel || "Cancelar"}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{t?.creating || "Creando..."}</span>
                  </div>
                ) : (
                  t?.createPost || "Crear Publicación"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}