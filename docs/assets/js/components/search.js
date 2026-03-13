import { fetchMd, slugify, parseSidebarLinks, stripMarkdown } from "../app.js";

class DocsSearch extends HTMLElement {
  connectedCallback() {
    this.input = this.querySelector(".search-input");
    this.results = this.querySelector(".search-results");
    this.fuse = null;

    this.input.addEventListener("input", (e) => this.onInput(e));

    this.results.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        this.input.value = "";
        this.results.classList.remove("open");
      }
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest("docs-search")) {
        this.results.classList.remove("open");
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement !== this.input) {
        e.preventDefault();
        this.input.focus();
      }
      if (e.key === "Escape") {
        this.input.blur();
        this.results.classList.remove("open");
      }
    });
  }

  set sidebarMd(md) {
    this.buildSearchIndex(md);
  }

  onInput(e) {
    const query = e.target.value.trim();
    if (!this.fuse || query.length < 2) {
      this.results.classList.remove("open");
      this.results.innerHTML = "";
      return;
    }

    const hits = this.fuse.search(query, { limit: 8 });
    if (hits.length === 0) {
      this.results.innerHTML = '<div class="search-empty">No results</div>';
      this.results.classList.add("open");
      return;
    }

    this.results.replaceChildren(...hits.map((h) => this.renderHit(h.item)));
    this.results.classList.add("open");
  }

  renderHit(item) {
    const href = item.slug
      ? `#/${item.path}?section=${item.slug}`
      : `#/${item.path}`;
    const snippet =
      item.text.substring(0, 120) + (item.text.length > 120 ? "..." : "");

    const a = document.createElement("a");
    a.className = "search-hit";
    a.href = href;

    const title = document.createElement("span");
    title.className = "search-hit-title";
    title.textContent = item.heading;

    const path = document.createElement("span");
    path.className = "search-hit-path";
    path.textContent = item.path;

    const snip = document.createElement("span");
    snip.className = "search-hit-snippet";
    snip.textContent = snippet;

    a.append(title, path, snip);
    return a;
  }

  splitSections(md, title) {
    const sections = md.split(/^(#{1,3}\s+.+)$/m);
    const entries = [];
    let currentHeading = title;
    let currentSlug = "";

    for (const part of sections) {
      const trimmed = part.trim();
      if (!trimmed) continue;

      const headingMatch = trimmed.match(/^#{1,3}\s+(.+)/);
      if (headingMatch) {
        currentHeading = headingMatch[1];
        currentSlug = "h-" + slugify(currentHeading);
        continue;
      }

      const text = stripMarkdown(trimmed);
      if (text.length > 0) {
        entries.push({
          heading: currentHeading,
          slug: currentSlug,
          text: text.substring(0, 500),
        });
      }
    }
    return entries;
  }

  async buildSearchIndex(sidebarMd) {
    const pages = parseSidebarLinks(sidebarMd);
    const entries = [];

    const results = await Promise.allSettled(
      pages.map(async ({ title, path }) => {
        const md = await fetchMd(path);
        return { title, path, md };
      }),
    );

    for (const result of results) {
      if (result.status !== "fulfilled") continue;
      const { title, path, md } = result.value;
      for (const section of this.splitSections(md, title)) {
        entries.push({ pageTitle: title, path, ...section });
      }
    }

    this.fuse = new Fuse(entries, {
      keys: [
        { name: "heading", weight: 0.4 },
        { name: "text", weight: 0.4 },
        { name: "pageTitle", weight: 0.2 },
      ],
      threshold: 0.35,
      minMatchCharLength: 2,
    });
  }
}

customElements.define("docs-search", DocsSearch);
