"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../../../supabaseClient";
import { useParams, useRouter } from "next/navigation";

const EditProfilePage = () => {
  const { username } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          setError("Debes estar loggeado para editar tu perfil.");
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from("perfil")
          .select("*")
          .eq("usuario", username)
          .single();

        if (profileError) throw profileError;

        if (user.id !== profileData.id_perfil) {
          setError("No tienes permiso para editar este perfil.");
          return;
        }

        setProfile(profileData);
      } catch (err) {
        console.error("Error al cargar el perfil:", err);
        setError("No se pudo cargar el perfil. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      let avatarUrl = profile.avatar;

      // Validar el archivo de imagen
      if (avatarFile) {
        const validTypes = ["image/png", "image/jpeg"];
        if (!validTypes.includes(avatarFile.type)) {
          setError("El archivo debe ser una imagen PNG o JPG.");
          return;
        }

        // Subir la imagen del avatar
        const filePath = `${profile.id_perfil}/${avatarFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatarFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          console.error("Error al subir la imagen:", uploadError);
          throw new Error("No se pudo subir la imagen. Por favor, intenta de nuevo.");
        }

        avatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${filePath}`;
      }

      const { error: updateError } = await supabase
        .from("perfil")
        .update({
          usuario: profile.usuario,
          email: profile.email,
          descripcion: profile.descripcion,
          avatar: avatarUrl,
        })
        .eq("id_perfil", profile.id_perfil);

      if (updateError) throw updateError;

      setSuccess("Perfil actualizado con éxito.");
      setTimeout(() => {
        router.push(`/perfil/${profile.usuario}`);
      }, 2000);
    } catch (err) {
      console.error("Error al actualizar el perfil:", err);
      setError(err.message || "No se pudo actualizar el perfil. Por favor, intenta de nuevo.");
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-100 mb-4">Editar Perfil</h1>
        {success && <p className="text-green-500 mb-4">{success}</p>}
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Nombre de Usuario</label>
            <input
              type="text"
              value={profile.usuario}
              onChange={(e) => setProfile({ ...profile, usuario: e.target.value })}
              className="w-full border border-gray-600 rounded p-2 bg-gray-700 text-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full border border-gray-600 rounded p-2 bg-gray-700 text-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Descripción</label>
            <textarea
              value={profile.descripcion || ""}
              onChange={(e) => setProfile({ ...profile, descripcion: e.target.value })}
              className="w-full border border-gray-600 rounded p-2 bg-gray-700 text-gray-100"
              rows="4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Avatar</label>
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={(e) => setAvatarFile(e.target.files[0])}
              className="w-full text-gray-300"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500"
          >
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
