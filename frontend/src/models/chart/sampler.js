import Range from "../timeline/range"


class Sampler {
    constructor(data) {
        this.data = data.sort((a, b) => a.x - b.x)
    }

    sample() {
        throw new Error('Not implemented')
    }
}

export class WindowSampler extends Sampler {
    constructor(data, {
        frequency = 1,
        windowSize = 1,
        falloffFunction = null,
        minWidth = 1,
    }) {
        super(data)
        this.windowSize = windowSize
        this.max = 0
        this.falloffFunction = falloffFunction
        this.frequency = frequency
        this.minWidth = minWidth
    }

    sample() {
        const data = this.data.slice()
        const windowSize = this.windowSize
        let samples = []

        let min = Infinity
        let max = -1 * Infinity
        if (data.length > 0) {

            let start = data[0].x
            let end = data.at(-1).x

            let span = end - start

            if (span < this.minWidth) {
                const cutoff = 10
                const offset = (this.minWidth - span) / 2
                start = (start - offset)
                start -= (start % this.frequency)
                start = parseFloat(start.toFixed(cutoff))
                end = (end + offset)
                end -= (end % this.frequency)
                end = parseFloat(end.toFixed(cutoff))
            }

            span = end - start
            const steps = span / this.frequency

            for (let i = 0; i < steps; i++) {

                let x = start + (i * this.frequency)

                let value = 0
                for (let j = 0; j < data.length; j++) {
                    if (data[j].x < x - windowSize) {
                        data.shift()
                        j--
                    }
                    else {
                        value += this.falloffFunction(data[j], {
                            x,
                            y: 0
                        }, windowSize)
                    }
                }

                if (value < min) min = value
                if (value > max) {
                    max = value
                }

                samples.push({
                    x,
                    y: value
                })
            }
        }

        return { min, max, samples }
    }

}

export class FrequencySampler extends Sampler {

    constructor(data, {
        frequency = 1,
        offset = 1,
        cutoff = 10,
        start = null,
        end = null

    }) {
        super(data)

        this.frequency = frequency
        this.offset = this.floor(offset)
        this.cutoff = cutoff

        if (data.length > 0) {
            if (start != null) {
                this.start = this.floor(start)
            }
            else {
                this.start = this.floor(this.data[0].x)
            }

            if (end != null) {
                this.end = this.floor(end)
            }
            else {
                this.end = this.floor(this.data.at(-1).x)
            }
        }


    }

    floor(x) {
        return this.fixPrecision(x - (x % this.frequency))
    }

    fixPrecision(x) {
        return parseFloat(x.toFixed(this.cutoff))
    }


    sample() {

        if (this.data.length === 0) {
            return { min: 0, max: 0, samples: [] }
        }

        let start = this.fixPrecision(this.start - this.offset)
        let end = this.fixPrecision(this.end + this.frequency + this.offset)

        let samples = []
        let min = Infinity
        let max = -1 * Infinity

        for (let rangeStart = start; rangeStart <= end; rangeStart += this.frequency) {
            let value = 0
            rangeStart = this.fixPrecision(rangeStart)
            let rangeEnd = this.fixPrecision(rangeStart + this.frequency)
            for (let i = 0;
                i < this.data.length;
                i++) {

                if (Range.inBetween(rangeStart, rangeEnd).contains(this.data[i].x, {
                    endInclusive: false
                })) {
                    value += this.data[i].y
                }
            }

            if (value < min) min = value
            if (value > max) max = value
            samples.push({
                x: rangeStart,
                y: value
            })
        }


        return { min, max, samples, start, end }
    }
}