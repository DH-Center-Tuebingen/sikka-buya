import StringUtils from './StringUtils';

export default class Sort {

    /**
     * Performs a classical alphabetical sorting without 
     * ignoring any characters.
     * 
     * If used for sorting phonetic spelling, you should use
     * 'Sort.stringAlphabetically'.
     * 
     * @param {*} asc 
     * @returns 
     */
    static classicStringAlphabetically(asc = true) {
        return function (a, b) {
            let sort;
            if (a == null) sort = 1
            if (b == null) sort = -1
            else sort = a.localeCompare(b)

            // Flip if not asc.
            if (!asc) sort *= -1
            return sort
        }
    }

    /**
     * Returns a sorting method for the german phonetic spelling of the 
     * arabic language, to get a more natural sorting of those words 
     * (ignores things like e.g. a starting halfring and al-, ad- prefixes).
     * 
     * @param {*} asc 
     * @returns 
     */
    static stringAlphabetically(asc = true) {
        return function (a, b) {

            // If an element is missing, we just push it
            // to the end of the 
            if (a == null) return 1
            if (b == null) return -1

            a = Sort._removeCharactersThatObstructSorting(a.toUpperCase())
            b = Sort._removeCharactersThatObstructSorting(b.toUpperCase())

            return Sort.classicStringAlphabetically(asc)(a, b)
        }
    }

    static stringPropAlphabetically(propertyNameOrPath, asc = true) {
        return function (objA, objB) {
            const path = propertyNameOrPath.split(".")

            let a = objA
            let b = objB

            while (path.length > 0) {
                let property = path.shift()
                a = a?.[property] ? a[property] : null
                b = b?.[property] ? b[property] : null
            }

            return Sort.stringAlphabetically(asc)(a, b)
        }
    }

    static _removeCharactersThatObstructSorting(str) {
        str = StringUtils.removeSpecialCharacters(str)

        str = StringUtils.removePrefix(str, "AL-")
        str = StringUtils.removePrefix(str, "AD-")
        str = StringUtils.removePrefix(str, "AR-")
        return str
    }

}