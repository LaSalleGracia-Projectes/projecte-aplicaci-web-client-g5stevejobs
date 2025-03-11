'use client';

import Link from 'next/link';
import Image from 'next/image';

const BlogPage = () => {
  const blogs = [
    { id: 1, title: "Pausa", slug: "blog-1", date: "09-03-2025", preview: "Nueva funcionalidad, nuestro menú de pausa.", thumbnail: "/images/menupausa.jpg" },
    { id: 2, title: "Blog 2", slug: "blog-2", date: "08-03-2025", preview: "Contenido inicial del Blog 2...", thumbnail: "/images/blog2-thumbnail.jpg" },
    { id: 3, title: "Blog 3", slug: "blog-3", date: "07-03-2025", preview: "Contenido inicial del Blog 3...", thumbnail: "/images/blog3-thumbnail.jpg" },
    { id: 4, title: "Blog 4", slug: "blog-4", date: "09-05-2024", preview: "Contenido inicial del Blog 4...", thumbnail: "/images/blog4-thumbnail.jpg" },
  ];

  return (
    <div className="bg-gray-850 min-h-screen text-white">
      <main className="px-4 py-6 text-center">
        <h1 className="text-4xl font-bold text-gray-100 mb-6">Blogs</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Link key={blog.id} href={`/blog/${blog.slug}`}>
              <article className="bg-gray-800 shadow-md rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gray-700">
                  <Image
                    src={blog.thumbnail}
                    alt={`Thumbnail for ${blog.title}`}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-t-lg"
                  />
                </div>
                <div className="p-4 text-left">
                  <h2 className="text-xl font-semibold text-gray-100 mb-2">
                    {blog.title}
                  </h2>
                  <p className="text-sm text-gray-400 mb-2">{blog.date}</p>
                  <p className="text-base text-gray-300">{blog.preview}</p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default BlogPage;