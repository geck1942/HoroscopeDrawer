const gulp = require('gulp');
const requireDir = require('require-dir');
const dir = requireDir('./tasks');

gulp.task('default', gulp.parallel('build'));

gulp.task('watch', function () {
  gulp.watch('src/horoscope/**/*', gulp.parallel('build'));
  gulp.watch('src/example/**/*', gulp.parallel('example-build'));
});
gulp.task('watch-builder', function () {
  gulp.watch('src/horoscope/**/*', gulp.parallel('build', 'builder-build'));
  gulp.watch('src/builder/**/*', gulp.parallel('builder-build'));
});