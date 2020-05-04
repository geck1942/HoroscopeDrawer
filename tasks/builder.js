const gulp = require('gulp');
const fs = require("fs");
const del = require('del');
const browserify = require("browserify");
const babelify = require('babelify');

gulp.task('builder-clean', function () {
  return del([
    'builder/**/*'
  ]);
});

gulp.task('builder-copy-dist', (done) => {
  gulp.src('dist/**/*')
    .pipe(gulp.dest('celestialhoroscope/'));
  done();
});

gulp.task('builder-copy', (done) => {
  gulp.src('src/builder/**/*.{php,html,js,txt,xml,png,jpg,gif,gpg,css}')
    .pipe(gulp.dest('celestialhoroscope/'));
  done();
});

// gulp.task('builder-bundle', function (done) {
//   browserify({
//     entries: ["src/builder/builder.js"],
//     debug: true,
//     paths: [
//       "./node_modules",
//       "./builder"
//     ]
//   })
//     .transform(babelify, {presets: ["es2015"], sourceMaps: true})
//     .bundle()
//     .pipe(fs.createWriteStream("builder/builder.js"));
//   done();
// });

gulp.task('builder-build',
  gulp.series(
    'clean',
    'builder-clean',
    'build',
    'builder-copy-dist',
    'builder-copy'
  )
);