'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function AdminPanel() {
  const router = useRouter();
  const { user, perfil, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    usuario: '',
    email: '',
    rol: '',
    descripcion: '',
    avatar: ''
  });
  const [accessDenied, setAccessDenied] = useState(false);
  const [activeSection, setActiveSection] = useState('users'); // 'users' or 'forum'
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banForm, setBanForm] = useState({
    duration: 1, // días
    reason: ''
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  useEffect(() => {
    console.log('AdminPanel - Auth state:', { user, perfil, authLoading });
    
    if (authLoading) {
      console.log('Auth is still loading...');
      return;
    }

    if (!user) {
      console.log('No user found, denying access');
      setAccessDenied(true);
      setError('Debes iniciar sesión para acceder al panel de administración');
      setLoading(false);
      return;
    }

    if (!perfil) {
      console.log('No profile found for user:', user.id);
      setAccessDenied(true);
      setError('Error al cargar el perfil de usuario');
      setLoading(false);
      return;
    }

    console.log('Checking admin role:', perfil.rol);
    if (perfil.rol !== 'admin') {
      console.log('User is not admin, denying access');
      setAccessDenied(true);
      setError('No tienes permisos de administrador para acceder a esta página');
      setLoading(false);
      return;
    }

    console.log('Access granted, loading data');
    fetchUsers();
    fetchPosts();
  }, [user, perfil, authLoading]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('perfil')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Error al cargar los usuarios');
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('publicacion')
        .select('*, perfil(usuario)')
        .order('fecha_publicacion', { ascending: false });

      if (error) throw error;
      setPosts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Error al cargar los posts');
      setLoading(false);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const { data, error } = await supabase
        .from('comentario')
        .select('*, perfil(usuario)')
        .eq('id_publicacion', postId)
        .order('fecha_publicacion', { ascending: false });

      if (error) throw error;
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Error al cargar los comentarios');
    }
  };

  const handlePostSelect = (post) => {
    setSelectedPost(post);
    fetchComments(post.id_publicacion);
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este post y todos sus comentarios?')) {
      return;
    }

    try {
      // Primero eliminar los comentarios
      const { error: commentsError } = await supabase
        .from('comentario')
        .delete()
        .eq('id_publicacion', postId);

      if (commentsError) throw commentsError;

      // Luego eliminar el post
      const { error: postError } = await supabase
        .from('publicacion')
        .delete()
        .eq('id_publicacion', postId);

      if (postError) throw postError;
      
      setPosts(posts.filter(post => post.id_publicacion !== postId));
      if (selectedPost && selectedPost.id_publicacion === postId) {
        setSelectedPost(null);
        setComments([]);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Error al eliminar el post');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('comentario')
        .delete()
        .eq('id_comentario', commentId);

      if (error) throw error;
      
      setComments(comments.filter(comment => comment.id_comentario !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('Error al eliminar el comentario');
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      usuario: user.usuario || '',
      email: user.email || '',
      rol: user.rol || 'usuario',
      descripcion: user.descripcion || '',
      avatar: user.avatar || ''
    });
    setIsEditing(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('perfil')
        .update({
          usuario: editForm.usuario,
          email: editForm.email,
          rol: editForm.rol,
          descripcion: editForm.descripcion,
          avatar: editForm.avatar
        })
        .eq('id_perfil', selectedUser.id_perfil);

      if (error) throw error;
      
      setUsers(users.map(user => 
        user.id_perfil === selectedUser.id_perfil 
          ? { ...user, ...editForm }
          : user
      ));
      setIsEditing(false);
      setError(null);
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Error al actualizar el usuario: ' + error.message);
    }
  };

  const handleDeleteAvatar = () => {
    setEditForm({ ...editForm, avatar: null });
  };

  const openBanModal = (user) => {
    setSelectedUser(user);
    setBanForm({
      duration: 1,
      reason: ''
    });
    setBanModalOpen(true);
  };

  const handleBan = async () => {
    if (!selectedUser) return;
    
    try {
      // Calcular la fecha de expiración del ban
      const banExpirationDate = new Date();
      banExpirationDate.setDate(banExpirationDate.getDate() + banForm.duration);
      
      // Guardar la información del ban en la base de datos
      const { error } = await supabase
        .from('perfil')
        .update({
          ban_expiration: banExpirationDate.toISOString(),
          ban_reason: banForm.reason
        })
        .eq('id_perfil', selectedUser.id_perfil);

      if (error) throw error;
      
      // Actualizar la lista de usuarios
      setUsers(users.map(user => 
        user.id_perfil === selectedUser.id_perfil 
          ? { 
              ...user, 
              ban_expiration: banExpirationDate.toISOString(),
              ban_reason: banForm.reason
            }
          : user
      ));
      
      setBanModalOpen(false);
      setError(null);
    } catch (error) {
      console.error('Error banning user:', error);
      setError('Error al banear al usuario: ' + error.message);
    }
  };

  const handleUnban = async (userId) => {
    try {
      const { error } = await supabase
        .from('perfil')
        .update({
          ban_expiration: null,
          ban_reason: null
        })
        .eq('id_perfil', userId);

      if (error) throw error;
      
      setUsers(users.map(user => 
        user.id_perfil === userId 
          ? { 
              ...user, 
              ban_expiration: null,
              ban_reason: null
            }
          : user
      ));
      
      setError(null);
    } catch (error) {
      console.error('Error unbanning user:', error);
      setError('Error al desbanear al usuario: ' + error.message);
    }
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setDeleteReason('');
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    
    try {
      // Primero, registrar la razón de eliminación si se proporcionó
      if (deleteReason) {
        const { error: logError } = await supabase
          .from('perfil')
          .update({
            delete_reason: deleteReason,
            deleted_at: new Date().toISOString()
          })
          .eq('id_perfil', selectedUser.id_perfil);
          
        if (logError) throw logError;
      }
      
      // Luego, eliminar el usuario
      const { error } = await supabase
        .from('perfil')
        .delete()
        .eq('id_perfil', selectedUser.id_perfil);

      if (error) throw error;
      
      setUsers(users.filter(user => user.id_perfil !== selectedUser.id_perfil));
      setDeleteModalOpen(false);
      setError(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Error al eliminar al usuario: ' + error.message);
    }
  };

  const isUserBanned = (user) => {
    if (!user.ban_expiration) return false;
    
    const expirationDate = new Date(user.ban_expiration);
    return expirationDate > new Date();
  };

  const getBanTimeRemaining = (user) => {
    if (!user.ban_expiration) return null;
    
    const expirationDate = new Date(user.ban_expiration);
    const now = new Date();
    
    if (expirationDate <= now) return null;
    
    const diffTime = expirationDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-850 p-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-white">Verificando acceso...</p>
          <pre className="text-gray-400 text-sm mt-4">
            {JSON.stringify({ user, perfil, authLoading, loading }, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gray-850 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Acceso Denegado</h2>
            <p className="mb-4">{error}</p>
            <pre className="text-gray-600 text-sm mt-4">
              {JSON.stringify({ user, perfil, error }, null, 2)}
            </pre>
            {!user ? (
              <div>
                <p className="mb-2">Para acceder al panel de administración:</p>
                <Link 
                  href="/login" 
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Iniciar sesión
                </Link>
              </div>
            ) : (
              <Link 
                href="/" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Volver al inicio
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-850 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 p-4">
        <h2 className="text-xl font-bold text-white mb-6">Panel de Administración</h2>
        <nav>
          <ul className="space-y-2">
            <li>
              <button 
                onClick={() => setActiveSection('users')}
                className={`w-full text-left px-4 py-2 rounded ${activeSection === 'users' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
              >
                Lista de Usuarios
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveSection('forum')}
                className={`w-full text-left px-4 py-2 rounded ${activeSection === 'forum' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
              >
                Gestión del Foro
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {activeSection === 'users' && (
          <>
            <h1 className="text-2xl font-bold text-white mb-6">Gestión de Usuarios</h1>
            
            {isEditing ? (
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
                <h2 className="text-xl font-bold text-white mb-4">Editar Usuario</h2>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">
                      Usuario
                    </label>
                    <input
                      type="text"
                      value={editForm.usuario}
                      onChange={(e) => setEditForm({ ...editForm, usuario: e.target.value })}
                      className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">
                      Rol
                    </label>
                    <select
                      value={editForm.rol}
                      onChange={(e) => setEditForm({ ...editForm, rol: e.target.value })}
                      className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                    >
                      <option value="usuario">Usuario</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">
                      Descripción
                    </label>
                    <textarea
                      value={editForm.descripcion}
                      onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
                      className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">
                      URL del Avatar
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={editForm.avatar || ''}
                        onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                      />
                      <button
                        type="button"
                        onClick={handleDeleteAvatar}
                        className="ml-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500"
                      >
                        Eliminar
                      </button>
                    </div>
                    {editForm.avatar && (
                      <div className="mt-2">
                        <img 
                          src={editForm.avatar} 
                          alt="Avatar preview" 
                          className="h-16 w-16 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/64?text=Error';
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {users.map((user) => (
                      <tr key={user.id_perfil}>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          <div className="flex items-center">
                            {user.avatar ? (
                              <img 
                                src={user.avatar} 
                                alt={user.usuario} 
                                className="h-8 w-8 rounded-full mr-2"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/32?text=Error';
                                }}
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-600 mr-2 flex items-center justify-center">
                                <span className="text-xs text-white">{user.usuario.charAt(0).toUpperCase()}</span>
                              </div>
                            )}
                            {user.usuario}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300 capitalize">
                          {user.rol}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            Editar
                          </button>
                          {isUserBanned(user) ? (
                            <button
                              onClick={() => handleUnban(user.id_perfil)}
                              className="text-green-400 hover:text-green-300"
                            >
                              Desbanear
                            </button>
                          ) : (
                            <button
                              onClick={() => openBanModal(user)}
                              className="text-yellow-400 hover:text-yellow-300"
                            >
                              Banear
                            </button>
                          )}
                          <button
                            onClick={() => openDeleteModal(user)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeSection === 'forum' && (
          <div>
            <h1 className="text-2xl font-bold text-white mb-6">Gestión del Foro</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Lista de Posts */}
              <div className="md:col-span-1 bg-gray-800 rounded-lg shadow-lg p-4">
                <h2 className="text-xl font-bold text-white mb-4">Posts</h2>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {posts.map(post => (
                    <div 
                      key={post.id_publicacion}
                      className={`p-3 rounded cursor-pointer ${selectedPost?.id_publicacion === post.id_publicacion ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                      onClick={() => handlePostSelect(post)}
                    >
                      <h3 className="font-medium text-white">{post.titulo}</h3>
                      <p className="text-sm text-gray-300">Por: {post.perfil?.usuario || 'Usuario desconocido'}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(post.fecha_publicacion).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Detalles del Post y Comentarios */}
              <div className="md:col-span-2">
                {selectedPost ? (
                  <div className="bg-gray-800 rounded-lg shadow-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-bold text-white">{selectedPost.titulo}</h2>
                      <button
                        onClick={() => handleDeletePost(selectedPost.id_publicacion)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500"
                      >
                        Eliminar Post
                      </button>
                    </div>
                    
                    <div className="mb-6 p-4 bg-gray-700 rounded">
                      <p className="text-white">{selectedPost.contenido}</p>
                      <div className="mt-2 text-sm text-gray-300">
                        <p>Por: {selectedPost.perfil?.usuario || 'Usuario desconocido'}</p>
                        <p>{new Date(selectedPost.fecha_publicacion).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-4">Comentarios</h3>
                    <div className="space-y-4">
                      {comments.length > 0 ? (
                        comments.map(comment => (
                          <div key={comment.id_comentario} className="p-4 bg-gray-700 rounded">
                            <div className="flex justify-between">
                              <p className="text-white">{comment.contenido}</p>
                              <button
                                onClick={() => handleDeleteComment(comment.id_comentario)}
                                className="text-red-400 hover:text-red-300"
                              >
                                Eliminar
                              </button>
                            </div>
                            <div className="mt-2 text-sm text-gray-300">
                              <p>Por: {comment.perfil?.usuario || 'Usuario desconocido'}</p>
                              <p>{new Date(comment.fecha_publicacion).toLocaleString()}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400">No hay comentarios en este post.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-800 rounded-lg shadow-lg p-4 flex items-center justify-center h-full">
                    <p className="text-gray-400">Selecciona un post para ver sus detalles y comentarios.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Ban */}
      {banModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">Banear Usuario</h2>
            <p className="text-gray-300 mb-4">
              Estás a punto de banear a <span className="font-bold">{selectedUser?.usuario}</span>.
              Selecciona la duración y proporciona una razón.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Duración (días)
                </label>
                <input
                  type="number"
                  min="1"
                  value={banForm.duration}
                  onChange={(e) => setBanForm({ ...banForm, duration: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Razón
                </label>
                <textarea
                  value={banForm.reason}
                  onChange={(e) => setBanForm({ ...banForm, reason: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  rows="3"
                  placeholder="Razón del ban..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setBanModalOpen(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleBan}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500"
                >
                  Banear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Eliminación */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">Eliminar Usuario</h2>
            <p className="text-gray-300 mb-4">
              Estás a punto de eliminar a <span className="font-bold">{selectedUser?.usuario}</span>.
              Esta acción no se puede deshacer.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Razón (opcional)
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  rows="3"
                  placeholder="Razón de la eliminación..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 