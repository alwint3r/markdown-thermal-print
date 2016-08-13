'use strict';

var md = require('./custom_markdown');

function nop() {}

function print(thermalPrinter, rawMd, done) {
    if (typeof thermalPrinter.printer !== 'function') {
        return done(new Error('First argument must be a valid printer'));
    }

    if (typeof rawMd !== 'string') {
        return done(new Error('Second argument must be a markdown string'));
    }

    var callback = done;

    if (typeof done !== 'function') {
        callback = nop;
    }

    var tree = md(rawMd);
    var i = 0;
    var defaultFunction = thermalPrinter.printLine;

    if (tree[0] === 'markdown') {
        tree.shift();
    }

    console.log(tree);

    while (tree[i]) {
        i += 1;
        // do actual printing
        console.log(tree[i]);
    }

    return callback(null);
}

module.exports = print;
