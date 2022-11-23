const { existsSync } = require('fs');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { JSDOM } = require("jsdom");
const YTDlpWrap = require('yt-dlp-wrap').default;
const ytDlpWrap = new YTDlpWrap();

async function downloadChapter(chapter, dest, cb) {
    if (existsSync(dest)) return; 
    const html = await fetch(chapter).then(r => r.text());
    const { document } = new JSDOM(html).window;

    const vimeoId = document.querySelector("global-data").getAttribute("vimeo");
    const youtubeId = document.querySelector("global-data").getAttribute("youtube");
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

    return new Promise((resolve, reject) => {
        ytDlpWrap
            .exec([
                "--referer",
                "https://fireship.io",
                `https://player.vimeo.com/video/${vimeoId}`,
                "-o",
                dest
            ])
            .on("progress", cb)
            .on("error", (err)=>reject(err))
            .on("close", ()=>resolve())
    });
};

module.exports = downloadChapter;