'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext'; // Importa el contexto de autenticación
import { supabase } from '../supabaseClient'; // Importa el cliente de Supabase
import styles from './Header.module.css'; // Módulo CSS para estilos

const Header = () => {
  const currentPath = usePathname();
  const { user, username } = useAuth(); // Obtén el usuario y el nombre de usuario del contexto de autenticación
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Redirigir al usuario a la página de inicio de sesión o a otra página
    window.location.href = '/login';
  };

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <Image
          src="/images/placeholder.png" // Placeholder para el logo
          alt="logoTheAbyss"
          width={200}
          height={70}
        />
      </div>
      <nav className={styles.nav}>
        <Link href="/">
          <h3 className={`${styles.navItem} ${currentPath === '/' ? styles.active : ''}`}>Descarga</h3>
        </Link>
        <Link href="/nosotros">
          <h3 className={`${styles.navItem} ${currentPath === '/nosotros' ? styles.active : ''}`}>Sobre nosotros</h3>
        </Link>
        <Link href="/blog">
          <h3 className={`${styles.navItem} ${currentPath === '/blog' ? styles.active : ''}`}>Blog</h3>
        </Link>
        <Link href="/foro">
          <h3 className={`${styles.navItem} ${currentPath === '/foro' ? styles.active : ''}`}>Foro</h3>
        </Link>
        <Link href="/soporte">
          <h3 className={`${styles.navItem} ${currentPath === '/soporte' ? styles.active : ''}`}>Soporte</h3>
        </Link>
      </nav>
      <form className={styles.searchBar}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            name="query"
            placeholder="Buscar perfil"
            className={styles.searchInput}
          />
          <button type="submit" aria-label="Search" className={styles.searchIcon}>
            <Image
              src="/images/global/frame_0_delay-0.1s.gif"
              alt="Buscar"
              width={40}
              height={40}
              className={styles.staticIcon}
            />
            <Image
              src="/images/global/antorcha.gif"
              alt="Buscar"
              width={40}
              height={40}
              className={styles.hoverIcon}
            />
          </button>
        </div>
      </form>
      {user ? (
        <div className={styles.userMenu} onMouseEnter={() => setIsDropdownOpen(true)} onMouseLeave={() => setIsDropdownOpen(false)}>
          <span className={styles.navItem}>{username}</span>
          {isDropdownOpen && (
            <div className={styles.dropdownMenu}>
              <Link href="/perfil" className={styles.dropdownItem}>Mi perfil</Link>
              <button onClick={handleLogout} className={`${styles.dropdownItem} ${styles.logoutItem}`}>Cerrar sesión</button>
            </div>
          )}
        </div>
      ) : (
        <Link href="/login">
          <button className={styles.loginButton}>Iniciar sesión</button>
        </Link>
      )}
    </header>
  );
};

export default Header;