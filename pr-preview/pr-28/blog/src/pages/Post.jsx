import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPostBySlug } from '../lib/posts';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function Post() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPostBySlug(slug).then((data) => {
      setPost(data);
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <div className="py-20 text-center">Loading...</div>;
  if (!post) return <div className="py-20 text-center">Post not found</div>;

  return (
    <>
      <Helmet>
        <title>{post.title} | Blog Theme</title>
        <meta name="description" content={post.excerpt} />
        {post.image && <meta property="og:image" content={post.image} />}
      </Helmet>

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-brand-600 mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to Home
        </Link>

        <header className="mb-10">
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <span className="bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-3 py-1 rounded-full text-xs font-semibold">
              {post.category}
            </span>
            <time>{post.date ? format(new Date(post.date), 'MMMM d, yyyy') : ''}</time>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-6 leading-tight text-gray-900 dark:text-white">
            {post.title}
          </h1>
          <div className="flex items-center gap-3">
             <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                By {post.author}
             </div>
          </div>
        </header>

        {post.image && (
          <div className="mb-10 rounded-2xl overflow-hidden shadow-lg">
            <img src={post.image} alt={post.title} className="w-full object-cover max-h-[500px]" />
          </div>
        )}

        <div className="prose prose-lg dark:prose-invert prose-brand max-w-none">
          <Markdown rehypePlugins={[rehypeRaw]}>{post.content}</Markdown>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
                {post.tags && post.tags.map(tag => (
                    <span key={tag} className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-gray-700 dark:text-gray-300">
                        #{tag}
                    </span>
                ))}
            </div>
        </div>
      </motion.article>
    </>
  );
}
