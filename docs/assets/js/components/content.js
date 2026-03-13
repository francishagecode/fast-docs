import {
  fetchMd,
  slugify,
  annotatePre,
  fixLinks,
  getHashParam,
} from "../app.js";

const SITE_NAME = document.title;

class DocsContent extends HTMLElement {
  connectedCallback() {
    this.contentEl = this.querySelector(".content");

    this.renderer = new marked.Renderer();
    this.renderer.heading = ({ text, depth }) => {
      const id = "h-" + slugify(text);
      return `<h${depth} id="${id}">${text} <a class="heading-anchor" data-heading="${id}" href="javascript:void(0)">#</a></h${depth}>`;
    };
    marked.setOptions({ renderer: this.renderer });

    this.contentEl.addEventListener("click", (e) => {
      const anchor = e.target.closest(".heading-anchor");
      if (!anchor) return;
      this.scrollToHeading(anchor.dataset.heading);
    });

    window.addEventListener("docs-navigate", (e) => {
      this.loadPage(e.detail.path, e.detail.section);
    });
  }

  scrollToHeading(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    if (this._currentPath) {
      history.replaceState(null, "", `#/${this._currentPath}?section=${id}`);
    }
  }

  renderMd(md) {
    let html = marked.parse(md);
    html = annotatePre(html);
    html = fixLinks(html);
    return html;
  }

  updateTitle(path) {
    document.title =
      path === "index.md"
        ? SITE_NAME
        : `${SITE_NAME} · ${path.split("/").pop().replace(".md", "")}`;
  }

  scrollToSection(section) {
    const headingId = section || getHashParam("section");
    if (headingId) {
      const el = document.getElementById(headingId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo(0, 0);
    }
  }

  async loadPage(path, section) {
    this._currentPath = path;

    try {
      const md = await fetchMd(path);
      this.contentEl.innerHTML = this.renderMd(md);
      this.scrollToSection(section);
      this.updateTitle(path);
      this.dispatchEvent(
        new CustomEvent("content-loaded", { detail: { path } }),
      );
    } catch (e) {
      const p = document.createElement("p");
      p.style.cssText = "font-family:var(--mono);font-size:14px;color:var(--text-muted)";
      const code = document.createElement("code");
      code.textContent = path;
      p.append("Could not load ", code, document.createElement("br"), document.createElement("br"), e.message);
      this.contentEl.replaceChildren(Object.assign(document.createElement("h1"), { textContent: "404" }), p);
    }
  }
}

customElements.define("docs-content", DocsContent);
