'use strict';

// Load node modules/plugins
var gulp = require('gulp'),
  concat = require('gulp-concat'),
  eslint = require('gulp-eslint'),
  uglify = require('gulp-uglify'),
  uglifycss = require('gulp-uglifycss'),
  rename = require('gulp-rename'),
  sass = require('gulp-sass'),
  imagemin = require('gulp-imagemin'),
  maps = require('gulp-sourcemaps'),
  del = require('del'),
  browserSync = require('browser-sync').create();


// Lint task
gulp.task('lintScripts', function(){
 return gulp.src(['app/js/global.js', 'app/js/circle/*.js'])
  // This will lint the scripts
   .pipe(eslint())
   // Then output any warnings/errors to console
   .pipe(eslint.format())
   // And halt the build process if there's an error
   .pipe(eslint.failAfterError());
});

// Concatenate scripts task
gulp.task('concatScripts', ['lintScripts'], function(){
  return gulp.src(['app/js/global.js', 'app/js/circle/*.js'])
    // Generate source maps for JS files
    .pipe(maps.init())
    // Concatenate JS files into file named all.js
    .pipe(concat('all.js'))
    .pipe(maps.write('./'))
    // Pipe result to the js/all folder
    .pipe(gulp.dest('app/js/all'))
    // Reload browser with updated JS
    .pipe(browserSync.reload({
      stream: true
    }));
});

// Scripts task
gulp.task('scripts', ['concatScripts'], function(){
  return gulp.src('app/js/all/all.js')
    // Take all.js file created in concatScripts and minify it
    .pipe(uglify())
    // Then rename resulting file all.min.js
    .pipe(rename('all.min.js'))
    // Copy it to js/all
    .pipe(gulp.dest('app/js/all'))
    // And also copy it to dist/scripts
    .pipe(gulp.dest('dist/scripts'))
});

// Compile sass task
gulp.task('compileSass', function(){
  return gulp.src(['app/sass/global.scss'])
    // Generate source maps for the SCSS files
    .pipe(maps.init())
    // Compile those files into CSS
    .pipe(sass())
    // Name the resulting file all.css
    .pipe(rename('all.css'))
    // Write source maps
    .pipe(maps.write('./'))
    // Save the result to css folder
    .pipe(gulp.dest('app/css'))
    // Use browser-sync to inject new CSS styles into the browser
    .pipe(browserSync.reload({
      stream: true
    }));
});

// Styles task
gulp.task('styles', ['compileSass'], function(){
  return gulp.src(['app/css/all.css'])
    // Minify the CSS
    .pipe(uglifycss())
    // Rename as all.min.css
    .pipe(rename('all.min.css'))
    // Copy result to css folder
    .pipe(gulp.dest('app/css'))
    // The result is copied to the dist/styles folder
    .pipe(gulp.dest('dist/styles'))
});

// Optimize images task
gulp.task('images', function(){
  return gulp.src('app/images/*')
    // Optimize JPEG and PNG images
    .pipe(imagemin())
    // Copies them to dist/content
    .pipe(gulp.dest('dist/content'));
});

// Clean task
// Deletes all files and folders in the dist folder
// It also deletes the js/all and css folders
gulp.task('clean', function(){
  return del(['dist', 'app/js/all', 'app/css']);
});

// Build task
// Runs clean, scripts, styles and images tasks
// But clean must complete first, so it is a dependency and the other tasks run in the callback
gulp.task('build', ['clean'], function(){
  gulp.start(['scripts', 'styles', 'images']);
  // This task also moves index.html and icon files to the dist folder
  return gulp.src(['app/index.html', 'app/icons/**'], {base: './app'})
    .pipe(gulp.dest('dist'));
});

// Default task
// This makes 'build' the default task so it runs when 'gulp' is run from the command line
gulp.task('default', function(){
  gulp.start('build');
});

// Serve task
// Running 'gulp serve' from command line will build and serve project using a local web server
gulp.task('serve', ['build'], function(){
  browserSync.init({
    server: {
      baseDir: 'app'
    }
  })
  // It will also start the watch task, which in turn will reload browser when changes are made to JS and SCSS files
  return gulp.start('watch');
});

// Watch task
gulp.task('watch', function(){
  // Run concatScripts when JS files are updated
  gulp.watch(['app/js/global.js', 'app/js/circle/*.js'], ['concatScripts']);
  // Run styles task when SCSS or SASS files are updated
  gulp.watch(['app/sass/*.scss', 'app/sass/**/*.sass', 'app/sass/**/**/*.sass'], ['styles']);
});
