'use strict';

var assert = require('assert');
var PrintMarkdown = require('../');

describe('index.js', function() {
    describe('print(printer, markdown, callback)', function() {
        it('Should carry error if printer does not pritn function', function(done) {
            PrintMarkdown.print({}, '**markdown**', function(err) {
                assert(err !== null);
                done();
            });
        });

        it('Should carry error if markdown is not a string', function(done) {
            var printer = {
                print: function(){},
            };

            PrintMarkdown.print(printer, null, function(err) {
                assert(err !== null);
                done();
            });
        });
    });
});
