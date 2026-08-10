import { toNumber } from "lodash";

export default class Time {
    static formatDateTime(timestamp) {
        if (!timestamp) return '-';
        let date = new Date(parseInt(timestamp));
        return date.toLocaleString("de-DE");
    }

    static formatDate(timestamp) {
        if (!timestamp || timestamp === "0") return '-';
        let date = new Date(parseInt(timestamp));
        return date.toLocaleDateString("de-DE");
    }

    static timestampToDateInputValue(timestamp) {
        const ts = parseInt(timestamp)
        if (isNaN(ts)) return null
        const date = new Date(ts)
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
    }

    static dateInputValueToTimestamp(dateInputValue) {
        const date = new Date(dateInputValue)
        return date.getTime()
    }

    static overlap(A, B) {
        if(A.from === undefined || A.to === undefined || B.from === undefined || B.to === undefined) return false
        const fromA = toNumber(A.from)
        const toA = toNumber(A.to)
        const fromB = toNumber(B.from)
        const toB = toNumber(B.to)
        if(isNaN(fromA) || isNaN(toA) || isNaN(fromB) || isNaN(toB)) return false
        return fromA <= toB &&  toA >= fromB
    }
}