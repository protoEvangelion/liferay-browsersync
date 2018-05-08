#!/usr/bin/env node
'use strict';

const browserSync = require('browser-sync').create();
const fs = require('fs-extra');
const gulp = require('gulp');
const gulp_compass = require('gulp-compass');
const notify = require('gulp-notify');
const path = require('path');
const proxy = require('http-proxy-middleware');

/* Setup folders and paths */

const browserSyncDir = path.dirname(fs.realpathSync(__filename));
const destDir = path.join(browserSyncDir, 'assets');

const defaultConfig = JSON.parse(
	fs.readFileSync(path.join(browserSyncDir, 'default.config.json'))
);

const customConfigExists = fs.pathExistsSync(
	path.join(browserSyncDir, 'custom.config.json')
);

let customConfig;

if (customConfigExists) {
	customConfig = JSON.parse(
		fs.readFileSync(path.join(browserSyncDir, 'custom.config.json'))
	);
}

const config = customConfigExists
	? Object.assign({}, defaultConfig, customConfig)
	: defaultConfig;

const SDK = config.LIFERAY_PLUGINS_SDK;
const eventsPortletDir = 'portlets/osb-www-marketing-events-portlet/docroot/';
const eventsThemeDir = 'themes/osb-www-events-theme/docroot';
const commThemeDir = 'themes/osb-community-theme/docroot';
const stylesDir = path.join(browserSyncDir, 'stylesheets/scss');

/* Copy theme entry point style files into browsersync dir */

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

fs.ensureFileSync(
	path.join(stylesDir, 'osb-www-marketing-events-portlet/agenda/css/main.scss')
);

fs.copySync(
	path.join(SDK, eventsPortletDir, 'agenda/css/main.css'),
	path.join(stylesDir, 'osb-www-marketing-events-portlet/agenda/css/main.scss')
);

fs.ensureFileSync(
	path.join(stylesDir, 'osb-www-marketing-events-portlet/events/css/main.scss')
);

fs.copySync(
	path.join(SDK, eventsPortletDir, 'events/css/main.css'),
	path.join(stylesDir, 'osb-www-marketing-events-portlet/events/css/main.scss')
);

fs.ensureFileSync(
	path.join(stylesDir, 'osb-www-marketing-events-portlet/sponsors/css/main.scss')
);

fs.copySync(
	path.join(SDK, eventsPortletDir, 'sponsors/css/main.css'),
	path.join(stylesDir, 'osb-www-marketing-events-portlet/sponsors/css/main.scss')
);

fs.ensureFileSync(
	path.join(stylesDir, 'osb-www-marketing-events-portlet/users/css/main.scss')
);

fs.copySync(
	path.join(SDK, eventsPortletDir, 'users/css/main.css'),
	path.join(stylesDir, 'osb-www-marketing-events-portlet/users/css/main.scss')
);

/* Add aui styles */

const adminStyles = `\n
	@import url(base.css);
	@import url(application.css);
	@import url(layout.css);
	@import url(dockbar.css);
	@import url(navigation.css);
	@import url(portlet.css);
	@import url(extras.css);
`;

fs.appendFileSync(path.join(stylesDir, 'osb-community-theme/css/main.scss'), adminStyles);
fs.appendFileSync(
	path.join(stylesDir, 'osb-www-events-theme/css/main.scss'),
	adminStyles
);

/* Main Task */

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

/* Notifications */

gulp.task('notify', function() {
	return gulp.src(browserSyncDir).pipe(
		notify({
			title: config.NOTIFICATION_TITLE1,
			message: config.NOTIFICATION_MESSAGE1,
		})
	);
});

const callNotifier = () =>
	notify({
		title: config.NOTIFICATION_TITLE2,
		message: config.NOTIFICATION_MESSAGE2,
		wait: false,
		sound: false,
	});

/* WATCH TASKS */

function mainCallback(srcPath, importPaths) {
	return gulp
		.src(path.join(stylesDir, srcPath))
		.pipe(
			gulp_compass({
				sass: stylesDir,
				import_path: [
					...importPaths,
					path.join(
						config.LIFERAY_PORTAL_SRC,
						'portal-web/docroot/html/css/common'
					),
				],
			})
		)
		.pipe(gulp.dest(destDir))
		.pipe(browserSync.stream())
		.pipe(callNotifier());
}

/* COMMUNITY THEME */

gulp.watch([path.join(SDK, commThemeDir, '_diffs/css/**/*')], ['sass-community-theme']);

gulp.task('sass-community-theme', () =>
	mainCallback('osb-community-theme/**/*.scss', [
		path.join(SDK, commThemeDir, '_diffs/css'),
		path.join(SDK, commThemeDir, 'css'),
	])
);

/* EVENTS THEME */

gulp.watch(path.join(SDK, eventsThemeDir, '_diffs/css/**/*.*'), ['sass-events-theme']);

gulp.task('sass-events-theme', () =>
	mainCallback('osb-www-events-theme/**/*.scss', [
		path.join(SDK, eventsThemeDir, '_diffs/css'),
	])
);

/* EVENTS PORTLET */

gulp.watch(
	[
		path.join(SDK, eventsPortletDir, 'agenda/css/**/*.*'),
		path.join(SDK, eventsPortletDir, 'events/css/**/*.*'),
		path.join(SDK, eventsPortletDir, 'sponsors/css/**/*.*'),
		path.join(SDK, eventsPortletDir, 'users/css/**/*.*'),
	],
	['sass-events-portlet']
);

gulp.task('sass-events-portlet', () =>
	mainCallback('osb-www-marketing-events-portlet/**/*.scss', [
		path.join(SDK, eventsPortletDir, 'agenda/css'),
		path.join(SDK, eventsPortletDir, 'events/css'),
		path.join(SDK, eventsPortletDir, 'sponsors/css'),
		path.join(SDK, eventsPortletDir, 'users/css'),
	])
);

/* RUN PROGRAM */

gulp.start('default');
