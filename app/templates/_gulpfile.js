var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var rimraf = require('rimraf');
var sequence = require('run-sequence');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

// UI JavaScript
var uiJS = ['bower_components/chico/dist/ui/chico.js'];

// Mobile JavaScript
var mobileJS = ['bower_components/chico/dist/mobile/chico.js'];

// Path where is located the Bourbon source
var bourbonPath = '<%= bower.directory %>/bourbon/app/assets/stylesheets/';

// Cleans the build directory
gulp.task('clean', function (cb) {
    rimraf('./build', cb);
});

// Copies theme related assets
gulp.task('copy', function () {
    // Everything in the assets folder
    return gulp
        .src(['./<%= bower.directory %>/chico/src/shared/assets/**/*.*'], {
            base: './<%= bower.directory %>/chico/src/shared/'
        })
        .pipe(gulp.dest('./build'));
});

// Compiles Sass for the theme
gulp.task('sass', [
    'sass:theme:ui',
    'sass:theme:mobile'
]);

// Compiles Sass Ui for the theme
gulp.task('sass:theme:ui', function () {
    return gulp.src('src/styles/theme-ui.scss')
        .pipe($.sass({
            includePaths: [bourbonPath]
        }))
        .pipe($.rename('theme.css'))
        .pipe(gulp.dest('./build/ui/'))
        .pipe(reload({stream: true}));
});

gulp.task('sass:theme:mobile', function () {
    return gulp.src('src/styles/theme-mobile.scss')
        .pipe($.sass({
            includePaths: [bourbonPath]
        }))
        .pipe($.rename('theme.css'))
        .pipe(gulp.dest('./build/mobile/'))
        .pipe(reload({stream: true}));
});

// Compiles and copies Chico's JavaScript and it's dependencies
gulp.task('uglify', [
    'uglify:theme:ui',
    'uglify:theme:mobile'
]);

// UI JavaScript
gulp.task('uglify:theme:ui', function () {
    return gulp.src(uiJS)
        .pipe($.uglify({
            beautify: true,
            mangle: false
        }).on('error', function(e) {
            console.log(e);
        }))
        .pipe($.concat('ui.js'))
        .pipe(gulp.dest('./build/ui/'));
});

// Mobile JavaScript
gulp.task('uglify:theme:mobile', function () {
    return gulp.src(mobileJS)
        .pipe($.uglify({
            beautify: true,
            mangle: false
        }).on('error', function(e) {
            console.log(e);
        }))
        .pipe($.concat('mobile.js'))
        .pipe(gulp.dest('./build/mobile/'));
});

// Starts a BrowserSync server, which you can view at http://localhost:3040
gulp.task('browser-sync', ['build'], function () {
    browserSync.init({
        port: 3040,
        startPath: '/ui.html',
        server: {
            baseDir: [
                './src/views/',
                './'
            ]
        }
    });

    gulp.watch('build/*.js').on('change', reload);
    gulp.watch('src/views/*.html').on('change', reload);
    gulp.watch('src/styles/*.scss', ['sass']);
});

// Builds all files without starting a server
gulp.task('build', function () {
    return sequence('clean', [
        'copy',
        'sass',
        'uglify'
    ], function () {
        console.log('The theme was successfully built.');
    });
});

// Default task: builds your theme and starts a server
gulp.task('default', [
    'build',
    'browser-sync'
]);
