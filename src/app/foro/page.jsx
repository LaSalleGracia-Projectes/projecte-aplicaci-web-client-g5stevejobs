"use client";

import React, { useState } from "react";

const ForoPage = () => {
  const [selectedTopic, setSelectedTopic] = useState("All");
  const pinnedTopics = [
    {
      title: "Pinned Topic 1",
      topic: "Offtopic",
      username: "Username1",
      upvotes: 222,
      comments: 222,
      postedDate: "xx of December of 202X",
      lastPost: "X time ago",
      status: "Active",
    },
    {
      title: "Pinned Topic 2",
      topic: "Bugs",
      username: "Username2",
      upvotes: 333,
      comments: 333,
      postedDate: "xx of January of 202X",
      lastPost: "Y time ago",
      status: "Inactive",
    },
  ];

  const otherTopics = [
    {
      title: "Other Topic 1",
      topic: "Offtopic",
      username: "Username3",
      upvotes: 111,
      comments: 111,
      postedDate: "xx of February of 202X",
      lastPost: "Z time ago",
      status: "Active",
    },
    {
      title: "Other Topic 2",
      topic: "Bugs",
      username: "Username4",
      upvotes: 444,
      comments: 444,
      postedDate: "xx of March of 202X",
      lastPost: "W time ago",
      status: "Inactive",
    },
  ];

  const topics = ["All", "Offtopic", "Bugs", "Announcements", "Feedback"];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Search and Filters */}
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
              onClick={() => setSelectedTopic((prev) => (prev === "All" ? "" : "All"))}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring focus:ring-blue-300"
            >
              Filter Topics
            </button>
            <div className="absolute mt-2 w-40 bg-white rounded-lg shadow-lg overflow-hidden">
              {topics.map((topic) => (
                <div
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className={`px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer ${
                    selectedTopic === topic ? "bg-blue-50 text-blue-600" : ""
                  }`}
                >
                  {topic}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pinned Topics */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Pinned Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pinnedTopics.map((topic, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-all"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {topic.title}
                </h3>
                <p className="text-gray-500 text-sm">Posted by {topic.username}</p>
                <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                  <span>Upvotes: {topic.upvotes}</span>
                  <span>Comments: {topic.comments}</span>
                  <span>{topic.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Other Topics */}
        <section className="mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Other Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {otherTopics
              .filter((topic) => selectedTopic === "All" || topic.topic === selectedTopic)
              .map((topic, index) => (
                <div
                  key={index}
                  className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-all"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {topic.title}
                  </h3>
                  <p className="text-gray-500 text-sm">Posted by {topic.username}</p>
                  <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                    <span>Upvotes: {topic.upvotes}</span>
                    <span>Comments: {topic.comments}</span>
                    <span>{topic.status}</span>
                  </div>
                </div>
              ))}
          </div>
        </section>

        <div className="flex justify-center mt-8">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Load More
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-sm text-center text-gray-600 bg-gray-100">
        &copy; 2025 Foro+. All rights reserved.
      </footer>
    </div>
  );
};

export default ForoPage;