"use client";

import Image from "next/image"; // Importa el componente Image de Next.js
import { useLanguage } from "../context/LanguageContext"; // Import useLanguage hook
import { useState, useEffect } from "react";

export default function Home() {
  const { t } = useLanguage(); // Get the current translations
  const [isLoading, setIsLoading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  // Handle download button click
  const handleDownload = () => {
    setIsLoading(true);
    // Simulate loading for better UX
    setTimeout(() => {
      setIsLoading(false);
      setShowThankYou(true);
      // Hide thank you message after 3 seconds
      setTimeout(() => setShowThankYou(false), 3000);
    }, 800);
  };

  return (
    <main className="bg-gray-850 min-h-screen text-white">
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center">
        {/* Background image with overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/abyss-imagen.jpg"
            alt="The Abyss Background"
            fill
            className="object-cover brightness-50"
            priority
          />
          <div className="absolute inset-0 bg-black/30 z-10"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white drop-shadow-lg">
            <span className="text-blue-400">The</span> Abyss
          </h1>
          <p className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto text-gray-200">
            {t.heroSubtitle || "Explora las profundidades de un mundo misterioso lleno de peligros y tesoros por descubrir."}
          </p>
          
          {/* Download button */}
          <div className="relative inline-block">
            <a
              href="/downloads/TheAbyss.exe"
              download="TheAbyss.exe"
              onClick={handleDownload}
              className={`group relative inline-flex items-center justify-center px-10 py-5 rounded-full overflow-hidden bg-blue-600 hover:bg-blue-500 transition-all duration-300 shadow-lg ${isLoading ? 'animate-pulse cursor-not-allowed' : 'hover:scale-105'}`}
            >
              <span className="relative flex items-center gap-2 text-xl md:text-2xl font-semibold text-white">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t.downloading || "Descargando..."}
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {t.download || "Descarga el juego"}
                  </>
                )}
              </span>
            </a>
            
            {/* Thank you message */}
            {showThankYou && (
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-md text-sm animate-fade-in">
                {t.thankYou || "¡Gracias por descargar!"}
              </div>
            )}
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>
      
      {/* Game Features Section */}
      <section className="py-20 px-4 bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            {t.gameFeatures || "Características del juego"}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 hover:bg-gray-650">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="white">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">{t.feature1Title || "Gráficos inmersivos"}</h3>
              <p className="text-gray-300 text-center">{t.feature1Desc || "Disfruta de un mundo detallado con gráficos cautivadores que te sumergirán en el universo de The Abyss."}</p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 hover:bg-gray-650">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="white">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">{t.feature2Title || "Controles intuitivos"}</h3>
              <p className="text-gray-300 text-center">{t.feature2Desc || "Domina fácilmente las mecánicas del juego con controles fluidos y responsivos diseñados para todos los niveles."}</p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 hover:bg-gray-650">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="white">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">{t.feature3Title || "Historia cautivadora"}</h3>
              <p className="text-gray-300 text-center">{t.feature3Desc || "Descubre los secretos del abismo a través de una narrativa envolvente que te mantendrá jugando hasta el final."}</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Game Screenshots Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            {t.screenshots || "Capturas de pantalla"}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <Image
                src="/images/menupausa.jpg"
                alt="Game Screenshot 1"
                width={600}
                height={338}
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <Image
                src="/images/attack.jpg"
                alt="Game Screenshot 2"
                width={600}
                height={338}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{t.readyToPlay || "¿Listo para comenzar tu aventura?"}</h2>
          <p className="text-lg md:text-xl mb-8 text-blue-100">{t.ctaSubtitle || "Descarga ahora y únete a miles de jugadores explorando The Abyss."}</p>
          <a
            href="/downloads/TheAbyss.exe"
            download="TheAbyss.exe"
            onClick={handleDownload}
            className="inline-block bg-white text-blue-600 font-bold text-lg px-8 py-4 rounded-full hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
          >
            {t.downloadNow || "Descargar Ahora"}
          </a>
        </div>
      </section>
    </main>
  );
}