"use client";

import Image from "next/image"; // Importa el componente Image de Next.js

export default function Home() {
  return (
    <main className="home-container">
      {/* Contenido principal de la página Home */}
      <section className="content">
        <div className="welcome-message">
          <h1>Bienvenido a The Abyss</h1>
          <p>Explora nuestras descargas, foro, blog y soporte técnico.</p>
        </div>
      </section>
    </main>
  );
}
