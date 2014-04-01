var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    less = require('gulp-less'),
    rename = require('gulp-rename'),
    browserify = require('gulp-browserify');

var paths = {
    main: 'index.js',
    less: ['styles/atlastory.less']
};

gulp.task('browserify', function() {
    return gulp.src(paths.main)
        .pipe(browserify())
        .pipe(rename('Atlastory.js'))
        .pipe(gulp.dest('build'));
});

gulp.task('min', function() {
    return gulp.src(paths.main)
        .pipe(browserify())
        .pipe(rename('Atlastory.min.js'))
        .pipe(uglify({ outSourceMap: true }))
        .pipe(gulp.dest('build'));
});

gulp.task('styles', function() {
    return gulp.src(paths.less)
        .pipe(less({
            compress: true,
            cleancss: true
        }))
        .pipe(rename('Atlastory.css'))
        .pipe(gulp.dest('build'));
});

gulp.task('watch', function() {
    gulp.watch(['lib/*.js', 'lib/*/**.js', 'index.js'], ['browserify']);
    gulp.watch('styles/*', ['styles']);
});

gulp.task('build', ['browserify', 'min', 'styles']);
gulp.task('default', ['watch']);
