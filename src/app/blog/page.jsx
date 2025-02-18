'use client';

import Link from 'next/link';

const BlogPage = () => {
  const blogs = [
    { id: 1, title: "Blog 1", slug: "blog-1", date: "2023-12-01", preview: "Contenido inicial del Blog 1..." },
    { id: 2, title: "Blog 2", slug: "blog-2", date: "2023-11-15", preview: "Contenido inicial del Blog 2..." },
    { id: 3, title: "Blog 3", slug: "blog-3", date: "2023-10-30", preview: "Contenido inicial del Blog 3..." },
    { id: 4, title: "Blog 4", slug: "blog-4", date: "2023-10-01", preview: "Contenido inicial del Blog 4..." },
  ];

  return (
    <div className="bg-gray-100 min-h-screen">
      <main className="px-4 py-6 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">BLOG</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Link key={blog.id} href={`/blog/${blog.slug}`}>
              <article className="bg-white shadow-md rounded-lg overflow-hidden cursor-pointer hover:shadow-lg">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-4 text-left">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {blog.title}
                  </h2>
                  <p className="text-sm text-gray-500 mb-2">{blog.date}</p>
                  <p className="text-base text-gray-700">{blog.preview}</p>
                </div>
              </article>
            </Link>
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
