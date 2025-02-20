'use client';

import React from 'react';

const ForoPage = () => {
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
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left border-b bg-gray-200 text-gray-800">
                Tema
              </th>
              <th className="px-4 py-2 text-left border-b bg-gray-200 text-gray-800">
                Temas
              </th>
              <th className="px-4 py-2 text-left border-b bg-gray-200 text-gray-800">
                Posted by
              </th>
              <th className="px-4 py-2 text-left border-b bg-gray-200 text-gray-800">
                Stats
              </th>
              <th className="px-4 py-2 text-left border-b bg-gray-200 text-gray-800">
                Posted
              </th>
              <th className="px-4 py-2 text-left border-b bg-gray-200 text-gray-800">
                Last post
              </th>
            </tr>
          </thead>
          <tbody>
            {[...Array(3)].map((_, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="px-4 py-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    Title
                  </h3>
                </td>
                <td className="px-4 py-4">
                  <p className="text-gray-700">Offtopic</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-gray-700">Username</p>
                  <p className="text-sm text-gray-500">(if admin)</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-gray-700">Upvotes: 222</p>
                  <p className="text-gray-700">Comments: 222</p>
                </td>
                <td className="px-4 py-4 text-gray-700">xx of December of 202X</td>
                <td className="px-4 py-4 text-gray-700">
                  X time ago
                  <span className="ml-2 text-gray-700">📌</span>
                </td>
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