
function toDist(a, b) {
    return Math.abs(b.x - a.x)
}


export function QuadraticFalloff(a, b, maxDist) {
    const dist = toDist(a, b)
    return Math.max(0, (-Math.pow(dist, 2) / Math.pow(maxDist, 2)) + 1)
}

export default class Falloff {
    static quadratic (...args){
        return QuadraticFalloff(...args)
    }
}
