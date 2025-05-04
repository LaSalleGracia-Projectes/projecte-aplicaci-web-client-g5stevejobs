"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../../../supabaseClient";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "../../../../context/LanguageContext";

const EditProfilePage = () => {
  const { username } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          setError(t.mustBeLoggedIn || "Debes estar loggeado para editar tu perfil.");
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from("perfil")
          .select("*")
          .eq("usuario", username)
          .single();

        if (profileError) throw profileError;

        if (user.id !== profileData.id_perfil) {
          setError(t.noPermissionEdit || "No tienes permiso para editar este perfil.");
          return;
        }

        setProfile(profileData);
        if (profileData.avatar) {
          setAvatarPreview(profileData.avatar);
        }
      } catch (err) {
        console.error("Error al cargar el perfil:", err);
        setError(t.errorLoadingProfile || "No se pudo cargar el perfil. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, t]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validación básica del archivo
    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setError(t.imageFormatError || "El archivo debe ser una imagen PNG o JPG.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB max
      setError(t.imageSizeError || "La imagen no debe superar los 5MB.");
      return;
    }

    setAvatarFile(file);
    
    // Crear una vista previa
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    setError(null);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      let avatarUrl = profile.avatar;

      // Subir la imagen del avatar si hay una nueva
      if (avatarFile) {
        const fileName = `avatar-${profile.id_perfil}-${Date.now()}`;
        const filePath = `${profile.id_perfil}/${fileName}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatarFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          console.error("Error al subir la imagen:", uploadError);
          throw new Error(t.imageUploadError || "No se pudo subir la imagen. Por favor, intenta de nuevo.");
        }

        avatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${filePath}`;
      }

      const { error: updateError } = await supabase
        .from("perfil")
        .update({
          usuario: profile.usuario,
          descripcion: profile.descripcion,
          avatar: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id_perfil", profile.id_perfil);

      if (updateError) throw updateError;

      setSuccess(t.profileUpdated || "Perfil actualizado con éxito.");
      setTimeout(() => {
        router.push(`/perfil/${profile.usuario}`);
      }, 2000);
    } catch (err) {
      console.error("Error al actualizar el perfil:", err);
      setError(err.message || t.updateProfileError || "No se pudo actualizar el perfil. Por favor, intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-850">
        <div className="flex flex-col items-center p-8 bg-gray-800 rounded-lg shadow-lg">
          <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-white text-lg">{t.loadingProfile || "Cargando perfil..."}</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-850">
        <div className="bg-red-900/20 border border-red-600 text-red-200 px-6 py-4 rounded-lg max-w-md">
          <div className="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <strong className="font-semibold text-red-300">{t.error || "Error"}: </strong>
          </div>
          <span className="block">{error}</span>
          <button
            onClick={() => router.push('/perfil')}
            className="mt-4 bg-red-800 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-all duration-300"
          >
            {t.backToProfile || "Volver al perfil"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-850 text-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-2xl p-8 md:p-10 shadow-xl border border-gray-700">
          {success && (
            <div className="bg-green-900/20 border border-green-600 text-green-200 px-4 py-3 rounded-lg mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {success}
            </div>
          )}
          
          {error && profile && (
            <div className="bg-red-900/20 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}
          
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-10">
              {/* Avatar Section */}
              <div className="w-full md:w-1/3">
                <div className="flex flex-col items-center">
                  <h3 className="text-xl font-semibold mb-4 text-blue-400">
                    {t.profilePicture || "Foto de Perfil"}
                  </h3>
                  <div className="mb-6 relative">
                    <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gray-700 shadow-lg bg-gray-700 flex items-center justify-center">
                      {avatarPreview ? (
                        <img 
                          src={avatarPreview} 
                          alt="Avatar Preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-5xl font-bold text-gray-500">
                          {profile?.usuario ? profile.usuario.charAt(0).toUpperCase() : "?"}
                        </span>
                      )}
                    </div>
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarFile(null);
                          setAvatarPreview(profile.avatar || null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="w-full">
                    <label className="block border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-blue-500 transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-300">
                        {t.selectImage || "Seleccionar imagen"}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG (máx. 5MB)</p>
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Form Fields */}
              <div className="w-full md:w-2/3">
                <h3 className="text-xl font-semibold mb-6 text-blue-400 border-b border-gray-700 pb-2">
                  {t.personalDetails || "Detalles Personales"}
                </h3>
                
                <div className="space-y-5">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">
                      {t.username || "Nombre de Usuario"}:
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={profile?.usuario || ""}
                      onChange={(e) => setProfile({ ...profile, usuario: e.target.value })}
                      className="w-full border border-gray-600 rounded-lg p-3 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                      disabled={submitting}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                      {t.email || "Email"}:
                    </label>
                    <div className="w-full border border-gray-600 rounded-lg p-3 bg-gray-750 text-gray-300">
                      {profile?.email || ""}
                      <p className="text-xs text-gray-500 mt-1">{t.emailNotEditable || "El email no se puede editar"}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-1">
                      {t.description || "Descripción"}:
                    </label>
                    <textarea
                      id="description"
                      value={profile?.descripcion || ""}
                      onChange={(e) => setProfile({ ...profile, descripcion: e.target.value })}
                      className="w-full border border-gray-600 rounded-lg p-3 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      rows="4"
                      disabled={submitting}
                      placeholder={t.descriptionPlaceholder || "Escribe una breve descripción sobre ti..."}
                    />
                    <div className="text-right mt-1 text-sm text-gray-400">
                      {profile?.descripcion?.length || 0} / 250 {t.characters || "caracteres"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={() => router.push(`/perfil/${profile.usuario}`)}
                className="py-3 px-6 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-300"
                disabled={submitting}
              >
                {t.cancel || "Cancelar"}
              </button>
              <button
                type="submit"
                className={`py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all duration-300 flex items-center justify-center gap-2 ${
                  submitting ? "opacity-70 cursor-not-allowed" : "hover:shadow-lg hover:shadow-blue-600/20"
                }`}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t.saving || "Guardando..."}
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t.saveChanges || "Guardar Cambios"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default EditProfilePage;
