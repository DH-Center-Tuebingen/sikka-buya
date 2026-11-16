

class StringUtils {
    static isEmptyOrWhitespaces(text) {
        return text === null || text.match(/^ *$/) !== null;
    }


    static sanitizeSearch(text) {
        if(!text || !text.trim) return "";
        return text.trim();
    }
}

module.exports = StringUtils