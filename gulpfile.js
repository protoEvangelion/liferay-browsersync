#!/usr/bin/env node
'use strict';

const browserSync = require('browser-sync').create();
const fs = require('fs');
const gulp = require('gulp');
const gulp_compass = require('gulp-compass');
const path = require('path');
const proxy = require('http-proxy-middleware');

const browserSyncDir = path.dirname(fs.realpathSync(__filename));

const defaultConfig = JSON.parse(
	fs.readFileSync(path.join(browserSyncDir, 'default.config.json'))
);
const customConfig = JSON.parse(
	fs.readFileSync(path.join(browserSyncDir, 'custom.config.json'))
);

const config = Object.assign({}, defaultConfig, customConfig);
const SDK = config.LIFERAY_PLUGINS_SDK;
const eventsPortletDir = 'portlets/osb-www-marketing-events-portlet/docroot/';

gulp.task('default', function() {
	browserSync.init({
		proxy: '',
		files: [path.join(browserSyncDir, 'assets/css/**')],
		serveStatic: [path.join(browserSyncDir, 'assets/css')],
		middleware: [
			function(req, res, next) {
				const host = req.headers.host.replace(
					config.BROWSER_SYNC_PORT,
					config.LIFERAY_SERVER_PORT
				);

				proxy({ target: `http://${host}`, logLevel: 'error' })(req, res, next);
			},
		],
	});

	const watchPaths = [
		path.join(browserSyncDir, 'stylesheets/scss/**/*.scss'),
		path.join(SDK, 'themes/osb-community-theme/docroot/_diffs/css/**/*.*'),
		path.join(SDK, 'themes/osb-www-events-theme/docroot/_diffs/css/**/*.*'),
		path.join(SDK, eventsPortletDir, 'agenda/css/**/*.*'),
		path.join(SDK, eventsPortletDir, 'events/css/**/*.*'),
		path.join(SDK, eventsPortletDir, 'users/css/**/*.*'),
	];

	gulp.watch(watchPaths[1], ['sass-compass']);

	// gulp.watch(watchPaths[2], [
	//     'sass-compass',
	// ]);
});

gulp.task('sass-compass', function() {
	return gulp
		.src(path.join(browserSyncDir, 'stylesheets/scss/**/*.scss'))
		.pipe(
			gulp_compass({
				project: path.join(browserSyncDir, 'assets'),
				sass: path.join(browserSyncDir, 'stylesheets/scss'),
				import_path: [
					path.join(
						config.LIFERAY_PORTAL_SRC,
						'portal-web/docroot/html/css/common'
					),
					path.join(SDK, 'themes/osb-community-theme/docroot/_diffs/css'),
					path.join(SDK, 'themes/osb-community-theme/docroot/css'),
					// path.join(SDK, 'themes/osb-www-events-theme/docroot/_diffs/css'),
					// path.join(SDK, eventsPortletDir, 'events/css'),
				],
			})
		)
		.on('error', function(error) {
			console.log('ERROR ====>', error);
			this.emit('end');
		})
		.pipe(browserSync.stream());
});

gulp.start('default');
