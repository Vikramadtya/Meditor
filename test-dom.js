import { JSDOM } from "jsdom";
const dom = new JSDOM(`<!DOCTYPE html><img id="i" src="hello.png">`);
const img = dom.window.document.getElementById("i");
console.log(img.getAttribute("src")); // hello.png
img.src = "blob:http://localhost/123";
console.log(img.getAttribute("src")); // blob:http://localhost/123
