"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import { useParams, useRouter } from "next/navigation";

const ProfilePage = () => {
  const { username } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: user, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error("Error al obtener el usuario actual:", userError);
          throw new Error("No se pudo obtener el usuario actual.");
        }

        const { data: profileData, error: profileError } = await supabase
          .from("perfil")
          .select("*")
          .eq("usuario", username)
          .single();

        if (profileError) {
          console.error("Error al obtener el perfil:", profileError);
          throw new Error(profileError.message || "No se pudo obtener el perfil.");
        }

        setProfile(profileData);
        setIsOwnProfile(user?.id === profileData?.id_perfil);
      } catch (err) {
        console.error("Error al cargar el perfil:", err);
        setError(err.message || "No se pudo cargar el perfil. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-100">Perfil de {profile.usuario}</h1>
          {isOwnProfile && (
            <button
              onClick={() => router.push(`/perfil/${username}/editar`)}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500"
            >
              Editar Perfil
            </button>
          )}
        </div>
        <div className="space-y-4">
          {profile.avatar && (
            <div className="flex justify-center">
              <img
                src={profile.avatar}
                alt="Avatar"
                className="w-32 h-32 rounded-full object-cover border-2 border-gray-700"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-300">Nombre de Usuario</label>
            <div className="mt-1 p-2 bg-gray-700 rounded text-gray-100">{profile.usuario}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <div className="mt-1 p-2 bg-gray-700 rounded text-gray-100">{profile.email}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Rol</label>
            <div className="mt-1 p-2 bg-gray-700 rounded text-gray-100 capitalize">{profile.rol}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Descripción</label>
            <div className="mt-1 p-2 bg-gray-700 rounded text-gray-100">{profile.descripcion || "Sin descripción"}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Fecha de Registro</label>
            <div className="mt-1 p-2 bg-gray-700 rounded text-gray-100">
              {new Date(profile.created_at).toLocaleDateString()}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Última Actualización</label>
            <div className="mt-1 p-2 bg-gray-700 rounded text-gray-100">
              {new Date(profile.updated_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
