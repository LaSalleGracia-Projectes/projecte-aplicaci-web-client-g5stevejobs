'use client';

import { useParams } from 'next/navigation';

const BlogPostPage = () => {
  const { slug } = useParams();

  const blogContent = {
    "blog-1": "Contenido detallado del Blog 1.",
    "blog-2": "Contenido detallado del Blog 2.",
    "blog-3": "Contenido detallado del Blog 3.",
    "blog-4": "Contenido detallado del Blog 4.",
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Blog: {slug}</h1>
      <p className="text-lg">{blogContent[slug] || "Contenido no encontrado."}</p>
    </div>
  );
};

export default BlogPostPage;
