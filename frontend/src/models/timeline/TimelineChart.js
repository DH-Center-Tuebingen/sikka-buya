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

    update({ graphs = null, timeline = null }) {
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

    height(val, { max = null, offset = 0 } = {}) {
        const height = this.canvas.height - offset

        if (max) {
            return (val / max) * height
        } else {
            return val
        }
    }


    y(val, { max = null, offset = 0 } = {}) {
        const height = this.canvas.height - offset

        if (max) {
            return (height - (val / max) * height) + offset
        } else
            return height - val + offset;
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

}
