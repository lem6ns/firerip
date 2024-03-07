const { existsSync } = require('fs');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { JSDOM } = require("jsdom");
const YTDlpWrap = require('yt-dlp-wrap').default;
const ytDlpWrap = new YTDlpWrap();

async function downloadChapter(chapter, dest, cb) {
    if (existsSync(dest)) return; 
    const html = await fetch(chapter).then(r => r.text());
    const { document } = new JSDOM(html).window;

    const vimeoId = Number(atob(document.querySelector("global-data").getAttribute("vimeo"))) - Number(document.querySelector("head").getAttribute("data-build"));
    const youtubeId = atob(document.querySelector("global-data").getAttribute("youtube"));
    if (!vimeoId && youtubeId) {
        return new Promise((resolve, reject) => {
            ytDlpWrap
                .exec([
                    `https://youtube.com/watch?v=${youtubeId}`,
                    "-o",
                    dest,
                    "-f",
                    "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
                ])
                .on("progress", cb)
                .on("error", (err)=>reject(err))
                .on("close", ()=>resolve())
        });
    };
    if (!vimeoId && !youtubeId) return;
    const src = (await fetch(`https://vimeo.com/api/oembed.json?url=https%3A%2F%2Fvimeo.com%2F${vimeoId}&id=${vimeoId}`).then(r => r.json())).html.split("src=\"")[1].split("\"")[0];

    return new Promise((resolve, reject) => {
        ytDlpWrap
            .exec([
                "--referer",
                "https://fireship.io",
                src,
                "-o",
                dest
            ])
            .on("progress", cb)
            .on("error", (err)=>reject(err))
            .on("close", ()=>resolve())
    });
};

module.exports = downloadChapter;
