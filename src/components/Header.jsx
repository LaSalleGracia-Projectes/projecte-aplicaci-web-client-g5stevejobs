'use client'; // Si necesitas interacción del cliente (por ejemplo, para manejar eventos)

import React from 'react';
import Image from 'next/image';
import styles from './Header.module.css'; // Módulo CSS para estilos

const Header = () => {
  return (
    <header className={styles.header}>
      <Image
        src="/images/global/Background.png"
        alt="logoTheAbyss"
        width={150}
        height={50}
      />
      <nav className={styles.nav}>
        <h3>Descarga</h3>
        <h3>Foro</h3>
        <h3>Blog</h3>
        <h3>Soporte</h3>
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
