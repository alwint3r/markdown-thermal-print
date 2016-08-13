'use strict';

var md = require('./lib/custom_markdown');

function nop() {}

module.exports = {
    print(thermalPrinter, rawMd, done) {
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

        while (tree[i]) {
            i += 1;
            // do actual printing
        }

        return callback(null);
    },
};
