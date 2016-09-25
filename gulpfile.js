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


// Scripts-related tasks
// Broken down into lint, concat and minify tasks

// lint must halt build process if there's an error
// gulp.task('lintScripts', function(){
//  gulp.src(['js/*.js', 'js/*/*.js'])
//    .pipe(eslint())
//    .pipe(eslint.format())
//    .pipe(eslint.failAfterError());
// });

// I piped this to an all folder, but what's the convention?
gulp.task('concatScripts', function(){
  return gulp.src(['js/*.js', 'js/**/*.js'])
    .pipe(maps.init())
    .pipe(concat('all.js'))
    .pipe(maps.write('./'))
    .pipe(gulp.dest('js/all'));
});


gulp.task('minifyScripts', ['concatScripts'], function(){
  return gulp.src('js/all/all.js')
    .pipe(uglify())
    .pipe(rename('all.min.js'))
    .pipe(gulp.dest('dist/scripts'));
});

// But he only used concatScripts, not minifyScripts
gulp.task('watch', function(){
  gulp.watch(['js/global.js', 'js/circle/*.js'], ['minifyScripts']);
  gulp.watch(['sass/*.scss', 'sass/**/*.sass', 'sass/**/**/*.sass'], ['styles']);
});

// Scripts task - add lintScripts as a dependency
// although, do I just need to make lintScripts a dependency of concatScripts?
gulp.task('scripts', ['minifyScripts']);



// Styles task
// compile SCSS files into CSS, then concatenate and minify into an all.min.css file that is then
// copied to the dist/styles folder
gulp.task('styles', function(){
  return gulp.src(['sass/*.scss', 'sass/**/*.sass', 'sass/**/**/*.sass'])
    .pipe(maps.init())
    .pipe(sass())
    .pipe(concat('all.min.css'))
    .pipe(uglifycss())
    .pipe(maps.write('./'))
    .pipe(gulp.dest('dist/styles'));
});


// Optimize images task
gulp.task('images', function(){
  return gulp.src('images/*')
    .pipe(imagemin())
    .pipe(gulp.dest('dist/content'));
});


// Clean task
// deletes all files and folders in dist folder
// But don't I have to delete all folder too?
// I think concatScripts is not overwriting the previous files. Is that happening for anything else?
//**WHY IS MY PROGRAM DIFFERENT THAN HIS?
// also, he didn't do a return on this task - why?
gulp.task('clean', function(){
  return del(['dist', 'js/all']);
});


// Build task - runs clean, scripts, styles and images (but clean first)
// also moves index.html and icon files to dest, because they weren't there
gulp.task('build', ['scripts', 'styles', 'images'], function(){
  return gulp.src(['index.html', 'icons/**'], {base: './'})
    .pipe(gulp.dest('dist'));
});


// Make build default task so it runs when you run gulp from the command line
gulp.task('default', ['clean'], function(){
  gulp.start('build');
});

// gulp serve from command line should build and serve the project using a local web server
// Is this where I'd use browsersync? or http-server?
gulp.task('serve', function(){


});
