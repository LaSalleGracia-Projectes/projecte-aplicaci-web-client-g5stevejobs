"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useLanguage } from "../../context/LanguageContext";
import Image from "next/image";

const ProfileContent = () => {
  const router = useRouter();
  const { user, perfil: authPerfil } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (authPerfil) {
          setProfile(authPerfil);
          setLoading(false);
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from("perfil")
          .select("*")
          .eq("id_perfil", user.id)
          .single();

        if (profileError) throw profileError;

        setProfile(profileData);
      } catch (err) {
        console.error("Error al cargar el perfil:", err);
        setError("No se pudo cargar tu perfil. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user, authPerfil]);

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

  if (error) {
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
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-850">
        <p className="text-gray-100">{t.profileNotFound || "No se encontró el perfil."}</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-850 text-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-2xl p-8 md:p-10 shadow-xl border border-gray-700">
          <div className="flex flex-col md:flex-row gap-10 mb-8">
            <div className="w-full md:w-1/3 flex flex-col items-center">
              <div className="relative mb-4">
                {profile.avatar ? (
                  <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gray-700 shadow-lg">
                    <img
                      src={profile.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-40 h-40 rounded-full flex items-center justify-center text-4xl font-bold bg-blue-600 text-white border-4 border-gray-700 shadow-lg">
                    {profile.usuario ? profile.usuario.charAt(0).toUpperCase() : "?"}
                  </div>
                )}
              </div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white">{profile.usuario}</h2>
                <span className="inline-block px-3 py-1 mt-2 bg-blue-600 rounded-full text-sm font-medium capitalize">
                  {profile.rol}
                </span>
              </div>
              <button
                onClick={() => router.push(`/perfil/${profile.usuario}/editar`)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-500 transition-all duration-300 shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {t.editProfile || "Editar Perfil"}
              </button>
            </div>

            <div className="w-full md:w-2/3">
              <h3 className="text-xl font-semibold mb-6 text-blue-400 border-b border-gray-700 pb-2">
                {t.personalInformation || "Información Personal"}
              </h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    {t.email || "Email"}
                  </label>
                  <div className="p-3 bg-gray-750 rounded-lg text-gray-200 border border-gray-700">
                    {profile.email}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    {t.description || "Descripción"}
                  </label>
                  <div className="p-3 bg-gray-750 rounded-lg text-gray-200 border border-gray-700 min-h-[100px]">
                    {profile.descripcion || t.noDescription || "Sin descripción"}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      {t.registrationDate || "Fecha de Registro"}
                    </label>
                    <div className="p-3 bg-gray-750 rounded-lg text-gray-200 border border-gray-700">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      {t.lastUpdate || "Última Actualización"}
                    </label>
                    <div className="p-3 bg-gray-750 rounded-lg text-gray-200 border border-gray-700">
                      {new Date(profile.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

const MyProfilePage = () => {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
};

export default MyProfilePage;
