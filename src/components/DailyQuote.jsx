"use client";

import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const DailyQuote = () => {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchDailyQuote = async () => {
      try {
        // Forzar resetear el caché para mostrar una nueva cita
        localStorage.removeItem('dailyQuote');
        localStorage.removeItem('dailyQuoteDate');
        
        // Usar DummyJSON API - Muy confiable para desarrollo y demos
        const response = await fetch('https://dummyjson.com/quotes/random');
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        const apiQuote = {
          content: data.quote,
          author: data.author
        };
        
        setQuote(apiQuote);
        localStorage.setItem('dailyQuote', JSON.stringify(apiQuote));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching quote:', err);
        setError('No se pudo cargar una frase. Por favor, recarga la página.');
        setLoading(false);
      }
    };
    
    // Only run client-side
    if (typeof window !== 'undefined') {
      fetchDailyQuote();
    }

    return () => {
      // Cleanup
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        {t.errorLoadingQuote || 'Error al cargar la frase del día'}: {error}
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="text-center p-4">
        {t.noQuoteAvailable || 'No hay frase disponible'}
      </div>
    );
  }

  return (
    <div className="bg-gray-700 rounded-lg p-6 shadow-md">
      <blockquote className="relative">
        <div className="text-3xl absolute -top-4 -left-2 text-gray-500">"</div>
        <p className="text-lg italic mb-4 mx-4">
          {quote.content}
        </p>
        <footer className="text-right text-gray-400">
          — {quote.author}
        </footer>
        <div className="text-3xl absolute -bottom-8 -right-2 text-gray-500">"</div>
      </blockquote>
    </div>
  );
};

export default DailyQuote; 