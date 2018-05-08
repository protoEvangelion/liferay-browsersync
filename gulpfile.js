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
const destDir = path.join(browserSyncDir, 'assets');

const defaultConfig = JSON.parse(
	fs.readFileSync(path.join(browserSyncDir, 'default.config.json'))
);

const customConfigExists = fs.pathExistsSync(path.join(browserSyncDir, 'custom.config.json'));

let customConfig;

if (customConfigExists) {
	customConfig = JSON.parse(
		fs.readFileSync(path.join(browserSyncDir, 'custom.config.json'))
	);
}

const config = customConfigExists ? Object.assign({}, defaultConfig, customConfig) : defaultConfig;

const SDK = config.LIFERAY_PLUGINS_SDK;
const eventsPortletDir = 'portlets/osb-www-marketing-events-portlet/docroot/';
const eventsThemeDir = 'themes/osb-www-events-theme/docroot';
const commThemeDir = 'themes/osb-community-theme/docroot';
const stylesDir = path.join(browserSyncDir, 'stylesheets/scss');

fs.ensureFileSync(path.join(stylesDir, 'osb-community-theme/css/main.scss'));
fs.copySync(
	path.join(SDK, commThemeDir, '_diffs/css/custom.css'),
	path.join(stylesDir, 'osb-community-theme/css/main.scss')
);

fs.ensureFileSync(path.join(stylesDir, 'osb-www-events-theme/css/main.scss'));
fs.copySync(
	path.join(SDK, eventsThemeDir, '_diffs/css/custom.css'),
	path.join(stylesDir, 'osb-www-events-theme/css/main.scss')
);

fs.ensureFileSync(path.join(stylesDir, 'osb-www-marketing-events-portlet/agenda/css/main.scss'));
fs.copySync(
	path.join(SDK, eventsPortletDir, 'agenda/css/main.css'),
	path.join(stylesDir, 'osb-www-marketing-events-portlet/agenda/css/main.scss')
);

fs.ensureFileSync(path.join(stylesDir, 'osb-www-marketing-events-portlet/events/css/main.scss'));
fs.copySync(
	path.join(SDK, eventsPortletDir, 'events/css/main.css'),
	path.join(stylesDir, 'osb-www-marketing-events-portlet/events/css/main.scss')
);

fs.ensureFileSync(path.join(stylesDir, 'osb-www-marketing-events-portlet/sponsors/css/main.scss'));
fs.copySync(
	path.join(SDK, eventsPortletDir, 'sponsors/css/main.css'),
	path.join(stylesDir, 'osb-www-marketing-events-portlet/sponsors/css/main.scss')
);

fs.ensureFileSync(path.join(stylesDir, 'osb-www-marketing-events-portlet/users/css/main.scss'));
fs.copySync(
	path.join(SDK, eventsPortletDir, 'users/css/main.css'),
	path.join(stylesDir, 'osb-www-marketing-events-portlet/users/css/main.scss')
);

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
			icon: path.join(browserSyncDir, config.NOTIFICATION_ICON1),
			title: config.NOTIFICATION_TITLE1,
			message: config.NOTIFICATION_MESSAGE1,
		})
	);
});

const callNotifier = () =>
	notify({
		icon: path.join(browserSyncDir, config.NOTIFICATION_ICON2),
		title: config.NOTIFICATION_TITLE2,
		message: config.NOTIFICATION_MESSAGE2,
	});

/* COMMUNITY THEME */

gulp.watch([path.join(SDK, commThemeDir, '_diffs/css/**/*')], ['sass-community-theme']);

gulp.task('sass-community-theme', function() {
	return gulp
		.src(path.join(stylesDir, 'osb-community-theme/**/*.scss'))
		.pipe(
			gulp_compass({
				// project: path.join(browserSyncDir, 'assets'),
				sass: stylesDir,
				import_path: [
					path.join(
						config.LIFERAY_PORTAL_SRC,
						'portal-web/docroot/html/css/common'
					),
					path.join(SDK, commThemeDir, '_diffs/css'),
					path.join(SDK, commThemeDir, 'css'),
				],
			})
		)
		.pipe(gulp.dest(destDir))
		.pipe(browserSync.stream())
		.pipe(callNotifier());
});

// /* EVENTS THEME */

gulp.watch(path.join(SDK, eventsThemeDir, '_diffs/css/**/*.*'), ['sass-events-theme']);

gulp.task('sass-events-theme', function() {
	return gulp
		.src(path.join(stylesDir, 'osb-www-events-theme/**/*.scss'))
		.pipe(
			gulp_compass({
				sass: stylesDir,
				import_path: [
					path.join(
						config.LIFERAY_PORTAL_SRC,
						'portal-web/docroot/html/css/common'
					),
					path.join(SDK, eventsThemeDir, '_diffs/css'),
				],
			})
		)
		.pipe(gulp.dest(destDir))
		.pipe(browserSync.stream())
		.pipe(callNotifier());
});

// /* EVENTS PORTLET */

gulp.watch(
	[
		path.join(SDK, eventsPortletDir, 'agenda/css/**/*.*'),
		path.join(SDK, eventsPortletDir, 'events/css/**/*.*'),
		path.join(SDK, eventsPortletDir, 'sponsors/css/**/*.*'),
		path.join(SDK, eventsPortletDir, 'users/css/**/*.*'),
	],
	['sass-events-portlet']
);

gulp.task('sass-events-portlet', function() {
	return gulp
		.src(path.join(stylesDir, 'osb-www-marketing-events-portlet/**/*.scss'))
		.pipe(
			gulp_compass({
				sass: stylesDir,
				import_path: [
					path.join(
						config.LIFERAY_PORTAL_SRC,
						'portal-web/docroot/html/css/common'
					),
					path.join(SDK, eventsPortletDir, 'agenda/css'),
					path.join(SDK, eventsPortletDir, 'events/css'),
					path.join(SDK, eventsPortletDir, 'sponsors/css'),
					path.join(SDK, eventsPortletDir, 'users/css'),
				],
			})
		)
		.pipe(gulp.dest(destDir))
		.pipe(browserSync.stream())
		.pipe(callNotifier());
});

gulp.start('default');
