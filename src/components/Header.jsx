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

  const handleLogout = async () => {
    try {
      // Prevenir múltiples clicks
      if (isLoggingOut) return;
      
      setIsLoggingOut(true);
      
      // Cerrar sesión en Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error al cerrar sesión:", error);
        throw error;
      }
      
      // Limpiamos cualquier estado de la sesión en localStorage si es necesario
      localStorage.removeItem('supabase.auth.token');
      
      // Usar router.push en lugar de window.location.href para navegación del lado del cliente
      router.push('/login');
      
      // Forzar recarga después de la redirección para asegurar que todos los estados se reinicien
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
    } catch (error) {
      console.error("Error durante el logout:", error);
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
                {isLoggingOut ? 'Cerrando sesión...' : (t.logout || "Cerrar sesión")}
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