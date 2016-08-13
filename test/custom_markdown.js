'use strict';

var assert = require('assert');
var markdown = require('../src/custom_markdown');

describe('src/custom_markdown.js', function() {
    this.timeout(3000);

    describe('toTree(rawMarkdown)', function() {
        it('Should generate center when a text is enclosed -> and <-', function() {
            var tree = markdown('-> winter <-');
            tree.shift();

            assert(Array.isArray(tree[0][1]));
            assert(tree[0][1][0] === 'center');
            assert(tree[0][1][1].trim() === 'winter');
        });

        it('Should generate center when a text is enclosed by -> <- and nested with another tag', function() {
            var tree = markdown('-> **winter** <-');
            tree.shift();

            var paragraph = tree[0];
            assert(paragraph[1][0] === 'center');
            assert(Array.isArray(paragraph[1][1]));
            assert(paragraph[1][1][1].trim() === 'winter');
        });

        it('Should generate big whenever a header tag is given', function() {
            var markdowns = [
                'Hello World\n==========',
                '# Hello World',
                '#Hello World',
                '## Hello World',
                '### Hello World',
                '#### Hello World',
                '##### Hello World',
                '###### Hello World',
            ];

            var tree;
            var element;

            markdowns.forEach(function(mark) {
                tree = markdown(mark);
                tree.shift();

                element = tree[0];
                assert(element[0] === 'para');
                assert(element[1][0] === 'big');
                assert(element[1][1] === 'Hello World');
            });
        });
    });
});
