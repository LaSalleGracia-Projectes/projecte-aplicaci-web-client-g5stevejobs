"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useRouter } from "next/navigation";

const MyProfilePage = () => {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Obtener el usuario actual
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          setError("Debes estar loggeado para ver tu perfil.");
          return;
        }

        // Obtener el perfil del usuario actual
        const { data: profileData, error: profileError } = await supabase
          .from("perfil")
          .select("*")
          .eq("id_perfil", user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        setProfile(profileData);
      } catch (err) {
        console.error("Error al cargar el perfil:", err);
        setError("No se pudo cargar tu perfil. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-850">
        <p className="text-gray-100">Cargando perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-850">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-850">
      <div className="bg-gray-800 p-8 rounded shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-100 mb-4">
          Mi Perfil
        </h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Nombre de Usuario
            </label>
            <div className="mt-1 p-2 bg-gray-700 rounded text-gray-100">
              {profile.usuario}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <div className="mt-1 p-2 bg-gray-700 rounded text-gray-100">
              {profile.email}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Rol
            </label>
            <div className="mt-1 p-2 bg-gray-700 rounded text-gray-100 capitalize">
              {profile.rol}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Fecha de Registro
            </label>
            <div className="mt-1 p-2 bg-gray-700 rounded text-gray-100">
              {new Date(profile.created_at).toLocaleDateString()}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Última Actualización
            </label>
            <div className="mt-1 p-2 bg-gray-700 rounded text-gray-100">
              {new Date(profile.updated_at).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={() => router.push("/")}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyProfilePage;
