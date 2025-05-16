'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // Soporte para tablas, listas de tareas, etc.
import rehypeRaw from 'rehype-raw'; // Para permitir HTML en el Markdown
import { useLanguage } from '../../../context/LanguageContext';
import Link from 'next/link';
import { FaCalendarAlt, FaUser, FaArrowLeft } from 'react-icons/fa';

const blogData = {
  "blog-1": {
    content: (t) => t.blogPauseContent || `
      Nos complace anunciar una nueva funcionalidad en nuestro juego: el menú de pausa. 
      Este menú ha sido desarrollado por nuestros talentosos desarrolladores Fan e Iván, quienes 
      han trabajado arduamente para ofrecer una experiencia de usuario fluida y eficiente.

      El menú de pausa permite a los jugadores detener el juego en cualquier momento y acceder a 
      una variedad de opciones útiles. Entre las características principales del menú de pausa se 
      incluyen:

      - Reanudar juego: Permite a los jugadores continuar desde donde dejaron.
      - Reiniciar sala: Para reiniciar el nivel.
      - Salir: Para salir del juego.

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
    tags: ["feature", "update", "gameplay"]
  },
  "blog-2": {
    content: (t) => t.blogUpdatesContent || `
      This is a sample blog post about the latest game updates.
      We've been working hard to improve the gameplay experience and fix various bugs 
      that were reported by our community. 
      
      Here are some of the key updates:
      
      - Improved character movement and responsiveness
      - Fixed collision detection issues in level 3
      - Enhanced visual effects for special abilities
      - Added new sound effects for better immersion
      
      We appreciate all the feedback we've received and continue to work on making 
      The Abyss the best possible experience for our players. Our commitment is to 
      deliver regular updates and improvements based on player feedback.
      
      The team has been focused on optimizing performance across all supported platforms,
      ensuring that the game runs smoothly regardless of your device specifications.
      
      Stay tuned for more updates coming soon!
    `,
    image: "/images/sprite1.png",
    author: {
      name: "Iván García",
      avatar: "/images/logo-abyss.png",
      bio: "Game designer and level creator for The Abyss.",
    },
    date: "08-03-2025",
    tags: ["updates", "bugfixes", "improvements"]
  },
  "blog-3": {
    content: (t) => t.blogDevelopmentContent || `
      In this post, we'd like to share some insights into our development process and 
      the technologies we used to create The Abyss. Our journey has been both challenging 
      and rewarding, filled with discoveries and innovations.
      
      Our game is built using Unity, which provides us with powerful tools for creating 
      immersive 2D platformer experiences. We've utilized various techniques to achieve 
      the unique visual style that characterizes our game:
      
      - Custom shaders for the mystical glow effects
      - Particle systems for environmental ambiance
      - Procedural generation for certain level elements
      - Advanced animation blending for fluid character movement
      
      The art direction was heavily influenced by the original Made in Abyss anime, with 
      our own unique twist to make it suitable for an interactive experience. Each asset 
      has been carefully crafted to enhance the atmosphere of mystery and discovery.
      
      The development journey has been challenging but extremely rewarding. We've learned 
      a lot along the way and continue to improve our skills with each update.
    `,
    image: "/images/sprite2.png",
    author: {
      name: "Fan",
      avatar: "/images/logo-abyss.png",
      bio: "Lead programmer and technical artist.",
    },
    date: "07-03-2025",
    tags: ["development", "technology", "behind-the-scenes"]
  },
  "blog-4": {
    content: (t) => t.blogFutureContent || `
      We're excited to share our future plans for The Abyss! Here's a sneak peek at what 
      we're working on for the upcoming months. Our roadmap is ambitious but achievable, 
      with several key features in development.
      
      ## Upcoming Features
      
      - **New Levels**: We're designing five new challenging levels that will test your 
        skills and introduce new game mechanics.
      - **Character Customization**: Soon you'll be able to personalize your character 
        with various cosmetic options.
      - **Boss Battles**: Epic boss fights are coming to provide a climactic challenge 
        at the end of each world.
      - **Enhanced Soundtrack**: New musical themes to enhance the atmosphere of each area.
      
      ## Release Timeline
      
      We're planning to release these features in phases over the next six months. 
      Stay tuned for more detailed announcements as we get closer to each release date.
      
      Your continued support and feedback are invaluable to us. We're committed to making 
      The Abyss an ever-evolving experience that you'll want to return to again and again.
      
      Thank you for being part of our journey!
    `,
    image: "/images/attack.jpg",
    author: {
      name: "Adrián Lozano",
      avatar: "/images/logo-abyss.png",
      bio: "Project manager and vision keeper.",
    },
    date: "09-05-2024",
    tags: ["roadmap", "future", "features"]
  }
};

const BlogPostPage = () => {
  const router = useRouter();
  const { slug } = useParams();
  const { t } = useLanguage();
  const [blog, setBlog] = useState(null);
  
  useEffect(() => {
    if (slug && blogData[slug]) {
      // Generate title from the slug if not already set
      const blogPost = blogData[slug];
      
      if (slug === "blog-1") {
        setBlog({
          ...blogPost,
          title: t.blogPauseTitle || "Pausa",
          content: blogPost.content(t)
        });
      } else if (slug === "blog-2") {
        setBlog({
          ...blogPost,
          title: t.blogUpdatesTitle || "Game Updates",
          content: blogPost.content(t)
        });
      } else if (slug === "blog-3") {
        setBlog({
          ...blogPost,
          title: t.blogDevelopmentTitle || "Development Process",
          content: blogPost.content(t)
        });
      } else if (slug === "blog-4") {
        setBlog({
          ...blogPost,
          title: t.blogFutureTitle || "Future Plans",
          content: blogPost.content(t)
        });
      }
    }
  }, [slug, t]);

  const formatDate = (dateString) => {
    const [day, month, year] = dateString.split('-');
    const date = new Date(`${year}-${month}-${day}`);
    
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-850 p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-500 mb-4">{t.blogNotFound || "Blog no encontrado"}</h1>
          <Link href="/blog">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-200">
              {t.backToBlog || "Volver al blog"}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-850 text-white pb-16">
      {/* Hero Section with Image */}
      <div className="relative h-80 md:h-96 bg-gray-900">
        <div className="absolute inset-0 bg-black opacity-40 z-10"></div>
        {blog.image && (
          <img
            src={blog.image}
            alt={`${blog.title} cover image`}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center z-20 p-4">
          <div className="text-center max-w-3xl">
            <h1 className="text-4xl font-bold text-white mb-4">{blog.title}</h1>
            <div className="flex items-center justify-center space-x-4 text-gray-300">
              <div className="flex items-center">
                <FaCalendarAlt className="mr-2" />
                <span>{formatDate(blog.date)}</span>
              </div>
              <div className="hidden md:flex items-center">
                <FaUser className="mr-2" />
                <span>{blog.author.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="container mx-auto px-4 md:px-0 -mt-10 relative z-30">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="md:col-span-8 lg:col-span-9">
            <article className="bg-gray-800 rounded-lg shadow-lg p-6 md:p-10">
              {/* Back to Blog */}
              <Link href="/blog" className="inline-flex items-center text-blue-500 hover:text-blue-400 mb-8">
                <FaArrowLeft className="mr-2" />
                <span>{t.backToBlog || "Volver al blog"}</span>
              </Link>
              
              {/* Article Content */}
              <div className="prose prose-lg prose-invert text-gray-300 max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {blog.content}
                </ReactMarkdown>
              </div>
              
              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-700">
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </article>
          </div>
          
          {/* Sidebar */}
          <div className="md:col-span-4 lg:col-span-3 space-y-8">
            {/* Author */}
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-100">{t.author || "Autor"}</h3>
              <div className="flex items-center space-x-4">
                <img
                  src={blog.author.avatar}
                  alt={blog.author.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-700"
                />
                <div>
                  <h4 className="text-lg font-medium text-gray-100">{blog.author.name}</h4>
                  <p className="text-sm text-gray-400">{blog.author.bio}</p>
                </div>
              </div>
            </div>
            
            {/* Related Posts */}
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-100">{t.relatedPosts || "Publicaciones relacionadas"}</h3>
              <div className="space-y-4">
                {Object.entries(blogData)
                  .filter(([key]) => key !== slug)
                  .slice(0, 3)
                  .map(([key, post]) => (
                    <Link href={`/blog/${key}`} key={key}>
                      <div className="flex items-center space-x-3 hover:bg-gray-700 p-2 rounded transition-colors">
                        <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden">
                          <img
                            src={post.image}
                            alt="Related post"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-100">
                            {key === "blog-1" 
                              ? (t.blogPauseTitle || "Pausa") 
                              : key === "blog-2" 
                                ? (t.blogUpdatesTitle || "Game Updates")
                                : key === "blog-3"
                                  ? (t.blogDevelopmentTitle || "Development Process")
                                  : (t.blogFutureTitle || "Future Plans")
                            }
                          </h4>
                          <p className="text-xs text-gray-400">{formatDate(post.date)}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage;
