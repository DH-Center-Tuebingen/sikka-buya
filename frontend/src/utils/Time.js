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
        const date = new Date(parseInt(timestamp))
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
    }
}