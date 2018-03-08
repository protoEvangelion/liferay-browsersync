let browserSync = require('browser-sync').create();
var fs = require("fs");
let gulp = require('gulp');
let gulp_compass = require('gulp-compass');
let proxy = require('http-proxy-middleware');


var configFile = "./config.json";
config = JSON.parse(fs.readFileSync(configFile));

gulp.task('serve', ['sass-compass'], function() {
	browserSync.init({
		proxy: "",
		files: ['assets/**'],
		serveStatic: ['assets'],
		middleware: [
			function(req, res, next) {
				let target = 'http://' + req.headers.host.replace('localhost:3000', 'localhost');
				proxy({
					target
				})(req, res, next);
			}
		]
	});

	gulp.watch(config.LIFERAY_PLUGINS_SDK + "themes/osb-www-events-theme/docroot/_diffs/css/**/*.*", ['sass-compass']);
	gulp.watch(config.LIFERAY_PLUGINS_SDK + "portlets/osb-www-marketing-events-portlet/docroot/events/css/**/*.*", ['sass-compass']);
	gulp.watch(config.LIFERAY_PLUGINS_SDK + "portlets/osb-www-marketing-events-portlet/docroot/users/css/**/*.*", ['sass-compass']);
	gulp.watch(config.LIFERAY_PLUGINS_SDK + "portlets/osb-www-marketing-events-portlet/docroot/agenda/css/**/*.*", ['sass-compass']);
	gulp.watch("stylesheets/scss/**/*.scss", ['sass-compass'])
});

gulp.task('sass-compass', function() {
	return gulp.src("stylesheets/scss/**/*.scss")
		.pipe(gulp_compass({
			sass: 'stylesheets/scss',
			import_path: [
				config.LIFERAY_PORTAL_SRC + "portal-web/docroot/html/css/common",
				config.LIFERAY_PLUGINS_SDK + "portlets/osb-www-marketing-events-portlet/docroot/events/css",
				config.LIFERAY_PLUGINS_SDK + "themes/osb-www-events-theme/docroot/_diffs/css"
			]
		}))
		.pipe(gulp.dest("assets"))
		.pipe(browserSync.stream());
});

gulp.task('default', function() {
	gulp.run("serve");
});