/* utils.js - tiny DOM and theme helpers */
const $=id=>document.getElementById(id);
const css=k=>getComputedStyle(document.documentElement).getPropertyValue(k).trim();
