'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../../context/LanguageContext';
import { FaCalendarAlt, FaArrowRight } from 'react-icons/fa';

const BlogPage = () => {
  const { t } = useLanguage();

  const blogs = [
    { 
      id: 1, 
      title: t.blogPauseTitle || "Pausa", 
      slug: "blog-1", 
      date: "09-03-2025", 
      preview: t.blogPausePreview || "Nueva funcionalidad, nuestro menú de pausa.", 
      thumbnail: "/images/menupausa.jpg",
      author: "Adrián Lozano",
      category: "Feature"
    },
    { 
      id: 2, 
      title: t.blogUpdatesTitle || "Game Updates", 
      slug: "blog-2", 
      date: "08-03-2025", 
      preview: t.blogUpdatesPreview || "Latest improvements and bug fixes to enhance the gameplay experience.", 
      thumbnail: "/images/blog2-thumbnail.jpg",
      author: "Iván García",
      category: "Updates"
    },
    { 
      id: 3, 
      title: t.blogDevelopmentTitle || "Development Process", 
      slug: "blog-3", 
      date: "07-03-2025", 
      preview: t.blogDevelopmentPreview || "Insights into our development journey and the technologies behind The Abyss.", 
      thumbnail: "/images/blog3-thumbnail.jpg",
      author: "Fan",
      category: "Development"
    },
    { 
      id: 4, 
      title: t.blogFutureTitle || "Future Plans", 
      slug: "blog-4", 
      date: "09-05-2024", 
      preview: t.blogFuturePreview || "Upcoming features and enhancements planned for The Abyss in the coming months.", 
      thumbnail: "/images/blog4-thumbnail.jpg",
      author: "Adrián Lozano",
      category: "Roadmap"
    },
  ];

  const formatDate = (dateString) => {
    const [day, month, year] = dateString.split('-');
    const date = new Date(`${year}-${month}-${day}`);
    
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-gray-850 min-h-screen text-white">
      <main className="px-4 py-6 container mx-auto">
        {/* Blog Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-100 mb-3">{t.blogTitle || "Noticias y Actualizaciones"}</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">{t.latestPosts || "Últimas Publicaciones"}</p>
          <div className="w-20 h-1 bg-blue-600 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Grid of Posts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <Link key={blog.id} href={`/blog/${blog.slug}`}>
              <article className="bg-gray-800 shadow-lg rounded-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow h-full flex flex-col">
                <div className="relative h-52 bg-gray-700">
                  <Image
                    src={blog.thumbnail}
                    alt={`Thumbnail for ${blog.title}`}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-t-lg"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {blog.category}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex-grow flex flex-col">
                  <h2 className="text-xl font-semibold text-gray-100 mb-3">
                    {blog.title}
                  </h2>
                  <div className="flex items-center text-gray-400 mb-3 text-sm">
                    <FaCalendarAlt className="mr-2" />
                    <span>{formatDate(blog.date)}</span>
                  </div>
                  <p className="text-gray-300 flex-grow mb-4 h-14 line-clamp-2">{blog.preview}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-gray-400 text-sm">{blog.author}</span>
                    <span className="text-blue-500 hover:text-blue-400 flex items-center">
                      <span className="mr-1">{t.readMore || "Leer más"}</span>
                      <FaArrowRight size={12} />
                    </span>
                  </div>
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