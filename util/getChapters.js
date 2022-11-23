import fetch from "node-fetch";
import { JSDOM } from "jsdom";

async function getChapters(course) {
    const html = await fetch(course).then(r => r.text());
    const { document } = new JSDOM(html).window;

    const chapters = [...document.querySelectorAll("div ul a")].map(el => {
        const chapterInfo = el.querySelector("li");
        return {
            name: chapterInfo.querySelector("h5").textContent.replace(/\d{2}/, "").trim(),
            description: chapterInfo.querySelector("p").textContent,
            number: chapterInfo.querySelector("h5 span").textContent,
            emoji: chapterInfo.querySelector("span").textContent.trim(),
            link: `https://fireship.io${el.href}`
        }
    });
    return chapters;
};

export default getChapters;