"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-hot-toast";

export default function PostDetailClient({ slug }) {
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [showDeletePostModal, setShowDeletePostModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);

  useEffect(() => {
    if (!slug) {
      setError('ID de publicación no válido');
      setLoading(false);
      return;
    }

    const fetchPostAndComments = async () => {
      try {
        // Obtener la publicación con información del autor
        const { data: postData, error: postError } = await supabase
          .from('publicacion')
          .select(`
            *,
            perfil!publicacion_id_perfil_fkey (
              usuario,
              avatar
            )
          `)
          .eq('id_publicacion', slug)
          .single();

        if (postError) throw postError;
        setPost(postData);

        // Obtener los comentarios con información de los autores
        const { data: commentsData, error: commentsError } = await supabase
          .from('comentario')
          .select(`
            *,
            perfil!comentario_id_perfil_fkey (
              usuario,
              avatar
            )
          `)
          .eq('id_publicacion', slug)
          .order('fecha_publicacion', { ascending: true });

        if (commentsError) throw commentsError;
        setComments(commentsData || []);
      } catch (err) {
        console.error('Error:', err);
        setError('Error al cargar la publicación');
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndComments();
  }, [slug]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    setCommenting(true);
    try {
      const { data, error } = await supabase
        .from('comentario')
        .insert([
          {
            contenido: newComment,
            id_perfil: user.id,
            id_publicacion: post.id_publicacion,
            fecha_publicacion: new Date().toISOString()
          }
        ])
        .select(`
          *,
          perfil!comentario_id_perfil_fkey (
            usuario,
            avatar
          )
        `)
        .single();

      if (error) throw error;

      // Actualizar la fecha de última publicación del post
      await supabase
        .from('publicacion')
        .update({ ultima_publicacion: new Date().toISOString() })
        .eq('id_publicacion', post.id_publicacion);

      setComments([...comments, data]);
      setNewComment("");
    } catch (err) {
      console.error('Error:', err);
      setError('Error al publicar el comentario');
    } finally {
      setCommenting(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeletePost = async () => {
    try {
      // Primero eliminamos todos los comentarios asociados
      const { error: commentsError } = await supabase
        .from('comentario')
        .delete()
        .eq('id_publicacion', post.id_publicacion);

      if (commentsError) throw commentsError;

      // Luego eliminamos la publicación
      const { error: postError } = await supabase
        .from('publicacion')
        .delete()
        .eq('id_publicacion', post.id_publicacion);

      if (postError) throw postError;

      toast.success('Post eliminado correctamente');
      router.push('/foro');
    } catch (error) {
      console.error('Error al eliminar el post:', error);
      toast.error('Error al eliminar el post');
    }
    setShowDeletePostModal(false);
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      const { error } = await supabase
        .from('comentario')
        .delete()
        .eq('id_comentario', commentToDelete.id_comentario);

      if (error) throw error;

      setComments(comments.filter(c => c.id_comentario !== commentToDelete.id_comentario));
      toast.success('Comentario eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar el comentario:', error);
      toast.error('Error al eliminar el comentario');
    }
    setShowDeleteCommentModal(false);
    setCommentToDelete(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-850 p-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-white">Cargando publicación...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-850 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error || 'Publicación no encontrada'}</span>
          </div>
          <div className="mt-4">
            <button
              onClick={() => router.push('/foro')}
              className="text-blue-400 hover:text-blue-500"
            >
              ← Volver al foro
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-850 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/foro')}
            className="text-blue-400 hover:text-blue-500"
          >
            ← Volver al foro
          </button>
        </div>

        {/* Publicación */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-start space-x-4">
            {post.perfil.avatar && (
              <img
                src={post.perfil.avatar}
                alt="Avatar"
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div className="flex-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">{post.titulo}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <Link href={`/perfil/${post.perfil.usuario}`} className="hover:text-blue-400">
                      {post.perfil.usuario}
                    </Link>
                    <span>•</span>
                    <span>{formatDate(post.fecha_publicacion)}</span>
                  </div>
                </div>
                {(user?.role?.toLowerCase() === 'admin' || user?.id === post.id_perfil) && (
                  <button
                    onClick={() => setShowDeletePostModal(true)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                  >
                    Eliminar Post
                  </button>
                )}
              </div>
              <div className="text-gray-300 whitespace-pre-wrap">{post.contenido}</div>
            </div>
          </div>
        </div>

        {/* Comentarios */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">
            Comentarios ({comments.length})
          </h2>

          {/* Formulario de comentario o mensaje de inicio de sesión */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="bg-gray-800 rounded-lg p-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                required
                rows={3}
                className="w-full bg-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={commenting}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 transition-colors disabled:opacity-50"
                >
                  {commenting ? "Publicando..." : "Publicar Comentario"}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-gray-300">
                Necesitas{" "}
                <Link href="/login" className="text-blue-400 hover:text-blue-300">
                  iniciar sesión
                </Link>{" "}
                para comentar.
              </p>
            </div>
          )}

          {/* Lista de comentarios */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id_comentario} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  {comment.perfil.avatar && (
                    <img
                      src={comment.perfil.avatar}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                      <Link href={`/perfil/${comment.perfil.usuario}`} className="hover:text-blue-400">
                        {comment.perfil.usuario}
                      </Link>
                      <span>•</span>
                      <span>{formatDate(comment.fecha_publicacion)}</span>
                    </div>
                    <div className="text-gray-300 whitespace-pre-wrap">
                      {comment.contenido}
                    </div>
                    {(user?.role?.toLowerCase() === 'admin' || user?.id === comment.id_perfil) && (
                      <button
                        onClick={() => {
                          setCommentToDelete(comment);
                          setShowDeleteCommentModal(true);
                        }}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors ml-4"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de confirmación para eliminar post */}
      {showDeletePostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Confirmar eliminación</h3>
            <p className="text-gray-300 mb-6">¿Estás seguro de que deseas eliminar este post? Esta acción eliminará también todos los comentarios asociados y no se puede deshacer.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeletePostModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeletePost}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar comentario */}
      {showDeleteCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Confirmar eliminación</h3>
            <p className="text-gray-300 mb-6">¿Estás seguro de que deseas eliminar este comentario? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteCommentModal(false);
                  setCommentToDelete(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteComment}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 