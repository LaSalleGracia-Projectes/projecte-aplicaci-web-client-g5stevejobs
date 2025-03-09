'use client';

import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css'; // Módulo CSS para estilos

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.logoContainer}>
        <Link href="/" className={styles.logoLink}>The Abyss</Link>
      </div>
      <nav className={styles.nav}>
        <Link href="/nosotros" className={styles.navItem}>Sobre nosotros</Link>
        <Link href="/blog" className={styles.navItem}>Blog</Link>
        <Link href="/foro" className={styles.navItem}>Foro</Link>
        <Link href="/soporte" className={styles.navItem}>Soporte</Link>
      </nav>
      <div className={styles.socialMedia}>
        <Link href="https://facebook.com" className={styles.socialIcon}>Facebook</Link>
        <Link href="https://twitter.com" className={styles.socialIcon}>Twitter</Link>
        <Link href="https://instagram.com" className={styles.socialIcon}>Instagram</Link>
      </div>
    </footer>
  );
};

export default Footer;