import gulp from 'gulp';
import * as builder from '@modern-mean/build-gulp';

//gulp build
let build = gulp.series(builder.build.clean, builder.build.all);
build.displayName = 'build';
gulp.task(build);

//gulp test
let test = gulp.series(builder.lint.all, builder.test.src);
test.displayName = 'test';
gulp.task(test);

//gulp
let defaultTask = gulp.series(build);
defaultTask.displayName = 'default';
gulp.task(defaultTask);
