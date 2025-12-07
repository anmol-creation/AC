import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Edit, Trash2, Plus, AlertTriangle } from 'lucide-react';

const API_URL = '/api';

export default function AdminDashboard() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchWithAuth = async (url, options = {}) => {
    const password = sessionStorage.getItem('admin_password');
    const headers = options.headers || {};

    if (password) {
      headers['Authorization'] = 'Basic ' + btoa('admin:' + password);
    }

    const res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
      const newPassword = prompt('Enter Admin Password:');
      if (newPassword) {
        sessionStorage.setItem('admin_password', newPassword);
        return fetchWithAuth(url, options); // Retry
      }
    }
    return res;
  };

  const fetchPosts = async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/posts`);
      if (!res.ok) {
        if (res.status === 403) throw new Error('Admin access disabled (ADMIN_PASSWORD not set on server).');
        throw new Error('Failed to connect to local admin server. Make sure "npm run server" is running.');
      }
      const data = await res.json();
      setPosts(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const deletePost = async (filename) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await fetchWithAuth(`${API_URL}/posts/${filename}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setPosts(posts.filter(p => p.filename !== filename));
      } else {
        alert('Failed to delete post');
      }
    } catch (err) {
      alert('Error deleting post');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <Helmet><title>Admin Dashboard</title></Helmet>

      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
             <p className="text-gray-500">Manage your blog content locally.</p>
          </div>
          <div className="flex gap-4">
              <Link to="/" className="btn bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                View Site
              </Link>
              <Link to="/admin/edit" className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition shadow-lg shadow-brand-500/30">
                <Plus size={18} /> New Post
              </Link>
          </div>
        </header>

        {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-lg mb-8 flex items-center gap-3">
                <AlertTriangle />
                <div>
                    <p className="font-bold">Connection Error</p>
                    <p className="text-sm">{error}</p>
                    <p className="text-xs mt-1 opacity-70">Run <code>npm run server</code> in the <code>blog</code> directory to start the backend.</p>
                </div>
            </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 font-semibold">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {posts.map((post) => (
                <tr key={post.filename} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{post.title}</div>
                    <div className="text-xs text-gray-400 font-mono">{post.filename}</div>
                  </td>
                   <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        post.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}>
                        {post.status || 'draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {post.date}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link
                        to={`/admin/edit/${post.filename}`}
                        className="inline-flex p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition"
                        title="Edit"
                    >
                        <Edit size={18} />
                    </Link>
                    <button
                        onClick={() => deletePost(post.filename)}
                        className="inline-flex p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition"
                        title="Delete"
                    >
                        <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && !error && (
                  <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                          No posts found. Create one!
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
