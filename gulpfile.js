'use strict';

// Load node modules/plugins
var gulp = require('gulp');
var concat = require('gulp-concat');
var eslint = require('gulp-eslint');
var uglify = require('gulp-uglify');
var uglifycss = require('gulp-uglifycss');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var imagemin = require('gulp-imagemin');
var maps = require('gulp-sourcemaps');
var del = require('del');
var browserSync = require('browser-sync').create();


// Instead of putting all the JS-related tasks into one 'scripts' task, I am breaking them down into smaller tasks. Is that the right thing to do?


// Concatenate scripts task
// This task generates source maps for the JS files
// It then concatenates the JS files and pipes them to the js/all folder
// ** Was it correct to pipe them to a js/all folder?
gulp.task('concatScripts', function(){
  return gulp.src(['js/*.js', 'js/**/*.js'])
    .pipe(maps.init())
    .pipe(concat('all.js'))
    .pipe(maps.write('./'))
    .pipe(gulp.dest('js/all'));
});

// Minify scripts task
// This concatenates the scripts before minifying them
// It will then rename the result as all.min.js and place it in dist/scripts
// ** It also uses browser-sync to update browser with new JS, but is this the correct place to do that?
gulp.task('minifyScripts', ['concatScripts'], function(){
  return gulp.src('js/all/all.js')
    .pipe(uglify())
    .pipe(rename('all.min.js'))
    .pipe(gulp.dest('dist/scripts'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// Lint task
// This task will lint the scripts, and be used to halt the build process if there's an error
gulp.task('lintScripts', function(){
 return gulp.src(['js/*.js', 'js/*/*.js'])
   .pipe(eslint())
   .pipe(eslint.format())
   .pipe(eslint.failAfterError());
});

// Scripts task
// This task will lint, concatenate and minify all JS files
// It will also rename the result and place it in dist/scripts
// I have set up the task this way because I want to make sure the scripts are linted before they are minified
gulp.task('scripts', ['lintScripts'], function(){
  return gulp.start('minifyScripts');
});

// Styles task
// First, this generates source maps for the SCSS files
// Then it compiles SCSS files into CSS
// It concatenates and minifies the CSS into all.min.css
// The result is copied to the dist/styles folder
// browser-sync is used to inject new CSS styles into the browser whenever the styles task is run
gulp.task('styles', function(){
  return gulp.src(['sass/*.scss', 'sass/**/*.sass', 'sass/**/**/*.sass'])
    .pipe(maps.init())
    .pipe(sass())
    .pipe(concat('all.min.css'))
    .pipe(uglifycss())
    .pipe(maps.write('./'))
    .pipe(gulp.dest('dist/styles'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// Optimize images task
// This optimizes JPEG and PNG images, and copies them to dist/content
gulp.task('images', function(){
  return gulp.src('images/*')
    .pipe(imagemin())
    .pipe(gulp.dest('dist/content'));
});

// Clean task
// Deletes all files and folders in the dist folder
// It also deletes the js/all folder, which I created as an intermediate step in concatScripts
gulp.task('clean', function(){
  return del(['dist', 'js/all']);
});

// Build task
// Runs clean, scripts, styles and images tasks
// But clean must complete first, so it is a dependency and the other tasks run in the callback
gulp.task('build', ['clean'], function(){
  gulp.start('scripts', 'styles', 'images');
  // This task also moves index.html and icon files to the dist folder
  gulp.src(['index.html', 'icons/**'], {base: './'})
    .pipe(gulp.dest('dist'));
});


// Default task
// This makes 'build' the default task so it runs when 'gulp' is run from the command line
gulp.task('default', function(){
  gulp.start('build');
});

// Serve task
// gulp serve from command line should build and serve the project using a local web server
gulp.task('serve', ['build'], function(){
  browserSync.init({
    server: {
      baseDir: 'dist'
    }
  })
  gulp.start('watch');
});

// Watch task
// ** In the video, Huston only used concatScripts in the watch task
// ** I believe the rationale was that minifying takes too much time, so you wouldn't want to do it anytime you save a file.
// ** So should I have just used concatScripts here?
gulp.task('watch', function(){
  gulp.watch(['js/global.js', 'js/circle/*.js'], ['scripts']);
  gulp.watch(['sass/*.scss', 'sass/**/*.sass', 'sass/**/**/*.sass'], ['styles']);
});
