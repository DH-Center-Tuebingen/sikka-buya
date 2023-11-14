import { isArray } from 'lodash'
import Range from "./range.js"

class Chart {
    constructor(canvas) {
        if (!canvas) throw new Error("Canvas is required")
        this.canvas = canvas
    }

    updateSize() {
        this.clear()
    }

    clear() {
        const rect = this.canvas.getBoundingClientRect()
        this.canvas.width = rect.width
        this.canvas.height = rect.height
        this.getContext().clearRect(0, 0, this.canvas.width, this.canvas.height)
    }

    getContext() {
        return this.canvas.getContext('2d');
    }
}

export class Graph {

    constructor(data, { contextStyles = {} } = {}) {
        this.data = data
        this.contextStyles = contextStyles
    }

    draw(context) {
        this.joinStyles(context)
    }

    get baseStyles() {
        return {
            fillStyle: "rgba(0,0,0,0.1)",
            strokeStyle: "rgba(0,0,0,0.1)",
        }
    }

    joinStyles(context) {
        Object.assign(context, this.baseStyles, this.contextStyles)
    }
}

export class TickGraph extends Graph {

    constructor(from, to, { options = {
        longDash: 50,
        shortDash: 10,
        textOffset: 5,
        showShortTextWhenCountBelow: 20,
    }, contextStyles = {} } = {}) {
        super([from, to], { contextStyles })

        this.longDash = options.longDash
        this.shortDash = options.shortDash
        this.textOffset = options.textOffset
        this.showShortTextWhenCountBelow = options.showShortTextWhenCountBelow
    }

    createLabel(context, chart, x, dash) {
        context.textAlign = "center"
        context.fillStyle = context.strokeStyle
        context.fillText(x, chart.x(x), chart.y(0) - dash - this.textOffset)
    }

    draw(context, chart) {
        super.draw(context)
        

        const steps = [1, 5, 10, 50, 100, 200, 500, 1000]

        const from = this.data[0]
        const to = this.data[1]
        const range = to - from

        let i = 0
        while (range / steps[i+1] > 15 && i < steps.length - 2) i++

        let smallStep = steps[i]
        let bigStep = steps[i + 1]



        const bigStart = Math.ceil(this.data[0] / bigStep) * bigStep
        for (let x = bigStart; x <= this.data[1]; x += bigStep) {
            if(x === from || x === to) continue
            context.beginPath()
            context.moveTo(chart.x(x), chart.y(0))
            this.createLabel(context, chart, x, this.longDash)
            context.lineTo(chart.x(x), chart.y(0) - this.longDash)

            context.stroke()
        }

        const smallStart = Math.ceil(this.data[0] / smallStep) * smallStep
        for (let x = smallStart; x <= this.data[1]; x += smallStep) {
            if(x === from || x === to) continue
            if (x % bigStep === 0) continue
            context.beginPath()
            context.moveTo(chart.x(x), chart.y(0))
            context.lineTo(chart.x(x), chart.y(0) - this.shortDash)
            if (range / smallStep < this.showShortTextWhenCountBelow) {
                this.createLabel(context, chart, x, this.shortDash)
            }
            context.stroke()
        }
    }

}





export class SplitYGraph extends Graph {

    constructor(data, { topMax = 0, bottomMax = 0, offset = 0, hlines = false, contextStyles = {}, colors = [] } = {}) {
        super(data, { contextStyles })
        this.topMax = topMax
        this.bottomMax = bottomMax
        this.offset = offset
        this.hlines = hlines
        this.yMax = topMax + bottomMax
        this.colors = colors
    }

    get yOptions() {
        return { max: this.yMax, offset: this.offset, bottomOffset: this.offset }
    }

    center(chart) {
        return chart.y(this.bottomMax, this.yOptions)
    }


    height(chart, value) {
        return chart.height(value, this.yOptions)
    }

    y(chart, value, isTop = false) {
        return chart.y(value, this.yOptions)
    }

    draw(context, chart) {
        super.draw(context)

        if (this.hlines) {
            this.drawHorizontalLines(context, chart)
        }
    }

    drawHorizontalLines(context, chart) {
        const steps = [1, 3, 5, 10, 20, 50, 100, 200, 500, 1000]
        const step = steps.find(step => step > this.yMax / 10)
        const padding = this.hlines.padding ? this.hlines.padding : { left: 5, bottom: 5 }
        context.strokeStyle = this.hlines.color ? this.hlines.color : "#ccc"



        for (let n = 0; n < 2; n++) {
            for (let i = step; i < this.yMax; i += step) {
                let y
                if (n === 1)
                    y = this.center(chart) + this.height(chart, i)
                else
                    y = this.center(chart) - this.height(chart, i)


                context.font = this.hlines?.font ? this.hlines.font : "12px sans-serif"
                context.strokeText(i, padding.left, y - padding.bottom)
                context.beginPath();

                context.moveTo(0, y)
                context.lineTo(chart.canvas.width, y)
                context.stroke()
            }
        }


    }

}


export class YGraph extends Graph {
    constructor(data, { yMax = 0, yOffset = 0, hlines = false, contextStyles = {} } = {}) {
        super(data, { contextStyles })
        this.yMax = yMax
        this.yOffset = yOffset
        this.hlines = hlines
    }

    get yOptions() {
        return { max: this.yMax, offset: this.yOffset }
    }

    height(chart, value) {
        return chart.height(value, this.yOptions)
    }

    y(chart, value) {
        return chart.y(value, this.yOptions)
    }

    draw(context, chart) {
        super.draw(context)

        if (this.hlines) {
            this.drawHorizontalLines(context, chart)
        }
    }

    drawHorizontalLines(context, chart) {
        const steps = [1, 5, 10, 20, 50, 100, 200, 500, 1000]
        const step = steps.find(step => step > this.yMax / 10)
        const padding = this.hlines.padding ? this.hlines.padding : { left: 5, bottom: 3 }
        context.strokeStyle = this.hlines.color ? this.hlines.color : "#ccc"

        for (let i = step; i < this.yMax; i += step) {
            context.font = this.hlines?.font ? this.hlines.font : "9px sans-serif"
            context.strokeText(i, padding.left, this.y(chart, i) - padding.bottom)
            context.beginPath();
            context.moveTo(0, this.y(chart, i))
            context.lineTo(chart.canvas.width, this.y(chart, i))
            context.stroke()
        }
    }

}



const defaultColors = [
    "#1f77b4",
    "#ff7f0e",
    "#2ca02c",
    "#d62728",
    "#9467bd",
    "#8c564b",
    "#e377c2",
    "#7f7f7f",
    "#bcbd22",
    "#17becf",
]

export class MirrorGraph extends SplitYGraph {

    draw(context, chart) {
        super.draw(context, chart)
        const width = chart.unitWidth > this.maxWidth ? this.maxWidth : chart.unitWidth


        const center = this.center(chart)
        context.beginPath();
        context.lineWidth = 1
        context.strokeStyle = "#111"
        context.moveTo(0, center)
        context.lineTo(chart.canvas.width, center)
        context.stroke()


        this.data.forEach(({ x: xVal, y }) => {
            if (!isArray(y)) y = [y]
            for (let i = 0; i < y.length && i < 2; i++) {



                const yVal = y[i]
                const color = this.colors[i % this.colors.length]

                context.beginPath();
                context.lineWidth = .5
                context.fillStyle = color

                const x = chart.x(xVal) - width / 2
                const height = this.height(chart, yVal)
                if (i === 0) {
                    context.rect(x, center - height, width, height)
                } else {
                    context.rect(x, center, width, height)
                }



                context.fill()
                context.stroke()
            }
        })
    }
}

export class BarGraph extends YGraph {
    constructor(data, { colors = defaultColors, hlines = false, yMax = 0, yOffset = 0, maxWidth = null, contextStyles = {} } = {}) {
        super(data, {
            yMax,
            yOffset,
            contextStyles,
            hlines
        })
        if (colors.length === 0) colors = defaultColors
        this.colors = colors
        this.maxWidth = maxWidth
    }

    draw(context, chart) {
        super.draw(context, chart)

        const width = chart.unitWidth > this.maxWidth ? this.maxWidth : chart.unitWidth
        this.data.forEach(({ x, y }) => {
            let yOffset = 0
            if (!isArray(y)) y = [y]
            for (let i = 0; i < y.length; i++) {
                const yVal = y[i]
                const color = this.colors[i % this.colors.length]
                context.beginPath();
                context.lineWidth = .5
                context.fillStyle = color
                yOffset += this.height(chart, yVal)
                context.rect(chart.x(x) - width / 2, this.y(chart, 0) - yOffset, width, this.height(chart, yVal))
                context.fill()
                context.stroke()
            }
        })
    }
}

export class HorizontalLinesGraph extends YGraph {

    draw(context, chart) {
        super.draw(context, chart)

        this.data.forEach(({ y } = {}) => {
            context.beginPath();
            context.moveTo(0, this.y(chart, y))
            context.lineTo(chart.canvas.width, this.y(chart, y))
            context.stroke()
        })
    }
}

export class LineGraph extends YGraph {

    constructor(data, { yMax = 0, yOffset = 0, edges = "drop", contextStyles = {} } = {}) {
        super(data, { yMax, yOffset, contextStyles })
        this.edges = edges
    }

    set(name, value) {
        this[name] = value
        return this
    }


    draw(context, chart) {
        super.draw(context, chart)

        context.beginPath();
        let prev = null
        for (let i = 0; i < this.data.length; i++) {
            let { x, y } = this.data[i]
            let { x: nextX } = this.data[i + 1] || { x: null }

            if (!prev || x - prev.x > 1) {
                switch (this.edges) {
                    case "line":
                        context.moveTo(chart.x(x, "start"), chart.y(y, this.yOptions))
                        break
                    case "drop":
                    default:
                        context.moveTo(chart.x(x), chart.y(0, this.yOptions))
                }
            }
            prev = { x, y }
            context.lineTo(chart.x(x), chart.y(y, this.yOptions))

            if (!nextX || nextX - x > 1) {
                switch (this.edges) {
                    case "line":
                        context.lineTo(chart.x(x, "end"), chart.y(y, this.yOptions))
                        break
                    case "drop":
                    default:
                        context.lineTo(chart.x(x), chart.y(0, this.yOptions))
                }
            }
        }


        context.stroke()
    }

}

export class RangeGraph extends Graph {

    constructor(data, { contextStyles = {} } = {}) {
        super(data, { contextStyles })
    }

    draw(context, chart) {
        super.draw(context, chart)
        this.data.forEach(range => {
            let start = chart.x(range[0], "start")
            let end = chart.x(range[1], "end")
            let width = Math.ceil(end - start)
            if (width === 0) {
                width = 1
            }
            context.fillRect(start, 0, width, chart.y(0))
        })
    }
}

export class StackedRanges extends Graph {

    constructor(data, { y = 0, contextStyles = {} } = {}) {
        super(data, { contextStyles })
        this.y = y
    }

    draw(context, chart) {
        super.draw(context, chart)

        this.data.forEach(range => {
            context.beginPath();
            const start = chart.x(range[0], "start")
            context.moveTo(start, chart.y(this.y))
            let end = chart.x(range[1], "end")
            if (end - start <= 1) end = start + 1
            context.lineTo(end, chart.y(this.y))
            context.stroke()
        })
    }
}


export default class TimelineChart extends Chart {

    /**
     * 
     * @param {HTMLCanvasElement} canvas 
     * @param {object} timeline - timeline object with from and to properties
     * @param {number} timeline.from - start year
     * @param {number} timeline.to  - end year
     */
    constructor(canvas, timeline, graphs = []) {
        super(canvas)
        this.graphs = graphs
        this.timeline = timeline

        if (graphs.length > 0)
            this.draw()
    }

    update({ graphs = null, timeline = null } = {}) {
        if (graphs) {
            if (Array.isArray(graphs))
                this.graphs = graphs
            else
                this.graphs = [graphs]
        }
        if (timeline)
            this.timeline = timeline
        this.draw()
    }

    updateGraph(graphs) {
        this.graphs = graphs
        this.draw()
    }

    updateSize() {
        super.updateSize()
        this.draw()
    }

    draw() {
        this.clear()
        this.graphs.forEach(graph => {
            graph.draw(this.getContext(), this)
        })
    }

    updateTimeline(timeline) {
        this.timeline = timeline
    }

    get unitWidth() {
        const timelineSpan = this.timeline.to - this.timeline.from
        const widthPerYear = (this.canvas.width / timelineSpan)
        return widthPerYear
    }

    height(val, { max = null, offset = 0, bottomOffset = 0 } = {}) {
        const height = this.canvas.height - offset - bottomOffset

        if (max) {
            return (val / max) * height
        } else {
            return val
        }
    }


    y(val, { max = null, offset = 0, bottomOffset = 0 } = {}) {
        const height = this.canvas.height - offset

        if (max) {
            return (height - (val / max) * height) + offset - bottomOffset
        } else
            return height - val + offset - bottomOffset;
    }

    x(val, pos = "center") {
        const widthPerYear = this.unitWidth
        let x = (val - this.timeline.from) * widthPerYear

        let halfWidth = widthPerYear / 2
        if (halfWidth < 1) halfWidth = 1
        if (pos === "start") {
            x = Math.floor(x - halfWidth)
        } else if (pos === "end") {
            x = Math.floor(x + halfWidth)
        }

        return x
    }

    getCell({ x, y }) {
        const offset = this.unitWidth / 2
        const xCell = Math.floor((x - offset) / this.unitWidth)
        let year = this.timeline.from + xCell + 1

        return {
            x: xCell * this.unitWidth + offset,
            y: 0,
            height: this.canvas.height,
            width: this.unitWidth,
            year,
        }
    }

}


export class HighlightGraph extends Graph {
    constructor(position) {
        super(position)
    }

    update(position) {
        this.data = position
    }

    draw(context, chart) {
        if (!this.data) return
        const rect = chart.getCell(this.data)

        context.beginPath()
        context.rect(rect.x, rect.y, rect.width, rect.height)
        context.fillStyle = "rgba(0,0,0,0.05)"
        context.fill()

        // context.textAlign = "center"
        // context.fillStyle = "#111"
        // context.font = "bold 10pt Arial, sans-serif"

        // let x = rect.x + rect.width / 2
        // if (x < 50) {
        //     x = 10
        //     context.textAlign = "left"
        // } else if (x > chart.canvas.width - 50) {
        //     x = chart.canvas.width - 10
        //     context.textAlign = "right"
        // }

        // context.fillText(rect.year, x, 20)
    }
}

