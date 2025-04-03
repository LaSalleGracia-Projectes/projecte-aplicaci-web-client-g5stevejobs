'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data: profile, error } = await supabase
          .from("Perfil")
          .select("*")
          .eq("ID_perfil", session.user.id)
          .single();

        if (!error) {
          setPerfil(profile);
        }
      }
    };

    fetchSession();

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        supabase
          .from("Perfil")
          .select("*")
          .eq("ID_perfil", session.user.id)
          .single()
          .then(({ data, error }) => {
            if (!error) {
              setPerfil(data);
            }
          });
      } else {
        setUser(null);
        setPerfil(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, perfil }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);