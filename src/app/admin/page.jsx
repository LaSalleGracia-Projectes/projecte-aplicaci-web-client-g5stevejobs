'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

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
  const [activeSection, setActiveSection] = useState('users'); // 'users', 'forum', 'reports', 'tickets'
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banForm, setBanForm] = useState({
    duration: 1,
    reason: ''
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [reports, setReports] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

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
    fetchReports();
    fetchTickets();
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
    
    // Evitar eliminar la propia cuenta
    if (selectedUser.id_perfil === user.id) {
      setError('No puedes eliminar tu propia cuenta de administrador');
      setDeleteModalOpen(false);
      return;
    }

    try {
      // Primero eliminar el usuario de auth usando la API REST de Supabase
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/delete_user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          user_id: selectedUser.id_perfil
        })
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el usuario de auth');
      }

      // Luego eliminar el perfil
      const { error: profileError } = await supabase
        .from('perfil')
        .delete()
        .eq('id_perfil', selectedUser.id_perfil);

      if (profileError) throw profileError;
      
      setUsers(users.filter(user => user.id_perfil !== selectedUser.id_perfil));
      setDeleteModalOpen(false);
      setError(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('No se pudo eliminar el usuario. Por favor, inténtalo de nuevo más tarde.');
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

  const fetchReports = async () => {
    try {
      const reportsRef = collection(db, "reports");
      const snapshot = await getDocs(reportsRef);
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(reportsData);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Error al cargar los reportes');
    }
  };

  const fetchTickets = async () => {
    try {
      const ticketsRef = collection(db, "tickets_contacto");
      const snapshot = await getDocs(ticketsRef);
      const ticketsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTickets(ticketsData);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setError('Error al cargar los tickets');
    }
  };

  const handleUpdateReportStatus = async (reportId, newStatus) => {
    try {
      const reportRef = doc(db, "reports", reportId);
      await updateDoc(reportRef, {
        status: newStatus
      });
      setReports(reports.map(report => 
        report.id === reportId 
          ? { ...report, status: newStatus }
          : report
      ));
    } catch (error) {
      console.error('Error updating report status:', error);
      setError('Error al actualizar el estado del reporte');
    }
  };

  const handleUpdateTicketStatus = async (ticketId, newStatus) => {
    try {
      const ticketRef = doc(db, "tickets_contacto", ticketId);
      await updateDoc(ticketRef, {
        estado: newStatus
      });
      setTickets(tickets.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, estado: newStatus }
          : ticket
      ));
    } catch (error) {
      console.error('Error updating ticket status:', error);
      setError('Error al actualizar el estado del ticket');
    }
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
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {accessDenied ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Acceso Denegado</h1>
          <p className="text-gray-300">{error}</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveSection('users')}
                className={`px-4 py-2 rounded ${
                  activeSection === 'users' ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              >
                Usuarios
              </button>
              <button
                onClick={() => setActiveSection('forum')}
                className={`px-4 py-2 rounded ${
                  activeSection === 'forum' ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              >
                Foro
              </button>
              <button
                onClick={() => setActiveSection('reports')}
                className={`px-4 py-2 rounded ${
                  activeSection === 'reports' ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              >
                Reportes
              </button>
              <button
                onClick={() => setActiveSection('tickets')}
                className={`px-4 py-2 rounded ${
                  activeSection === 'tickets' ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              >
                Tickets
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            </div>
          ) : (
            <>
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

              {activeSection === 'reports' && (
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-4">Reportes de Usuarios</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-700">
                          <th className="px-6 py-3 text-left">Usuario Reportado</th>
                          <th className="px-6 py-3 text-left">Razón</th>
                          <th className="px-6 py-3 text-left">Estado</th>
                          <th className="px-6 py-3 text-left">Fecha</th>
                          <th className="px-6 py-3 text-left">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.map((report) => (
                          <tr key={report.id} className="border-b border-gray-700">
                            <td className="px-6 py-4">{report.reported_user}</td>
                            <td className="px-6 py-4">{report.reason}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded ${
                                report.status === 'pendiente' ? 'bg-yellow-500' :
                                report.status === 'resuelto' ? 'bg-green-500' :
                                'bg-red-500'
                              }`}>
                                {report.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {new Date(report.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => setSelectedReport(report)}
                                className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                              >
                                Ver Detalles
                              </button>
                              <select
                                value={report.status}
                                onChange={(e) => handleUpdateReportStatus(report.id, e.target.value)}
                                className="bg-gray-700 text-white px-3 py-1 rounded"
                              >
                                <option value="pendiente">Pendiente</option>
                                <option value="en_revision">En Revisión</option>
                                <option value="resuelto">Resuelto</option>
                                <option value="rechazado">Rechazado</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeSection === 'tickets' && (
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-4">Tickets de Contacto</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-700">
                          <th className="px-6 py-3 text-left">Email</th>
                          <th className="px-6 py-3 text-left">Tema</th>
                          <th className="px-6 py-3 text-left">Estado</th>
                          <th className="px-6 py-3 text-left">Fecha</th>
                          <th className="px-6 py-3 text-left">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tickets.map((ticket) => (
                          <tr key={ticket.id} className="border-b border-gray-700">
                            <td className="px-6 py-4">{ticket.email}</td>
                            <td className="px-6 py-4">{ticket.tema}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded ${
                                ticket.estado === 'pendiente' ? 'bg-yellow-500' :
                                ticket.estado === 'resuelto' ? 'bg-green-500' :
                                'bg-red-500'
                              }`}>
                                {ticket.estado}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {new Date(ticket.fecha_creacion.seconds * 1000).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => setSelectedTicket(ticket)}
                                className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                              >
                                Ver Detalles
                              </button>
                              <select
                                value={ticket.estado}
                                onChange={(e) => handleUpdateTicketStatus(ticket.id, e.target.value)}
                                className="bg-gray-700 text-white px-3 py-1 rounded"
                              >
                                <option value="pendiente">Pendiente</option>
                                <option value="en_proceso">En Proceso</option>
                                <option value="resuelto">Resuelto</option>
                                <option value="cerrado">Cerrado</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Modal para ver detalles del reporte */}
          {selectedReport && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
                <h3 className="text-xl font-bold mb-4">Detalles del Reporte</h3>
                <div className="space-y-4">
                  <p><strong>Usuario Reportado:</strong> {selectedReport.reported_user}</p>
                  <p><strong>Razón:</strong> {selectedReport.reason}</p>
                  <p><strong>Descripción:</strong> {selectedReport.description}</p>
                  <p><strong>Reportado por:</strong> {selectedReport.reporter_username}</p>
                  <p><strong>Fecha:</strong> {new Date(selectedReport.created_at).toLocaleString()}</p>
                  {selectedReport.image_data && (
                    <div>
                      <p className="font-bold mb-2">Evidencia:</p>
                      <img 
                        src={selectedReport.image_data} 
                        alt="Evidencia del reporte" 
                        className="max-w-full h-auto rounded"
                      />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="mt-4 bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}

          {/* Modal para ver detalles del ticket */}
          {selectedTicket && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
                <h3 className="text-xl font-bold mb-4">Detalles del Ticket</h3>
                <div className="space-y-4">
                  <p><strong>Email:</strong> {selectedTicket.email}</p>
                  <p><strong>Tema:</strong> {selectedTicket.tema}</p>
                  <p><strong>Descripción:</strong> {selectedTicket.descripcion}</p>
                  <p><strong>Usuario:</strong> {selectedTicket.usuario || 'No registrado'}</p>
                  <p><strong>Fecha:</strong> {new Date(selectedTicket.fecha_creacion.seconds * 1000).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="mt-4 bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 