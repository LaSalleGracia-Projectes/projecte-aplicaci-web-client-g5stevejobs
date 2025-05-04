'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-hot-toast';

// Función simple para timeout
const createTimeout = (ms) => new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Timeout')), ms)
);

export default function PostListClient() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const router = useRouter();
  const { user } = useAuth();
  const { t, currentLanguage } = useLanguage();

  // Función para cargar los posts
  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Intentar cargar los posts con un timeout de 10 segundos
      const postsPromise = supabase
        .from('publicacion')
        .select(`
          *,
          perfil!publicacion_id_perfil_fkey (
            usuario,
            avatar
          )
        `)
        .order('fecha_publicacion', { ascending: false });
        
      const result = await Promise.race([
        postsPromise,
        createTimeout(10000)
      ]);
      
      if (result.error) throw new Error('Error al cargar las publicaciones');
      
      console.log("Posts cargados correctamente:", result.data?.length || 0);
      setPosts(result.data || []);
      
    } catch (err) {
      console.error('Error al cargar posts:', err);
      setError(
        err.message === 'Timeout'
          ? 'La carga de publicaciones está tardando demasiado. Por favor, inténtalo de nuevo.'
          : 'Error al cargar las publicaciones'
      );
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar los posts al montar el componente
  useEffect(() => {
    loadPosts();
    
    return () => {
      console.log("Componente PostListClient desmontado");
    };
  }, []);

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
      loadPosts();
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
  
  // Función para refrescar los posts
  const handleRefresh = () => {
    loadPosts();
    toast.success(t.refreshing || "Actualizando el foro...");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-850 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-white">{t.loading || "Cargando publicaciones..."}</p>
            
            <button 
              onClick={() => window.location.reload()} 
              className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
            >
              {t.manualReload || "Recargar manualmente"}
            </button>
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
            <div className="flex space-x-4 mt-4">
              <button 
                onClick={loadPosts} 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
              >
                {t.tryAgain || "Intentar nuevamente"}
              </button>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                {t.reload || "Recargar página"}
              </button>
            </div>
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
              onClick={handleRefresh}
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