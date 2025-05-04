"use client";

import React, { useState, useEffect } from "react";
import { db, storage } from "../../firebase";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { supabase } from "../../supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "../../context/LanguageContext";
import Image from "next/image";

const ReportPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reportedUser, setReportedUser] = useState(searchParams.get("user") || "");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  // Verificar Firebase al cargar
  useEffect(() => {
    console.log("Verificando Firebase:", {
      dbExists: !!db,
      storageExists: !!storage,
      collectionRef: !!collection(db, "reports")
    });
  }, []);

  // Razones predefinidas para reportar
  const reportReasons = [
    "Comportamiento tóxico",
    "Contenido inapropiado",
    "Spam",
    "Acoso",
    "Otro"
  ];

  useEffect(() => {
    console.log("Estado de autenticación:", { 
      user: !!user, 
      authLoading, 
      userId: user?.id 
    });

    // Esperar a que se complete la carga de autenticación
    if (authLoading) {
      return;
    }

    // Redirigir si no está autenticado
    if (!user) {
      console.log("Usuario no autenticado, redirigiendo a login");
      router.push('/login');
      return;
    }

    const fetchUserProfile = async () => {
      setIsLoading(true);
      if (user?.id) {
        try {
          console.log("Intentando obtener perfil del usuario:", user.id);
          const { data, error } = await supabase
            .from('perfil')
            .select('usuario')
            .eq('id_perfil', user.id)
            .single();

          if (error) {
            console.error('Error de Supabase al obtener perfil:', error);
            throw error;
          }
          setUserProfile(data);
          console.log("Perfil de usuario cargado:", data);
        } catch (error) {
          console.error('Error al obtener el perfil:', error);
          // No redirigir en caso de error al obtener perfil
          // Solo mostramos el error pero dejamos al usuario en la página
          toast.error("Error al cargar tu perfil. Algunas funciones pueden no estar disponibles.");
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, authLoading, router]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.includes('image/jpeg') && !file.type.includes('image/png')) {
        setError('Solo se permiten imágenes JPG o PNG');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setError('La imagen no debe superar los 5MB');
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  // Función para convertir imagen a base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    console.log("Iniciando envío de reporte...");

    if (!reportedUser || !reason || !description) {
      setError("Los campos Usuario, Razón y Descripción son obligatorios.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Verificar Firebase
      console.log("Estado de Firebase:", {
        dbExists: !!db,
        userExists: !!user,
        userProfile: userProfile
      });

      // Preparar los datos del reporte
      const reportData = {
        reported_user: reportedUser,
        reason,
        description,
        status: "pendiente",
        created_at: new Date().toISOString(),
        reporter_id: user?.id || null,
        reporter_username: userProfile?.usuario || null,
        image_data: null
      };

      // Si hay imagen, convertirla a base64
      if (image) {
        try {
          console.log("Convirtiendo imagen a base64...");
          const base64Image = await convertToBase64(image);
          reportData.image_data = base64Image;
          console.log("Imagen convertida exitosamente");
        } catch (imageError) {
          console.error("Error al procesar la imagen:", imageError);
          // Continuamos sin la imagen si hay error
        }
      }

      console.log("Guardando reporte en Firestore...");
      const docRef = await addDoc(collection(db, "reports"), reportData);
      console.log("Reporte guardado con ID:", docRef.id);

      setSubmitted(true);
      toast.success("Reporte enviado correctamente");
      
      // Redirigir después de 3 segundos
      setTimeout(() => {
        router.push('/foro');
      }, 3000);
    } catch (error) {
      console.error("Error al enviar el reporte:", error);
      setError("Error al enviar el reporte. Por favor, inténtalo de nuevo.");
      toast.error("Error al enviar el reporte");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mostrar estado de carga
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-850">
        <div className="flex flex-col items-center p-8 bg-gray-800 rounded-lg shadow-lg">
          <svg className="animate-spin h-10 w-10 text-red-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-white text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-850 text-white">
      {/* Header with background */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-red-900 to-gray-900 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('/images/abyss-imagen.jpg')] bg-cover bg-center mix-blend-overlay"></div>
        </div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">
            {t.reportUser || "Reportar Usuario"}
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-red-100">
            {t.reportSubtitle || "Ayúdanos a mantener nuestra comunidad segura reportando comportamientos inadecuados."}
          </p>
        </div>
      </div>

      {/* Report Form Section */}
      <div className="max-w-4xl mx-auto px-4 py-12 -mt-10">
        <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-2xl p-8 md:p-10 shadow-xl border border-gray-700">
          {submitted ? (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">{t.thankYouForReport || "¡Gracias por tu reporte!"}</h2>
              <p className="text-gray-300 mb-8">{t.reviewSoon || "Revisaremos tu reporte lo antes posible."}</p>
              <p className="text-gray-400 text-sm">{t.redirectingToForum || "Redirigiendo al foro..."}</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row items-start gap-10 mb-8">
                <div className="w-full md:w-2/3">
                  <h2 className="text-2xl font-semibold mb-6 text-red-400">{t.reportForm || "Formulario de reporte"}</h2>
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
                      <label className="block mb-2 text-gray-300 text-sm font-medium">{t.userToReport || "Usuario a reportar"}:</label>
                      <input
                        type="text"
                        value={reportedUser}
                        onChange={(e) => setReportedUser(e.target.value)}
                        className="w-full border border-gray-600 rounded-lg p-3 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        disabled={isSubmitting}
                        placeholder={t.usernamePlaceholder || "Nombre del usuario"}
                      />
                    </div>
                    
                    <div>
                      <label className="block mb-2 text-gray-300 text-sm font-medium">{t.reason || "Razón"}:</label>
                      <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full border border-gray-600 rounded-lg p-3 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        disabled={isSubmitting}
                      >
                        <option value="">{t.selectReason || "Selecciona una razón"}</option>
                        {reportReasons.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block mb-2 text-gray-300 text-sm font-medium">{t.description || "Descripción"}:</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border border-gray-600 rounded-lg p-3 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        rows="6"
                        disabled={isSubmitting}
                        placeholder={t.descriptionPlaceholder || "Describe el problema en detalle..."}
                      />
                      <div className="text-right mt-1 text-sm text-gray-400">
                        {description.length} / 500 {t.characters || "caracteres"}
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 text-gray-300 text-sm font-medium">{t.evidence || "Evidencia"} ({t.optional || "opcional"}):</label>
                      <div className="border border-dashed border-gray-600 rounded-lg p-4 bg-gray-700 text-center hover:border-red-400 transition-colors">
                        <input
                          type="file"
                          accept="image/jpeg,image/png"
                          onChange={handleImageChange}
                          className="hidden"
                          id="file-upload"
                          disabled={isSubmitting}
                        />
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                          </svg>
                          <span className="text-gray-300">{imagePreview ? "Cambiar imagen" : t.uploadImage || "Subir imagen"}</span>
                          <span className="text-xs text-gray-400 mt-1">JPG, PNG (máx. 5MB)</span>
                        </label>
                      </div>
                      {imagePreview && (
                        <div className="mt-4 relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-w-full h-auto rounded-lg border border-gray-600"
                          />
                          <button 
                            type="button" 
                            onClick={() => {
                              setImage(null);
                              setImagePreview(null);
                            }}
                            className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>

                    <button 
                      type="submit"
                      className={`w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-500 transition-all duration-300 shadow-lg ${
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
                        t.sendReport || "Enviar reporte"
                      )}
                    </button>
                  </form>
                </div>
                
                <div className="w-full md:w-1/3 bg-gray-750 p-6 rounded-xl border border-gray-700">
                  <h3 className="text-xl font-semibold mb-4 text-red-400">{t.reportGuidelines || "Directrices de reporte"}</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="bg-red-600 p-2 rounded-full mr-3 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white text-sm">{t.guidelineSpecific || "Sé específico"}</p>
                        <p className="text-gray-400 text-xs mt-1">{t.guidelineSpecificDesc || "Proporciona detalles claros que nos ayuden a entender el problema."}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-red-600 p-2 rounded-full mr-3 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white text-sm">{t.guidelineEvidence || "Añade pruebas"}</p>
                        <p className="text-gray-400 text-xs mt-1">{t.guidelineEvidenceDesc || "Las capturas de pantalla o imágenes ayudan a verificar más rápido el reporte."}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-red-600 p-2 rounded-full mr-3 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white text-sm">{t.guidelineTime || "Tiempo de resolución"}</p>
                        <p className="text-gray-400 text-xs mt-1">{t.guidelineTimeDesc || "Los reportes son revisados en un plazo de 24-48 horas."}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 p-4 bg-red-900 bg-opacity-20 rounded-lg border border-red-800">
                    <h4 className="text-lg font-medium text-red-400 mb-2">{t.attention || "Atención"}</h4>
                    <p className="text-gray-300 text-sm">
                      {t.falseReports || "Los reportes falsos o malintencionados pueden resultar en sanciones para tu cuenta. Por favor, asegúrate de que tu reporte sea veraz y objetivo."}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Common Reports Section */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <h2 className="text-3xl font-bold mb-8 text-center text-red-400">{t.commonReportTypes || "Tipos comunes de reportes"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-all hover:bg-gray-750 border border-gray-700">
            <div className="bg-red-600 w-12 h-12 rounded-lg mb-4 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">{t.inappropriateContent || "Contenido inapropiado"}</h3>
            <p className="text-gray-300 text-sm">{t.inappropriateContentDesc || "Reporta contenido que incluya lenguaje ofensivo, violento, pornográfico o ilegal."}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-all hover:bg-gray-750 border border-gray-700">
            <div className="bg-red-600 w-12 h-12 rounded-lg mb-4 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">{t.harassment || "Acoso"}</h3>
            <p className="text-gray-300 text-sm">{t.harassmentDesc || "Comportamientos intimidatorios, amenazas o cualquier forma de acoso hacia otros miembros."}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-all hover:bg-gray-750 border border-gray-700">
            <div className="bg-red-600 w-12 h-12 rounded-lg mb-4 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">{t.toxicBehavior || "Comportamiento tóxico"}</h3>
            <p className="text-gray-300 text-sm">{t.toxicBehaviorDesc || "Actitudes que afectan negativamente a la comunidad como insultos, provocaciones o comportamiento disruptivo."}</p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ReportPage; 