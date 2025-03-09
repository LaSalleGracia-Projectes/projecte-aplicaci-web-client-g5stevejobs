"use client";

import Image from "next/image"; // Importa el componente Image de Next.js

export default function Home() {
  return (
    <main className="bg-gray-850 min-h-screen text-white flex flex-col items-center justify-center space-y-20">
      {/* Título principal */}
      <h1 className="text-6xl font-bold text-center mt-12">The Abyss</h1>
      
      {/* Botón de descarga */}
      <button className="bg-blue-600 text-white text-4xl px-16 py-8 rounded-lg hover:bg-blue-500">
        Descarga el juego
      </button>
      
      {/* Div superpuesto con imagen placeholder */}
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
        <Image
          src="/images/placeholder.png"
          alt="Información del juego"
          width={800}
          height={400}
          className="rounded-lg object-cover"
        />
      </div>
    </main>
  );
}