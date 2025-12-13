import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPosts } from '../lib/posts';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Helmet } from 'react-helmet-async';

export default function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    getPosts().then(setPosts);
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <>
      <Helmet>
        <title>Modern Blog Theme</title>
        <meta name="description" content="A clean, modern blog theme built with React and Tailwind." />
      </Helmet>

      {/* Hero Section */}
      <section className="mb-16 text-center sm:text-left py-10 sm:py-20">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent"
        >
          Minimalist. Modern. Fast.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl"
        >
          A blog theme designed for readability and performance. Built for the modern web.
        </motion.p>
      </section>

      {/* Post Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {posts.map((post) => (
          <motion.article
            key={post.slug}
            variants={item}
            className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700 flex flex-col h-full"
          >
            {post.image && (
              <div className="aspect-video overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            )}
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-brand-500">
                <span>{post.category}</span>
                <span>•</span>
                <time>{post.date ? format(new Date(post.date), 'MMM d, yyyy') : ''}</time>
              </div>
              <h2 className="text-xl font-bold mb-2 group-hover:text-brand-500 transition-colors">
                <Link to={`/post/${post.slug}`}>
                  {post.title}
                </Link>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 text-sm flex-grow">
                {post.excerpt}
              </p>
              <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                 <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                    {post.author}
                 </div>
                 <Link to={`/post/${post.slug}`} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                    Read more →
                 </Link>
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </>
  );
}
