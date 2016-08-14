'use strict';

module.exports = {
    trim: function trim(source) {
        if (typeof source !== 'string'
            || typeof source.trim !== 'function')
            return source;

        return source.trim();
    },

    isString: function isString(source) {
        return typeof source === 'string';
    },

    isArray: function isArray(source) {
        return Array.isArray(source);
    },

    isObject: function isObject(source) {
        return typeof source === 'object';
    },
};
