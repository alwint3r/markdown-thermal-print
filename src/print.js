'use strict';

var md = require('./custom_markdown');

function nop() {}

function print(thermalPrinter, rawMd, done) {
    var callback = done;

    if (typeof done !== 'function') {
        callback = nop;
    }

    if (typeof thermalPrinter.print !== 'function') {
        return callback(new Error('First argument must be a valid printer'));
    }

    if (typeof rawMd !== 'string') {
        return callback(new Error('Second argument must be a markdown string'));
    }

    var tree = md(rawMd);
    var i = 0;
    var defaultFunction = thermalPrinter.printLine;

    if (tree[0] === 'markdown') {
        tree.shift();
    }

    for (var i = 0; i < tree.length; i++) {
        console.log(tree[i]);
    }

    return callback(null);
}

module.exports = print;
