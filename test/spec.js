var Bs = require('../index'),
	fs = require('fs'),
	fse = require('fs-extra'),
	chai = require('chai'),
	expect = chai.expect,
	assert = chai.assert,
	cwd = process.cwd();

global.l = function(x) {
	console.log(x);
};
var child = require('child_process');
var exec = require('child_process').exec;
var FakerFiles = {
	dir: cwd + '/test-fake/fake',
	entryName: 'index.js',
	entryPath: cwd + '/test-fake/fake/' + 'index.js',

	init: function(cb) {
		this.createDir().then(this.createEntry.bind(this)).then(cb);
	},

	createDir: function() {
		var self = this;
		return new Promise(function(res, rej) {
			fse.ensureDir(self.dir, function(e) {
				if (e) throw e;
				res();
			});
		}).catch(function(e) {
			l(e);
		});
	},

	createEntry: function() {
		var self = this;
		return new Promise(function(res, rej) {
			fs.writeFile(self.entryPath, 'require("fs")', function(e) {
				if (e) throw e;
				res();
			});
		}).catch(function(e) {
			l(e);
		});
	},

	clear: function(cb) {
		fse.remove('./test-fake', function(e) {
			if (e) throw e;
			cb();
		});
	},
};

beforeEach(function(cb) {
	FakerFiles.init(cb);
});
afterEach(function(cb) {
	FakerFiles.clear(cb);
});

describe('.run', function() {
	it ('bundle file should exist', function(cb) {
		Bs.run({entry: './test-fake/fake/index.js', onEnd: function() {
			fs.access('./test-fake/fake/index.min.js', function(e) {
				if (e) l(e), assert(false);
				cb();
			});
		}});
	});
});

describe('#makeOutputName', function() {
	it ('add .min suffix to basename of entry option', function() {
		var bs = new Bs();
		bs.options = {
			entry: 'index.js'
		};
		expect(bs.makeOutputName()).to.equal('index.min.js');
	});
});

/** Todo: end this spec */
/*describe('watch option', function() {
	it.only ('without errors', function(cb) {
		Bs.run({
			entry: './test-fake/fake/index.js',
			watch: true,
			onEnd: function() {
				l(child)
				child.kill();
				// exec('exit', function(e) {
				// 	if (e) throw e;
				// });
				fs.access('./test-fake/fake/index.min.js', function(e) {
					if (!e) assert(false);
					cb();
				});
			}
		});
	});
});*/