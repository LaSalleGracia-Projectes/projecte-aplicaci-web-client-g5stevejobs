"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../supabaseClient";

const CreateTopicPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("Offtopic");
  const [content, setContent] = useState("");
  const [error, setError] = useState(null);
  const [username, setUsername] = useState("");
  const topics = ["Offtopic", "Bugs", "Anuncios", "Feedback"];

  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching username:", error);
        } else {
          setUsername(data.username);
        }
      }
    };

    fetchUsername();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      setError("Title and content are required.");
      return;
    }

    if (!username) {
      setError("Username is required.");
      return;
    }

    const currentDate = new Date();

    const newThread = {
      title,
      topic,
      username,
      content,
      posteddate: currentDate,
      lastpost: currentDate,
      status: "Active",
    };

    console.log("Data to be sent:", newThread);

    try {
      const { data, error } = await supabase
        .from("threads")
        .insert([newThread]);

      if (error) {
        console.error("Error creating topic:", error);
        console.error("Error details:", error.details);
        console.error("Error hint:", error.hint);
        if (error.status === 400) {
          setError("Bad request. Please check your input.");
        } else {
          setError(error.message || "An unknown error occurred");
        }
      } else {
        router.push("/foro");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError(err.message || "An unexpected error occurred");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">You must be logged in to create a topic.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-850 min-h-screen text-white">
      <main className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">Create a New Topic</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-500">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-300">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Topic</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
            >
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
              rows="6"
              required
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring focus:ring-blue-300"
          >
            Create Topic
          </button>
        </form>
      </main>
    </div>
  );
};

export default CreateTopicPage;