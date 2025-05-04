"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "../../../supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../context/LanguageContext";
import { toast } from "react-hot-toast";

// Función simple para timeout
const createTimeout = (ms) => new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Timeout')), ms)
);

export default function PostDetailClient({ slug }) {
  const router = useRouter();
  const { t, currentLanguage } = useLanguage();
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
  const commentTextareaRef = useRef(null);

  // Cargar el post y comentarios
  const loadPostAndComments = async () => {
    if (!slug) {
      setError('ID de publicación no válido');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Intentar cargar el post con un timeout de 10 segundos
      const postPromise = supabase
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
        
      const postResult = await Promise.race([
        postPromise,
        createTimeout(10000)
      ]);
      
      if (postResult.error) throw new Error('Error al cargar la publicación');
      setPost(postResult.data);
      
      // Cargar comentarios después de cargar el post
      const commentsPromise = supabase
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
        
      const commentsResult = await Promise.race([
        commentsPromise,
        createTimeout(10000)
      ]);
      
      if (commentsResult.error) throw new Error('Error al cargar los comentarios');
      setComments(commentsResult.data || []);
      
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError(err.message === 'Timeout' 
        ? 'La carga está tardando demasiado. Por favor, inténtalo de nuevo.' 
        : 'Error al cargar la publicación o comentarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPostAndComments();
  }, [slug]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    if (!newComment.trim()) {
      toast.error(t.commentCannotBeEmpty || 'El comentario no puede estar vacío');
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
      toast.success(t.commentPublished || 'Comentario publicado correctamente');
    } catch (err) {
      console.error('Error:', err);
      toast.error(t.errorPublishingComment || 'Error al publicar el comentario');
    } finally {
      setCommenting(false);
    }
  };

  const formatDate = (date) => {
    const locale = currentLanguage === 'en' ? 'en-US' : 
                  currentLanguage === 'ca' ? 'ca-ES' : 'es-ES';
                  
    return new Date(date).toLocaleDateString(locale, {
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

      toast.success(t.postDeleted || 'Post eliminado correctamente');
      router.push('/foro');
    } catch (error) {
      console.error('Error al eliminar el post:', error);
      toast.error(t.errorDeletingPost || 'Error al eliminar el post');
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
      toast.success(t.commentDeleted || 'Comentario eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar el comentario:', error);
      toast.error(t.errorDeletingComment || 'Error al eliminar el comentario');
    }
    setShowDeleteCommentModal(false);
    setCommentToDelete(null);
  };

  // Format content text with paragraphs
  const formatContentText = (text) => {
    if (!text) return null;
    
    return text.split('\n\n').map((paragraph, i) => (
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
        <h2 className="text-xl font-medium text-white mb-4">{t.loading || "Cargando publicación..."}</h2>
        <p className="text-gray-400 mb-8 text-center max-w-md">{t.loadingMessage || "Estamos cargando los detalles de la publicación."}</p>
      </div>
    );
  }

  if (error || !post) {
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
            <p className="mt-2 text-base text-red-200">{error || t.postNotFound || 'Publicación no encontrada'}</p>
            <div className="flex space-x-4 mt-6">
              <button 
                onClick={loadPostAndComments} 
                className="bg-red-800 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                {t.tryAgain || "Intentar nuevamente"}
              </button>
              <button 
                onClick={() => router.push('/foro')} 
                className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                {t.backToForum || "Volver al foro"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Navigation breadcrumbs */}
      <div className="mb-6 flex items-center text-sm text-gray-400">
        <Link href="/foro" className="hover:text-blue-400 transition-colors">
          {t?.forum || "Foro"}
        </Link>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-white">{post.titulo}</span>
      </div>
      
      {/* Post card */}
      <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Post header */}
          <div className="flex flex-col md:flex-row md:items-start gap-4 mb-6">
            {/* Author avatar */}
            <div className="flex-shrink-0">
              <Link href={`/perfil/${post.perfil.usuario}`}>
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center border-2 border-gray-600">
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
            
            {/* Post info */}
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
              
              <h1 className="text-2xl font-bold text-white mb-2">
                {post.titulo}
              </h1>
            </div>
            
            {/* Actions dropdown */}
            {user && (user.id === post.id_perfil || user.user_metadata?.isAdmin) && (
              <div className="relative">
                <button
                  onClick={() => setShowDeletePostModal(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {t.delete || "Eliminar"}
                </button>
              </div>
            )}
          </div>
          
          {/* Post content */}
          <div className="prose prose-invert max-w-none pb-4 border-b border-gray-700 mb-4">
            {formatContentText(post.contenido)}
          </div>

          {/* Comment section */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">{t.comments || "Comentarios"} ({comments.length})</h2>
            
            {/* New comment form */}
            {user ? (
              <form onSubmit={handleSubmitComment} className="mb-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center border-2 border-gray-600">
                      {user.user_metadata?.avatar ? (
                        <img 
                          src={user.user_metadata.avatar} 
                          alt={user.user_metadata.username || user.email}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-gray-400">
                          {(user.user_metadata?.username || user.email).charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <textarea
                      ref={commentTextareaRef}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={t.writeComment || "Escribe un comentario..."}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      rows={3}
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        type="submit"
                        disabled={commenting || !newComment.trim()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {commenting ? (
                          <>
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>{t.publishing || 'Publicando...'}</span>
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {t.comment || "Comentar"}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="bg-gray-750 rounded-lg p-4 mb-8 text-center">
                <p className="text-gray-300 mb-4">{t.loginToComment || "Inicia sesión para comentar en esta publicación"}</p>
                <button
                  onClick={() => router.push('/login')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors"
                >
                  {t.login || "Iniciar sesión"}
                </button>
              </div>
            )}
            
            {/* Comments list */}
            {comments.length === 0 ? (
              <div className="bg-gray-750 rounded-lg p-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-gray-400">{t.noComments || "No hay comentarios todavía. ¡Sé el primero en comentar!"}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id_comentario} className="bg-gray-750 rounded-lg p-4 hover:bg-gray-700 transition-colors">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <Link href={`/perfil/${comment.perfil.usuario}`}>
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center border-2 border-gray-600">
                            {comment.perfil.avatar ? (
                              <img 
                                src={comment.perfil.avatar} 
                                alt={comment.perfil.usuario}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-lg font-bold text-gray-400">
                                {comment.perfil.usuario.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        </Link>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <Link href={`/perfil/${comment.perfil.usuario}`} className="text-sm font-medium text-blue-400 hover:text-blue-300">
                              {comment.perfil.usuario}
                            </Link>
                            <span className="text-xs text-gray-500 ml-2">{formatDate(comment.fecha_publicacion)}</span>
                          </div>
                          
                          {/* Comment actions */}
                          {user && (user.id === comment.id_perfil || user.user_metadata?.isAdmin) && (
                            <button
                              onClick={() => {
                                setCommentToDelete(comment);
                                setShowDeleteCommentModal(true);
                              }}
                              className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              {t.delete || "Eliminar"}
                            </button>
                          )}
                        </div>
                        <div className="text-gray-300">
                          {formatContentText(comment.contenido)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Delete post modal */}
      {showDeletePostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">{t.confirmDeletePost || "¿Confirmar eliminación de publicación?"}</h3>
            <p className="text-gray-300 mb-6">{t.deletePostWarning || "Esta acción eliminará permanentemente la publicación y todos sus comentarios. No se puede deshacer."}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeletePostModal(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                {t.cancel || "Cancelar"}
              </button>
              <button
                onClick={handleDeletePost}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {t.delete || "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete comment modal */}
      {showDeleteCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">{t.confirmDeleteComment || "¿Confirmar eliminación de comentario?"}</h3>
            <p className="text-gray-300 mb-6">{t.deleteCommentWarning || "Esta acción eliminará permanentemente el comentario. No se puede deshacer."}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteCommentModal(false);
                  setCommentToDelete(null);
                }}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                {t.cancel || "Cancelar"}
              </button>
              <button
                onClick={handleDeleteComment}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {t.delete || "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 