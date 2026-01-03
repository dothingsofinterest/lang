const gulp = require("gulp");
const shell = require("gulp-shell");
const path = require("path");
const rootPath = __dirname;

// Compile
gulp.task("compile", shell.task([`cd ${path.join(rootPath, "webapi")} && npm install && tsc`, `cd ${path.join(rootPath, "webserver")} && npm install && tsc`, `cd ${path.join(rootPath, "ui")} && npm install && npm run build`]));
// Copy
gulp.task("copy", () => {
    return gulp.src(path.join(rootPath, "ui", "dist", "**", "*"), { allowEmpty: true, encoding: false }).pipe(gulp.dest(path.join(rootPath, "webserver", "dist", "views")));
});
// Run webapi
gulp.task("webapi", shell.task([`cd ${path.join(rootPath, "webapi")} && node dist/app.js > output.log 2>&1 &`]));
// Run webserver
gulp.task("webserver", shell.task([`cd ${path.join(rootPath, "webserver")} && node dist/app.js > output.log 2>&1 &`]));
// Print entry URL
gulp.task("console", (done) => {
    console.log("http://localhost:8080");
    done();
});

// Build
gulp.task("build", gulp.series("compile", "copy"));
// Start
gulp.task("run", gulp.parallel("webapi", "webserver", "console"));
