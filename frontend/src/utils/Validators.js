/**
 * This module exports a function that checks whether a value is a number or null.
 * 
 * @module number-or-null
 */

/**
 * Checks whether a value is a number or null.
 * 
 * @param {*} value - The value to check.
 * @returns {boolean} - `true` if the value is a number or null, `false` otherwise.
 */
export function isNumberOrNull(value) {
    return value == null || !isNaN(value)
}
