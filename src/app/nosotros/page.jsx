"use client";

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import OSMMap from '../../components/OSMMap';
import WeatherWidget from '../../components/WeatherWidget';
import DailyQuote from '../../components/DailyQuote';

const NosotrosPage = () => {
  const { t } = useLanguage(); // Get translations

  return (
    <div className="bg-gray-850 min-h-screen text-white">
      <main className="px-4 py-6">
        {/* Sección Sobre Nosotros */}
        <section className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">
            {t.about || "Sobre Nosotros"}
          </h1>
          <p className="text-lg text-center mb-6">
            {t.aboutUsDescription || "Somos un equipo de estudiantes apasionados por el desarrollo de videojuegos y el arte digital, unidos por nuestro amor hacia el universo de Made in Abyss."}
          </p>
          <div className="space-y-4">
            <p className="text-gray-300">
              {t.aboutUsText1 || "Nuestro equipo está formado por Iván, Fan y Adrián, tres estudiantes de La Salle Campus Barcelona con diferentes habilidades pero una visión compartida: crear experiencias inmersivas que capturen la esencia de mundos fantásticos. Nuestra pasión por la narrativa de 'Made in Abyss' nos inspiró a desarrollar un juego de plataformas que rinde homenaje a su misterioso y cautivador universo."}
            </p>
            <p className="text-gray-300">
              {t.aboutUsText2 || "En nuestro juego, exploramos los misterios de un abismo vertical lleno de criaturas fascinantes, reliquias olvidadas y paisajes impresionantes. Cada nivel está diseñado para evocar la sensación de descubrimiento y peligro que caracteriza la obra original, desafiando a los jugadores a adentrarse más profundamente mientras enfrentan los crecientes riesgos del descenso."}
            </p>
            <p className="text-gray-300">
              {t.aboutUsText3 || "Este proyecto representa no solo nuestra dedicación al desarrollo de videojuegos, sino también nuestro compromiso con la creación de experiencias que resuenen emocionalmente con los jugadores. A través de mecánicas de juego cuidadosamente diseñadas, una estética visual cautivadora y una banda sonora atmosférica, invitamos a los jugadores a sumergirse en un mundo donde la curiosidad y la aventura van de la mano con el misterio y el peligro."}
            </p>
          </div>
        </section>

        {/* Office Location Section - PRIMERO */}
        <section className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4">{t.ourOffice || "Nuestra Oficina"}</h2>
          <p className="mb-4">{t.officeLocation || "La Salle Campus Barcelona, Carrer de Sant Joan de La Salle, 42, 08022 Barcelona"}</p>
          <div className="h-96 w-full">
            <OSMMap />
          </div>
        </section>

        {/* Weather Section - SEGUNDO */}
        <section className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4">{t.currentWeather || "Clima en Barcelona"}</h2>
          <WeatherWidget />
        </section>

        {/* Daily Quote Section - TERCERO */}
        <section className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4">{t.dailyQuote || "Frase del Día"}</h2>
          <DailyQuote />
        </section>
      </main>
    </div>
  );
};

export default NosotrosPage;