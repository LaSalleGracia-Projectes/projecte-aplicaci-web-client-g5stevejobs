"use client";

import React, { useState, useEffect } from "react";
import { db, storage } from "../../firebase";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { supabase } from "../../supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";

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
  const [userProfile, setUserProfile] = useState(null);
  const { user } = useAuth();

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
    // Redirigir si no está autenticado
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('perfil')
            .select('usuario')
            .eq('id_perfil', user.id)
            .single();

          if (error) throw error;
          setUserProfile(data);
          console.log("Perfil de usuario cargado:", data);
        } catch (error) {
          console.error('Error al obtener el perfil:', error);
        }
      }
    };

    fetchUserProfile();
  }, [user, router]);

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

      toast.success("Reporte enviado correctamente");
      router.push('/foro');
    } catch (error) {
      console.error("Error al enviar el reporte:", error);
      setError("Error al enviar el reporte. Por favor, inténtalo de nuevo.");
      toast.error("Error al enviar el reporte");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-850">
      <div className="bg-gray-800 p-8 rounded shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-100">Reportar Usuario</h1>
        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-gray-300">Usuario a reportar:</label>
            <input
              type="text"
              value={reportedUser}
              onChange={(e) => setReportedUser(e.target.value)}
              className="w-full border border-gray-600 rounded p-2 bg-gray-700 text-gray-100 focus:outline-none focus:border-blue-500"
              disabled={isSubmitting}
              placeholder="Nombre del usuario"
            />
          </div>
          
          <div>
            <label className="block mb-2 text-gray-300">Razón:</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-600 rounded p-2 bg-gray-700 text-gray-100 focus:outline-none focus:border-blue-500"
              disabled={isSubmitting}
            >
              <option value="">Selecciona una razón</option>
              {reportReasons.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block mb-2 text-gray-300">Descripción:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-600 rounded p-2 bg-gray-700 text-gray-100 focus:outline-none focus:border-blue-500"
              rows="6"
              disabled={isSubmitting}
              placeholder="Describe el problema en detalle..."
            />
          </div>

          <div>
            <label className="block mb-2 text-gray-300">Evidencia (opcional):</label>
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleImageChange}
              className="w-full border border-gray-600 rounded p-2 bg-gray-700 text-gray-100 focus:outline-none focus:border-blue-500"
              disabled={isSubmitting}
            />
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full h-auto rounded"
                />
              </div>
            )}
          </div>

          <button 
            type="submit"
            className={`w-full bg-red-600 text-white py-3 px-4 rounded hover:bg-red-700 transition-colors ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </span>
            ) : (
              "Enviar Reporte"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportPage; 