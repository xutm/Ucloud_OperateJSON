var gulp = require('gulp');
var less = require('gulp-less');
var LessPluginCleanCSS = require('less-plugin-clean-css'),
    cleancss = new LessPluginCleanCSS({ advanced: true });

gulp.task('less', function () {
    return gulp.src('./client/styles/less/main.less')
        .pipe(less({
            plugins: [cleancss]
        }))
        .pipe(gulp.dest('./client/styles/css'));
});

gulp.task('default', ['less']);