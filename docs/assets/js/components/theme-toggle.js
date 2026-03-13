class ThemeToggle extends HTMLElement {
  connectedCallback() {
    this.btn = this.querySelector(".theme-btn");
    this.update();

    this.btn.addEventListener("click", () => {
      const next =
        document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      localStorage.setItem("theme", next);
      this.update();
    });
  }

  update() {
    const theme = document.documentElement.dataset.theme;
    this.btn.textContent = theme === "dark" ? "☀" : "☾";
    this.btn.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
    );
  }
}

// Apply saved or system preference before paint
(function () {
  const saved = localStorage.getItem("theme");
  if (saved) {
    document.documentElement.dataset.theme = saved;
  } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.documentElement.dataset.theme = "dark";
  }
})();

customElements.define("theme-toggle", ThemeToggle);
