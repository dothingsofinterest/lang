const gulp = require("gulp");
const shell = require("gulp-shell");
const rootPath = "D:/Github/lang";

// Define task - Compile
gulp.task("compile", shell.task([`cd ${rootPath}/webapi && tsc`, `cd ${rootPath}/webserver && tsc`, `cd ${rootPath}/ui && npm run build`]));
// Define task - Copy
gulp.task("copy", () => {
    return gulp.src(`${rootPath}/ui/dist/**/*`, { allowEmpty: true, encoding: false  }).pipe(gulp.dest(`${rootPath}/webserver/dist/views/`));
});
// Define task - RunWebapi
gulp.task("webapi", shell.task([`cd ${rootPath}/webapi && node dist/app.js > output.log 2>&1 &`]));
// Define task RunWebserver
gulp.task("webserver", shell.task([`cd ${rootPath}/webserver && node dist/app.js > output.log 2>&1 &`]));
// Define task - print entry URL
gulp.task("console", (done) => {
	console.log('http://localhost:8080');
    done();
});

// Build
gulp.task("build", gulp.series("compile", "copy"));
// Start
gulp.task("run", gulp.parallel("webapi", "webserver", "console"));