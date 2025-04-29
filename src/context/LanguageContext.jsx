'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations, languages } from '../locales';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState('es');
  const [t, setT] = useState(translations.es);

  // Cargar el idioma guardado en localStorage al iniciar
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
      setT(translations[savedLanguage]);
    }
  }, []);

  // Función para cambiar el idioma
  const changeLanguage = (langCode) => {
    if (translations[langCode]) {
      setCurrentLanguage(langCode);
      setT(translations[langCode]);
      localStorage.setItem('language', langCode);
    }
  };

  return (
    <LanguageContext.Provider value={{ t, currentLanguage, changeLanguage, languages }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook personalizado para usar el contexto de idioma
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext; 