'use client';

import React from 'react';

const ForoPage = () => {
  const pinnedTopics = [
    {
      title: 'Title 1',
      topic: 'Offtopic',
      username: 'Username1',
      upvotes: 222,
      comments: 222,
      postedDate: 'xx of December of 202X',
      lastPost: 'X time ago',
      status: 'Active',
    },
    {
      title: 'Title 2',
      topic: 'Bugs',
      username: 'Username2',
      upvotes: 333,
      comments: 333,
      postedDate: 'xx of January of 202X',
      lastPost: 'Y time ago',
      status: 'Inactive',
    },
  ];

  const otherTopics = [
    {
      title: 'Title 3',
      topic: 'Offtopic',
      username: 'Username3',
      upvotes: 111,
      comments: 111,
      postedDate: 'xx of February of 202X',
      lastPost: 'Z time ago',
      status: 'Active',
    },
    {
      title: 'Title 4',
      topic: 'Bugs',
      username: 'Username4',
      upvotes: 444,
      comments: 444,
      postedDate: 'xx of March of 202X',
      lastPost: 'W time ago',
      status: 'Inactive',
    },
  ];

  return (
    <div className="bg-gray-100 min-h-screen">
      <main className="px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">FORO</h1>
          <p className="text-base text-gray-600">text</p>
        </div>
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Search topics..."
            className="px-4 py-2 border rounded w-1/3"
          />
          <button className="px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600">
            Report
          </button>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Fijados</h2>
        <table className="w-full border-collapse mb-8">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left border-b bg-gray-200 text-gray-800">Tema</th>
              <th className="px-4 py-2 text-left border-b bg-gray-200 text-gray-800">Temas</th>
              <th className="px-4 py-2 text-left border-b bg-gray-200 text-gray-800">Posted by</th>
              <th className="px-4 py-2 text-left border-b bg-gray-200 text-gray-800">Stats</th>
              <th className="px-4 py-2 text-left border-b bg-gray-200 text-gray-800">Posted</th>
              <th className="px-4 py-2 text-left border-b bg-gray-200 text-gray-800">Last post</th>
              <th className="px-4 py-2 text-left border-b bg-gray-200 text-gray-800">Status</th>
            </tr>
          </thead>
          <tbody>
            {pinnedTopics.map((topic, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="px-4 py-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{topic.title}</h3>
                </td>
                <td className="px-4 py-4">
                  <p className="text-gray-700">{topic.topic}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-gray-700">{topic.username}</p>
                  <p className="text-sm text-gray-500">(if admin)</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-gray-700">Upvotes: {topic.upvotes}</p>
                  <p className="text-gray-700">Comments: {topic.comments}</p>
                </td>
                <td className="px-4 py-4 text-gray-700">{topic.postedDate}</td>
                <td className="px-4 py-4 text-gray-700">{topic.lastPost}</td>
                <td className="px-4 py-4 text-gray-700">{topic.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Otros Foros</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left border-b bg-gray-200 text-gray-800">Tema</th>
              <th className="px-4 py-2 text-left border-b bg-gray-200 text-gray-800">Temas</th>
              <th className="px-4 py-2 text-left border-b bg-gray-200 text-gray-800">Posted by</th>
              <th className="px-4 py-2 text-left border-b bg-gray-200 text-gray-800">Stats</th>
              <th className="px-4 py-2 text-left border-b bg-gray-200 text-gray-800">Posted</th>
              <th className="px-4 py-2 text-left border-b bg-gray-200 text-gray-800">Last post</th>
              <th className="px-4 py-2 text-left border-b bg-gray-200 text-gray-800">Status</th>
            </tr>
          </thead>
          <tbody>
            {otherTopics.map((topic, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="px-4 py-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{topic.title}</h3>
                </td>
                <td className="px-4 py-4">
                  <p className="text-gray-700">{topic.topic}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-gray-700">{topic.username}</p>
                  <p className="text-sm text-gray-500">(if admin)</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-gray-700">Upvotes: {topic.upvotes}</p>
                  <p className="text-gray-700">Comments: {topic.comments}</p>
                </td>
                <td className="px-4 py-4 text-gray-700">{topic.postedDate}</td>
                <td className="px-4 py-4 text-gray-700">{topic.lastPost}</td>
                <td className="px-4 py-4 text-gray-700">{topic.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-center mt-4">
          <button className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600">
            Load More
          </button>
        </div>
      </main>
      <footer className="py-4 text-sm text-center text-white bg-gray-800">
        footer text goes here
      </footer>
    </div>
  );
};

export default ForoPage;