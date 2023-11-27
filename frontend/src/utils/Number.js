

export function fixPrecision(x, cutoff = 10) {
    return parseFloat(x.toFixed(cutoff))
}