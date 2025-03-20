'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const { data: profile } = await supabase
          .from('perfil')
          .select('usuario')
          .eq('id_perfil', session.user.id)
          .single();
        setUsuario(profile?.usuario ?? null);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
        const fetchProfile = async () => {
          const { data: profile } = await supabase
            .from('perfil')
            .select('usuario')
            .eq('id_perfil', session.user.id)
            .single();
          setUsuario(profile?.usuario ?? null);
        };
        fetchProfile();
      } else {
        setUser(null);
        setUsuario(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, usuario }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);