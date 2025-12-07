import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { parse, stringify } from '../lib/frontmatter';

const API_URL = '/api';

export default function AdminEditor() {
  const { filename } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [frontmatter, setFrontmatter] = useState({
    title: '',
    slug: '',
    date: new Date().toISOString().split('T')[0],
    author: 'Admin',
    category: 'Uncategorized',
    tags: '',
    status: 'draft',
    image: '',
    excerpt: ''
  });
  const [loading, setLoading] = useState(!!filename);

  useEffect(() => {
    if (filename) {
      fetch(`${API_URL}/posts/${filename}`)
        .then(res => res.json())
        .then(data => {
             const parsed = parse(data.content);
             setFrontmatter({
                 ...parsed.data,
                 tags: Array.isArray(parsed.data.tags) ? parsed.data.tags.join(', ') : parsed.data.tags || ''
             });
             setContent(parsed.content);
             setLoading(false);
        })
        .catch(err => {
            alert('Error loading post');
            console.error(err);
            navigate('/admin');
        });
    }
  }, [filename, navigate]);

  const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('image', file);

      try {
          const res = await fetch(`${API_URL}/upload`, {
              method: 'POST',
              body: formData
          });
          const data = await res.json();
          if (data.url) {
              setFrontmatter({ ...frontmatter, image: data.url });
          }
      } catch (err) {
          alert('Upload failed');
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reconstruct markdown
    const tagsArray = frontmatter.tags.split(',').map(t => t.trim()).filter(Boolean);
    const fileContent = stringify(content, {
        ...frontmatter,
        tags: tagsArray
    });

    try {
        const res = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filename: filename, // Update if exists, or create new
                content: fileContent
            })
        });

        if (res.ok) {
            navigate('/admin');
        } else {
            alert('Failed to save');
        }
    } catch (err) {
        alert('Error saving post');
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link to="/admin" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {filename ? 'Edit Post' : 'New Post'}
                </h1>
            </div>
            <button
                onClick={handleSubmit}
                className="flex items-center gap-2 bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 font-medium shadow-lg shadow-brand-500/30"
            >
                <Save size={18} /> Save
            </button>
        </header>

        <div className="max-w-5xl mx-auto mt-8 px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <input
                        type="text"
                        placeholder="Post Title"
                        value={frontmatter.title}
                        onChange={e => setFrontmatter({...frontmatter, title: e.target.value})}
                        className="w-full text-3xl font-bold bg-transparent border-none focus:ring-0 placeholder-gray-300 dark:placeholder-gray-600 dark:text-white p-0 mb-4"
                    />
                     <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="Write your story..."
                        className="w-full h-[600px] bg-transparent border-none focus:ring-0 resize-none dark:text-gray-300 font-mono text-base"
                    />
                </div>
            </div>

            <div className="space-y-6">
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Publishing</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                        <select
                            value={frontmatter.status}
                            onChange={e => setFrontmatter({...frontmatter, status: e.target.value})}
                            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-brand-500 focus:border-brand-500"
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Date</label>
                        <input
                            type="date"
                            value={frontmatter.date}
                            onChange={e => setFrontmatter({...frontmatter, date: e.target.value})}
                            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Slug</label>
                        <input
                            type="text"
                            value={frontmatter.slug}
                            onChange={e => setFrontmatter({...frontmatter, slug: e.target.value})}
                            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                 </div>

                 <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                     <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Metadata</h3>

                     <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Excerpt</label>
                        <textarea
                            rows="3"
                            value={frontmatter.excerpt}
                            onChange={e => setFrontmatter({...frontmatter, excerpt: e.target.value})}
                            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
                        <input
                            type="text"
                            value={frontmatter.category}
                            onChange={e => setFrontmatter({...frontmatter, category: e.target.value})}
                            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Tags (comma separated)</label>
                        <input
                            type="text"
                            value={frontmatter.tags}
                            onChange={e => setFrontmatter({...frontmatter, tags: e.target.value})}
                            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                 </div>

                 <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                     <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Featured Image</h3>
                     {frontmatter.image && (
                         <div className="mb-2 rounded-lg overflow-hidden border border-gray-200">
                             <img src={frontmatter.image} alt="Featured" className="w-full h-32 object-cover" />
                         </div>
                     )}
                     <div className="flex items-center gap-2">
                         <input
                            type="text"
                            placeholder="Image URL"
                            value={frontmatter.image}
                            onChange={e => setFrontmatter({...frontmatter, image: e.target.value})}
                            className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                         />
                     </div>
                     <div className="relative">
                         <input
                            type="file"
                            onChange={handleImageUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                         />
                         <button className="w-full btn border border-dashed border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-center items-center gap-2">
                             <Upload size={16} /> Upload Image
                         </button>
                     </div>
                 </div>
            </div>
        </div>
    </div>
  );
}
