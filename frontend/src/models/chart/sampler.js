

class Sampler {
    constructor(data) {
        this.data = data.sort((a, b) => a.x - b.x)
    }
}


export class WindowSampler extends Sampler {
    constructor(data, {
        frequency = 1,
        windowSize = 1,
        falloffFunction
    }) {
        super(data)
        this.windowSize = windowSize
        this.max = 0
        this.falloffFunction = falloffFunction
        console.log(falloffFunction)
        this.frequency = frequency
    }

    sample() {
        const data = this.data.slice()
        const windowSize = this.windowSize
        let samples = []

        const start = data[0].x
        const end = data.at(-1).x

        let min = Infinity
        let max = -1 * Infinity
        if (data.length > 0)
            for (let i = start; i < end; i += this.frequency) {
                let value = 0
                for (let j = 0; j < data.length; j++) {
                    if (data[j].x < i - windowSize) {
                        data.shift()
                        j--
                    }
                    else {
                        value += this.falloffFunction(data[j], {
                            x: i,
                            y: 0
                        }, windowSize)
                    }
                }

                if (value < min) min = value
                if (value > max) {
                    max = value
                }

                samples.push({
                    x: i,
                    y: value
                })
            }
        return { min, max, samples }
    }

}