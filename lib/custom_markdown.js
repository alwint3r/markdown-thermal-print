'use strict';

var md = require('markdown').markdown;
var utils = require('./utils');

function alignCenter(element) {
    var length = element.length;

    if (element[0] !== 'para')
        return element;

    var newElement = ['para', ['center']];
    if (length  === 2) {
        var sliced = element[1].slice(2, element[1].length - 2);
        newElement[1].push(utils.trim(sliced));

        return newElement;
    }

    for (var i = 2; i < length; i++) {
        if (utils.trim(element[i]) === '<-')
            break;
        newElement[1].push(element[i]);
    }

    return newElement;
}

function isNeedAlignCenter(element) {
    var length = element.length;
    var first = utils.trim(element[1]);
    var last = utils.trim(element[length - 1]);
    var isSeparatedToken = first === '->' && last === '<-';
    var isInPlain = element[1].indexOf('->') === 0
        && element[1].indexOf('<-') === element[1].length - 2;

    return isSeparatedToken || isInPlain;
}

function reprocessTree(tree) {
    var element;
    var length;

    for (var i = 0; i < tree.length; i++) {
        element = tree[i];
        length = element.length;

        if (isNeedAlignCenter(element)) {
            tree[i] = alignCenter(element);
        }
    }

    return tree;
}

module.exports = function toTree(markdownString) {
    var content;

    if (!Buffer.isBuffer(markdownString)) {
        content = markdownString.toString('utf-8');
    } else {
        content = markdownString;
    }

    var tree = reprocessTree(md.parse(content));

    console.log(JSON.stringify(tree));

    return tree;
};
