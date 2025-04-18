const gulp = require("gulp");
const shell = require("gulp-shell");

const rootPath = "D:/Github/lang";

// Build
gulp.task("compileserver", shell.task([`cd ${rootPath}/server/api && tsc`, `cd ${rootPath}/server/ui && tsc`]));
gulp.task("compileui", shell.task([`cd ${rootPath}/ui/frontend && npm run build`]));
gulp.task("copy", () => {
    return gulp.src(`${rootPath}/ui/frontend/dist/**/*`, { allowEmpty: true, encoding: false  }).pipe(gulp.dest(`${rootPath}/server/ui/dist/views/frontend/`));
});
gulp.task("build", gulp.series("compileserver", "compileui", "copy"));

// Start web node proccess
gulp.task("runapi", shell.task([`cd ${rootPath}/server/api && node dist/app.js > output.log 2>&1 &`]));
gulp.task("runui", shell.task([`cd ${rootPath}/server/ui && node dist/app.js > output.log 2>&1 &`]));
gulp.task("run", gulp.parallel("runapi", "runui"));
