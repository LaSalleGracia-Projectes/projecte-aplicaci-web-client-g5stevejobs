'use client'; // Si necesitas interacción del cliente (por ejemplo, para manejar eventos)

import React from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css'; // Módulo CSS para estilos

const Header = () => {
  const currentPath = usePathname();

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <Image
          src="/images/placeholder.png" // Placeholder para el logo
          alt="logoTheAbyss"
          width={150}
          height={50}
        />
      </div>
      <nav className={styles.nav}>
        <h3 className={`${styles.navItem} ${currentPath === '/descarga' ? styles.active : ''}`}>Descarga</h3>
        <h3 className={`${styles.navItem} ${currentPath === '/about' ? styles.active : ''}`}>About Us</h3>
        <h3 className={`${styles.navItem} ${currentPath === '/blog' ? styles.active : ''}`}>Blog</h3>
        <h3 className={`${styles.navItem} ${currentPath === '/foro' ? styles.active : ''}`}>Foro</h3>
        <h3 className={`${styles.navItem} ${currentPath === '/soporte' ? styles.active : ''}`}>Soporte</h3>
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
      <button className={styles.loginButton}>Iniciar sesión</button>
    </header>
  );
};

export default Header;