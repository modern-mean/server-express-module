'use strict';

import gulp from 'gulp';
import * as modules from 'modern-mean-build-gulp';

//Build
let build = gulp.series(modules.server.clean, gulp.parallel(modules.server.application));
build.displayName = 'build';
gulp.task(build);

//Gulp Default
let defaultTask = gulp.parallel(build);
defaultTask.displayName = 'default';
gulp.task(defaultTask);

//Gulp Watch
let watch = gulp.series(defaultTask, modules.watch.all);
watch.displayName = 'watch';
gulp.task(watch);

//Gulp Lint
let lint = gulp.series(modules.lint.all);
lint.displayName = 'lint';
gulp.task(lint);

//Gulp Test
let testTask = gulp.series(modules.lint.all, defaultTask, modules.test.server);
testTask.displayName = 'test';
gulp.task(testTask);


//Gulp Coverage
let coverage = gulp.series(modules.test.coverage);
coverage.displayName = 'coverage';
gulp.task(coverage);

//Gulp Clean
let clean = gulp.series(modules.clean);
clean.displayName = 'clean';
gulp.task(clean);
