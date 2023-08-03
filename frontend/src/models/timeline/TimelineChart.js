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
    constructor(data, { yMax = 0, yOffset = 0, contextStyles = {} } = {}) {
        super(data, { contextStyles })
        this.yMax = yMax
        this.yOffset = yOffset
    }

    get yOptions() {
        return { max: this.yMax, offset: this.yOffset }
    }

    y(chart, value) {
        return chart.y(value, this.yOptions)
    }
}


export class BarGraph extends YGraph {
    draw(context, chart) {
        super.draw(context, chart)

        const width = chart.unitWidth

        this.data.forEach(({ x, y } = {}) => {
            context.beginPath();
            console.log(y, chart.y(y), this.yMax)
            context.rect(chart.x(x) - width / 2, this.y(chart, y), width, chart.y(0) - this.y(chart, y))
            context.fill()
            context.stroke()
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
