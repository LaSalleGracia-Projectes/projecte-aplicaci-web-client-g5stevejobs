"use client";

import React, { useEffect, useState } from "react";

const ForumDetailPage = ({ params }) => {
  const { slug } = params;

  const [forumData, setForumData] = useState(null);

  const forums = {
    offtopic: {
      title: "Offtopic Discussions",
      description: "A place to talk about anything and everything.",
      topics: [
        { title: "Random thoughts", comments: 12, upvotes: 40 },
        { title: "Movies to watch", comments: 20, upvotes: 55 },
      ],
    },
    bugs: {
      title: "Bug Reports",
      description: "Report and discuss bugs in our platform.",
      topics: [
        { title: "Login issue", comments: 8, upvotes: 30 },
        { title: "UI glitches", comments: 15, upvotes: 50 },
      ],
    },
    announcements: {
      title: "Announcements",
      description: "Stay updated with our latest news and updates.",
      topics: [
        { title: "New Features", comments: 25, upvotes: 100 },
        { title: "Upcoming Events", comments: 10, upvotes: 60 },
      ],
    },
  };

  useEffect(() => {
    setForumData(forums[slug] || null);
  }, [slug]);

  if (!forumData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Forum not found.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{forumData.title}</h1>
        <p className="text-gray-600 mb-6">{forumData.description}</p>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {forumData.topics.map((topic, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-all"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{topic.title}</h3>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Comments: {topic.comments}</span>
                  <span>Upvotes: {topic.upvotes}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ForumDetailPage;
