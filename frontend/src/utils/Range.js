export function stringifyRange(value) {
    if (value.from != null && value.to == null) {
        return `${value.from}`;
    }

    if (value.from != null && value.to != null) {
        return `${value.from}–${value.to}`;
    }

    return "N/A";
}