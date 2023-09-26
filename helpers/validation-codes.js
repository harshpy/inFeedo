'use strict';

const codes = {
    v001: 'Name must be valid string and less than 255 characters',
    v002: 'Email must be a valid string and less than 255 characters.',
    v003: 'Password must be a valid string and should consist of atleast 8 characters.',
    v004: 'Email already exists.',
    v005: 'Invalid email.',
    v006: `Task's status can be one of "inProgress", "completed" or "open".`
};

/**
 * Provides a mechanism to translate validation codes into messages
 */
module.exports = class ValidationCodes {
    /**
     * Translates a validation code into a human readable message
     * @param {string} code
     */
    static get(code) {
        return codes[code];
    }
};