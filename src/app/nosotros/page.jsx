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
            {t.aboutUsDescription || "Aquí va el texto genérico sobre nosotros. Este texto será reemplazado con la información real más adelante."}
          </p>
          <div className="space-y-4">
            <p className="text-gray-300">
              {t.aboutUsText1 || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique."}
            </p>
            <p className="text-gray-300">
              {t.aboutUsText2 || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique."}
            </p>
            <p className="text-gray-300">
              {t.aboutUsText3 || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique."}
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