const { src, dest, parallel, series, watch } = require('gulp');
const rollup = require('gulp-better-rollup');
const babel = require('rollup-plugin-babel');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer').default || require('gulp-autoprefixer');
const uglify = require('gulp-uglify-es').default;
const connect = require('gulp-connect');
const rootImport = require('rollup-plugin-root-import');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

const serverTask = (done) => {
  connect.server({
    root: '',
    host: '0.0.0.0',
    livereload: true
  });
  done();
};

const stylesTask = () => src('src/sass/app.scss')
  .pipe(sass({
    loadPaths: [
      'node_modules',
      require('path').resolve(__dirname, 'node_modules')
    ],
    includePaths: [
      'node_modules',
      require('path').resolve(__dirname, 'node_modules')
    ]
  }).on('error', sass.logError))
  .pipe(autoprefixer({ overrideBrowserslist: ['last 2 versions'] }))
  .pipe(dest('dist/css'))
  .pipe(connect.reload());

const scriptsTask = () => src('src/javascripts/index.js')
  .pipe(rollup({
    rollup: require('rollup'),
    plugins: [
      nodeResolve({
        mainFields: ['module', 'main', 'browser']
      }),
      commonjs({
        include: [/node_modules/]
      }),
      rootImport({
        root: `src/javascripts`,
        extensions: '.js'
      }),
      babel()
    ]
  }, {
    format: 'umd',
  }))
  .pipe(dest('dist/js'))
  .pipe(connect.reload());

const htmlTask = () => src('*.html').pipe(connect.reload());

const watchTask = (done) => {
  watch('*.html', htmlTask);
  watch('src/javascripts/**', scriptsTask);
  watch('src/sass/**', stylesTask);
  done();
};

const stylesDist = () => src('src/sass/app.scss')
  .pipe(sass({
    outputStyle: 'compressed',
    loadPaths: [
      'node_modules',
      require('path').resolve(__dirname, 'node_modules')
    ],
    includePaths: [
      'node_modules',
      require('path').resolve(__dirname, 'node_modules')
    ]
  }).on('error', sass.logError))
  .pipe(autoprefixer({ overrideBrowserslist: ['last 2 versions'] }))
  .pipe(dest('dist/css'));

const scriptsDist = () => src('dist/js/index.js')
  .pipe(uglify())
  .pipe(dest('dist/js/'));

exports.default = parallel(watchTask, serverTask);
exports.build = parallel(stylesDist, series(scriptsTask, scriptsDist));