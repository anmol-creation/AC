import { parse } from './frontmatter';

// Get all posts for public view (Static Build friendly)
export async function getPosts() {
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
  const modules = import.meta.glob('/content/posts/*.md', { query: '?raw', import: 'default' });

  for (const [path, resolver] of Object.entries(modules)) {
    const content = await resolver();
    const { data, content: markdown } = parse(content);
    if (data.slug === slug) {
      return { ...data, content: markdown, slug };
    }
  }
  return null;
}
