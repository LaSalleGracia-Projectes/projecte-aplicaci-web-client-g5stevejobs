'use client';

import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // Soporte para tablas, listas de tareas, etc.
import rehypeRaw from 'rehype-raw'; // Para permitir HTML en el Markdown

const blogData = {
  "blog-1": {
    title: "Pausa",
    content: `
      Nos complace anunciar una nueva funcionalidad en nuestro juego: el menú de pausa. 
      Este menú ha sido desarrollado por nuestros talentosos desarrolladores Fan e Iván, quienes 
      han trabajado arduamente para ofrecer una experiencia de usuario fluida y eficiente.

      El menú de pausa permite a los jugadores detener el juego en cualquier momento y acceder a 
      una variedad de opciones útiles. Entre las características principales del menú de pausa se 
      incluyen:

      - **Reanudar juego**: Permite a los jugadores continuar desde donde dejaron.
      - **Reiniciar sala**: Para reiniciar el nivel.
      - **Salir**: Para salir del juego.

      Fan e Iván han puesto un gran esfuerzo en asegurarse de que el menú de pausa sea intuitivo 
      y fácil de usar. Han realizado múltiples pruebas y ajustes para garantizar que funcione sin 
      problemas en todas las plataformas.

      Estamos muy orgullosos del trabajo realizado por Fan e Iván y estamos seguros de que los 
      jugadores apreciarán esta nueva funcionalidad. ¡Esperamos que disfruten del nuevo menú de 
      pausa tanto como nosotros disfrutamos creándolo!
    `,
    image: "/images/menupausa.jpg",
    author: {
      name: "Adrián Lozano",
      avatar: "/images/logo-abyss.png",
      bio: "Desarrollador web y entusiasta de las nuevas tecnologías.",
    },
    date: "09-03-2025",
  },
};

const BlogPostPage = () => {
  const { slug } = useParams();
  const blog = blogData[slug];

  if (!blog) {
    return <div className="text-center text-red-500">Blog no encontrado</div>;
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white flex flex-col items-center">
      <article className="max-w-4xl w-full bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">{blog.title}</h1>
        <p className="text-gray-400 text-sm mb-4">Publicado el {blog.date}</p>
        
        {/* Imagen dentro del artículo */}
        {blog.image && (
          <img
            src={blog.image}
            alt={`Imagen de ${blog.title}`}
            className="w-full rounded-lg mb-4"
          />
        )}

        <div className="prose prose-invert text-gray-300">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {blog.content}
          </ReactMarkdown>
        </div>
      </article>

      {/* Autor del blog */}
      <section className="max-w-4xl w-full bg-gray-800 p-6 rounded-lg shadow-lg flex items-center gap-4">
        <img
          src={blog.author.avatar}
          alt={blog.author.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-gray-700"
        />
        <div>
          <h3 className="text-xl font-semibold text-gray-100">{blog.author.name}</h3>
          <p className="text-sm text-gray-400">{blog.author.bio}</p>
        </div>
      </section>
    </div>
  );
};

export default BlogPostPage;
