var source = require('vinyl-source-stream'),
	browserify = require('browserify'),
	watchify = require('watchify'),
	extend = require('deep-extend'),
	gulp = require('gulp'),
	fs = require('fs'),
	path = require('path'),
	gutil = require('gulp-util');


/**
 * Creates a new Browserify
 * @class
 * @classdesc Bundle a js file using browserify and watchify by options
 */
function Browserify () {
	/**
	 * Watchify bundle
	 * @type {(Object|null)}
	 */
	this.b = null;

	/**
	 * Options
	 * @type {(Browserify.options|null)}
	 */
	this.options = null;
}

Browserify.prototype = {
	constructor: Browserify,

	/**
	 * Set options
	 * @param {Browserify.options}
	 */
	setOptions: function(options) {
		this.options = extend({}, Browserify.defaults, options);
		this.checkEntryOption();
		this.checkOutputNameOption();
		this.ensureOutputNameOption();
		this.options.dest = this.options.dest || path.dirname(this.options.entry);
	},

	/**
	 * Ensure that {@link Browserify#options.outputName} exists
	 */
	ensureOutputNameOption: function() {
		if (!this.options.outputName) {
			this.options.outputName = this.makeOutputName();
		}
	},

	makeOutputName: function() {
		var entryExt = path.extname(this.options.entry);
		return path.basename(this.options.entry, entryExt) + '.min' + entryExt;
	},

	checkOutputNameOption: function() {
		if (this.options.outputName == path.basename(this.options.entry))
			console.warn('Entry and dest file are the same');
	},

	/**
	 * Check if entry option is valid
	 */
	checkEntryOption: function() {
		try {
			fs.accessSync(path.join(process.cwd(), this.options.entry));
		} catch (e) {
			throw new Error('Entry file must exit');
		}
	},

	/**
	 * Main method
	 */
	run: function() {
		this.makeBundle();
		this.bundle();
	},

	/**
	 * @this {Browserify#b}
	 * @param  {Object} err Stream error
	 */
	onError: function(err) {
		new gutil.PluginError('Browserify', err.message);
		this.emit('end');
		gutil.beep();
	},

	logEvent: function(message) {
		if (!this.options.log) return;
		gutil.log(
			gutil.colors.green('The file'),
			gutil.colors.magenta(this.options.outputName),
			gutil.colors.green('was bundled to'),
			gutil.colors.magenta(this.options.dest),
			'Info:',
			message
		);
	},

	/**
	 * Bundle entry file to dest
	 * @return {Object}
	 */
	bundle: function() {
		var self = this;
		return this.b
			.bundle()
			.on('error', this.onError)
			.pipe(source(this.options.outputName))
			.pipe(gulp.dest(this.options.dest))
			.on('end', this.options.onEnd);
	},

	/**
	 * Make watchify bundle
	 */
	makeBundle: function() {
		var b = this.makeBroswerifyBundle();
		if (this.options.watch)
			b = watchify(b);
		this.b = b
			.on('update', this.bundle.bind(this))
			.on('log', this.logEvent.bind(this));
	},

	/**
	 * Make browserify bundle
	 * @return {Object} browserify bundle
	 */
	makeBroswerifyBundle: function() {
		return browserify(this.options.entry, this.options.browserify);
	},
};


/**
 * Make instance and run it. The preffered way to use the class
 * @param  {Browserify.options} options
 * @example
 * // Make bundle for file and watch it changes
 * Browserify.run({entry: 'myFile.js', dest: 'myDest'});
 * @return {Browserify}
 */
Browserify.run = function(options) {
	var inst = new this;
	if (options) inst.setOptions(options);
	inst.run();
	return inst;
};

/**
 * Defaults options
 * @type {Browserify.options}
 */
Browserify.defaults = {
	browserify: {
		debug: true,
		cache: {},
		packageCache: {},
		fullPaths: false
	},
	log: true,
	watch: true,
	onEnd: new Function()
};


/**
 * @typedef {Object} Browserify.options
 * @property {String} entry - Entry file
 * @property {String} dest - Destination directory. By default the 'entry' file directory
 * @property {String} [outputName] - Output name of the entry file. Default value is the 'entry' value
 * @property {Boolean} log - If log when the file is bundled
 * @property {Boolean} [watch=true] - If watch the entry
 * @property {requestCallback} onEnd - The callback that is calleld when the file is bundled
 * @property {Object} [browserify] - Options for browserify plugin; see [browserify options argument]{@link https://github.com/substack/node-browserify#browserifyfiles--opts}
 */

module.exports = Browserify;