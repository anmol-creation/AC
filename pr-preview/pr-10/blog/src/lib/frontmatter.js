export function parse(text) {
  if (!text) return { data: {}, content: '' };

  // Regex to match the frontmatter block
  const match = text.match(/^---\s*([\s\S]*?)\s*---([\s\S]*)$/);

  if (!match) {
    // No frontmatter found
    return { data: {}, content: text };
  }

  const yamlBlock = match[1];
  const content = match[2].trim();

  const data = {};

  // Parse YAML-like lines
  yamlBlock.split('\n').forEach(line => {
    const parts = line.split(':');
    if (parts.length < 2) return; // Skip invalid lines

    const key = parts[0].trim();
    let value = parts.slice(1).join(':').trim();

    // Handle arrays: ["Tag1", "Tag2"]
    if (value.startsWith('[') && value.endsWith(']')) {
      const arrayContent = value.slice(1, -1);
      if (!arrayContent.trim()) {
          value = [];
      } else {
          value = arrayContent.split(',').map(v => {
            v = v.trim();
            // Remove quotes if present
            if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
              return v.slice(1, -1);
            }
            return v;
          });
      }
    } else {
      // Handle strings with quotes
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
    }

    data[key] = value;
  });

  return { data, content };
}

export function stringify(content, data) {
  let yaml = '---\n';
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      yaml += `${key}: [${value.map(v => `"${v}"`).join(', ')}]\n`;
    } else {
       yaml += `${key}: "${value}"\n`;
    }
  }
  yaml += '---\n\n';
  yaml += content || '';
  return yaml;
}
