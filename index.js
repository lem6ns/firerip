import getCourses from "./util/getCourses.js";
import getChapters from "./util/getChapters.js";
import downloadChapter from "./util/downloadChapter.cjs";
import { eachLimit } from "async";
import { MultiProgressBars } from 'multi-progress-bars';
import { program } from "commander";
import chalk from "chalk";
import inquirer from "inquirer";

const mpb = new MultiProgressBars({
    initMessage: ' Firerip ',
    anchor: "bottom",
    persist: true,
    progressWidth: 40,
    numCrawlers: 7,
    border: true,
});

(async () => {
    const courses = await getCourses();
    let errors = 0
    program.action(() => {
        inquirer.prompt([
            {
                type: "checkbox",
                name: "courses",
                message: "Select courses to download",
                choices: courses.map((course) => ({ name: course.title, value: course })),
                loop: false,
            },
        ]).then(async (answers) => {
            for (const course of answers.courses) {
                const chapters = await getChapters(course.link);
                await eachLimit(chapters, 4, async (chapter) => {
                    mpb.addTask(chapter.name, { type: "percentage", message: `${chapter.number} - ${course.title}` });

                    await downloadChapter(chapter.link, `./downloads/${course.title}/${chapter.number}. ${chapter.emoji} - ${chapter.name.replace(/\//g, " ")}.mp4`, (progress) => {
                        mpb.updateTask(chapter.name, { percentage: progress.percent / 100 })
                    }).catch((err) => {
                        chalk.red(err); 
                        errors++
                    });

                    mpb.done(chapter.name, { message: `${chapter.number} - ${course.title} - Downloaded successfully.` });
                    setTimeout(() => mpb.removeTask(chapter.name), 3000);
                });
                await mpb.promise;
                mpb.setHeader({
                    message: `Firerip - Downloaded ${course.title} ${errors > 0 ? 'with errors ❌' : '✅'}`,
                    left: ` ${errors > 0 ? '❌' : '🚀'}`,
                    right: ` ${errors > 0 ? '❌' : '🚀'}`
                });
            }
        });
    })
    program.parse(process.argv);
})();