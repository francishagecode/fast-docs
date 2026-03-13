# fast-docs

Static docs site. No npm or build step.

## Add to your repo

Run this from your project root:

```bash
curl -sL https://github.com/francishagecode/fast-docs/archive/main.tar.gz \
  | tar -xz --strip-components=1 fast-docs-main/docs
```

This will drop a `docs/` folder into your repo. Afterward, run it locally:

## Run locally

```bash
python3 -m http.server 8000 -d docs
```

Open `http://localhost:8000`.

## Adding pages

Create a markdown file in `docs/pages/`, then add a link to `docs/_sidebar.md`:

```md
- [My Page](pages/my-page.md)
```

## Deploy to GitHub Pages

1. Push to GitHub
2. Settings > Pages > set folder to `/docs`

## Structure

```
docs/
├── index.html
├── index.md           # homepage
├── _sidebar.md        # sidebar nav
├── assets/            # css, js, fonts
└── pages/             # your markdown files
```

## Customizing

Edit the `<title>` and `.title-text` in `docs/index.html` to change the site name.

The entire color palette is derived from one hex value in `docs/assets/css/style.css`:

```css
:root {
  --accent: #1095c1;
}
```

Change it to any color. Light and dark themes adapt automatically.
