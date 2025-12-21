export default class {
  constructor() {
    window.addEventListener("cockpit-style", event => {
        if (event instanceof CustomEvent) {
            const style = event.detail.style;
            this.setTheme(style)
        }
    });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const style = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? "dark" : "light";
        //console.log(`Operating system theme preference changed to ${style}`);
    })
  }

  setTheme(style) {
    console.log(`Change Cockpit style to ${style}`);
    if (style === "dark") {
      document.body.classList.add("theme-dark");
    } else {
      document.body.classList.remove("theme-dark");
    }
  }

}