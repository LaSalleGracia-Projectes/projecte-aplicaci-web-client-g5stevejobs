"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const ForoPage = () => {
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const topicsPerPage = 10;
  const router = useRouter();
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
    {
      title: "Other Topic 3",
      topic: "Announcements",
      username: "Username5",
      upvotes: 555,
      comments: 555,
      postedDate: "xx of April of 202X",
      lastPost: "V time ago",
      status: "Active",
    },
    {
      title: "Other Topic 4",
      topic: "Feedback",
      username: "Username6",
      upvotes: 666,
      comments: 666,
      postedDate: "xx of May of 202X",
      lastPost: "U time ago",
      status: "Inactive",
    },
    {
      title: "Other Topic 5",
      topic: "Offtopic",
      username: "Username7",
      upvotes: 777,
      comments: 777,
      postedDate: "xx of June of 202X",
      lastPost: "T time ago",
      status: "Active",
    },
    {
      title: "Other Topic 6",
      topic: "Bugs",
      username: "Username8",
      upvotes: 888,
      comments: 888,
      postedDate: "xx of July of 202X",
      lastPost: "S time ago",
      status: "Inactive",
    },
    {
      title: "Other Topic 7",
      topic: "Announcements",
      username: "Username9",
      upvotes: 999,
      comments: 999,
      postedDate: "xx of August of 202X",
      lastPost: "R time ago",
      status: "Active",
    },
    {
      title: "Other Topic 8",
      topic: "Feedback",
      username: "Username10",
      upvotes: 1010,
      comments: 1010,
      postedDate: "xx of September of 202X",
      lastPost: "Q time ago",
      status: "Inactive",
    },
    {
      title: "Other Topic 9",
      topic: "Offtopic",
      username: "Username11",
      upvotes: 1111,
      comments: 1111,
      postedDate: "xx of October of 202X",
      lastPost: "P time ago",
      status: "Active",
    },
    {
      title: "Other Topic 10",
      topic: "Bugs",
      username: "Username12",
      upvotes: 1212,
      comments: 1212,
      postedDate: "xx of November of 202X",
      lastPost: "O time ago",
      status: "Inactive",
    },
    {
      title: "Other Topic 11",
      topic: "Announcements",
      username: "Username13",
      upvotes: 1313,
      comments: 1313,
      postedDate: "xx of December of 202X",
      lastPost: "N time ago",
      status: "Active",
    },
    {
      title: "Other Topic 12",
      topic: "Feedback",
      username: "Username14",
      upvotes: 1414,
      comments: 1414,
      postedDate: "xx of January of 202X",
      lastPost: "M time ago",
      status: "Inactive",
    },
    {
      title: "Other Topic 13",
      topic: "Offtopic",
      username: "Username15",
      upvotes: 1515,
      comments: 1515,
      postedDate: "xx of February of 202X",
      lastPost: "L time ago",
      status: "Active",
    },
    {
      title: "Other Topic 14",
      topic: "Bugs",
      username: "Username16",
      upvotes: 1616,
      comments: 1616,
      postedDate: "xx of March of 202X",
      lastPost: "K time ago",
      status: "Inactive",
    },
    {
      title: "Other Topic 15",
      topic: "Announcements",
      username: "Username17",
      upvotes: 1717,
      comments: 1717,
      postedDate: "xx of April of 202X",
      lastPost: "J time ago",
      status: "Active",
    },
    {
      title: "Other Topic 16",
      topic: "Feedback",
      username: "Username18",
      upvotes: 1818,
      comments: 1818,
      postedDate: "xx of May of 202X",
      lastPost: "I time ago",
      status: "Inactive",
    },
    {
      title: "Other Topic 17",
      topic: "Offtopic",
      username: "Username19",
      upvotes: 1919,
      comments: 1919,
      postedDate: "xx of June of 202X",
      lastPost: "H time ago",
      status: "Active",
    },
    {
      title: "Other Topic 18",
      topic: "Bugs",
      username: "Username20",
      upvotes: 2020,
      comments: 2020,
      postedDate: "xx of July of 202X",
      lastPost: "G time ago",
      status: "Inactive",
    },
  ];

  const topics = ["All", "Offtopic", "Bugs", "Announcements", "Feedback"];

  const filteredTopics = otherTopics.filter(
    (topic) => selectedTopic === "All" || topic.topic === selectedTopic
  );

  const totalPages = Math.ceil(filteredTopics.length / topicsPerPage);
  const displayedTopics = filteredTopics.slice(
    (currentPage - 1) * topicsPerPage,
    currentPage * topicsPerPage
  );

  return (
    <div className="bg-gray-900 min-h-screen text-white">
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
                    <p>Posted on {topic.postedDate}</p>
                    <p>Last activity {topic.lastPost}</p>
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

        <section className="mt-8">
          <h2 className="text-xl font-bold mb-4">Other Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedTopics.map((topic, index) => (
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
                  <p>Posted on {topic.postedDate}</p>
                  <p>Last activity {topic.lastPost}</p>
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

        <div className="flex justify-center mt-8">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-4 py-2 mx-1 rounded-lg ${
                currentPage === index + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </main>
      <footer className="py-4 text-sm text-center bg-gray-800">
        &copy; 2025 Foro+. All rights reserved.
      </footer>
    </div>
  );
};

export default ForoPage;