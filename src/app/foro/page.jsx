'use client';

import React from 'react';

const ForoPage = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <main className="px-4 py-6 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">FORO</h1>
        <p className="text-base text-gray-600 mb-6">text</p>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left border-b bg-gray-100 text-gray-800">
                Tema
              </th>
              <th className="px-4 py-2 text-left border-b bg-gray-100 text-gray-800">
                Posted by
              </th>
              <th className="px-4 py-2 text-left border-b bg-gray-100 text-gray-800">
                Stats
              </th>
              <th className="px-4 py-2 text-left border-b bg-gray-100 text-gray-800">
                Posted
              </th>
              <th className="px-4 py-2 text-left border-b bg-gray-100 text-gray-800">
                Last post
              </th>
            </tr>
          </thead>
          <tbody>
            {[...Array(3)].map((_, index) => (
              <tr key={index} className="border-b">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-red-500 text-xl">⚠️</span>
                    <img
                      src="image_placeholder.jpg"
                      alt="Topic"
                      className="w-12 h-12 rounded object-cover bg-gray-300"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        Title
                      </h3>
                      <button className="px-2 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600">
                        Report
                      </button>
                    </div>
                  </div>
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
      </main>
      <footer className="py-4 text-sm text-center text-white bg-gray-800">
        footer text goes here
      </footer>
    </div>
  );
};

export default ForoPage;
