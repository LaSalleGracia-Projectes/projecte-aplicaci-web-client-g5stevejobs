"use client";

import React from 'react';

const NosotrosPage = () => {
  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <main className="px-4 py-6">
        {/* Sección Sobre Nosotros */}
        <section className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">
            Sobre Nosotros
          </h1>
          <p className="text-lg text-center mb-6">
            Aquí va el texto genérico sobre nosotros. Este texto será reemplazado con la información real más adelante.
          </p>
          <div className="space-y-4">
            <p className="text-gray-300">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.
            </p>
            <p className="text-gray-300">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.
            </p>
            <p className="text-gray-300">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.
            </p>
          </div>
        </section>
      </main>
      <footer className="py-4 bg-gray-800 text-center text-sm text-gray-400">
        footer text goes here
      </footer>
    </div>
  );
};

export default NosotrosPage;