'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function AdminPanel() {
  const router = useRouter();
  const { user, perfil } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    usuario: '',
    email: '',
    rol: '',
    estatus: true
  });
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!user) {
      setAccessDenied(true);
      setError('Debes iniciar sesión para acceder al panel de administración');
      setLoading(false);
      return;
    }

    if (!perfil) {
      setLoading(true);
      return;
    }

    if (perfil.rol !== 'admin') {
      setAccessDenied(true);
      setError('No tienes permisos de administrador para acceder a esta página');
      setLoading(false);
      return;
    }

    // Si el usuario está autenticado y es admin, cargar los usuarios
    fetchUsers();
  }, [user, perfil]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('perfil')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Error al cargar los usuarios');
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      usuario: user.usuario,
      email: user.email,
      rol: user.rol,
      estatus: user.estatus
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
          estatus: editForm.estatus
        })
        .eq('id_perfil', selectedUser.id_perfil);

      if (error) throw error;
      
      setUsers(users.map(user => 
        user.id_perfil === selectedUser.id_perfil 
          ? { ...user, ...editForm }
          : user
      ));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Error al actualizar el usuario');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('perfil')
        .delete()
        .eq('id_perfil', userId);

      if (error) throw error;
      
      setUsers(users.filter(user => user.id_perfil !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Error al eliminar el usuario');
    }
  };

  const handleBan = async (userId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('perfil')
        .update({ estatus: !currentStatus })
        .eq('id_perfil', userId);

      if (error) throw error;
      
      setUsers(users.map(user => 
        user.id_perfil === userId 
          ? { ...user, estatus: !currentStatus }
          : user
      ));
    } catch (error) {
      console.error('Error updating user status:', error);
      setError('Error al actualizar el estado del usuario');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-850 p-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-white">Verificando acceso...</p>
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
    <div className="min-h-screen bg-gray-850 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Panel de Administración</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

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
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={editForm.estatus}
                  onChange={(e) => setEditForm({ ...editForm, estatus: e.target.checked })}
                  className="rounded bg-gray-700 border-gray-600 text-blue-600"
                />
                <label className="ml-2 text-sm text-gray-300">
                  Usuario activo
                </label>
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
                    Estado
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
                      {user.usuario}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300 capitalize">
                      {user.rol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.estatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.estatus ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleBan(user.id_perfil, user.estatus)}
                        className={`${
                          user.estatus ? 'text-yellow-400 hover:text-yellow-300' : 'text-green-400 hover:text-green-300'
                        }`}
                      >
                        {user.estatus ? 'Banear' : 'Desbanear'}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id_perfil)}
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
      </div>
    </div>
  );
} 