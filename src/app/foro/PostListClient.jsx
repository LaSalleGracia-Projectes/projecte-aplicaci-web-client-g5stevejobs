'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

// Función para crear un timeout que resuelva un Promise después de un tiempo
const createTimeout = (ms) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Timeout: La solicitud tardó demasiado tiempo'));
    }, ms);
  });
};

// Constantes de configuración de reintentos
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 segundos entre reintentos
const TIMEOUT_MS = 10000; // 10 segundos de timeout por intento

export default function PostListClient() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { t, currentLanguage } = useLanguage();

  // Función de delay para esperar entre reintentos
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Memoizamos fetchPosts con useCallback para evitar recreaciones innecesarias
  const fetchPosts = useCallback(async (retry = 0, manual = false) => {
    try {
      if (retry === 0 || manual) {
        setLoading(true);
      }
      setError(null);
      
      if (retry > 0) {
        setIsRetrying(true);
        setRetryCount(retry);
      }
      
      console.log(`Intentando cargar posts (intento ${retry + 1} de ${MAX_RETRIES + 1})`);
      
      // Usamos Promise.race para establecer un timeout
      const result = await Promise.race([
        supabase
          .from('publicacion')
          .select(`
            *,
            perfil!publicacion_id_perfil_fkey (
              usuario,
              avatar
            )
          `)
          .order('fecha_publicacion', { ascending: false }),
        createTimeout(TIMEOUT_MS) // timeout configurable
      ]);

      // Si llegamos aquí, la promesa de supabase se resolvió antes que el timeout
      const { data, error } = result;

      if (error) throw error;
      
      console.log("Posts cargados correctamente:", data?.length || 0);
      setPosts(data || []);
      setIsRetrying(false);
      setRetryCount(0);
    } catch (error) {
      console.error(`Error fetching posts (intento ${retry + 1}):`, error);
      
      // Si aún podemos reintentar y no fue un reintento manual
      if (retry < MAX_RETRIES && !manual) {
        console.log(`Reintentando en ${RETRY_DELAY/1000} segundos...`);
        // Esperamos antes de reintentar
        await delay(RETRY_DELAY);
        // Reintentamos con un contador incrementado
        return fetchPosts(retry + 1);
      }
      
      // Si llegamos al máximo de reintentos o fue un reintento manual, mostramos el error
      setIsRetrying(false);
      setError(
        error.message.includes('Timeout')
          ? `La carga de publicaciones está tardando demasiado. Se han realizado ${retry + 1} intentos. Por favor, inténtalo de nuevo más tarde.`
          : `${t.errorLoadingPosts || 'Error al cargar las publicaciones'} (${retry + 1}/${MAX_RETRIES + 1} intentos)`
      );
    } finally {
      if (retry === 0 || manual || retry >= MAX_RETRIES) {
        setLoading(false);
      }
    }
  }, [t]);

  useEffect(() => {
    const controller = new AbortController();
    
    fetchPosts(0);
    
    // Cleanup function para gestionar el caso de unmount durante la carga
    return () => {
      controller.abort();
      console.log("Componente PostListClient desmontado");
    };
  }, [fetchPosts]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    if (!newPostTitle.trim() || !newPostContent.trim()) {
      setError(t.pleaseCompleteAllFields || 'Por favor, completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      const slug = newPostTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const { error } = await supabase.from('posts').insert([
        {
          title: newPostTitle,
          content: newPostContent,
          slug,
          user_id: user.id,
        },
      ]);

      if (error) throw error;

      setNewPostTitle('');
      setNewPostContent('');
      fetchPosts(0);
      router.push(`/foro/${slug}`);
    } catch (error) {
      console.error('Error creating post:', error);
      setError(t.errorCreatingPost || 'Error al crear el post. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const locale = currentLanguage === 'en' ? 'en-US' : 
                  currentLanguage === 'ca' ? 'ca-ES' : 'es-ES';
    
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-850 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            {isRetrying ? (
              <div className="text-center">
                <p className="text-white mb-2">{t.retrying || "Reintentando cargar publicaciones..."}</p>
                <p className="text-yellow-400 text-sm">Intento {retryCount + 1} de {MAX_RETRIES + 1}</p>
              </div>
            ) : (
              <p className="text-white">{t.loading || "Cargando publicaciones..."}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-850 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">{t.error || "Error"}: </strong>
            <span className="block sm:inline">{error}</span>
            <button 
              onClick={() => fetchPosts(0, true)} 
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
            >
              {t.tryAgain || "Intentar nuevamente"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-850 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">{t.forum || "Foro de Discusión"}</h1>
          <div className="flex gap-4">
            {user && (
              <>
                <button
                  onClick={() => router.push('/foro/create')}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
                >
                  {t.createPost || "Nueva Publicación"}
                </button>
                <button
                  onClick={() => router.push('/report')}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  title={t.reportUser || "Reportar usuario"}
                >
                  {t.reportUser || "Reportar Usuario"}
                </button>
              </>
            )}
            <button
              onClick={() => fetchPosts(0, true)}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500"
              title={t.refresh || "Actualizar"}
            >
              {t.refresh || "Actualizar"}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg text-center">
              <p className="text-gray-300">{t.noPosts || "No hay publicaciones disponibles"}</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id_publicacion} className="bg-gray-800 rounded-lg p-6 shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <Link href={`/foro/${post.id_publicacion}`}>
                    <h2 className="text-xl font-bold text-white hover:text-blue-400">
                      {post.titulo}
                    </h2>
                  </Link>
                </div>
                <p className="text-gray-300 mb-4">
                  {post.contenido.length > 200
                    ? `${post.contenido.substring(0, 200)}...`
                    : post.contenido}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <Link href={`/perfil/${post.perfil.usuario}`} className="hover:text-blue-400">
                    {post.perfil.usuario}
                  </Link>
                  <span>{formatDate(post.fecha_publicacion)}</span>
                  {post.topico && (
                    <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                      {post.topico}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 