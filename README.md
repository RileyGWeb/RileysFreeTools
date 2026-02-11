# RileysFreeTools

For all of Riley's Free Tools!

## Static Site Generator

This project includes a basic SSG (Static Site Generator) for building the website.

### Structure

```
├── src/
│   ├── template.html    # HTML template with {{placeholders}}
│   ├── index.md         # Markdown content for the page
│   └── static/          # Static assets (copied to dist/)
├── build.js             # Build script
├── site.config.json     # Site configuration
└── dist/                # Generated output (created on build)
```

### Building the Site

```bash
npm run build
```

This will:
1. Read the template and content
2. Process basic markdown formatting
3. Generate HTML with templated values
4. Copy static assets
5. Output everything to `dist/`

### Configuration

Edit `site.config.json` to customize:
- `title`: Site title
- `description`: Site description

### Templating

The template supports simple `{{variable}}` placeholders:
- `{{title}}` - Site title from config
- `{{description}}` - Site description from config
- `{{content}}` - Processed content from index.md

### Content

Write content in `src/index.md` using basic markdown:
- `# Heading` → `<h1>Heading</h1>`
- `## Heading` → `<h2>Heading</h2>`
- `**bold**` → `<strong>bold</strong>`
- `*italic*` → `<em>italic</em>`

### Development

To build and serve locally:

```bash
npm run dev
```

Then visit http://localhost:8080
