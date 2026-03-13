class MobileDrawer extends HTMLElement {
  connectedCallback() {
    this.sidebarSelector =
      this.getAttribute("sidebar-selector") || "docs-sidebar";
    this.btn = this.querySelector(".menu-btn");
    this.icon = this.querySelector(".menu-icon");
    this.overlayEl = this.querySelector(".overlay");

    this.btn.addEventListener("click", () => this.toggle());
    this.overlayEl.addEventListener("click", () => this.setOpen(false));

    window.addEventListener("docs-navigate", () => this.setOpen(false));
  }

  get open() {
    return this.hasAttribute("open");
  }

  toggle() {
    this.setOpen(!this.open);
  }

  setOpen(val) {
    val ? this.setAttribute("open", "") : this.removeAttribute("open");
    const sidebar = document.querySelector(this.sidebarSelector);
    const method = val ? "add" : "remove";
    if (sidebar) sidebar.classList[method]("open");
    this.overlayEl.classList[method]("open");
    this.icon.textContent = val ? "✕" : "≡";
  }
}

customElements.define("mobile-drawer", MobileDrawer);
