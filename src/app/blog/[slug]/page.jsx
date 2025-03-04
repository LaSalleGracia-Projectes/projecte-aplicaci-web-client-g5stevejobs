'use client';

import { useParams } from 'next/navigation';

// Simularemos algunos datos para los blogs, autores y comentarios
const blogData = {
  "blog-1": {
    title: "Blog 1",
    content: "Este es el contenido completo del Blog 1. Aquí está toda la información relevante sobre el tema del blog.",
    author: {
      name: "Juan Pérez",
      avatar: "/images/juan.jpg", // Asegúrate de tener una imagen en esa ruta
      bio: "Desarrollador web y entusiasta de las nuevas tecnologías.",
    },
    date: "2023-12-01",
    comments: [
      {
        id: 1,
        username: "Carlos",
        comment: "¡Excelente blog! Me encantó la información.",
        date: "2023-12-02",
      },
      {
        id: 2,
        username: "Ana",
        comment: "Muy interesante, ¡seguiré leyendo tus publicaciones!",
        date: "2023-12-03",
      },
    ],
  },
  // Similar para otros blogs...
};

const BlogPostPage = () => {
  const { slug } = useParams();
  const blog = blogData[slug];

  if (!blog) {
    return <div>Blog no encontrado</div>;
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      {/* Titulo y contenido del blog */}
      <article className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-4">{blog.title}</h1>
        <p className="text-gray-400 mb-4">Publicado el {blog.date}</p>
        <div className="text-gray-300">
          <p>{blog.content}</p>
        </div>
      </article>

      {/* Autor del blog */}
      <section className="author-section bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-semibold text-gray-100 mb-4">Sobre el autor</h2>
        <div className="flex items-center gap-4">
          <img
            src={blog.author.avatar}
            alt={blog.author.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h3 className="text-xl font-semibold text-gray-100">{blog.author.name}</h3>
            <p className="text-sm text-gray-400">{blog.author.bio}</p>
          </div>
        </div>
      </section>

      {/* Sección de comentarios */}
      <section className="comments-section bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-100 mb-4">Comentarios</h2>
        <div className="space-y-4">
          {blog.comments.map((comment) => (
            <div key={comment.id} className="comment bg-gray-700 p-4 rounded-lg shadow-sm">
              <p className="font-semibold text-gray-100">{comment.username}</p>
              <p className="text-sm text-gray-400 mb-2">{comment.date}</p>
              <p className="text-gray-300">{comment.comment}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Formulario para agregar un comentario */}
      <section className="comment-form bg-gray-800 p-6 rounded-lg shadow-lg mt-8">
        <h2 className="text-2xl font-semibold text-gray-100 mb-4">Deja un comentario</h2>
        <form className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Tu nombre"
              className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-gray-100"
            />
          </div>
          <div>
            <textarea
              placeholder="Escribe tu comentario..."
              className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-gray-100"
              rows="4"
            ></textarea>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-500">
            Enviar comentario
          </button>
        </form>
      </section>
    </div>
  );
};

export default BlogPostPage;