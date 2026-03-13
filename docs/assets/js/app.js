import "./components/mobile-drawer.js";
import "./components/sidebar.js";
import "./components/content.js";
import "./components/search.js";
import "./components/theme-toggle.js";

// --- utils ---

export async function fetchMd(path) {
  const res = await fetch(path.replace(/^\//, ""));
  if (!res.ok) throw new Error(`${res.status} — ${path}`);
  return res.text();
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function annotatePre(html) {
  return html.replace(
    /<pre><code class="language-(\w+)">/g,
    (_, lang) => `<pre data-lang="${lang}"><code class="language-${lang}">`,
  );
}

export function fixLinks(html) {
  return html.replace(
    /href="([^"#][^"]*\.md[^"]*)"/g,
    (_, href) => `href="#/${href}"`,
  );
}

const SIDEBAR_LINK_RE = /^[\s-]*\[(.+?)\]\((.+?)\)/;

export function parseSidebarLinks(md) {
  const links = [];
  for (const line of md.split("\n")) {
    const m = line.match(SIDEBAR_LINK_RE);
    if (m) links.push({ title: m[1], path: m[2].replace(/^\//, "") });
  }
  return links;
}

export function stripMarkdown(text) {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]+`/g, "")
    .replace(/[#*_>\[\]()!|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// --- router ---

export function getPath() {
  const hash = location.hash.replace(/^#\//, "").trim();
  const path = hash.split("?")[0];
  return path || "index.md";
}

export function getHashParam(key) {
  const parts = location.hash.split("?")[1];
  if (!parts) return null;
  const params = new URLSearchParams(parts);
  return params.get(key);
}

function dispatch() {
  window.dispatchEvent(
    new CustomEvent("docs-navigate", {
      detail: { path: getPath(), section: getHashParam("section") },
    }),
  );
}

function initRouter() {
  window.addEventListener("hashchange", dispatch);
  dispatch();
}

// --- init ---

const sidebarEl = document.querySelector("docs-sidebar");
const searchEl = document.querySelector("docs-search");

(async () => {
  try {
    const md = await fetchMd("_sidebar.md");
    sidebarEl.sidebarMd = md;
    searchEl.sidebarMd = md;
  } catch {
    sidebarEl.querySelector(".sidebar-nav").innerHTML = "";
  }
  initRouter();
})();
