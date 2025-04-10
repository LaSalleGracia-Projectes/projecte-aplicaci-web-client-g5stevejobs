'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function PostListClient() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('publicacion')
        .select(`
          *,
          perfil!publicacion_id_perfil_fkey (
            usuario,
            avatar
          )
        `)
        .order('fecha_publicacion', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Error al cargar las publicaciones. Por favor, inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    if (!newPostTitle.trim() || !newPostContent.trim()) {
      setError('Por favor, completa todos los campos');
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
      fetchPosts();
      router.push(`/foro/${slug}`);
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Error al crear el post. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-850 p-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-white">Cargando publicaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-850 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-850 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Foro de Discusión</h1>
          {user && (
            <button
              onClick={() => router.push('/foro/create')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
            >
              Nueva Publicación
            </button>
          )}
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id_publicacion} className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <Link href={`/foro/${post.id_publicacion}`}>
                <h2 className="text-xl font-bold text-white mb-2 hover:text-blue-400">
                  {post.titulo}
                </h2>
              </Link>
              <p className="text-gray-300 mb-4">
                {post.contenido.length > 200
                  ? `${post.contenido.substring(0, 200)}...`
                  : post.contenido}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <Link href={`/perfil/${post.perfil.usuario}`} className="hover:text-blue-400">
                  {post.perfil.usuario}
                </Link>
                <span>{new Date(post.fecha_publicacion).toLocaleDateString('es-ES')}</span>
                {post.topico && (
                  <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                    {post.topico}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 