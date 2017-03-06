const gulp = require('gulp')
//const rename = require('gulp-rename')
const concat = require('gulp-concat')
const concatCss = require('gulp-concat-css')
const minifyCSS = require('gulp-minify-css');
const replace = require('gulp-replace')
const templateCache = require('gulp-angular-templatecache')
const ngAnnotate = require('gulp-ng-annotate')
const plumber = require('gulp-plumber')
const uglify = require('gulp-uglify')
const bytediff = require('gulp-bytediff')
const order = require("gulp-order");

gulp.task('concatScripts', function() {
  return gulp.src(['js/*.js'])
    .pipe(plumber())
    .pipe(concat('app.min.js', { newLine: ';' }))
    .pipe(ngAnnotate({ add: true }))
    .pipe(bytediff.start())
		.pipe(uglify({ mangle: true }))
		.pipe(bytediff.stop())
    .pipe(plumber.stop())
    .pipe(gulp.dest('dist/'))
})

gulp.task('concatVendorScripts', function() {
  return gulp.src(['js/vendor/*'])
    .pipe(order([
      'angular.min.js',
      '*.js'
    ]))
    .pipe(concat('deps.min.js', {
      newLine: ''
    }))
    .pipe(bytediff.start())
		.pipe(uglify({ mangle: true }))
		.pipe(bytediff.stop())
    .pipe(gulp.dest('dist/'))
})

gulp.task('buildTemplateCache', function() {
  return gulp.src(['templates/*.html', 'templates/**/*.html'])
    .pipe(templateCache({
        module: 'OWI',
        root: 'templates/'
    }))
    .pipe(gulp.dest('dist'))
})

gulp.task('tabTemplate', ['buildTemplateCache'], function() {
  return gulp.src(['index.html'])
      .pipe(replace(/<!-- deploy:replace\=\'(.*)\' -->([\s\S]+?)[^\/deploy:]<!-- \/deploy:replace -->/g, '$1'))
      .pipe(replace('</head>', '  <script src="templates.js"></script>\n</head>'))
      .pipe(gulp.dest('dist'));
});

gulp.task('buildStyles', ['concatMainCSS', 'moveVendorCSS', 'moveEventCSS', 'moveThemeFiles', 'moveThemeEventCSS'])
gulp.task('concatMainCSS', function() {
  return gulp.src(['css/*.css', '!css/vendor.min.css', '!css/events.css'], {
    base: 'src'
  })
  .pipe(concatCss("main.min.css"))
  .pipe(minifyCSS())
  .pipe(gulp.dest('dist/css'))
})

gulp.task('moveVendorCSS', function() {
  return gulp.src(['css/vendor.min.css'])
  .pipe(concatCss("vendor.min.css"))
  .pipe(minifyCSS())
  .pipe(gulp.dest('dist/css'))
})

gulp.task('moveEventCSS', function() {
  return gulp.src(['css/events.css'])
  .pipe(concatCss("events.min.css"))
  .pipe(minifyCSS())
  .pipe(gulp.dest('dist/css'))
})

gulp.task('moveThemeFiles', function() {
  return gulp.src(['css/**/*', '!css/**/*.css'])
  .pipe(gulp.dest('dist/css/'))
})

gulp.task('moveThemeEventCSS', function() {
  return gulp.src(['css/themes/dirtdiglett/events.css'])
  .pipe(concatCss("events.min.css"))
  .pipe(minifyCSS())
  .pipe(gulp.dest('dist/css/themes/dirtdiglett'))
})

gulp.task('moveFonts', function() {
  return gulp.src(['fonts/**/*'], {
    base: 'src'
  }).pipe(gulp.dest('dist/fonts'))
})

gulp.task('moveData', function() {
  return gulp.src(['data/master.json'], {
    base: 'src'
  }).pipe(gulp.dest('dist/data'))
})

gulp.task('moveResources', function() {
  return gulp.src(['resources/*', 'resources/icons/*'], {
    base: 'src'
  }).pipe(gulp.dest('dist/resources'))
})

gulp.task('build', ['concatScripts', 'concatVendorScripts', 'buildStyles', 'moveData', 'moveFonts', 'moveResources', 'tabTemplate'], console.log)
