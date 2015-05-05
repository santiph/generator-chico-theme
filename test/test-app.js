'use strict';

var path = require('path');
var assert = require('yeoman-generator').assert;
var helpers = require('yeoman-generator').test;

describe('chico-theme', function () {
    var runGen;

    beforeEach(function () {
        runGen = helpers
            .run(path.join(__dirname, '../app'))
            .inDir(path.join( __dirname, '../tmp'))
            .withOptions({
                skipInstall: true,
                test: true
            });
    });

    it('creates common project files', function (done) {
        runGen.on('end', function() {
            assert.file([
                'bower.json',
                'package.json',
                'gulpfile.js',
                '.editorconfig',
                '.jshintrc',
                '.gitignore',
                '.bowerrc'
            ]);
            done();
        });
    });

    it('creates theme files', function (done) {
        runGen.on('end', function() {
            assert.file([
                'src/styles/theme-ui.scss',
                'src/styles/theme-mobile.scss'
            ]);
            done();
        });
    });
});
