"use client";

import React, { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import { supabase } from "../../../supabaseClient";

const pinnedTopics = [
  {
    id: "pinned-1",
    slug: "tema-fijado-1",
    title: "Tema Fijado 1",
    topic: "Offtopic",
    username: "Usuario1",
    content: "Contenido del tema fijado 1.",
    posteddate: "2023-12-01T12:00:00Z",
    lastpost: "2023-12-02T12:00:00Z",
    status: "open",
  },
  {
    id: "pinned-2",
    slug: "tema-fijado-2",
    title: "Tema Fijado 2",
    topic: "Bugs",
    username: "Usuario2",
    content: "Contenido del tema fijado 2.",
    posteddate: "2023-12-02T14:30:00Z",
    lastpost: "2023-12-03T14:30:00Z",
    status: "closed",
  },
];

const ForumDiscussionPage = () => {
  const { slug } = useParams();
  const [thread, setThread] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const fetchThread = async () => {
      // Buscar en los hilos fijados primero
      const pinnedThread = pinnedTopics.find(topic => topic.slug === slug);
      if (pinnedThread) {
        setThread(pinnedThread);
        return;
      }

      // Si no es un hilo fijado, buscar en la base de datos
      const { data, error } = await supabase
        .from("threads")
        .select("*")
        .eq("id", slug)
        .single();

      if (error) {
        console.error("Error fetching thread:", error.message);
      } else if (data) {
        setThread(data);
      } else {
        console.error("Thread not found");
      }
    };

    fetchThread();
  }, [slug]);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      setComments([
        ...comments,
        {
          author: "CurrentUser",
          content: newComment,
          postedAt: "Just now",
        },
      ]);
      setNewComment("");
    }
  };

  if (!thread) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Thread not found.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-850 min-h-screen text-white">
      <main className="container mx-auto px-6 py-8">
        {/* Forum Header */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">
            {thread.title}
          </h1>
          <p className="text-gray-400 mb-4">{thread.content}</p>
          <div className="text-sm text-gray-500 flex gap-4">
            <span>Posted by: {thread.username}</span>
            <span>On: {new Date(thread.posteddate).toLocaleDateString()}</span>
            <span>Last post: {new Date(thread.lastpost).toLocaleDateString()}</span>
            <span>Status: {thread.status}</span>
          </div>
        </header>

        {/* Comments Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">
            Comments
          </h2>
          <div className="space-y-4">
            {comments.map((comment, index) => (
              <div
                key={index}
                className="p-4 bg-gray-800 rounded-lg shadow hover:shadow-md transition-all"
              >
                <p className="text-sm text-gray-100">{comment.content}</p>
                <div className="text-xs text-gray-400 mt-2 flex justify-between">
                  <span>By: {comment.author}</span>
                  <span>{comment.postedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Add Comment Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-100 mb-4">
            Add a Comment
          </h2>
          <form onSubmit={handleCommentSubmit} className="flex flex-col gap-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your comment here..."
              className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:ring focus:ring-blue-300 focus:outline-none"
              rows="4"
              id="new-comment"
              name="new-comment"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring focus:ring-blue-300"
            >
              Post Comment
            </button>
          </form>
        </section>

        {/* Back Button */}
        <div className="mt-8">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Back to Forums
          </button>
        </div>
      </main>
    </div>
  );
};

export default ForumDiscussionPage;