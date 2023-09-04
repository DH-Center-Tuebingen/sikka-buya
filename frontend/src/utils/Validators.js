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


/**
 * Checks if the provided value is a valid GeoJSON object.
 * 
 * Note: Currently only supports GeoJSON objects with a type of `Feature`, `Point`, or `Polygon`.
 * 
 * @param {object} value - The value to check. 
 */
export function isValidGeoJson(value) {
    if (!value) return false
    if (!value.type) return false
    const validTypes = ['feature', 'point', 'polygon']
    if (!validTypes.includes(value.type.toLowerCase())) return false

    if (value.type.toLowerCase() === 'feature') {
        if (!value.geometry) return false
        return isValidGeoJson(value.geometry)
    } else {
        if (!value.coordinates) return false
    }
    return true
}