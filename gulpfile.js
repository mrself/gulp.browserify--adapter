var gulp = require('gulp'),
	watch = require('gulp-watch'),
	jsdoc = require('gulp-jsdoc3');

gulp.task('docs', function(cb) {
	gulp.src('src/**/*.js', {read: false})
		.pipe(jsdoc({
			"opts": {
				"destination": "./docs"
			},
		}, cb));
});
gulp.task('docs.watch' ,function() {
	watch('src/**/*.js', function() {
		gulp.start('docs');
	});
});

gulp.task('default', ['docs', 'docs.watch']);