'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminPanel() {
  const router = useRouter();
  const { user, perfil, loading: authLoading } = useAuth();
  const { t } = useLanguage();
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
      <main className="min-h-screen bg-gray-850 text-white">
        <div className="w-full h-full flex items-center justify-center py-20">
          <div className="flex flex-col items-center">
            <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
            <p className="text-lg font-medium text-gray-300">{t?.loadingAdminPanel || "Cargando panel de administración..."}</p>
          </div>
        </div>
      </main>
    );
  }

  if (accessDenied) {
    return (
      <main className="min-h-screen bg-gray-850 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-2xl p-8 md:p-10 shadow-xl border border-gray-700">
            <div className="flex items-center mb-6 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h1 className="text-2xl font-bold">Acceso Denegado</h1>
            </div>
            
            <div className="bg-red-900/20 border border-red-600 text-red-200 px-6 py-4 rounded-lg mb-6">
              <p className="mb-2 text-lg">{error}</p>
              <p className="text-sm text-red-300">
                {!user 
                  ? "Necesitas iniciar sesión con una cuenta de administrador para acceder a esta sección." 
                  : "Tu cuenta no tiene permisos suficientes para acceder al panel de administración."}
              </p>
            </div>
            
            <div className="flex justify-center mt-8">
              {!user ? (
                <Link 
                  href="/login"
                  className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-500 transition-all duration-300 shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Iniciar sesión
                </Link>
              ) : (
                <Link 
                  href="/"
                  className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-500 transition-all duration-300 shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Volver al inicio
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-850 text-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">{t?.adminPanel || "Panel de Administración"}</h1>
          <p className="text-blue-200 mt-2">{t?.adminPanelSubtitle || "Gestiona usuarios, foro, reportes y tickets de soporte"}</p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="bg-red-900/20 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        {/* Navigation Tabs */}
        <div className="bg-gray-800 rounded-lg p-1 mb-8 inline-flex">
          <button
            onClick={() => setActiveSection('users')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeSection === 'users' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center space-x-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>Usuarios</span>
            </div>
          </button>
          <button
            onClick={() => setActiveSection('forum')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeSection === 'forum' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center space-x-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <span>Foro</span>
            </div>
          </button>
          <button
            onClick={() => setActiveSection('reports')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeSection === 'reports' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center space-x-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Reportes</span>
            </div>
          </button>
          <button
            onClick={() => setActiveSection('tickets')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeSection === 'tickets' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center space-x-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Tickets</span>
            </div>
          </button>
        </div>
        
        {/* Content Sections - The content sections will be updated in subsequent edits */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-2xl p-6 shadow-xl border border-gray-700">
          {activeSection === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-blue-400">
                  {t?.userManagement || "Gestión de Usuarios"}
                </h2>
                <p className="text-sm text-gray-400">
                  {users.length} {users.length === 1 ? 'usuario' : 'usuarios'} registrados
                </p>
              </div>
              
              {isEditing ? (
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-white">
                      {t?.editUser || "Editar Usuario"}
                    </h3>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="text-gray-400 hover:text-gray-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="username">
                          {t?.username || "Nombre de usuario"}
                        </label>
                        <input
                          id="username"
                          type="text"
                          value={editForm.usuario}
                          onChange={(e) => setEditForm({ ...editForm, usuario: e.target.value })}
                          className="w-full border border-gray-600 rounded-lg p-2.5 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="email">
                          {t?.email || "Email"}
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full border border-gray-600 rounded-lg p-2.5 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="role">
                          {t?.role || "Rol"}
                        </label>
                        <select
                          id="role"
                          value={editForm.rol}
                          onChange={(e) => setEditForm({ ...editForm, rol: e.target.value })}
                          className="w-full border border-gray-600 rounded-lg p-2.5 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <option value="usuario">Usuario</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="avatar">
                          {t?.avatar || "URL del Avatar"}
                        </label>
                        <div className="flex">
                          <input
                            id="avatar"
                            type="text"
                            value={editForm.avatar || ''}
                            onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                            className="w-full border border-gray-600 rounded-lg rounded-r-none p-2.5 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                          <button
                            type="button"
                            onClick={handleDeleteAvatar}
                            className="bg-red-600 text-white px-3 rounded-r-lg hover:bg-red-500 transition-colors"
                            title="Eliminar avatar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="description">
                        {t?.description || "Descripción"}
                      </label>
                      <textarea
                        id="description"
                        value={editForm.descripcion || ''}
                        onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
                        className="w-full border border-gray-600 rounded-lg p-2.5 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        rows="3"
                      />
                    </div>
                    
                    {editForm.avatar && (
                      <div className="flex items-center space-x-3 p-3 bg-gray-750 rounded-lg">
                        <img 
                          src={editForm.avatar} 
                          alt="Vista previa" 
                          className="h-16 w-16 rounded-full object-cover border-2 border-gray-600"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/64?text=Error';
                          }}
                        />
                        <span className="text-sm text-gray-400">Vista previa del avatar</span>
                      </div>
                    )}
                    
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        {t?.cancel || "Cancelar"}
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {t?.saveChanges || "Guardar Cambios"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-700">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-750">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          {t?.user || "Usuario"}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          {t?.email || "Email"}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          {t?.role || "Rol"}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          {t?.status || "Estado"}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          {t?.actions || "Acciones"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                      {users.map((user) => (
                        <tr key={user.id_perfil} className="hover:bg-gray-750 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {user.avatar ? (
                                <img 
                                  src={user.avatar} 
                                  alt={user.usuario} 
                                  className="h-10 w-10 rounded-full mr-3 border border-gray-600"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/40?text=?';
                                  }}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full mr-3 flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700 text-white border border-blue-700">
                                  <span className="font-medium">{user.usuario?.charAt(0).toUpperCase() || '?'}</span>
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-medium text-white">{user.usuario}</div>
                                <div className="text-xs text-gray-400">
                                  {new Date(user.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.rol === 'admin' 
                                ? 'bg-purple-900 text-purple-200 border border-purple-700' 
                                : 'bg-blue-900 text-blue-200 border border-blue-700'
                            }`}>
                              {user.rol}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isUserBanned(user) ? (
                              <div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-200 border border-red-700">
                                  {t?.banned || "Baneado"}
                                </span>
                                <div className="text-xs text-gray-400 mt-1">
                                  {getBanTimeRemaining(user)} {t?.daysRemaining || "días restantes"}
                                </div>
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200 border border-green-700">
                                {t?.active || "Activo"}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(user)}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                title="Editar usuario"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              
                              {isUserBanned(user) ? (
                                <button
                                  onClick={() => handleUnban(user.id_perfil)}
                                  className="text-green-400 hover:text-green-300 transition-colors"
                                  title="Desbanear usuario"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </button>
                              ) : (
                                <button
                                  onClick={() => openBanModal(user)}
                                  className="text-yellow-500 hover:text-yellow-400 transition-colors"
                                  title="Banear usuario"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                  </svg>
                                </button>
                              )}
                              
                              <button
                                onClick={() => openDeleteModal(user)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                                title="Eliminar usuario"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {/* Ban Modal */}
          {banModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
              <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-2xl p-6 shadow-xl border border-gray-700 max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    {t?.banUser || "Banear Usuario"}
                  </h3>
                  <button 
                    onClick={() => setBanModalOpen(false)}
                    className="text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                
                <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg text-yellow-200">
                  <div className="flex items-start mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm">
                      {t?.banningUser || "Estás a punto de banear a"} <span className="font-semibold">{selectedUser?.usuario}</span>. {t?.banExplanation || "Este usuario no podrá iniciar sesión durante el período seleccionado."}
                    </p>
                  </div>
                </div>
                
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="banDuration">
                      {t?.banDuration || "Duración del ban (días)"}:
                    </label>
                    <input
                      id="banDuration"
                      type="number"
                      min="1"
                      max="365"
                      value={banForm.duration}
                      onChange={(e) => setBanForm({ ...banForm, duration: e.target.value })}
                      className="w-full border border-gray-600 rounded-lg p-2.5 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="banReason">
                      {t?.banReason || "Razón del ban"}:
                    </label>
                    <textarea
                      id="banReason"
                      value={banForm.reason}
                      onChange={(e) => setBanForm({ ...banForm, reason: e.target.value })}
                      className="w-full border border-gray-600 rounded-lg p-2.5 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      rows="3"
                      placeholder="Explica la razón del ban..."
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setBanModalOpen(false)}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      {t?.cancel || "Cancelar"}
                    </button>
                    <button
                      type="button"
                      onClick={handleBan}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-500 transition-colors flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      {t?.banUser || "Banear Usuario"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* Delete Modal */}
          {deleteModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
              <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-2xl p-6 shadow-xl border border-gray-700 max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {t?.deleteUser || "Eliminar Usuario"}
                  </h3>
                  <button 
                    onClick={() => setDeleteModalOpen(false)}
                    className="text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                
                <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-200">
                  <div className="flex items-start mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-sm">
                      {t?.deleteUserWarning || "¡Atención! Estás a punto de eliminar permanentemente la cuenta de"} <span className="font-semibold">{selectedUser?.usuario}</span>. {t?.deleteExplanation || "Esta acción no se puede deshacer y eliminará todos los datos asociados a este usuario."}
                    </p>
                  </div>
                </div>
                
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="confirmDelete">
                      {t?.confirmDelete || "Para confirmar, escribe"} <span className="font-semibold text-white">ELIMINAR</span>:
                    </label>
                    <input
                      id="confirmDelete"
                      type="text"
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      className="w-full border border-gray-600 rounded-lg p-2.5 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="ELIMINAR"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setDeleteModalOpen(false)}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      {t?.cancel || "Cancelar"}
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleteReason !== 'ELIMINAR'}
                      className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 ${
                        deleteReason === 'ELIMINAR' 
                          ? 'bg-red-600 hover:bg-red-500' 
                          : 'bg-gray-600 cursor-not-allowed'
                      } transition-colors`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {t?.deleteUserConfirm || "Eliminar Usuario"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {activeSection === 'forum' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-blue-400">
                  {t?.forumManagement || "Gestión del Foro"}
                </h2>
                <p className="text-sm text-gray-400">
                  {posts.length} {posts.length === 1 ? 'publicación' : 'publicaciones'} disponibles
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Lista de Posts */}
                <div className="md:col-span-1 bg-gray-800/50 rounded-lg border border-gray-700 p-5">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 00-2 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    {t?.posts || "Publicaciones"}
                  </h3>
                  
                  <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                    {posts.length > 0 ? (
                      posts.map(post => (
                        <div 
                          key={post.id_publicacion}
                          onClick={() => handlePostSelect(post)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-750 ${
                            selectedPost?.id_publicacion === post.id_publicacion
                              ? 'bg-blue-900/30 border border-blue-700'
                              : 'bg-gray-750/50 border border-gray-700'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-gray-200 text-sm line-clamp-1">{post.titulo}</h4>
                            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                              {new Date(post.fecha_publicacion).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mt-1 line-clamp-2">{post.contenido}</p>
                          <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                            <span className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {post.perfil?.usuario || "Anónimo"}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePost(post.id_publicacion);
                              }}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Eliminar publicación"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-6 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p>{t?.noPosts || "No hay publicaciones disponibles"}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Detalles del Post Seleccionado */}
                <div className="md:col-span-2 bg-gray-800/50 rounded-lg border border-gray-700 p-5">
                  {selectedPost ? (
                    <div>
                      <div className="mb-6">
                        <h3 className="text-lg font-medium text-white mb-2">{selectedPost.titulo}</h3>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-gray-400 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {selectedPost.perfil?.usuario || "Anónimo"}
                          </span>
                          <span className="text-sm text-gray-400">
                            {new Date(selectedPost.fecha_publicacion).toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="bg-gray-750/50 rounded-lg p-4 border border-gray-700 mb-6">
                          <p className="text-gray-300 whitespace-pre-wrap">{selectedPost.contenido}</p>
                        </div>
                        
                        <button
                          onClick={() => handleDeletePost(selectedPost.id_publicacion)}
                          className="text-red-500 hover:text-red-400 flex items-center transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          {t?.deletePost || "Eliminar Publicación"}
                        </button>
                      </div>
                      
                      <div className="border-t border-gray-700 pt-4">
                        <h4 className="text-md font-medium text-white mb-4 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                          {comments.length} {comments.length === 1 ? t?.comment || "Comentario" : t?.comments || "Comentarios"}
                        </h4>
                        
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                          {comments.length > 0 ? (
                            comments.map(comment => (
                              <div key={comment.id_comentario} className="bg-gray-750/50 rounded-lg p-3 border border-gray-700">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm text-gray-300 font-medium flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    {comment.perfil?.usuario || "Anónimo"}
                                  </span>
                                  <div className="flex items-center">
                                    <span className="text-xs text-gray-400 mr-3">
                                      {new Date(comment.fecha_publicacion).toLocaleString()}
                                    </span>
                                    <button
                                      onClick={() => handleDeleteComment(comment.id_comentario)}
                                      className="text-red-400 hover:text-red-300 transition-colors"
                                      title="Eliminar comentario"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                                <p className="text-gray-300 text-sm whitespace-pre-wrap">{comment.contenido}</p>
                              </div>
                            ))
                          ) : (
                            <div className="text-center p-4 text-gray-400">
                              <p>{t?.noComments || "No hay comentarios en esta publicación"}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-lg">{t?.selectPost || "Selecciona una publicación para ver los detalles"}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'reports' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-blue-400">
                  {t?.reportsManagement || "Gestión de Reportes"}
                </h2>
                <p className="text-sm text-gray-400">
                  {reports.length} {reports.length === 1 ? 'reporte' : 'reportes'} disponibles
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Lista de Reportes */}
                <div className="md:col-span-1 bg-gray-800/50 rounded-lg border border-gray-700 p-5">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {t?.reports || "Reportes"}
                  </h3>
                  
                  <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                    {reports.length > 0 ? (
                      reports.map(report => (
                        <div 
                          key={report.id}
                          onClick={() => setSelectedReport(report)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-750 ${
                            selectedReport?.id === report.id
                              ? 'bg-blue-900/30 border border-blue-700'
                              : 'bg-gray-750/50 border border-gray-700'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-gray-200 text-sm line-clamp-1">{report.reason}</h4>
                            <span className={`text-xs font-medium rounded-full px-2 py-0.5 ml-2 whitespace-nowrap ${
                              report.status === 'pendiente' ? 'bg-yellow-900 text-yellow-200 border border-yellow-700' :
                              report.status === 'en_proceso' ? 'bg-blue-900 text-blue-200 border border-blue-700' :
                              report.status === 'resuelto' ? 'bg-green-900 text-green-200 border border-green-700' :
                              'bg-red-900 text-red-200 border border-red-700'
                            }`}>
                              {report.status === 'pendiente' && (t?.pending || "Pendiente")}
                              {report.status === 'en_proceso' && (t?.inProgress || "En proceso")}
                              {report.status === 'resuelto' && (t?.resolved || "Resuelto")}
                              {report.status === 'rechazado' && (t?.rejected || "Rechazado")}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mt-1 line-clamp-2">{report.description}</p>
                          <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                            <span className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {report.reporter_username || t?.anonymousUser || "Usuario anónimo"}
                            </span>
                            <span className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {new Date(report.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-6 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>{t?.noReports || "No hay reportes disponibles"}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Detalles del Reporte Seleccionado */}
                <div className="md:col-span-2 bg-gray-800/50 rounded-lg border border-gray-700 p-5">
                  {selectedReport ? (
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium text-white">{selectedReport.reason}</h3>
                        <span className={`text-xs font-medium rounded-full px-3 py-1 ${
                          selectedReport.status === 'pendiente' ? 'bg-yellow-900 text-yellow-200 border border-yellow-700' :
                          selectedReport.status === 'en_proceso' ? 'bg-blue-900 text-blue-200 border border-blue-700' :
                          selectedReport.status === 'resuelto' ? 'bg-green-900 text-green-200 border border-green-700' :
                          'bg-red-900 text-red-200 border border-red-700'
                        }`}>
                          {selectedReport.status === 'pendiente' && (t?.pending || "Pendiente")}
                          {selectedReport.status === 'en_proceso' && (t?.inProgress || "En proceso")}
                          {selectedReport.status === 'resuelto' && (t?.resolved || "Resuelto")}
                          {selectedReport.status === 'rechazado' && (t?.rejected || "Rechazado")}
                        </span>
                      </div>
                      
                      <div className="space-y-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-400 mb-1">{t?.reportedBy || "Reportado por"}:</p>
                            <div className="bg-gray-750/50 rounded-lg p-3 border border-gray-700">
                              <span className="text-gray-300 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {selectedReport.reporter_username || t?.anonymousUser || "Usuario anónimo"}
                              </span>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-400 mb-1">{t?.reportedUser || "Usuario reportado"}:</p>
                            <div className="bg-gray-750/50 rounded-lg p-3 border border-gray-700">
                              <span className="text-gray-300 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {selectedReport.reported_user || t?.unknownUser || "Usuario desconocido"}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-400 mb-1">{t?.details || "Detalles"}:</p>
                          <div className="bg-gray-750/50 rounded-lg p-3 border border-gray-700">
                            <p className="text-gray-300 whitespace-pre-wrap">{selectedReport.description}</p>
                          </div>
                        </div>
                        
                        {selectedReport.image_data && (
                          <div>
                            <p className="text-sm text-gray-400 mb-1">{t?.image || "Imagen"}:</p>
                            <div className="bg-gray-750/50 rounded-lg p-3 border border-gray-700">
                              <img 
                                src={selectedReport.image_data} 
                                alt="Imagen del reporte" 
                                className="max-h-64 rounded-lg mx-auto"
                              />
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <p className="text-sm text-gray-400 mb-1">{t?.reportDate || "Fecha del reporte"}:</p>
                          <div className="bg-gray-750/50 rounded-lg p-3 border border-gray-700">
                            <span className="text-gray-300 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {new Date(selectedReport.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-700 pt-4">
                        <h4 className="text-md font-medium text-white mb-4">{t?.updateStatus || "Actualizar Estado"}</h4>
                        
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleUpdateReportStatus(selectedReport.id, 'en_proceso')}
                            className={`px-4 py-2 rounded-lg flex items-center ${
                              selectedReport.status === 'en_proceso'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            } transition-colors`}
                            disabled={selectedReport.status === 'en_proceso'}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            {t?.markInProgress || "Marcar como En Progreso"}
                          </button>
                          
                          <button
                            onClick={() => handleUpdateReportStatus(selectedReport.id, 'resuelto')}
                            className={`px-4 py-2 rounded-lg flex items-center ${
                              selectedReport.status === 'resuelto'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            } transition-colors`}
                            disabled={selectedReport.status === 'resuelto'}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {t?.markResolved || "Marcar como Resuelto"}
                          </button>
                          
                          <button
                            onClick={() => handleUpdateReportStatus(selectedReport.id, 'rechazado')}
                            className={`px-4 py-2 rounded-lg flex items-center ${
                              selectedReport.status === 'rechazado'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            } transition-colors`}
                            disabled={selectedReport.status === 'rechazado'}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            {t?.markRejected || "Marcar como Rechazado"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="text-lg">{t?.selectReport || "Selecciona un reporte para ver los detalles"}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'tickets' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-blue-400">
                  {t?.ticketsManagement || "Gestión de Tickets de Soporte"}
                </h2>
                <p className="text-sm text-gray-400">
                  {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'} disponibles
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Lista de Tickets */}
                <div className="md:col-span-1 bg-gray-800/50 rounded-lg border border-gray-700 p-5">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {t?.tickets || "Tickets"}
                  </h3>
                  
                  <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                    {tickets.length > 0 ? (
                      tickets.map(ticket => (
                        <div 
                          key={ticket.id}
                          onClick={() => setSelectedTicket(ticket)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-750 ${
                            selectedTicket?.id === ticket.id
                              ? 'bg-blue-900/30 border border-blue-700'
                              : 'bg-gray-750/50 border border-gray-700'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-gray-200 text-sm line-clamp-1">{ticket.tema}</h4>
                            <span className={`text-xs font-medium rounded-full px-2 py-0.5 ml-2 whitespace-nowrap ${
                              ticket.estado === 'pendiente' ? 'bg-yellow-900 text-yellow-200 border border-yellow-700' :
                              ticket.estado === 'en_proceso' ? 'bg-blue-900 text-blue-200 border border-blue-700' :
                              ticket.estado === 'resuelto' ? 'bg-green-900 text-green-200 border border-green-700' :
                              'bg-red-900 text-red-200 border border-red-700'
                            }`}>
                              {ticket.estado === 'pendiente' && (t?.pending || "Pendiente")}
                              {ticket.estado === 'en_proceso' && (t?.inProcess || "En proceso")}
                              {ticket.estado === 'resuelto' && (t?.resolved || "Resuelto")}
                              {ticket.estado === 'cerrado' && (t?.closed || "Cerrado")}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mt-1 line-clamp-2">{ticket.descripcion}</p>
                          <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                            <span className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {ticket.usuario || t?.unknownUser || "Usuario desconocido"}
                            </span>
                            <span className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {ticket.fecha_creacion ? new Date(ticket.fecha_creacion).toLocaleDateString() : "Fecha desconocida"}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-6 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <p>{t?.noTickets || "No hay tickets disponibles"}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Detalles del Ticket Seleccionado */}
                <div className="md:col-span-2 bg-gray-800/50 rounded-lg border border-gray-700 p-5">
                  {selectedTicket ? (
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium text-white">{selectedTicket.tema}</h3>
                        <span className={`text-xs font-medium rounded-full px-3 py-1 ${
                          selectedTicket.estado === 'pendiente' ? 'bg-yellow-900 text-yellow-200 border border-yellow-700' :
                          selectedTicket.estado === 'en_proceso' ? 'bg-blue-900 text-blue-200 border border-blue-700' :
                          selectedTicket.estado === 'resuelto' ? 'bg-green-900 text-green-200 border border-green-700' :
                          'bg-red-900 text-red-200 border border-red-700'
                        }`}>
                          {selectedTicket.estado === 'pendiente' && (t?.pending || "Pendiente")}
                          {selectedTicket.estado === 'en_proceso' && (t?.inProcess || "En proceso")}
                          {selectedTicket.estado === 'resuelto' && (t?.resolved || "Resuelto")}
                          {selectedTicket.estado === 'cerrado' && (t?.closed || "Cerrado")}
                        </span>
                      </div>
                      
                      <div className="space-y-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-400 mb-1">{t?.from || "De"}:</p>
                            <div className="bg-gray-750/50 rounded-lg p-3 border border-gray-700">
                              <span className="text-gray-300 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {selectedTicket.usuario || t?.unknownUser || "Usuario desconocido"}
                              </span>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-400 mb-1">{t?.email || "Email"}:</p>
                            <div className="bg-gray-750/50 rounded-lg p-3 border border-gray-700">
                              <span className="text-gray-300 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {selectedTicket.email || t?.noEmail || "Email no proporcionado"}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-400 mb-1">{t?.topic || "Tema"}:</p>
                          <div className="bg-gray-750/50 rounded-lg p-3 border border-gray-700">
                            <p className="text-gray-300">{selectedTicket.tema}</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-400 mb-1">{t?.message || "Mensaje"}:</p>
                          <div className="bg-gray-750/50 rounded-lg p-3 border border-gray-700">
                            <p className="text-gray-300 whitespace-pre-wrap">{selectedTicket.descripcion}</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-400 mb-1">{t?.date || "Fecha"}:</p>
                          <div className="bg-gray-750/50 rounded-lg p-3 border border-gray-700">
                            <span className="text-gray-300 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {selectedTicket.fecha_creacion ? new Date(selectedTicket.fecha_creacion).toLocaleString() : "Fecha desconocida"}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-700 pt-4">
                        <h4 className="text-md font-medium text-white mb-4">{t?.updateStatus || "Actualizar Estado"}</h4>
                        
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'en_proceso')}
                            className={`px-4 py-2 rounded-lg flex items-center ${
                              selectedTicket.estado === 'en_proceso'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            } transition-colors`}
                            disabled={selectedTicket.estado === 'en_proceso'}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            {t?.markInProcess || "Marcar como En Progreso"}
                          </button>
                          
                          <button
                            onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'resuelto')}
                            className={`px-4 py-2 rounded-lg flex items-center ${
                              selectedTicket.estado === 'resuelto'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            } transition-colors`}
                            disabled={selectedTicket.estado === 'resuelto'}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {t?.markResolved || "Marcar como Resuelto"}
                          </button>
                          
                          <button
                            onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'cerrado')}
                            className={`px-4 py-2 rounded-lg flex items-center ${
                              selectedTicket.estado === 'cerrado'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            } transition-colors`}
                            disabled={selectedTicket.estado === 'cerrado'}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            {t?.markClosed || "Marcar como Cerrado"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <p className="text-lg">{t?.selectTicket || "Selecciona un ticket para ver los detalles"}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 