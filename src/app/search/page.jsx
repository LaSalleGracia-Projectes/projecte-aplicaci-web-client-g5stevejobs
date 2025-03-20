"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../supabaseClient";

const SearchPage = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const [profiles, setProfiles] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from("perfil")
        .select("*")
        .ilike("usuario", `%${query}%`);

      if (error) {
        setError("Error al buscar perfiles.");
      } else {
        setProfiles(data);
      }
    };

    if (query) {
      fetchProfiles();
    }
  }, [query]);

  return (
    <div className="bg-gray-850 min-h-screen text-white">
      <main className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">Resultados de búsqueda</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {profiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <Link key={profile.id_perfil} href={`/perfil/${profile.usuario}`}>
                <div className="bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition-all cursor-pointer">
                  <img
                    src={profile.avatar || "/images/default-avatar.png"}
                    alt={profile.usuario}
                    className="w-24 h-24 rounded-full object-cover mx-auto"
                  />
                  <h2 className="text-xl font-semibold text-center mt-4">{profile.usuario}</h2>
                  <p className="text-gray-400 text-center mt-2">{profile.descripcion}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No se encontraron perfiles.</p>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
