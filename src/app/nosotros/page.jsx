"use client";

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

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
      </main>
    </div>
  );
};

export default NosotrosPage;