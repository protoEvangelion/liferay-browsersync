const browserSync = require('browser-sync').create();
const fs = require('fs');
const gulp = require('gulp');
const gulp_compass = require('gulp-compass');
const proxy = require('http-proxy-middleware');

const defaultConfig = JSON.parse(fs.readFileSync('./default.config.json'));
const customConfig = JSON.parse(fs.readFileSync('./custom.config.json'));

const config = Object.assign({}, defaultConfig, customConfig);
const SDK = config.LIFERAY_PLUGINS_SDK;

gulp.task('serve', ['sass-compass'], function() {
    browserSync.init({
        proxy: '',
        files: ['assets/**'],
        serveStatic: ['assets'],
        middleware: [
            function(req, res, next) {
                const host = req.headers.host.replace(
                    config.BROWSER_SYNC_PORT,
                    config.LIFERAY_SERVER_PORT
                );

                proxy({ target: `http://${host}` })(req, res, next);
            },
        ],
    });

    const watchPaths = [
        'stylesheets/scss/**/*.scss',
        SDK + 'themes/osb-community-theme/docroot/_diffs/css/**/*.*',
        SDK + 'themes/osb-www-events-theme/docroot/_diffs/css/**/*.*',
        SDK + 'portlets/osb-www-marketing-events-portlet/docroot/agenda/css/**/*.*',
        SDK + 'portlets/osb-www-marketing-events-portlet/docroot/events/css/**/*.*',
        SDK + 'portlets/osb-www-marketing-events-portlet/docroot/users/css/**/*.*',
    ];

    watchPaths.forEach(path => gulp.watch(path, ['sass-compass']));
});

gulp.task('sass-compass', function() {
    return gulp
        .src('stylesheets/scss/**/*.scss')
        .pipe(
            gulp_compass({
                sass: 'stylesheets/scss',
                import_path: [
                    config.LIFERAY_PORTAL_SRC + 'portal-web/docroot/html/css/common',
                    SDK + 'themes/osb-community-theme/docroot/_diffs/css',
                    SDK + 'themes/osb-www-events-theme/docroot/_diffs/css',
                    SDK + 'portlets/osb-www-marketing-events-portlet/docroot/events/css',
                ],
            })
        )
        .pipe(gulp.dest('assets'))
        .pipe(browserSync.stream());
});

gulp.task('default', function() {
    gulp.run('serve');
});
