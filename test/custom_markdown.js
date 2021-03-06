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
            var tree = markdown('-> **winter** yeah <-');
            tree.shift();

            var paragraph = tree[0];
            assert.equal(paragraph[1][0], 'center');
            assert(Array.isArray(paragraph[1][1]));
            assert.equal(paragraph[1][1][1].trim(), 'winter');
            assert.equal(paragraph[1][2].trim(), 'yeah');
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

        it('Should replace link text by the actual url', function() {
            var links = [
                '(a link)[https://google.com]',
                'Hello, this is (a link)[https://google.com] link yes.',
            ];

            var tree;
            var element;

            tree = markdown(links[0]);
            tree.shift();

            element = tree[0];
            assert.equal(element[1], 'https://google.com');

            tree = markdown(links[1]);
            tree.shift();

            element = tree[0];
            assert.equal(element[1], 'Hello, this is https://google.com');
        });

        it('Centered link should be centered and parsed as link', function() {
            var mark = '-> centered (link)[https://google.com] <-';
            var tree = markdown(mark);

            tree.shift();
            var element = tree[0];

            assert.equal(element[1][0], 'center');
            assert.equal(element[1][1], 'centered https://google.com');
        });

        it('Should align left correctly', function() {
            var mark = '-> left aligned';
            var tree = markdown(mark);

            tree.shift();
            var element = tree[0];

            assert.equal(element[1][0], 'left');
            assert.equal(element[1][1], ' left aligned');

            mark = '-> **Bold Text** aligned left';
            tree = markdown(mark);

            tree.shift();
            element = tree[0];

            assert.equal(element[1][0], 'left');
            assert.equal(typeof element[1][1], 'object');
            assert.equal(element[1][1][1], 'Bold Text');
            assert.equal(element[1][2], ' aligned left');
        });

        it('Should align right correctly', function() {
            var mark = 'right aligned <-';
            var tree = markdown(mark);

            tree.shift();
            var element = tree[0];

            assert.equal(typeof element[1], 'object');
            assert.equal(element[1][0], 'right');
            assert.equal(element[1][1], 'right aligned');

            mark = '_Italic Text_ aligned right <-';
            tree = markdown(mark);

            tree.shift();
            element = tree[0];

            assert.equal(typeof element[1], 'object');
            assert.equal(element[1][1][0], 'em');
            assert.equal(element[1][1][1], 'Italic Text');
            assert.equal(element[1][2], ' aligned right');
        });
    });
});
