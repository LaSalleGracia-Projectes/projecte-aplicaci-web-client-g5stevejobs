'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

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
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Tópicos disponibles
  const topics = [
    { id: 'all', name: t.allTopics || 'Todos los tópicos' },
    { id: 'General', name: 'General' },
    { id: 'Bugs', name: 'Bugs' },
    { id: 'Sugerencias', name: t.suggestions || 'Sugerencias' },
    { id: 'Ayuda', name: t.help || 'Ayuda' },
    { id: 'Guías', name: t.guides || 'Guías' },
    { id: 'Discusión', name: t.discussion || 'Discusión' },
  ];

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

  // Filtrar los posts según el tópico seleccionado y el término de búsqueda
  const filteredPosts = posts.filter(post => {
    const matchesTopic = selectedTopic === 'all' || post.topico === selectedTopic;
    const matchesSearch = searchTerm === '' || 
      post.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.contenido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.perfil.usuario.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTopic && matchesSearch;
  });

  const getTopicColor = (topic) => {
    switch(topic) {
      case 'General': return 'bg-blue-600';
      case 'Bugs': return 'bg-red-600';
      case 'Sugerencias': return 'bg-green-600';
      case 'Ayuda': return 'bg-yellow-600';
      case 'Guías': return 'bg-purple-600';
      case 'Discusión': return 'bg-indigo-600';
      default: return 'bg-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 relative mb-6">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-xl font-medium text-white mb-4">{t.loading || "Cargando publicaciones..."}</h2>
        <p className="text-gray-400 mb-8 text-center max-w-md">{t.loadingMessage || "Estamos cargando las últimas conversaciones del foro."}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          {t.manualReload || "Recargar manualmente"}
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 rounded-xl p-8 backdrop-blur-sm border border-red-700 shadow-lg">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 bg-red-100 rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-red-300">{t.error || "Error"}</h3>
            <p className="mt-2 text-base text-red-200">{error}</p>
            <div className="flex space-x-4 mt-6">
              <button 
                onClick={loadPosts} 
                className="bg-red-800 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                {t.tryAgain || "Intentar nuevamente"}
              </button>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
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
    <div className="space-y-8">
      {/* Cabecera */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{t.forum || "Foro de Discusión"}</h1>
            <p className="text-gray-400">{t.forumDescription || "Comparte ideas, resuelve dudas y conecta con la comunidad"}</p>
          </div>
          <div className="flex gap-3">
            {user ? (
              <>
                <button
                  onClick={() => router.push('/foro/create')}
                  className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-500 transition-colors shadow-lg hover:shadow-blue-700/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t.createPost || "Nueva Publicación"}
                </button>
                <button
                  onClick={() => router.push('/report')}
                  className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-500 transition-colors shadow-lg hover:shadow-red-700/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {t.reportUser || "Reportar Usuario"}
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-500 transition-colors shadow-lg hover:shadow-blue-700/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                {t.loginToPost || "Iniciar sesión para publicar"}
              </button>
            )}
            <button
              onClick={handleRefresh}
              className="flex items-center justify-center bg-gray-700 text-white p-2.5 rounded-lg hover:bg-gray-600 transition-colors shadow-md"
              title={t.refresh || "Actualizar"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {topics.map(topic => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTopic === topic.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {topic.name}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-auto">
            <input
              type="text"
              placeholder={t.searchPosts || "Buscar en el foro..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-700 text-white rounded-lg py-2 pl-10 pr-4 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        
        {/* Contador de resultados */}
        <div className="mt-4 text-sm text-gray-400">
          {filteredPosts.length === 0 ? (
            <p>{t.noResultsFound || "No se encontraron resultados"}</p>
          ) : (
            <p>
              {t.showingResults || "Mostrando"} {filteredPosts.length} {filteredPosts.length === 1 ? (t.result || "resultado") : (t.results || "resultados")}
              {selectedTopic !== 'all' && ` ${t.inTopic || "en el tópico"} ${selectedTopic}`}
              {searchTerm && ` ${t.matchingSearch || "que coinciden con"} "${searchTerm}"`}
            </p>
          )}
        </div>
      </div>
      
      {/* Lista de publicaciones */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <h3 className="text-xl font-medium text-white mb-2">{t.noPosts || "No hay publicaciones disponibles"}</h3>
            <p className="text-gray-400 mb-6">{t.noPostsMessage || "No se encontraron publicaciones que coincidan con tus criterios de búsqueda."}</p>
            <button
              onClick={() => {
                setSelectedTopic('all');
                setSearchTerm('');
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors"
            >
              {t.clearFilters || "Limpiar filtros"}
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id_publicacion}
              className="bg-gray-800 hover:bg-gray-750 rounded-xl p-6 shadow-lg transition-all duration-200 hover:shadow-xl border border-gray-700 hover:border-gray-600"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* Avatar del usuario */}
                <div className="flex-shrink-0">
                  <Link href={`/perfil/${post.perfil.usuario}`}>
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center border-2 border-gray-600">
                      {post.perfil.avatar ? (
                        <img 
                          src={post.perfil.avatar} 
                          alt={post.perfil.usuario}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-gray-400">
                          {post.perfil.usuario.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
                
                {/* Contenido principal */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    {post.topico && (
                      <span className={`${getTopicColor(post.topico)} text-white text-xs px-2.5 py-1 rounded-full font-medium`}>
                        {post.topico}
                      </span>
                    )}
                    <Link href={`/perfil/${post.perfil.usuario}`} className="text-sm text-blue-400 hover:text-blue-300">
                      {post.perfil.usuario}
                    </Link>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-400">{formatDate(post.fecha_publicacion)}</span>
                  </div>
                  
                  <Link href={`/foro/${post.id_publicacion}`}>
                    <h2 className="text-xl font-bold text-white mb-2 hover:text-blue-400 transition-colors">
                      {post.titulo}
                    </h2>
                  </Link>
                  
                  <p className="text-gray-300 mb-4 line-clamp-3">
                    {post.contenido.length > 250
                      ? `${post.contenido.substring(0, 250)}...`
                      : post.contenido}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <Link 
                      href={`/foro/${post.id_publicacion}`}
                      className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {t.viewComments || "Ver comentarios"}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}