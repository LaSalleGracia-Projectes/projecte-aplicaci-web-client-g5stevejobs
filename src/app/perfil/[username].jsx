"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../supabaseClient";

const ProfilePage = () => {
  const { username } = useParams();
  const { user, usuario } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [logros, setLogros] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("perfil")
        .select("*")
        .eq("usuario", username)
        .single();

      if (error) {
        setError("Perfil no encontrado.");
      } else {
        setProfile(data);
        setAvatar(data.avatar);
        setDescripcion(data.descripcion);
        setIsOwner(user && user.id === data.id_perfil);
      }
    };

    const fetchLogros = async () => {
      const { data, error } = await supabase
        .from("logro")
        .select("*")
        .eq("id_perfil", profile.id_perfil);

      if (error) {
        console.error("Error fetching logros:", error);
      } else {
        setLogros(data);
      }
    };

    fetchProfile();
    if (profile) {
      fetchLogros();
    }
  }, [username, user, profile]);

  const handleSave = async () => {
    const { error } = await supabase
      .from("perfil")
      .update({ avatar, descripcion })
      .eq("id_perfil", profile.id_perfil);

    if (error) {
      setError("Error al actualizar el perfil.");
    } else {
      setError(null);
      alert("Perfil actualizado con éxito.");
    }
  };

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!profile) {
    return <div className="text-center text-gray-500">Cargando perfil...</div>;
  }

  return (
    <div className="bg-gray-850 min-h-screen text-white">
      <main className="container mx-auto px-6 py-8">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
          <div className="flex items-center space-x-4">
            <img
              src={avatar || "/images/default-avatar.png"}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover"
            />
            <div>
              <h1 className="text-3xl font-bold">{profile.usuario}</h1>
              {isOwner && (
                <input
                  type="file"
                  onChange={(e) => setAvatar(URL.createObjectURL(e.target.files[0]))}
                  className="mt-2"
                />
              )}
            </div>
          </div>
          <div className="mt-6">
            <h2 className="text-xl font-semibold">Descripción</h2>
            {isOwner ? (
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full mt-2 p-2 border border-gray-600 rounded bg-gray-700 text-gray-100"
                rows="4"
              />
            ) : (
              <p className="mt-2 text-gray-300">{descripcion}</p>
            )}
          </div>
          {isOwner && (
            <button
              onClick={handleSave}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
            >
              Guardar cambios
            </button>
          )}
        </div>
        <div className="mt-8">
          <h2 className="text-2xl font-bold">Logros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {logros.map((logro) => (
              <div key={logro.id_logro} className="bg-gray-800 p-4 rounded-lg shadow">
                <img
                  src={logro.imagen_logro || "/images/default-logro.png"}
                  alt={logro.nombre_logro}
                  className="w-full h-32 object-cover rounded"
                />
                <h3 className="mt-2 text-xl font-semibold">{logro.nombre_logro}</h3>
                <p className="mt-1 text-gray-400">{logro.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
