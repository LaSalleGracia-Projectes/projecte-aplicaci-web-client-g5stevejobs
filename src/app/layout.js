import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'The Abyss',
  description: 'Página web oficial de The Abyss',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Toaster position="top-right" />
          <Header />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}