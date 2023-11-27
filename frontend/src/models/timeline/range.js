export default class Range {

    constructor(start, end) {
        if (start > end) {
            let tmp = start
            start = end
            end = tmp
        }
        this.start = start
        this.end = end
    }

    static inBetween(start, end) {
        return new Range(start, end)
    }

    contains(value, {
        startInclusive = true,
        endInclusive = true
    } = {}) {
        const biggerThanStart = startInclusive ? value >= this.start : value > this.start
        const smallerThanEnd = endInclusive ? value <= this.end : value < this.end
        return biggerThanStart && smallerThanEnd
    }


    static union(rangesArr) {
        if (rangesArr.length === 0) return []
        let overlappingRanges = []
        rangesArr.forEach(ranges => {
            ranges.forEach(range => {
                let nextOverlap = []
                let nextRange = range


                overlappingRanges.forEach(existingRange => {
                    let consumed = false

                    if (existingRange[0] >= nextRange[0] && existingRange[1] <= nextRange[1]) {
                        consumed = true
                    }

                    if (existingRange[0] < nextRange[0] && existingRange[1] >= nextRange[0]) {
                        nextRange[0] = existingRange[0]
                        consumed = true
                    }

                    if (existingRange[0] <= nextRange[1] && existingRange[1] > nextRange[1]) {
                        nextRange[1] = existingRange[1]
                        consumed = true
                    }

                    if (!consumed) {
                        nextOverlap.push(existingRange)
                    }
                })

                nextOverlap.push(nextRange)
                overlappingRanges = nextOverlap.sort((a, b) => a[0] - b[0])

            })
        })
        return overlappingRanges
    }


    static getWidthFromRanges(ranges) {
        return ranges[ranges.length - 1][1] - ranges[0][0]
    }

    static overlappingRanges(rangesArr) {
        if (rangesArr.length === 0) return []

        let overlappingRanges = rangesArr.shift()
        rangesArr.forEach(ranges => {
            // We need to save it to a new array,
            // as we may overwrite xisting ranges otherwise:
            // e.g.
            //      [9 ... 16]
            //[1 ... 9]   [14 ... 18]

            let nextOverlap = []

            for (let o_range of overlappingRanges) {

                for (let range of ranges) {
                    const nextRange = [o_range[0], o_range[1]]
                    let include = false
                    // If the lower bound is inside the existing range, it sets a new lower bound.
                    if (range[0] >= o_range[0] && range[0] < o_range[1]) {
                        nextRange[0] = range[0]
                        include = true
                    }

                    // If the higher bound is inside the existing range, it sets a new higher bound.
                    if (range[1] >= o_range[0] && range[1] <= o_range[1]) {
                        nextRange[1] = range[1]
                        include = true
                    }

                    if (include)
                        nextOverlap.push(nextRange)

                    // For efficiancy, we skip all steps if the lower bound is above the 
                    // higher bound of the overlapping array.
                    if (range[0] > o_range[1]) break;
                }

            }

            overlappingRanges = nextOverlap
        })
        return overlappingRanges
    }

    static fromPointArray(arr, {
        mergeDistance = null
    } = {}) {
        const nonEmptyPoints = arr.filter(point => {
            if (Array.isArray(point.y)) {
                return point.y.reduce((a, b) => a + b, 0) > 0
            } else {
                return point.y > 0
            }
        })

        const pointArray = nonEmptyPoints.map(point => point.x)
        return this.fromNumberSequence(pointArray, {
            mergeDistance
        })
    }

    static fromNumberSequence(arr, {
        mergeDistance = 1
    } = {}) {
        let ranges = [];
        arr.sort((a, b) => a - b)

        if (arr.length > 0) {
            const first = arr.shift();
            ranges.push([first, first]);

            let prev = first;
            let prevRange = 0;
            for (let obj of arr) {
                const value = obj
                if (value - prev <= mergeDistance) {
                    ranges[prevRange][1] = value;
                } else {
                    ranges.push([value, value]);
                    prevRange++;
                }
                prev = value;
            }
        }
        return ranges;
    }
}