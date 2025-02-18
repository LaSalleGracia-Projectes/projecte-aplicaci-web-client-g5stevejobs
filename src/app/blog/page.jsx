'use client';

import React from 'react';

const BlogPage = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <main className="px-4 py-6 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">BLOG</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <article
              key={index}
              className="bg-white shadow-md rounded-lg overflow-hidden"
            >
              <div className="h-48 bg-gray-300"></div>
              <div className="p-4 text-left">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Title
                </h2>
                <p className="text-sm text-gray-500 mb-2">Day posted</p>
                <p className="text-base text-gray-700">
                  First words of the article...
                </p>
              </div>
            </article>
          ))}
        </div>
      </main>
      <footer className="py-4 text-sm text-center text-white bg-gray-800">
        footer text goes here
      </footer>
    </div>
  );
};

export default BlogPage;
