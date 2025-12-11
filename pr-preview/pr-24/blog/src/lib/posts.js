import { parse } from './frontmatter';

// Get all posts for public view (Static Build friendly)
export async function getPosts() {
  // Try to fetch from local API if in development (Real-time updates)
  if (import.meta.env.DEV) {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const posts = await res.json();
        // The API returns metadata objects directly, but we need to ensure consistency
        return posts
          .map(post => ({
            ...post,
            slug: post.slug || post.filename.replace('.md', ''),
          }))
          .filter(post => post.status !== 'draft')
          .sort((a, b) => new Date(b.date) - new Date(a.date));
      }
    } catch (e) {
      console.warn('Admin API not available, falling back to static files.', e);
    }
  }

  // Fallback (or Production) - Static Build friendly
  const modules = import.meta.glob('/content/posts/*.md', { query: '?raw', import: 'default' });

  const posts = await Promise.all(
    Object.entries(modules).map(async ([path, resolver]) => {
      const content = await resolver();
      const { data } = parse(content);
      return {
        ...data,
        slug: data.slug || path.split('/').pop().replace('.md', ''),
        path, // Store path to help with identifying source
      };
    })
  );

  return posts.filter(post => post.status !== 'draft').sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Get single post by slug
export async function getPostBySlug(slug) {
  // Try to fetch from local API if in development
  if (import.meta.env.DEV) {
    try {
      const res = await fetch(`/api/posts/${slug}`);
      if (res.ok) {
        const { content, filename } = await res.json();
        const { data, content: markdown } = parse(content);
        return {
          ...data,
          content: markdown,
          slug: data.slug || filename.replace('.md', '')
        };
      }
    } catch (e) {
       console.warn('Admin API not available for single post, falling back to static files.', e);
    }
  }

  const modules = import.meta.glob('/content/posts/*.md', { query: '?raw', import: 'default' });

  for (const [_, resolver] of Object.entries(modules)) {
    const content = await resolver();
    const { data, content: markdown } = parse(content);
    if (data.slug === slug) {
      return { ...data, content: markdown, slug };
    }
  }
  return null;
}
