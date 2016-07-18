'use strict';

module.exports = {
    trim: function trim(source) {
        if (typeof source !== 'string'
            || typeof source.trim !== 'function')
            return source;

        return source.trim();
    },
};
