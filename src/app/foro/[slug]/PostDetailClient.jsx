"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-hot-toast";
import { useLanguage } from "../../../context/LanguageContext";

// Función para crear un timeout
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

export default function PostDetailClient({ slug }) {
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { t } = useLanguage();
  const [showDeletePostModal, setShowDeletePostModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Función de delay para esperar entre reintentos
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Memoizamos fetchPostAndComments con useCallback para evitar recreaciones
  const fetchPostAndComments = useCallback(async (retry = 0, manual = false) => {
    if (!slug) {
      setError('ID de publicación no válido');
      setLoading(false);
      return;
    }

    try {
      if (retry === 0 || manual) {
        setLoading(true);
      }
      setError(null);
      
      if (retry > 0) {
        setIsRetrying(true);
        setRetryCount(retry);
      }
      
      console.log(`Intentando cargar post y comentarios (intento ${retry + 1} de ${MAX_RETRIES + 1})`);
      
      // Obtener la publicación con información del autor con timeout
      const postResult = await Promise.race([
        supabase
          .from('publicacion')
          .select(`
            *,
            perfil!publicacion_id_perfil_fkey (
              usuario,
              avatar
            )
          `)
          .eq('id_publicacion', slug)
          .single(),
        createTimeout(TIMEOUT_MS)
      ]);

      if (postResult.error) throw postResult.error;
      setPost(postResult.data);

      // Obtener los comentarios con información de los autores con timeout
      const commentsResult = await Promise.race([
        supabase
          .from('comentario')
          .select(`
            *,
            perfil!comentario_id_perfil_fkey (
              usuario,
              avatar
            )
          `)
          .eq('id_publicacion', slug)
          .order('fecha_publicacion', { ascending: true }),
        createTimeout(TIMEOUT_MS)
      ]);

      if (commentsResult.error) throw commentsResult.error;
      setComments(commentsResult.data || []);
      
      // Restablecemos los estados de reintento
      setIsRetrying(false);
      setRetryCount(0);
      
    } catch (err) {
      console.error(`Error fetching post details (intento ${retry + 1}):`, err);
      
      // Si aún podemos reintentar y no fue un reintento manual
      if (retry < MAX_RETRIES && !manual) {
        console.log(`Reintentando en ${RETRY_DELAY/1000} segundos...`);
        // Esperamos antes de reintentar
        await delay(RETRY_DELAY);
        // Reintentamos con un contador incrementado
        return fetchPostAndComments(retry + 1);
      }
      
      // Si llegamos al máximo de reintentos o fue un reintento manual, mostramos el error
      setIsRetrying(false);
      setError(
        err.message.includes('Timeout')
          ? `La carga de la publicación está tardando demasiado. Se han realizado ${retry + 1} intentos. Por favor, inténtalo de nuevo más tarde.`
          : `Error al cargar la publicación (${retry + 1}/${MAX_RETRIES + 1} intentos)`
      );
    } finally {
      if (retry === 0 || manual || retry >= MAX_RETRIES) {
        setLoading(false);
      }
    }
  }, [slug]);

  useEffect(() => {
    const controller = new AbortController();
    
    fetchPostAndComments(0);
    
    // Cleanup function para gestionar el caso de unmount durante la carga
    return () => {
      controller.abort();
      console.log("Componente PostDetailClient desmontado");
    };
  }, [fetchPostAndComments]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    if (!newComment.trim()) {
      toast.error(t?.emptyCommentError || 'El comentario no puede estar vacío');
      return;
    }

    setCommenting(true);
    try {
      // Usamos Promise.race para establecer un timeout
      const result = await Promise.race([
        supabase
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
          .single(),
        createTimeout(TIMEOUT_MS)
      ]);

      if (result.error) throw result.error;

      // Actualizar la fecha de última publicación del post
      await supabase
        .from('publicacion')
        .update({ ultima_publicacion: new Date().toISOString() })
        .eq('id_publicacion', post.id_publicacion);

      setComments([...comments, result.data]);
      setNewComment("");
      toast.success(t?.commentSuccess || 'Comentario publicado con éxito');
    } catch (err) {
      console.error('Error al publicar comentario:', err);
      toast.error(
        err.message.includes('Timeout')
          ? 'La publicación del comentario está tardando demasiado. Por favor, inténtalo de nuevo.'
          : t?.commentError || 'Error al publicar el comentario'
      );
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

      toast.success(t?.postDeleteSuccess || 'Post eliminado correctamente');
      router.push('/foro');
    } catch (error) {
      console.error('Error al eliminar el post:', error);
      toast.error(t?.postDeleteError || 'Error al eliminar el post');
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
      toast.success(t?.commentDeleteSuccess || 'Comentario eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar el comentario:', error);
      toast.error(t?.commentDeleteError || 'Error al eliminar el comentario');
    }
    setShowDeleteCommentModal(false);
    setCommentToDelete(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-850 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            {isRetrying ? (
              <div className="text-center">
                <p className="text-white mb-2">{t?.retrying || "Reintentando cargar publicación..."}</p>
                <p className="text-yellow-400 text-sm">Intento {retryCount + 1} de {MAX_RETRIES + 1}</p>
              </div>
            ) : (
              <p className="text-white">{t?.loadingPost || "Cargando publicación..."}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-850 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">{t?.error || "Error"}: </strong>
            <span className="block sm:inline">{error || t?.postNotFound || 'Publicación no encontrada'}</span>
            <button 
              onClick={() => fetchPostAndComments(0, true)} 
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
            >
              {t?.tryAgain || "Intentar nuevamente"}
            </button>
          </div>
          <div className="mt-4">
            <button
              onClick={() => router.push('/foro')}
              className="text-blue-400 hover:text-blue-500"
            >
              ← {t?.backToForum || "Volver al foro"}
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