const {
  src,
  dest,
  series,
  watch
} = require('gulp')
const concat = require('gulp-concat')
const htmlmin = require('gulp-htmlmin')
const autoprefixes = require('gulp-autoprefixer')
const cleanCSS = require('gulp-clean-css')
const sass = require('sass');
const gulpSass = require('gulp-sass');
const mainSass = gulpSass(sass);
const typograf = require('gulp-typograf');
const plumber = require('gulp-plumber');
const svgSprite = require('gulp-svg-sprite');
const svgmin = require('gulp-svgmin');
const cheerio = require('gulp-cheerio');
const fileInclude = require('gulp-file-include');
const image = require('gulp-image')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify-es').default
const notify = require('gulp-notify')
const sourcemaps = require('gulp-sourcemaps')
const del = require('del')
const browserSync = require('browser-sync').create()

const clean = () => {
  return del(['dist'])
}

const resources = () => {
  return src('src/resources/**')
    .pipe(dest('dist'))
}

const styles = () => { // нас интересуют все файлы, находящиеся в папке src styles, **- будут получены файлы не только из первого уровня, но и из подпапок  *.css - любой файл css
  return src('src/scss/**/*.scss')
    .pipe(sourcemaps.init()) // пропускаем файлы через трубу (.pipe), для того, чтобы на выходе получить их модифицированными
    .pipe(mainSass())
    // .pipe(concat('main.scss'))
    .pipe(plumber(
      notify.onError({
        title: "SCSS",
        message: "Error: <%= error.message %>"
      })
    ))
    .pipe(autoprefixes({
      cascade: false,
      grid: true,
      overrideBrowserslist: ["last 5 versions"]
    }))
    .pipe(cleanCSS({
      level: 2
    }))
    .pipe(sourcemaps.write())
    .pipe(dest('dist/css'))
    .pipe(browserSync.stream())
}

const htmlMinify = () => {
  return src('src/**/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
    }))
    .pipe(dest('dist'))
    .pipe(browserSync.stream());
}

const htmlInclude = () => {
  return src('src/*.html')
    .pipe(fileInclude({
      prefix: '@',
      basepath: '@file'
    }))
    .pipe(typograf({
      locale: ['ru', 'en-US']
    }))
    .pipe(dest('dist'))
    .pipe(browserSync.stream());
}

const svgSprites = () => {
  return src('src/images/svg/**/*.svg')
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: '../sprite.svg'
        }
      }
    }))
    .pipe(
      svgmin({
        js2svg: {
          pretty: true,
        },
      })
    )
    // .pipe(
    //   cheerio({
    //     run: function ($) {
    //       $('[fill]').removeAttr('fill');
    //       $('[stroke]').removeAttr('stroke');
    //       $('[style]').removeAttr('style');
    //     },
    //     parserOptions: {
    //       xmlMode: true
    //     },
    //   })
    // )
    .pipe(dest('dist/images'))
}



const scripts = () => {
  return src([
      'src/js/components/**/*.js',
      'src/js/main.js'
    ])
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('app.js'))
    .pipe(uglify().on('error', notify.onError()))
    .pipe(sourcemaps.write())
    .pipe(dest('dist'))
    .pipe(browserSync.stream())
}
const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: 'dist'
    }
  })
}

const images = () => {
  return src([
      'src/images/**/*.jpg',
      'src/images/**/*.png',
      'src/images/**/*.svg',
      'src/images/**/*.jpeg',
    ])
    .pipe(image())
    .pipe(dest('dist/images'))
}

watch('src/**/*.html', htmlMinify)
watch('src/**/*.html', htmlInclude)
watch('src/partials/**/*.html', htmlInclude)
watch('src/scss/**/*.scss', styles)
watch('src/images/svg/**/*.svg', svgSprites)
watch('src/js/**/*.js', scripts)
watch('src/resources/**', resources)

exports.clean = clean
exports.styles = styles
exports.htmlMinify = htmlMinify
exports.scripts = scripts
exports.default = series(clean, htmlInclude, resources, svgSprites, styles, images, scripts, watchFiles) // удалил HTMLminify


const stylesBuild = () => { // нас интересуют все файлы, находящиеся в папке src styles, **- будут получены файлы не только из первого уровня, но и из подпапок  *.css - любой файл css
  return src('src/styles/**/*.css') // пропускаем файлы через трубу (.pipe), для того, чтобы на выходе получить их модифицированными
    .pipe(concat('main.css'))
    .pipe(autoprefixes({
      cascade: false
    }))
    .pipe(cleanCSS({
      level: 2
    }))
    .pipe(dest('dist'))
}

const scriptsBuild = () => {
  return src([
      'src/js/components/**/*.js',
      'src/js/main.js'
    ])
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('app.js'))
    .pipe(uglify().on('error', notify.onError()))
    .pipe(dest('dist'))
}

exports.build = series(clean, resources, htmlInclude, htmlMinify, svgSprites, stylesBuild, images, scriptsBuild, watchFiles) // build-версия
