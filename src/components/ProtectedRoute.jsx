'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Mostrar nada mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-850">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  // Si no hay usuario y no está cargando, no mostrar nada (se redirigirá)
  if (!user) {
    return null;
  }

  // Si hay usuario, mostrar el contenido
  return children;
};

export default ProtectedRoute; 