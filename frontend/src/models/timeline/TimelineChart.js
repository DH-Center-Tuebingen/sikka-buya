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
    draw(context, data) {
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

export class LineGraph extends Graph {

    constructor(data, { yMax = 0, yOffset = 0, edges = "drop", contextStyles = {} } = {}) {
        super()
        this.yMax = yMax
        this.yOffset = yOffset
        this.edges = edges
        this.data = data
        this.contextStyles = contextStyles
    }

    set(name, value) {
        this[name] = value
        return this
    }

    get yOptions() {
        return { max: this.yMax, offset: this.yOffset }
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
        super()
        this.data = data
        this.contextStyles = contextStyles
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
        super()
        this.y = y
        this.data = data
        this.contextStyles = contextStyles
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
        if (graphs != null)
            this.graphs = graphs
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


    y(val, { max = null, offset = 0 } = {}) {

        const height = this.canvas.height - offset

        if (max) {
            return (height - (val / max) * height) + offset
        } else
            return height - val + offset;
    }

    x(val, pos = "center") {
        const timelineSpan = this.timeline.to - this.timeline.from
        const widthPerYear = (this.canvas.width / timelineSpan)
        let x = (val - this.timeline.from) * widthPerYear

        let halfWidth = widthPerYear / 2
        if (halfWidth < 1) halfWidth = 1
        if (pos === "start") {
            x = Math.floor(x - halfWidth)
        } else if (pos === "end") {
            x = Math.floor(x + halfWidth)
        }
        // console.table({ in: val, x, timelineSpan, widthPerYear, to: this.timeline.to, from: this.timeline.from })

        return x
    }

    // drawRangeRectOnCanvas(data, height, contextStyles) {
    //     let ctx = this.getContext()
    //     Object.assign(ctx, contextStyles)
    //     data.forEach(range => {
    //         let width = this.x(range[1], "end") - this.x(range[0], "start")
    //         ctx.fillRect(this.x(range[0], "start"), 0, width, height)
    //     })
    // }



    // drawGraphOnTimeline(data, lineOptions = {}, {
    //     max = null
    // } = {}) {
    //     let ctx = this.canvas.getContext('2d');
    //     Object.assign(ctx, lineOptions)
    //     ctx.beginPath();

    //     let curveMax = max;
    //     let yStep = (this.canvas.height - (lineOptions.lineWidth || 1) - 10) / (curveMax > 0 ? curveMax : 20);
    //     data = data.sort((a, b) => a.x - b.x)
    //     let last = null;
    //     data.forEach(({ x: _x, y: _y }) => {
    //         if (last && _x - last.x > 1) {
    //             ctx.lineTo(this.x(last.x), this.y(0));
    //             last = null;
    //         }

    //         const x = this.x(_x)
    //         const y = this.y(_y * yStep)
    //         const bezier = 0

    //         if (last == null) {
    //             ctx.moveTo(this.x(_x), this.y(0));
    //             ctx.lineTo(x, y)
    //         } else {
    //             ctx.lineTo(x, y)
    //             // ctx.bezierCurveTo(this.x(last.x + bezier), this.y(last.y), this.x(_x - bezier), this.y(_y), x, y)
    //         }






    //         last = { x: _x, y: _y };
    //     });

    //     ctx.lineTo(this.x(last.x), this.y(0));
    //     ctx.stroke();
    //     ctx.fill();
    //     ctx.closePath();
    // }
}