import getCourses from "./util/getCourses.js";
import getChapters from "./util/getChapters.js";
import downloadChapter from "./util/downloadChapter.cjs";
import { eachLimit } from "async";
import { MultiProgressBars } from 'multi-progress-bars';

const mpb = new MultiProgressBars({
    initMessage: ' Firerip ',
    anchor: "bottom",
    persist: true,
    progressWidth: 40,
    numCrawlers: 7,
    border: true,
});

(async () => {
    console.log("[INFO] Grabbing courses")
    const courses = await getCourses();

    for (const course of courses) {
        console.log(`[INFO] Grabbing chapters from ${course.title}`)
        const chapters = await getChapters(course.link);

        await eachLimit(chapters, 4, async (chapter) => {
            mpb.addTask(chapter.name, { type: "percentage", message: `${chapter.number} - ${course.title}` });

            await downloadChapter(chapter.link, `./downloads/${course.title}/${chapter.number}. ${chapter.emoji} - ${chapter.name.replace(/\//g, " ")}.mp4`, (progress) => {
                mpb.updateTask(chapter.name, { percentage: progress.percent / 100 })
            }).catch((err) => console.log(err));

            mpb.done(chapter.name, { message: `${chapter.number} - ${course.title} - Downloaded successfully.` });
            setTimeout(() => mpb.removeTask(chapter.name), 3000);
        });
    }
})();