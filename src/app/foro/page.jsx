"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../supabaseClient"; // Ruta corregida

const ForoPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [threads, setThreads] = useState([]);
  const topicsPerPage = 10;
  const pinnedTopics = [
    {
      title: "Pinned Topic 1",
      topic: "Offtopic",
      username: "Username1",
      upvotes: 222,
      comments: 222,
      posteddate: "xx of December of 202X",
      lastpost: "X time ago",
      status: "Active",
    },
    {
      title: "Pinned Topic 2",
      topic: "Bugs",
      username: "Username2",
      upvotes: 333,
      comments: 333,
      posteddate: "xx of January of 202X",
      lastpost: "Y time ago",
      status: "Inactive",
    },
  ];

  const topics = ["All", "Offtopic", "Bugs", "Announcements", "Feedback"];

  useEffect(() => {
    const fetchThreads = async () => {
      let query = supabase.from("threads").select("*");

      if (selectedTopic !== "All") {
        query = query.eq("topic", selectedTopic);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching threads:", error);
      } else {
        setThreads(data);
      }
    };

    fetchThreads();
  }, [selectedTopic]);

  return (
    <div className="bg-gray-850 min-h-screen text-white">
      <main className="container mx-auto px-6 py-8">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div className="relative flex items-center w-full md:w-1/3">
            <input
              type="text"
              placeholder="Search topics..."
              className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring focus:ring-blue-300"
            >
              Filter Topics
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
              Create Topic
            </button>
          )}
        </div>

        {currentPage === 1 && (
          <section>
            <h2 className="text-xl font-bold mb-4">Pinned Topics</h2>
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
                  <p className="text-gray-500 text-sm">Posted by {topic.username}</p>
                  <div className="mt-4 flex flex-col items-end text-sm text-gray-500">
                    <p>Posted on {topic.posteddate}</p>
                    <p>Last activity {topic.lastpost}</p>
                  </div>
                  <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                    <span>Upvotes: {topic.upvotes}</span>
                    <span>Comments: {topic.comments}</span>
                    <span>{topic.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-bold mb-4">All Topics</h2>
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
                <p className="text-gray-500 text-sm">Posted by {thread.username}</p>
                <div className="mt-4 flex flex-col items-end text-sm text-gray-500">
                  <p>Posted on {thread.posteddate}</p>
                  <p>Last activity {thread.lastpost}</p>
                </div>
                <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                  <span>Upvotes: {thread.upvotes}</span>
                  <span>Comments: {thread.comments}</span>
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