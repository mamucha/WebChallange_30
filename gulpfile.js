const gulp = require("gulp");
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const autoprefixer = require("gulp-autoprefixer");
const plumber = require("gulp-plumber");
const colors = require("ansi-colors");
const notifier = require("node-notifier")
const rename = require("gulp-rename");
const wait = require("gulp-wait");
const csso = require("gulp-csso");
const browserSync = require("browser-sync").create();
const webpack = require("webpack");

const showError = (err) => {
    notifier.notify({
        title: "Error in sass",
        message: err.messageFormatted
    });

    console.log(colors.red("==============================="));
    console.log(colors.red(err.messageFormatted));
    console.log(colors.red("==============================="));
    this.emit("end");
}


const browseSyncTask = () => {
    browserSync.init({
        server: "./docs",
        notify: false,
        //host: "192.168.0.24",
        //port: 3000,
        open: true,
        //browser: "google chrome" //https://stackoverflow.com/questions/24686585/gulp-browser-sync-open-chrome-only
    });
};


const sassTask = () => {
    return gulp.src("src/scss/style.scss")
        .pipe(wait(500))
        .pipe(plumber({
            errorHandler: showError
        }))
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: "compressed" //nested, expanded, compact, compressed
        }))
        .pipe(autoprefixer({
            browsers: ["> 5%"]
        })) //autoprefixy https://github.com/browserslist/browserslist#queries
        .pipe(csso())
        .pipe(rename({
            suffix: ".min",
            basename: "style"
        }))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("docs/css"))
        .pipe(browserSync.stream({
            match: "**/*.css"
        }));
};


const es6Task = (cb) => { //https://github.com/webpack/docs/wiki/usage-with-gulp#normal-compilation
    return webpack(require("./webpack.config.js"), function (err, stats) {
        if (err) throw err;
        console.log(stats.toString());
        cb();
        browserSync.reload();
    })
};


const watchTask = () => {
    gulp.watch("src/scss/**/*.scss", gulp.series(sassTask));
    // gulp.watch("src/js/**/*.js", gulp.series(es6Task));
    gulp.watch("src/**/*.js", gulp.series(es6Task));
    gulp.watch("docs/**/*.html").on("change", browserSync.reload);
};


exports.default = gulp.parallel(sassTask, es6Task, browseSyncTask, watchTask);