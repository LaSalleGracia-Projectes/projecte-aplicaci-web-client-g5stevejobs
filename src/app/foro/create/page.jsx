"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../supabaseClient";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../../context/LanguageContext";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-hot-toast";
import Link from "next/link";

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
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Define available topics
  const topics = [
    { id: "General", name: "General" },
    { id: "Bugs", name: "Bugs" },
    { id: "Sugerencias", name: t?.suggestions || "Sugerencias" },
    { id: "Ayuda", name: t?.help || "Ayuda" },
    { id: "Guías", name: t?.guides || "Guías" },
    { id: "Discusión", name: t?.discussion || "Discusión" }
  ];

  // Set isClient to true once component mounts to avoid hydration issues
  useEffect(() => {
    setIsClient(true);
    // Check if user is logged in, if not redirect to login
    if (!user) {
      toast.error(t?.loginRequired || "Debes iniciar sesión para crear una publicación");
      router.push('/login');
    }
  }, [user, router, t]);

  useEffect(() => {
    // Update character count
    setCharCount(content.length);
  }, [content]);

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
      const now = new Date().toISOString();

      // Crear la publicación con timeout
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

  // Format preview text with paragraphs and line breaks
  const formatPreviewText = (text) => {
    return text
      .split('\n\n')
      .map((paragraph, i) => (
        <p key={i} className="mb-4">
          {paragraph.split('\n').map((line, j) => (
            <span key={j}>
              {line}
              {j < paragraph.split('\n').length - 1 && <br />}
            </span>
          ))}
        </p>
      ));
  };

  if (!isClient) {
    return null; // Return null to avoid hydration issues
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-850 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Navigation breadcrumbs */}
        <div className="mb-6 flex items-center text-sm text-gray-400">
          <Link href="/foro" className="hover:text-blue-400 transition-colors">
            {t?.forum || "Foro"}
          </Link>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-white">{t?.createNewPost || "Crear Nueva Publicación"}</span>
        </div>

        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-700">
          {/* Form header */}
          <div className="bg-gray-800 p-6 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">{t?.createNewPost || "Crear Nueva Publicación"}</h1>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  {showPreview ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      {t?.editMode || "Modo Edición"}
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {t?.preview || "Vista Previa"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 backdrop-blur-sm border-l-4 border-red-600 p-4 m-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          {showPreview ? (
            <div className="p-6 bg-gray-800/80">
              <div className="bg-gray-750 rounded-xl p-6 border border-gray-700 shadow-inner mb-6">
                <div className="mb-2 pb-2 border-b border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2.5 py-1 text-xs font-medium text-white rounded-full ${topic ? 'bg-blue-600' : 'bg-gray-600'}`}>
                      {topic || t?.selectTopic || "Selecciona un tópico"}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-white">
                    {title || t?.titlePlaceholder || "Escribe un título descriptivo"}
                  </h1>
                </div>
                <div className="prose prose-invert max-w-none">
                  {content ? (
                    formatPreviewText(content)
                  ) : (
                    <p className="text-gray-400 italic">
                      {t?.contentWillAppearHere || "El contenido de tu publicación aparecerá aquí"}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  {t?.backToEditing || "Volver a Editar"}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                    {t?.title || "Título"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    minLength={3}
                    maxLength={100}
                    placeholder={t?.titlePlaceholder || "Escribe un título descriptivo"}
                    className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <p className="mt-1 text-xs text-gray-400">{title.length}/100 {t?.characters || "caracteres"}</p>
                </div>
                
                <div>
                  <label htmlFor="topic" className="block text-sm font-medium text-gray-300 mb-1">
                    {t?.topic || "Tópico"} <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">{t?.selectTopic || "Selecciona un tópico"}</option>
                    {topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-400">{t?.topicHelp || "Elige la categoría más adecuada para tu publicación"}</p>
                </div>
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-1">
                  {t?.content || "Contenido"} <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={12}
                  placeholder={t?.contentPlaceholder || "Escribe el contenido de tu publicación"}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <div className="mt-1 flex justify-between">
                  <p className="text-xs text-gray-400">
                    {t?.supportsParagraphs || "Soporta párrafos separados por líneas en blanco"}
                  </p>
                  <p className={`text-xs ${charCount > 10000 ? 'text-red-400' : 'text-gray-400'}`}>
                    {charCount}/10000 {t?.characters || "caracteres"}
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex items-center gap-2 px-5 py-2.5 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {t?.cancel || "Cancelar"}
                </button>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {t?.preview || "Vista Previa"}
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>{t?.creating || "Creando..."}</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t?.publishPost || "Publicar"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
        
        {/* Tips section */}
        <div className="mt-8 bg-blue-900/20 backdrop-blur-sm border border-blue-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-medium text-white mb-3">
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t?.writingTips || "Consejos para escribir una buena publicación"}
            </span>
          </h3>
          <ul className="text-gray-300 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{t?.tip1 || "Usa un título descriptivo que resuma claramente tu publicación"}</span>
            </li>
            <li className="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{t?.tip2 || "Organiza el contenido en párrafos para facilitar la lectura"}</span>
            </li>
            <li className="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{t?.tip3 || "Selecciona el tópico más apropiado para tu publicación"}</span>
            </li>
            <li className="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{t?.tip4 || "Si es un reporte de error, incluye detalles específicos sobre cómo reproducirlo"}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}