import { parseSidebarLinks } from "../app.js";

class DocsSidebar extends HTMLElement {
  connectedCallback() {
    this.nav = this.querySelector(".sidebar-nav");

    window.addEventListener("docs-navigate", (e) => {
      this.setActiveLink(e.detail.path);
    });
  }

  set sidebarMd(md) {
    this.parseSidebar(md);
  }

  parseSidebar(md) {
    this.nav.innerHTML = "";
    let ul = null;

    md.split("\n").forEach((line) => {
      const heading = line.match(/^##\s+(.*)/);

      if (heading) {
        const el = document.createElement("p");
        el.className = "sidebar-section";
        el.textContent = heading[1];
        this.nav.appendChild(el);
        ul = null;
        return;
      }

      const links = parseSidebarLinks(line);
      if (links.length === 0) return;

      if (!ul) {
        ul = document.createElement("ul");
        this.nav.appendChild(ul);
      }
      const { title, path } = links[0];
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.textContent = title;
      a.href = "#/" + path;
      a.dataset.path = path;
      li.appendChild(a);
      ul.appendChild(li);
    });
  }

  setActiveLink(path) {
    this.querySelectorAll(".sidebar-nav a").forEach((a) => {
      a.classList.toggle("active", a.dataset.path === path);
    });
  }
}

customElements.define("docs-sidebar", DocsSidebar);
