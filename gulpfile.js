// dependances
var gulp = require('gulp');
var del = require('del');
var es = require('event-stream');
var argv = require('yargs').argv;
var pngquant = require('imagemin-pngquant');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var $ = require('gulp-load-plugins')({
  rename: {
    'gulp-minify-css': 'minifycss',
    'gulp-sourcemaps': 'sourcemaps'
  }
});

// variables
var pjson = require('./package.json');
var production = !!(argv.production);
var theme = argv.theme || 'default';
var basePaths = {
  src: './themes/' + theme + '/',
  dest: './dist/' + theme + '/'
};
var paths = {
  pages: {
    src: basePaths.src + 'pages/**',
    dest: basePaths.dest
  },
  images: {
    src: basePaths.src + 'img/**',
    dest: basePaths.dest + 'assets/img/'
  },
  assets: {
    src: [basePaths.src + 'assets/**'],
    dest: basePaths.dest + 'assets/'
  },
  scripts: {
    src: basePaths.src + 'scripts/**/*.js',
    dest: basePaths.dest + 'assets/js/'
  },
  styles: {
    src: basePaths.src + 'styles/**/*.scss',
    dest: basePaths.dest + 'assets/css/'
  },
  fonts: {
    src: basePaths.src + 'assets/fonts/**',
    dest: basePaths.dest + 'assets/fonts/'
  }
};

// ******************************************
// DELETE TASKS
// ******************************************

gulp.task('clean', function (cb) {
  del([
    // delete everything under public directory
    basePaths.dest + '*',
    // except Git files
    '!' + basePaths.dest + '.git',
    '!' + basePaths.dest + '.gitignore'
  ], cb);
});

// ******************************************
// SRC TASKS
// ******************************************

gulp.task('js', function() {
  gulp.src(paths.scripts.src)
    .pipe($.concat('app.js'))
    // delete console/alert/debug into JS files
    .pipe($.if(production,
      $.stripDebug())
    )
    .pipe($.if(production,
      $.uglify())
    )
    .pipe($.if(production,
      $.rename('app.min.js'))
    )
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(reload({stream: true}));
});

gulp.task('css', function () {
  // keep stream CSS after Sass pre-processing
  var appFile = gulp.src(paths.styles.src)
    .pipe($.sourcemaps.init())
    .pipe($.sass()).on('error', function logError(error) {
      console.error(error);
    })
    .pipe($.sourcemaps.write());
  // concat and minify CSS files and stream CSS
  return es.concat(gulp.src('./vendor/styles/*.css'), appFile)
    .pipe($.concat('screen.css'))
    .pipe($.autoprefixer())
    .pipe($.if(production, $.minifycss()))
    .pipe($.if(production, $.rename('screen.min.css')))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(reload({stream: true}));
});

gulp.task('pages', function() {
  return gulp.src(paths.pages.src)
    .pipe($.preprocess({context: {NODE_ENV: production?'production':''}}))
    // .pipe($.if(production,
    //   $.htmlmin({collapseWhitespace: true}))
    // )
    .pipe(gulp.dest(paths.pages.dest))
    .pipe(reload({stream: true}));
});

gulp.task('image-min', [], function () {
  return gulp.src(paths.images.src)
    .pipe($.if(production,
      $.imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()]
    })))
    .pipe(gulp.dest(paths.images.dest));
});

// ******************************************
// DEST TASKS
// ******************************************

gulp.task('post-build', ['pages'], function() {

  gulp.src(paths.pages.dest + 'default.hbs')
    .pipe($.if(production, $.replace('{{asset "css/screen.css"}}', '{{asset "css/screen.min.css"}}')))
    .pipe($.if(production, $.replace('{{asset "js/app.js"}}', '{{asset "js/app.min.js"}}')))
    .pipe(gulp.dest(paths.pages.dest));

  return gulp.src(paths.pages.dest + 'partials/footer.hbs')
    .pipe($.replace(/vx.x.x/g, pjson.name + ' ' + pjson.version))
    .pipe(gulp.dest(paths.pages.dest + 'partials'));
});

// ******************************************
// COPY TASKS
// ******************************************

// gulp.task('copy-fonts', [], function() {
//   return gulp.src(['./app/assets/css/fonts/**'])
//     .pipe(gulp.dest('./public/css/fonts'));
// });

// gulp.task('copy-icons', [], function() {
//   return gulp.src(['./app/assets/icons/**'])
//     .pipe(gulp.dest(basePaths.dest));
// });

gulp.task('copy-assets', [], function() {
  return gulp.src(paths.assets.src)
    .pipe(gulp.dest(paths.assets.dest));
});

gulp.task('copy-extras', function () {
  return gulp.src([
      basePaths.src + 'package.json',
      basePaths.src + 'LICENSE'], {dot: true})
    .pipe(gulp.dest(basePaths.dest));
});

// // Build the sitemap
// gulp.task('sitemap', function () {
//   return gulp.src(paths.html.src)
//     .pipe($.sitemap({
//         siteUrl: 'http://www.webyousoon.com',
//         mappings: [{
//           pages: ['*.html'],
//           changefreq: 'monthly',
//           priority: 1,
//           lastmod: Date.now()
//         }]
//     }))
//     .pipe(gulp.dest(basePaths.dest));
// });

// ******************************************
// DEV TASKS
// ******************************************

gulp.task('watch', ['build'], function() {
    gulp.watch(paths.pages.src, ['pages']);
    gulp.watch(paths.styles.src, ['css']);
    gulp.watch(paths.scripts.src, ['js']);
});

// ******************************************
// MASTER TASKS
// ******************************************

gulp.task('build', ['copy-extras', 'copy-assets', 'js', 'css', 'pages', 'image-min', 'post-build']);

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});
