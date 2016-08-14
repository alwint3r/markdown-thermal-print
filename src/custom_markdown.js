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

    for (var i = 1; i < length; i++) {
        if (utils.trim(element[i]) === '<-')
            break;
        if (utils.trim(element[i]).indexOf('->') === 0) {
            var replaceTag = element[i][element[i].indexOf('->') + 2] === ' ' ? '-> ' : '->';
            newElement[1].push(element[i].replace(replaceTag, ''));
        } else if (element[i].indexOf('<-') === element[i].length - 2) {
            var replaceTag = element[i][element[i].indexOf('<-') - 1] === ' ' ? ' <-' : '<-';
            newElement[1].push(element[i].replace(replaceTag, ''));
        } else {
            newElement[1].push(element[i]);
        }
    }

    newElement[1] = newElement[1].filter(function(item) {
        return item !== '';
    });

    return newElement;
}

function alignLeft(element) {
    var length = element.length;

    if (element[0] !== 'para') {
        return element;
    }

    var newElement = ['para', ['left']];
    if (length === 2) {
        var sliced = element[1].slice(2, element[1].length);
        newElement[1].push(sliced);

        return newElement;
    }

    for (var i = 1; i < length; i++) {
        if (utils.trim(element[i]).indexOf('->') === 0) {
            var replaceTag = element[i][element[i].indexOf('->') + 2] === ' ' ? '-> ' : '->';
            newElement[1].push(element[i].replace(replaceTag, ''));
        } else {
            newElement[1].push(element[i]);
        }
    }

    newElement[1] = newElement[1].filter(function(item) {
        return item !== '';
    });

    return newElement;
}

function alignRight(element) {
    var length = element.length;

    if (element[0] !== 'para') {
        return element;
    }

    var newElement = ['para', ['right']];
    if (length === 2) {
        var sliced = element[1].slice(0, element[1].length - 2);
        newElement[1].push(utils.trim(sliced));

        return newElement;
    }

    for (var i = 1; i < length; i++) {
        if (element[i].indexOf('<-') === element[i].length - 2) {
            var replaceTag = element[i][element[i].indexOf('<-') - 1] === ' ' ? ' <-' : '<-';
            newElement[1].push(element[i].replace(replaceTag, ''));
        } else {
            newElement[1].push(element[i]);
        }
    }

    newElement[1] = newElement[1].filter(function(item) {
        return item !== '';
    });

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

function shalloWLink(element) {
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
    var findResult = shalloWLink(element);
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

function findDeepLink(element) {
    var duplicate = element.concat([]);

    function recursiveFind(current, depth) {
        for (var i = 0 ; i < current.length; i++) {
            if (utils.isArray(current[i])) {
                depth.push(i);

                if (current[i][0] === 'link') {
                    return [depth, current[i][1].href];
                } else if (current[i][0] === 'link_ref') {
                    return [depth, current[i][1].ref];
                } else {
                    return recursiveFind(current[i], depth);
                }
            }
        }

        return false;
    }

    var link = recursiveFind(duplicate, []);

    if (link) {
        var pointer;
        for (var i = 0; i < link[0].length - 1; i++) {
            pointer = duplicate[link[0][i]];
        }

        if (pointer[link[0][link[0].length - 1]][0].indexOf('link') >= 0) {
            pointer[1] = pointer[1].replace(/\(.*\)/, link[1]);
        }

        var newPointer = [];

        for (var i = 0; i < pointer.length; i++) {
            if (utils.isArray(pointer[i])) {
                if (pointer[i][0].indexOf('link') >= 0) {
                    continue;
                }
            }

            newPointer.push(pointer[i]);
        }

        for (var i = 0; i < pointer.length; i++) {
            pointer[i] = newPointer[i];
        }

        pointer.length = newPointer.length;
    }

    return duplicate;
}

function isAlignRight(element) {
    if (element[0] !== 'para') {
        return false;
    }

    var length = element.length;

    if (length === 2 && utils.isString(element[1])) {
        var trimmed = utils.trim(element[1]);

        return trimmed.indexOf('->') < 0
            && trimmed.indexOf('<-') === trimmed.length - 2;
    }

    if (length > 2 && utils.isString(element[length - 1])) {

        return utils.trim(element[1]).indexOf('->') < 0
            && utils.trim(element[length - 1]).indexOf('<-') === (utils.trim(element[length - 1]).length - 2);
    }

    return false;
}

function isAlignLeft(element) {
    if (element[0] !== 'para') {
        return false;
    }

    var length = element.length;

    if (length === 2 && utils.isString(element[1])) {
        var trimmed = utils.trim(element[1]);

        return trimmed.indexOf('->') === 0
            && trimmed.indexOf('<-') < 0;
    }

    if (length > 2 && utils.isString(element[1])) {

        return utils.trim(element[1]).indexOf('->') === 0
            && utils.trim(element[length - 1]).indexOf('<-') < 0;
    }

    return false;
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

        if (isAlignLeft(tree[i])) {
            tree[i] = alignLeft(tree[i]);
        }

        if (isAlignRight(tree[i])) {
            tree[i] = alignRight(tree[i]);
        }

        if (isHeading(tree[i])) {
            tree[i] = heading(tree[i]);
        }

        if (shalloWLink(tree[i])) {
            tree[i] = link(tree[i]);
        }

        tree[i] = findDeepLink(tree[i]);
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
