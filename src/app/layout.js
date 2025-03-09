import './globals.css'; // Estilos globales opcionales
import Header from '../components/Header'; // Importa el Header desde un componente separado
import Footer from '../components/Footer'; // Importa el Footer desde un componente separado

export const metadata = {
  title: 'The Abyss',
  description: 'Página web oficial de The Abyss',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Aquí va el header que se aplicará globalmente */}
        <Header />
        {/* Renderiza el contenido específico de cada página */}
        {children}
        {/* Aquí va el footer que se aplicará globalmente */}
        <Footer />
      </body>
    </html>
  );
}