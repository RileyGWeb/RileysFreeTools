const fs = require('fs');
const path = require('path');

// Simple template engine
function renderTemplate(template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] || '';
  });
}

// Ensure directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Copy static assets
function copyStatic(src, dest) {
  if (!fs.existsSync(src)) return;
  
  ensureDir(dest);
  const items = fs.readdirSync(src);
  
  items.forEach(item => {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory()) {
      copyStatic(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

// Main build function
function build() {
  console.log('🔨 Building site...');
  
  // Load config
  const config = JSON.parse(fs.readFileSync('./site.config.json', 'utf8'));
  
  // Ensure dist directory
  ensureDir('./dist');
  
  // Read template
  const template = fs.readFileSync('./src/template.html', 'utf8');
  
  // Read content
  const contentPath = './src/index.md';
  let content = '';
  
  if (fs.existsSync(contentPath)) {
    content = fs.readFileSync(contentPath, 'utf8');
    // Simple markdown-like conversion
    const lines = content.split('\n');
    let html = [];
    let inCodeBlock = false;
    let inList = false;
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      
      // Code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          html.push('</code></pre>');
          inCodeBlock = false;
        } else {
          html.push('<pre><code>');
          inCodeBlock = true;
        }
        continue;
      }
      
      if (inCodeBlock) {
        // Escape HTML entities to prevent injection
        line = line.replace(/&/g, '&amp;')
                   .replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;');
        html.push(line);
        continue;
      }
      
      // Headings
      if (line.startsWith('# ')) {
        if (inList) { html.push('</ul>'); inList = false; }
        html.push(`<h1>${line.substring(2)}</h1>`);
        continue;
      }
      if (line.startsWith('## ')) {
        if (inList) { html.push('</ul>'); inList = false; }
        html.push(`<h2>${line.substring(3)}</h2>`);
        continue;
      }
      if (line.startsWith('### ')) {
        if (inList) { html.push('</ul>'); inList = false; }
        html.push(`<h3>${line.substring(4)}</h3>`);
        continue;
      }
      
      // Lists
      if (line.startsWith('- ')) {
        if (!inList) {
          html.push('<ul>');
          inList = true;
        }
        let listContent = line.substring(2);
        // Process inline formatting (bold before italic to avoid conflicts)
        listContent = listContent.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        listContent = listContent.replace(/\*(?!\*)(.+?)(?<!\*)\*/g, '<em>$1</em>');
        html.push(`<li>${listContent}</li>`);
        continue;
      } else if (inList) {
        html.push('</ul>');
        inList = false;
      }
      
      // Empty lines
      if (line.trim() === '') {
        continue;
      }
      
      // Regular paragraphs
      // Process inline formatting (bold before italic to avoid conflicts)
      line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      line = line.replace(/\*(?!\*)(.+?)(?<!\*)\*/g, '<em>$1</em>');
      html.push(`<p>${line}</p>`);
    }
    
    if (inList) html.push('</ul>');
    if (inCodeBlock) html.push('</code></pre>');
    
    content = html.join('\n');
  }
  
  // Render template with data
  const html = renderTemplate(template, {
    title: config.title,
    description: config.description,
    content: content
  });
  
  // Write output
  fs.writeFileSync('./dist/index.html', html);
  
  // Copy static assets
  copyStatic('./src/static', './dist');
  
  console.log('✅ Build complete! Output in ./dist/');
}

// Run build
try {
  build();
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
