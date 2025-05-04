'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext'; // Importa el contexto de autenticación
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../supabaseClient'; // Importa el cliente de Supabase
import styles from './Header.module.css'; // Módulo CSS para estilos
import { languages } from '../locales';
import { toast } from 'react-hot-toast';

const Header = () => {
  const currentPath = usePathname();
  const router = useRouter();
  const { user, usuario } = useAuth(); // Obtén el usuario y el nombre de usuario del contexto de autenticación
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Estado para almacenar la URL de la imagen de perfil
  const [profileImage, setProfileImage] = useState(null);
  // Estado para controlar si se está procesando el cierre de sesión
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Obtener la imagen de perfil desde Supabase
  useEffect(() => {
    const fetchProfileImage = async () => {
      if (!user) return;

      try {
        console.log("Fetching profile for user:", user.email);
        
        // Consultar la tabla de perfiles para obtener el avatar usando el email
        // Ya que la tabla no tiene un campo id_usuario
        const { data, error } = await supabase
          .from('perfil')
          .select('avatar')
          .eq('email', user.email)
          .single();

        if (error) {
          console.error('Error en la consulta a la tabla perfil:', error.message || error);
          return;
        }

        if (data && data.avatar) {
          console.log('Avatar encontrado:', data.avatar);
          setProfileImage(data.avatar);
        } else {
          console.log('No se encontró avatar para el usuario con email:', user.email);
        }
      } catch (error) {
        console.error('Error inesperado al obtener la imagen de perfil:', error);
      }
    };

    fetchProfileImage();
  }, [user]);

  // Función para realizar una limpieza agresiva de la sesión
  const forceCleanupSession = () => {
    // 1. Limpieza de localStorage
    try {
      // Tokens de Supabase
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-localhost-auth-token');
      localStorage.removeItem('sb-auth-token');
      
      // Cualquier otro item de almacenamiento que pueda estar relacionado
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('auth') || key.includes('user'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      console.log('Limpieza de localStorage completada');
    } catch (e) {
      console.error('Error al limpiar localStorage:', e);
    }
    
    // 2. Limpieza de sessionStorage
    try {
      sessionStorage.removeItem('returnUrl');
      sessionStorage.clear();
      console.log('Limpieza de sessionStorage completada');
    } catch (e) {
      console.error('Error al limpiar sessionStorage:', e);
    }
    
    // 3. Eliminar cookies relacionadas con la autenticación
    try {
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        if (name && (name.includes('supabase') || name.includes('auth'))) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
        }
      });
      console.log('Limpieza de cookies completada');
    } catch (e) {
      console.error('Error al limpiar cookies:', e);
    }
  };

  const handleLogout = async () => {
    try {
      // Prevenir múltiples clicks
      if (isLoggingOut) return;
      
      setIsLoggingOut(true);
      setIsDropdownOpen(false); // Cerrar el menú desplegable inmediatamente
      
      // Iniciar limpieza agresiva incluso antes de la respuesta de Supabase
      forceCleanupSession();
      
      // Mostrar notificación de cierre de sesión
      toast.success(t.loggingOut || 'Cerrando sesión...');
      
      // Cerrar sesión en Supabase con timeout para evitar bloqueos
      const signOutPromise = supabase.auth.signOut();
      
      // Usar un timeout para no esperar indefinidamente
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout al cerrar sesión')), 3000);
      });
      
      // Intentar cerrar sesión con timeout
      try {
        const { error } = await Promise.race([signOutPromise, timeoutPromise]);
        if (error) console.error("Error al cerrar sesión:", error);
      } catch (e) {
        console.warn("Timeout en signOut, continuando con cierre forzado:", e);
      }
      
      // Redirección inmediata, no esperamos a que se complete el cierre de sesión
      router.push('/login');
      
      // Forzar recarga completa después de un pequeño retraso para asegurar 
      // que la navegación comience antes de la recarga
      setTimeout(() => {
        console.log("Recargando página para completar cierre de sesión");
        window.location.href = '/login';
      }, 200);
      
    } catch (error) {
      console.error("Error durante el logout:", error);
      // Intentar redirección incluso si hay error
      window.location.href = '/login';
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${searchQuery.trim()}`);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <Image
          src="/images/logo-abyss.png" // Placeholder para el logo
          alt="logoTheAbyss"
          width={80}
          height={50}
        />
      </div>

      <button 
        className={styles.burgerMenu} 
        onMouseEnter={() => setIsMenuOpen(true)}
        onMouseLeave={() => setIsMenuOpen(false)}
        aria-label="Menu"
      >
        <span className={`${styles.burgerLine} ${isMenuOpen ? styles.open : ''}`}></span>
        <span className={`${styles.burgerLine} ${isMenuOpen ? styles.open : ''}`}></span>
        <span className={`${styles.burgerLine} ${isMenuOpen ? styles.open : ''}`}></span>
      </button>

      <nav className={styles.nav}>
        <Link href="/">
          <h3 className={`${styles.navItem} ${currentPath === '/' ? styles.active : ''}`}>{t.download || "Descarga"}</h3>
        </Link>
        <Link href="/nosotros">
          <h3 className={`${styles.navItem} ${currentPath === '/nosotros' ? styles.active : ''}`}>{t.about || "Sobre nosotros"}</h3>
        </Link>
        <Link href="/blog">
          <h3 className={`${styles.navItem} ${currentPath === '/blog' ? styles.active : ''}`}>{t.blog || "Blog"}</h3>
        </Link>
        <Link href="/foro">
          <h3 className={`${styles.navItem} ${currentPath === '/foro' ? styles.active : ''}`}>{t.forum || "Foro"}</h3>
        </Link>
        <Link href="/soporte">
          <h3 className={`${styles.navItem} ${currentPath === '/soporte' ? styles.active : ''}`}>{t.support || "Soporte"}</h3>
        </Link>
      </nav>

      <div className={styles.languageSelector} onMouseEnter={() => setIsLanguageDropdownOpen(true)} onMouseLeave={() => setIsLanguageDropdownOpen(false)}>
        <span className={styles.navItem}>
          {languages.find(lang => lang.code === currentLanguage)?.name || "Español"}
        </span>
        {isLanguageDropdownOpen && (
          <div className={styles.dropdownMenu}>
            {languages.map((lang) => (
              <button
                key={lang.code}
                className={`${styles.dropdownItem} ${currentLanguage === lang.code ? styles.active : ''}`}
                onClick={() => {
                  changeLanguage(lang.code);
                  setIsLanguageDropdownOpen(false);
                }}
              >
                {lang.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <form className={styles.searchBar} onSubmit={handleSearch}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            name="query"
            placeholder={t.searchProfile || "Buscar perfil"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" aria-label="Search" className={styles.searchIcon}>
            <Image
              src="/images/global/frame_0_delay-0.1s.gif"
              alt={t.search || "Buscar"}
              width={40}
              height={40}
              className={styles.staticIcon}
            />
            <Image
              src="/images/global/antorcha.gif"
              alt={t.search || "Buscar"}
              width={40}
              height={40}
              className={styles.hoverIcon}
            />
          </button>
        </div>
      </form>

      {user ? (
        <div className={styles.userMenu} onMouseEnter={() => setIsDropdownOpen(true)} onMouseLeave={() => setIsDropdownOpen(false)}>
          <div className={styles.userMenuTrigger}>
            <div className={styles.profileImageContainer}>
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className={styles.profileImage}
                />
              ) : (
                <div className={styles.profileImagePlaceholder}>
                  {usuario ? usuario.charAt(0).toUpperCase() : "U"}
                </div>
              )}
            </div>
            <span className={styles.navItem}>{usuario}</span>
          </div>
          {isDropdownOpen && (
            <div className={styles.dropdownMenu}>
              <Link href="/perfil" className={styles.dropdownItem}>{t.myProfile || "Mi perfil"}</Link>
              <button 
                onClick={handleLogout} 
                className={`${styles.dropdownItem} ${styles.logoutItem}`}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Cerrando...</span>
                  </div>
                ) : (t.logout || "Cerrar sesión")}
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link href="/login">
          <button className={styles.loginButton}>{t.login || "Iniciar sesión"}</button>
        </Link>
      )}
    </header>
  );
};

export default Header;