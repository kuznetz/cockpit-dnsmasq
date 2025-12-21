export default class {
  constructor() {
    window.addEventListener("cockpit-style", event => {
        if (event instanceof CustomEvent) {
            const style = event.detail.style;
            this.setLocalTheme(style)
        }
    });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const style = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? "dark" : "light";
        //console.log(`Operating system theme preference changed to ${style}`);
    })
    this.loadTheme()
    //this.setLocalTheme('dark')
  }

  loadTheme() {
    let curTheme = localStorage.getItem('shell:style') || 'auto';    
    if (curTheme === 'auto') {
      curTheme = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? "dark" : "light";
    }
    this.setLocalTheme(curTheme)
  }

  setLocalTheme(style) {
    console.log(`Change Cockpit style to ${style}`);
    if (style === "dark") {
      document.body.classList.add("theme-dark");
    } else {
      document.body.classList.remove("theme-dark");
    }
  }

}