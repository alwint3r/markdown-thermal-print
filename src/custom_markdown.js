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

    var length = element.length;

    if (length === 2 && utils.isString(element[length - 1])) {
        var trimmed = utils.trim(element[length - 1]);

        return trimmed.indexOf('->') === 0
            && trimmed.indexOf('<-') === trimmed.length - 2;
    }

    if (length > 2 &&
            (utils.isString(element[1]) && utils.isString(element[length - 1]))) {

        return utils.trim(element[1]).indexOf('->') === 0
            && utils.trim(element[length - 1]).indexOf('<-') === (utils.trim(element[length - 1]).length - 2);
    }

    return false;
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
        replacement = element[replaceIndex].replace(/\(.*\)/g, linkNode[1].ref);
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
    if (typeof element === 'string' || !utils.isArray(element)) {
        return element;
    }

    if (utils.isObject(element[1]) && !utils.isArray(element[1])) {
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

        if (isNeedAlignCenter(tree[i])) {
            tree[i] = alignCenter(tree[i]);
        }

        if (isHeading(tree[i])) {
            tree[i] = heading(tree[i]);
        }

        if (isLink(tree[i])) {
            tree[i] = link(tree[i]);
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
