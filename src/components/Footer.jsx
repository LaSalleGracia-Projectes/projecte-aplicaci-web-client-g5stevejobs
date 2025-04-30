'use client';

import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css'; // Módulo CSS para estilos
import { useLanguage } from '../context/LanguageContext'; // Import the language context

const Footer = () => {
  const { t } = useLanguage(); // Get current translations
  
  return (
    <footer className={styles.footer}>
      <div className={styles.logoContainer}>
        <Link href="/" className={styles.logoLink}>The Abyss</Link>
      </div>
      <nav className={styles.nav}>
        <Link href="/nosotros" className={styles.navItem}>{t.about || "Sobre nosotros"}</Link>
        <Link href="/blog" className={styles.navItem}>{t.blog || "Blog"}</Link>
        <Link href="/foro" className={styles.navItem}>{t.forum || "Foro"}</Link>
        <Link href="/soporte" className={styles.navItem}>{t.support || "Soporte"}</Link>
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