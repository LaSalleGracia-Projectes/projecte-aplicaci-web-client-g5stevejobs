'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBanned, setIsBanned] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banExpiration, setBanExpiration] = useState(null);
  const router = useRouter();

  // Función para verificar si un usuario está baneado
  const checkIfUserIsBanned = (profile) => {
    if (!profile || !profile.ban_expiration) return false;
    
    const expirationDate = new Date(profile.ban_expiration);
    const now = new Date();
    const isBanned = expirationDate > now;
    
    if (isBanned) {
      const timeLeft = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));
      console.log('Usuario baneado detectado en AuthContext:', {
        userId: profile.id_perfil,
        banReason: profile.ban_reason,
        banExpiration: profile.ban_expiration,
        timeLeft: `${timeLeft} días`
      });
      
      setIsBanned(true);
      setBanReason(profile.ban_reason || 'No se proporcionó razón');
      setBanExpiration(profile.ban_expiration);
      
      return {
        isBanned: true,
        reason: profile.ban_reason || 'No se proporcionó razón',
        expiration: profile.ban_expiration,
        timeLeft: timeLeft
      };
    }
    
    setIsBanned(false);
    setBanReason('');
    setBanExpiration(null);
    return false;
  };

  // Función para obtener el perfil del usuario
  const fetchUserProfile = async (userId) => {
    try {
      const { data: userProfile, error } = await supabase
        .from('perfil')
        .select('*')
        .eq('id_perfil', userId)
        .single();

      if (error) throw error;

      console.log('Perfil obtenido:', userProfile);
      setPerfil(userProfile);
      return userProfile;
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    // Obtener la sesión inicial
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        console.log('Sesión inicial:', {
          tieneSession: !!session,
          userId: session?.user?.id
        });

        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            const userProfile = await fetchUserProfile(session.user.id);
            if (userProfile) {
              const banStatus = checkIfUserIsBanned(userProfile);
              if (banStatus?.isBanned) {
                await supabase.auth.signOut();
                setUser(null);
                setPerfil(null);
                router.push('/login');
                return;
              }
            }
          } else {
            setUser(null);
            setPerfil(null);
          }
        }
      } catch (error) {
        console.error('Error al obtener la sesión inicial:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    getInitialSession();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Cambio en el estado de autenticación:', {
        event,
        userId: session?.user?.id
      });

      if (mounted) {
        if (session?.user) {
          setUser(session.user);
          const userProfile = await fetchUserProfile(session.user.id);
          if (userProfile) {
            const banStatus = checkIfUserIsBanned(userProfile);
            if (banStatus?.isBanned) {
              await supabase.auth.signOut();
              setUser(null);
              setPerfil(null);
              router.push('/login');
              return;
            }
          }
        } else {
          // Cuando no hay sesión de usuario (logout o sesión expirada)
          setUser(null);
          setPerfil(null);
          setIsBanned(false);
          setBanReason('');
          setBanExpiration(null);
        }

        setLoading(false);

        if (event === 'SIGNED_OUT') {
          // Forzar limpieza de datos de sesión locales al desconectar
          localStorage.removeItem('supabase.auth.token');
          sessionStorage.removeItem('returnUrl');
          
          // Usar setTimeout para permitir que el estado se actualice antes de la redirección
          setTimeout(() => {
            router.push('/login');
          }, 50);
        } else if (event === 'SIGNED_IN') {
          const returnUrl = sessionStorage.getItem('returnUrl');
          if (returnUrl) {
            sessionStorage.removeItem('returnUrl');
            router.push(returnUrl);
          } else {
            router.push('/');
          }
        }
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [router]);

  return (
    <AuthContext.Provider 
      value={{
        user,
        perfil,
        loading,
        isBanned,
        banReason,
        banExpiration,
        getBanTimeLeft: () => {
          if (!banExpiration) return null;
          const expirationDate = new Date(banExpiration);
          const now = new Date();
          if (expirationDate <= now) return null;
          const diff = expirationDate - now;
          return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            total: diff
          };
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};