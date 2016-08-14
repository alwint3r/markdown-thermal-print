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

function headToTail(element) {
    return {
        length: element.length,
        head: utils.trim(element[1]),
        tail: utils.trim(element[element.length - 1]),
    };
}

function isHeading(element) {
    return element[0] === 'header';
}

function heading(element) {
    return ['para', ['big', element[2]]];
}

function isNeedAlignCenter(element) {
    if (element[0] !== 'para') {
        return false;
    }

    var headTail = headToTail(element);
    var isSeparatedToken = headTail.head === '->' && headTail.tail === '<-';
    var isInPlain;

    if (typeof element[1] === 'string') {
        isInPlain = (element[1].indexOf('->') === 0
            && element[1].indexOf('<-') === element[1].length - 2);

        if (typeof element[headTail.length - 1] === 'string') {
            isInPlain = isInPlain || (utils.trim(element[headTail.length - 1]).indexOf('<-') === 0);
        }
    } else {
        isInPlain = false;
    }

    return isSeparatedToken || isInPlain;
}

function isLink(element) {
    if (findLink(element)) {
        return true;
    }

    return false;
}

function findLink(element) {
    for (var i = 0; i < element.length; i++) {
        if (Array.isArray(element[i])) {
            if (element[i][0] === 'link' || element[i][0] === 'link_ref') {
                return [element[i], i];
            }
        }
    }

    return false;
}

function link(element) {
    var findResult = findLink(element);
    var linkNode = findResult[0];
    var linkIndex = findResult[1];
    var replacement;
    var replaceIndex = linkIndex;

    if (linkNode[0] === 'link_ref') {
        replaceIndex -= 1;
        replacement = element[linkIndex - 1].replace(/\(.*\)/g, linkNode[1].ref);
    } else {
        replacement = linkNode[1].href;
    }

    var duplicate = element.concat([]);
    duplicate[replaceIndex] = replacement;

    var result = [];

    for (var i = 0; i < duplicate.length; i++) {
        if (Array.isArray(duplicate[i])) {
            if (duplicate[i][0] === 'link' || duplicate[i][0] === 'link_ref') {
                continue;
            }
        }

        result.push(duplicate[i]);
    }

    return result;
}

function deepTextSearch(element) {
    if (typeof element === 'string' || !Array.isArray(element)) {
        return element;
    }

    if (typeof element[1] === 'object' && !Array.isArray(element[1])) {
        return deepTextSearch(element[2]);
    }

    return deepTextSearch(element[1]);
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

        if (isHeading(element)) {
            tree[i] = heading(element);
        }

        if (isLink(element)) {
            tree[i] = link(element);
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

    return tree;
};
