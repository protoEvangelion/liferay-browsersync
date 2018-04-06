#!/usr/bin/env node
'use strict';

const browserSync = require('browser-sync').create();
const fs = require('fs-extra');
const gulp = require('gulp');
const gulp_compass = require('gulp-compass');
const notify = require('gulp-notify');
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

gulp.task('default', ['notify'], function() {
	browserSync.init({
		proxy: '',
		files: [path.join(browserSyncDir, 'assets/**')],
		serveStatic: [path.join(browserSyncDir, 'assets')],
		logLevel: 'debug',
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
});

gulp.task('notify', function() {
	return gulp.src(browserSyncDir).pipe(
		notify({
			icon: path.join(browserSyncDir, 'icon2.jpg'),
			title: 'Rocketship Ready For Liftoff 🚀',
			message:
				'Start saving files in community/events themes & events portlets...& watch the beauty unfold ❤️',
		})
	);
});

const callNotifier = () =>
	notify({
		icon: path.join(browserSyncDir, 'icon.jpg'),
		title: '✓ Sass esta Listo!',
		message: 'Vamanos a la Guacamole 😊',
	});

/* COMMUNITY THEME */

gulp.watch(
	[path.join(SDK, 'themes/osb-community-theme/docroot/_diffs/css/**/*.*')],
	['sass-community-theme']
);

gulp.task('sass-community-theme', function() {
	return gulp
		.src(path.join(browserSyncDir, 'stylesheets/scss/osb-community-theme/**/*.scss'))
		.pipe(
			gulp_compass({
				// project: path.join(browserSyncDir, 'assets'),
				sass: path.join(browserSyncDir, 'stylesheets/scss'),
				import_path: [
					path.join(
						config.LIFERAY_PORTAL_SRC,
						'portal-web/docroot/html/css/common'
					),
					path.join(SDK, 'themes/osb-community-theme/docroot/_diffs/css'),
					path.join(SDK, 'themes/osb-community-theme/docroot/css'),
				],
			})
		)
		.pipe(gulp.dest(path.join(browserSyncDir, 'assets')))
		.pipe(browserSync.stream())
		.pipe(callNotifier());
});

// /* EVENTS THEME */

gulp.watch(path.join(SDK, 'themes/osb-www-events-theme/docroot/_diffs/css/**/*.*'), [
	'sass-events-theme',
]);

gulp.task('sass-events-theme', function() {
	return gulp
		.src(path.join(browserSyncDir, 'stylesheets/scss/osb-www-events-theme/**/*.scss'))
		.pipe(
			gulp_compass({
				sass: path.join(browserSyncDir, 'stylesheets/scss'),
				import_path: [
					path.join(
						config.LIFERAY_PORTAL_SRC,
						'portal-web/docroot/html/css/common'
					),
					path.join(SDK, 'themes/osb-www-events-theme/docroot/_diffs/css'),
				],
			})
		)
		.pipe(gulp.dest(path.join(browserSyncDir, 'assets')))
		.pipe(browserSync.stream())
		.pipe(callNotifier());
});

// /* EVENTS PORTLET */

gulp.watch(
	[
		path.join(SDK, eventsPortletDir, 'agenda/css/**/*.*'),
		path.join(SDK, eventsPortletDir, 'events/css/**/*.*'),
		path.join(SDK, eventsPortletDir, 'users/css/**/*.*'),
	],
	['sass-events-portlet']
);

gulp.task('sass-events-portlet', function() {
	return gulp
		.src(
			path.join(
				browserSyncDir,
				'stylesheets/scss/osb-www-marketing-events-portlet/**/*.scss'
			)
		)
		.pipe(
			gulp_compass({
				sass: path.join(browserSyncDir, 'stylesheets/scss'),
				import_path: [
					path.join(
						config.LIFERAY_PORTAL_SRC,
						'portal-web/docroot/html/css/common'
					),
					path.join(SDK, eventsPortletDir, 'events/css'),
				],
			})
		)
		.pipe(gulp.dest(path.join(browserSyncDir, 'assets')))
		.pipe(browserSync.stream())
		.pipe(callNotifier());
});

gulp.start('default');
