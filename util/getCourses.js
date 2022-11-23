import fetch from "node-fetch";
import { JSDOM } from "jsdom";

async function getCourses() {
    const html = await fetch("https://fireship.io/courses/").then(r => r.text());
    const { document } = new JSDOM(html).window;

    const courses = [...document.querySelectorAll("article")].map(el => {
        return {
            title: el.querySelector("h5").textContent,
            description: el.querySelector("p").textContent,
            tags: [...el.querySelectorAll("span")].map(el => el.textContent.trim()),
            link: `https://fireship.io${el.querySelector("a").href}`,
            image: `https://fireship.io${el.querySelector("img").src}`
        }
    });
    return courses;
}

export default getCourses;