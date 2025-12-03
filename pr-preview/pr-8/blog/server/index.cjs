const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const matter = require('gray-matter');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const POSTS_DIR = path.join(__dirname, '../content/posts');
const IMAGES_DIR = path.join(__dirname, '../public/assets/images');

// Ensure directories exist
if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, IMAGES_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Get all posts (metadata only)
app.get('/api/posts', (req, res) => {
  try {
    const files = fs.readdirSync(POSTS_DIR);
    const posts = files
      .filter(file => file.endsWith('.md'))
      .map(file => {
        const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
        const { data } = matter(content);
        return {
          filename: file,
          ...data,
        };
      });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single post
app.get('/api/posts/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const files = fs.readdirSync(POSTS_DIR);
    const file = files.find(f => {
      const content = fs.readFileSync(path.join(POSTS_DIR, f), 'utf-8');
      const { data } = matter(content);
      return data.slug === slug || f === slug || f === slug + '.md';
    });

    if (!file) return res.status(404).json({ error: 'Post not found' });

    const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
    res.json({ content, filename: file });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create or Update post
app.post('/api/posts', (req, res) => {
  try {
    const { filename, content } = req.body;
    // If filename is not provided, generate one from slug or title
    let targetFilename = filename;
    if (!targetFilename) {
        // Parse content to get slug
        const { data } = matter(content);
        if (data.slug) targetFilename = `${data.slug}.md`;
        else targetFilename = `post-${Date.now()}.md`;
    }

    fs.writeFileSync(path.join(POSTS_DIR, targetFilename), content);
    res.json({ success: true, filename: targetFilename });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete post
app.delete('/api/posts/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(POSTS_DIR, filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload image
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/assets/images/${req.file.filename}` });
});

app.listen(PORT, () => {
  console.log(`Admin server running at http://localhost:${PORT}`);
});
