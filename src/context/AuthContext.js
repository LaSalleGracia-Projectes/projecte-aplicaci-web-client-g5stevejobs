'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      console.log('Fetching session...');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session data:', session);

      if (session?.user) {
        console.log('User found in session:', session.user);
        setUser(session.user);
        
        console.log('Fetching profile for user:', session.user.id);
        const { data: profile, error } = await supabase
          .from("perfil")
          .select("*")
          .eq("id_perfil", session.user.id)
          .single();

        console.log('Profile fetch result:', { profile, error });

        if (!error) {
          console.log('Setting profile:', profile);
          setPerfil(profile);
        } else {
          console.error('Error fetching profile:', error);
        }
      } else {
        console.log('No session found');
      }
      setLoading(false);
    };

    fetchSession();

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      
      if (session?.user) {
        console.log('Setting user from auth state change:', session.user);
        setUser(session.user);
        
        console.log('Fetching profile after auth state change');
        supabase
          .from("perfil")
          .select("*")
          .eq("id_perfil", session.user.id)
          .single()
          .then(({ data, error }) => {
            console.log('Profile fetch after auth change:', { data, error });
            if (!error) {
              console.log('Setting profile after auth change:', data);
              setPerfil(data);
            } else {
              console.error('Error fetching profile after auth change:', error);
            }
          });
      } else {
        console.log('Clearing user and profile');
        setUser(null);
        setPerfil(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, perfil, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);