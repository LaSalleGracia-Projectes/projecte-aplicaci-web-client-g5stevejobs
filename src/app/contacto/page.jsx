"use client";

import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { supabase } from "../../supabaseClient";
import { useLanguage } from "../../context/LanguageContext";
import Image from "next/image";

const ContactoPage = () => {
  const [email, setEmail] = useState("");
  const [tema, setTema] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const { user } = useAuth();
  const { t } = useLanguage(); // Get translations

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('perfil')
            .select('usuario, email')
            .eq('id_perfil', user.id)
            .single();

          if (error) throw error;
          setUserProfile(data);
          if (data?.email) setEmail(data.email);
        } catch (error) {
          console.error('Error al obtener el perfil:', error);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !tema || !descripcion) {
      setError(t.allFieldsRequired || "Todos los campos son obligatorios.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t.invalidEmailFormat || "Email con formato inválido.");
      return;
    }

    setIsSubmitting(true);

    try {
      const ticketData = {
        email,
        tema,
        descripcion,
        estado: "pendiente",
        fecha_creacion: new Date(),
        id_usuario: user?.id || null,
        usuario: userProfile?.usuario || null
      };

      await addDoc(collection(db, "tickets_contacto"), ticketData);

      // Mark as submitted and show success
      setSubmitted(true);
      toast.success(t.messageSentSuccess || "Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.");
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setEmail(userProfile?.email || "");
        setTema("");
        setDescripcion("");
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      setError(t.errorSendingMessage || "Error al enviar el mensaje. Por favor, inténtalo de nuevo.");
      toast.error(t.errorSendingMessage || "Error al enviar el mensaje");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-850 text-white">
      {/* Header with background */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-purple-900 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('/images/abyss-imagen.jpg')] bg-cover bg-center mix-blend-overlay"></div>
        </div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">
            {t.contactUs || "Contacta con nosotros"}
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-blue-100">
            {t.contactSubtitle || "¿Tienes alguna pregunta o sugerencia? Estamos aquí para ayudarte."}
          </p>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="max-w-4xl mx-auto px-4 py-12 -mt-10">
        <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-2xl p-8 md:p-10 shadow-xl border border-gray-700">
          {submitted ? (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">{t.thankYouForMessage || "¡Gracias por tu mensaje!"}</h2>
              <p className="text-gray-300 mb-8">{t.willReplyASAP || "Te responderemos lo antes posible."}</p>
              <button 
                onClick={() => {
                  setEmail(userProfile?.email || "");
                  setTema("");
                  setDescripcion("");
                  setSubmitted(false);
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg transition-all duration-300"
              >
                {t.sendAnotherMessage || "Enviar otro mensaje"}
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row items-start gap-10 mb-8">
                <div className="w-full md:w-2/3">
                  <h2 className="text-2xl font-semibold mb-6 text-blue-400">{t.sendUsMessage || "Envíanos un mensaje"}</h2>
                  {error && (
                    <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6 animate-pulse">
                      <div className="flex">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {error}
                      </div>
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block mb-2 text-gray-300 text-sm font-medium">{t.email || "Email"}:</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-gray-600 rounded-lg p-3 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        disabled={isSubmitting}
                        placeholder={t.emailPlaceholder || "tu@email.com"}
                      />
                    </div>
                    
                    <div>
                      <label className="block mb-2 text-gray-300 text-sm font-medium">{t.subject || "Tema"}:</label>
                      <input
                        type="text"
                        value={tema}
                        onChange={(e) => setTema(e.target.value)}
                        className="w-full border border-gray-600 rounded-lg p-3 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        disabled={isSubmitting}
                        placeholder={t.subjectPlaceholder || "Asunto de tu mensaje"}
                      />
                    </div>
                    
                    <div>
                      <label className="block mb-2 text-gray-300 text-sm font-medium">{t.description || "Descripción"}:</label>
                      <textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        className="w-full border border-gray-600 rounded-lg p-3 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        rows="6"
                        disabled={isSubmitting}
                        placeholder={t.descriptionPlaceholder || "Describe tu consulta, problema o sugerencia..."}
                      />
                      <div className="text-right mt-1 text-sm text-gray-400">
                        {descripcion.length} / 500 {t.characters || "caracteres"}
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-500 transition-all duration-300 shadow-lg ${
                        isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'
                      }`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t.sending || "Enviando..."}
                        </span>
                      ) : (
                        t.sendMessage || "Enviar mensaje"
                      )}
                    </button>
                  </form>
                </div>
                
                <div className="w-full md:w-1/3 bg-gray-750 p-6 rounded-xl border border-gray-700">
                  <h3 className="text-xl font-semibold mb-4 text-blue-400">{t.contactInfo || "Información de contacto"}</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="bg-blue-600 p-2 rounded-full mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">{t.email || "Email"}:</p>
                        <p className="text-white">support@theabyss.com</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-blue-600 p-2 rounded-full mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">{t.responseTime || "Tiempo de respuesta"}:</p>
                        <p className="text-white">{t.within24Hours || "En menos de 24 horas"}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-3 text-blue-400">{t.followUs || "Síguenos"}</h3>
                    <div className="flex space-x-3">
                      <a href="#" className="bg-gray-700 hover:bg-blue-600 p-2 rounded-full transition-colors">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                        </svg>
                      </a>
                      <a href="#" className="bg-gray-700 hover:bg-blue-600 p-2 rounded-full transition-colors">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                        </svg>
                      </a>
                      <a href="#" className="bg-gray-700 hover:bg-blue-600 p-2 rounded-full transition-colors">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-10 text-center text-blue-400">{t.faq || "Preguntas frecuentes"}</h2>
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-all hover:bg-gray-750 border border-gray-700">
            <h3 className="text-xl font-semibold mb-2">{t.faqQuestion1 || "¿Cómo puedo descargar el juego?"}</h3>
            <p className="text-gray-300">{t.faqAnswer1 || "Puedes descargar el juego directamente desde nuestra página principal haciendo clic en el botón 'Descargar ahora'."}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-all hover:bg-gray-750 border border-gray-700">
            <h3 className="text-xl font-semibold mb-2">{t.faqQuestion2 || "¿Cuáles son los requisitos mínimos?"}</h3>
            <p className="text-gray-300">{t.faqAnswer2 || "The Abyss requiere al menos 4GB de RAM, Windows 10 o posterior, y 2GB de espacio en disco."}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-all hover:bg-gray-750 border border-gray-700">
            <h3 className="text-xl font-semibold mb-2">{t.faqQuestion3 || "¿Cómo reporto un error en el juego?"}</h3>
            <p className="text-gray-300">{t.faqAnswer3 || "Puedes reportar errores a través de este formulario de contacto o directamente en nuestro foro en la sección de 'Reportes'."}</p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ContactoPage;
