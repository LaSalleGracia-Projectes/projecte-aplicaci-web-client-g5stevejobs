"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Este archivo redirige de /reporte a /report manteniendo los query parameters
export default function ReportRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const params = new URLSearchParams();
    
    // Copiar todos los parámetros actuales
    searchParams.forEach((value, key) => {
      params.append(key, value);
    });
    
    const queryString = params.toString();
    const destination = `/report${queryString ? `?${queryString}` : ''}`;
    
    console.log(`Redirigiendo de /reporte a: ${destination}`);
    router.push(destination);
  }, [router, searchParams]);

  // Mostrar un mensaje de carga mientras se redirecciona
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-850">
      <div className="flex flex-col items-center p-8 bg-gray-800 rounded-lg shadow-lg">
        <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-white text-lg">Redirigiendo...</p>
      </div>
    </div>
  );
} 