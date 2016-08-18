'use strict';

var md = require('./custom_markdown');
var utils = require('./utils');
var PRINTING_FUNCTION_MAP = {
    strong: 'bold',
    center: 'center',
    left: 'left',
    right: 'right',
    big: 'big',
};

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
    var defaultFunction = thermalPrinter.printText.bind(thermalPrinter);

    if (tree[0] === 'markdown') {
        tree.shift();
    }

    function iterateBranch(branch) {
        var configs = [];
        var deactivated;
        var currentFn;

        for (var i = 0; i < branch.length; i++) {
            if (utils.isArray(branch[i])) {
                if (PRINTING_FUNCTION_MAP[branch[i][0]]) {
                    currentFn = PRINTING_FUNCTION_MAP[branch[i][0]];

                    if (utils.isFunction(thermalPrinter[currentFn])) {
                        thermalPrinter[currentFn].call(thermalPrinter, true);
                        configs.push(branch[i][0]);
                    }
                }

                return iterateBranch(branch[i].slice(1));
            } else {
                defaultFunction(branch[i]);
            }
        }

        while (configs.length > 0) {
            deactivated = configs.pop();
            if (deactivated) {
                if (['center', 'right'].indexOf(deactivated) >= 0)
                    thermalPrinter.left.call(thermalPrinter);
                else
                    thermalPrinter[deactivated].call(thermalPrinter, false);
            }
        }

        thermalPrinter.lineFeed(1);
    }

    for (var i = 0; i < tree.length; i++) {
        if (tree[i][0] !== 'para') {
            continue;
        }

        iterateBranch(tree[i].slice(1));
    }

    thermalPrinter.left();

    return thermalPrinter.print(callback);
}

module.exports = print;
