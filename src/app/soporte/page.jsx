'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';

const SoportePage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: t.allQuestions || 'Todas las preguntas' },
    { id: 'account', name: t.accountProfile || 'Cuenta y Perfil' },
    { id: 'forum', name: t.forumPosts || 'Foro y Publicaciones' },
    { id: 'game', name: t.aboutGame || 'Sobre el Juego' },
    { id: 'technical', name: t.technicalIssues || 'Problemas Técnicos' }
  ];

  const faqItems = [
    {
      question: t.changePassword || '¿Cómo puedo cambiar mi contraseña?',
      answer: t.changePasswordAnswer ||
        'Puedes cambiar tu contraseña accediendo a tu perfil, haciendo clic en "Configuración" y seleccionando la opción "Cambiar contraseña". Si has olvidado tu contraseña, usa la opción "Olvidé mi contraseña" en la página de inicio de sesión.',
      category: 'account'
    },
    {
      question: t.cannotPostForum || '¿Por qué no puedo publicar en el foro?',
      answer: t.cannotPostForumAnswer ||
        'Para publicar en el foro necesitas tener una cuenta y estar conectado. Si ya tienes una cuenta y sigues teniendo problemas, es posible que tu cuenta esté temporalmente suspendida debido a infracciones de las normas del foro.',
      category: 'forum'
    },
    {
      question: t.technicalRequirements || '¿Cuáles son los requisitos técnicos para jugar The Abyss?',
      answer: t.technicalRequirementsAnswer ||
        'The Abyss requiere: Sistema operativo Windows 10 o superior, procesador Intel Core i5 o equivalente, 8GB de RAM, 4GB de espacio libre en disco y una tarjeta gráfica con al menos 2GB de memoria dedicada. Para una experiencia óptima, recomendamos usar una conexión a Internet estable.',
      category: 'game'
    },
    {
      question: t.reportUserForum || '¿Cómo reporto a un usuario que está incumpliendo las normas?',
      answer: t.reportUserForumAnswer ||
        'Puedes reportar a un usuario dirigiéndote a la sección "Reportar" en la página del foro. Proporciona toda la información relevante, incluyendo el nombre de usuario y una descripción del comportamiento inapropiado. Nuestro equipo revisará tu informe lo antes posible.',
      category: 'forum'
    },
    {
      question: t.multiplayerMode || '¿El juego tiene modo multijugador?',
      answer: t.multiplayerModeAnswer ||
        'Actualmente, The Abyss es una experiencia principalmente para un solo jugador que se centra en la exploración y narrativa. Sin embargo, estamos considerando añadir características multijugador en futuras actualizaciones.',
      category: 'game'
    },
    {
      question: t.gameNotStarting || '¿Por qué el juego no se inicia en mi ordenador?',
      answer: t.gameNotStartingAnswer ||
        'Si tienes problemas para iniciar el juego, verifica que tu sistema cumple con los requisitos mínimos. Intenta actualizar los controladores de tu tarjeta gráfica, reiniciar tu ordenador y asegurarte de que no hay otros programas consumiendo muchos recursos. Si el problema persiste, contacta con nuestro equipo de soporte.',
      category: 'technical'
    },
    {
      question: t.changeUsername || '¿Cómo cambio mi nombre de usuario o avatar?',
      answer: t.changeUsernameAnswer ||
        'Para cambiar tu nombre de usuario o avatar, ve a tu perfil y selecciona "Editar perfil". Desde allí podrás actualizar tu información personal, incluyendo tu nombre de usuario y avatar. Ten en cuenta que solo puedes cambiar tu nombre de usuario una vez cada 30 días.',
      category: 'account'
    },
    {
      question: t.forumModeration || '¿El foro tiene algún sistema de moderación?',
      answer: t.forumModerationAnswer ||
        'Sí, nuestro foro cuenta con un equipo de moderadores que supervisan las publicaciones para garantizar que se respeten las normas de la comunidad. También utilizamos sistemas automáticos para filtrar contenido inapropiado.',
      category: 'forum'
    }
  ];

  // Filtrar las preguntas según la categoría seleccionada y el término de búsqueda
  const filteredFAQs = faqItems.filter(faq => 
    (selectedCategory === 'all' || faq.category === selectedCategory) &&
    (searchTerm === '' || 
     faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
     faq.answer.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-gray-850 min-h-screen text-white">
      <main className="px-4 py-6 max-w-6xl mx-auto">
        {/* Banner de soporte */}
        <div className="bg-blue-600 rounded-lg p-6 mb-8 flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t.supportCenter || "Centro de Soporte"}</h1>
            <p className="text-gray-100">{t.findAnswers || "Encuentra respuestas a tus preguntas o contáctanos directamente"}</p>
          </div>
          <Link href="/contacto">
            <button className="mt-4 md:mt-0 px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-colors">
              {t.directContact || "Contacto Directo"}
            </button>
          </Link>
        </div>
        
        {/* Buscador */}
        <div className="mb-8">
          <div className="relative flex items-center">
            <svg className="absolute left-4 w-5 h-5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder={t.searchFAQ || "Busca en nuestras preguntas frecuentes..."} 
              className="w-full p-4 pl-12 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Categorías */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(category => (
            <button
              key={category.id}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* FAQ Section */}
        <section className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-6 border-b border-gray-700 pb-3">
            {t.frequentlyAskedQuestions || "Preguntas Frecuentes"}
          </h2>
          
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">{t.noSearchResults || "No se encontraron resultados para tu búsqueda"}</p>
              <button 
                onClick={() => {setSearchTerm(''); setSelectedCategory('all');}}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                {t.clearFilters || "Limpiar filtros"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <details
                  key={index}
                  className="border border-gray-600 rounded-md p-4 bg-gray-700 hover:bg-gray-650 transition-colors"
                >
                  <summary className="font-bold cursor-pointer text-gray-100 flex justify-between items-center">
                    <span>{faq.question}</span>
                    <span className="text-blue-400">+</span>
                  </summary>
                  <div className="mt-4 pt-3 border-t border-gray-600">
                    <p className="text-gray-300">{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>

        {/* Learn More Section */}
        <section className="bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <img
                src="/images/attack.jpg"
                alt="Learn More"
                className="w-48 h-48 rounded-lg object-cover bg-gray-700"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3 text-gray-100">
                {t.discoverTheAbyss || "Descubre The Abyss"}
              </h2>
              <p className="mb-4 text-gray-300">
                {t.exploreAbyss || "Sumérgete en el misterioso mundo de The Abyss, inspirado en el anime 'Made in Abyss'. Explora un abismo vertical lleno de criaturas fascinantes, reliquias antiguas y secretos por descubrir."}
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => router.push('/')} 
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors"
                >
                  {t.downloadGame || "Descargar juego"}
                </button>
                <button 
                  onClick={() => router.push('/nosotros')} 
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  {t.aboutUs || "Sobre nosotros"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SoportePage;
