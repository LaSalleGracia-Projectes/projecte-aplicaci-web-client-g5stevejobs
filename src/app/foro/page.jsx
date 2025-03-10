"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../supabaseClient"; // Ruta corregida

const ForoPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [threads, setThreads] = useState([]);
  const topicsPerPage = 10;
  const pinnedTopics = [
    {
      title: "Tema Fijado 1",
      topic: "Offtopic",
      username: "Usuario1",
      posteddate: "2023-12-01T12:00:00Z",
    },
    {
      title: "Tema Fijado 2",
      topic: "Bugs",
      username: "Usuario2",
      posteddate: "2023-12-02T14:30:00Z",
    },
  ];

  const topics = ["Todos", "Offtopic", "Bugs", "Anuncios", "Feedback"];

  useEffect(() => {
    const fetchThreads = async () => {
      let query = supabase.from("threads").select("*");

      if (selectedTopic !== "Todos") {
        query = query.eq("topic", selectedTopic);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error al obtener los hilos:", error);
      } else {
        setThreads(data);
      }
    };

    fetchThreads();
  }, [selectedTopic]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const formatLastActivity = (dateString) => {
    const now = new Date();
    const lastActivityDate = new Date(dateString);
    const diff = now - lastActivityDate;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    return `última actividad hace: ${days} días, ${hours} horas y ${minutes} minutos`;
  };

  return (
    <div className="bg-gray-850 min-h-screen text-white">
      <main className="container mx-auto px-6 py-8">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div className="relative flex items-center w-full md:w-1/3">
            <input
              type="text"
              placeholder="Buscar temas..."
              className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring focus:ring-blue-300"
            >
              Filtrar Temas
            </button>
            {isFilterOpen && (
              <div className="absolute mt-2 w-40 bg-white rounded-lg shadow-lg overflow-hidden z-10">
                {topics.map((topic) => (
                  <div
                    key={topic}
                    onClick={() => {
                      setSelectedTopic(topic);
                      setIsFilterOpen(false);
                    }}
                    className={`px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer ${
                      selectedTopic === topic ? "bg-blue-50 text-blue-600" : ""
                    }`}
                  >
                    {topic}
                  </div>
                ))}
              </div>
            )}
          </div>
          {user && (
            <button
              onClick={() => router.push("/foro/create")}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring focus:ring-green-300"
            >
              Crear Tema
            </button>
          )}
        </div>

        {currentPage === 1 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4">Hilos Fijados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pinnedTopics.map((topic, index) => (
                <div
                  key={index}
                  onClick={() => router.push(`/foro/${topic.title.toLowerCase().replace(/\s+/g, '-')}`)}
                  className="p-6 bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all cursor-pointer"
                >
                  <h3 className="text-lg font-semibold mb-2">
                    {topic.title}
                  </h3>
                  <p className="text-gray-500 text-sm">Publicado por {topic.username}</p>
                  <div className="mt-4 flex flex-col items-end text-sm text-gray-500">
                    <p>Publicado el {formatDate(topic.posteddate)}</p>
                  </div>
                  <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                    <span>Tema: {topic.topic}</span>
                    <span>{topic.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-bold mb-4">Otros Hilos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {threads.map((thread, index) => (
              <div
                key={index}
                onClick={() => router.push(`/foro/${thread.title.toLowerCase().replace(/\s+/g, '-')}`)}
                className="p-6 bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all cursor-pointer"
              >
                <h3 className="text-lg font-semibold mb-2">
                  {thread.title}
                </h3>
                <p className="text-gray-500 text-sm">Publicado por {thread.username}</p>
                <div className="mt-4 flex flex-col items-end text-sm text-gray-500">
                  <p>Publicado el {formatDate(thread.posteddate)}</p>
                  <p>{formatLastActivity(thread.lastpost)}</p>
                </div>
                <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                  <span>Tema: {thread.topic}</span>
                  <span>Comentarios: {thread.comments || 0}</span>
                  <span>{thread.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ForoPage;