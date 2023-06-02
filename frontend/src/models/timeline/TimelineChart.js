class Chart {
    constructor(canvas) {
        if (!canvas) throw new Error("Canvas is required")
        this.canvas = canvas
    }

    updateSize() {
        const rect = this.canvas.getBoundingClientRect()
        this.canvas.width = rect.width
        this.canvas.height = rect.height
    }

    clear() {
        this.updateSize()
        this.getContext().clearRect(0, 0, this.canvas.width, this.canvas.height)
    }

    getContext() {
        return this.canvas.getContext('2d');
    }
}


export default class TimelineChart extends Chart {

    constructor(canvas, timeline) {
        super(canvas)
        this.timeline = timeline
    }

    updateTimeline(timeline) {
        this.timeline = timeline
    }


    y(val) {
        if (val < 0)
            return val * -1
        else
            return this.canvas.height - val;
    }

    x(val, pos = null) {
        const timelineSpan = this.timeline.to - this.timeline.from
        const widthPerYear = this.canvas.width / timelineSpan
        let x = (val - this.timeline.from) * widthPerYear - 2

        if (pos === "start")
            x = x - widthPerYear / 2
        else if (pos === "end") {
            x = x + widthPerYear / 2

        }
        // console.table({ in: val, x, timelineSpan, widthPerYear, to: this.timeline.to, from: this.timeline.from })

        return x
    }

    drawRangeRectOnCanvas(data, height, contextStyles) {
        let ctx = this.getContext()
        Object.assign(ctx, contextStyles)
        data.forEach(range => {
            let width = this.x(range[1], "end") - this.x(range[0], "start")
            ctx.fillRect(this.x(range[0], "start"), 0, width, height)
        })
    }

    drawRangeLineOnCanvas(data, y, lineOptions) {
        let ctx = this.getContext()
        Object.assign(ctx, lineOptions)

        data.forEach(range => {
            ctx.beginPath();
            const start = this.x(range[0], "start")
            ctx.moveTo(start, this.y(y))

            let end = this.x(range[1], "end")
            if (end - start <= 1) end = start + 1
            ctx.lineTo(end, this.y(y))
            ctx.stroke()
        })

    }

    drawGraphOnTimeline(data, lineOptions = {}, {
        max = null
    } = {}) {
        let ctx = this.canvas.getContext('2d');
        Object.assign(ctx, lineOptions)
        ctx.beginPath();

        let curveMax = max;
        let yStep = (this.canvas.height - (lineOptions.lineWidth || 1) - 10) / (curveMax > 0 ? curveMax : 20);
        data = data.sort((a, b) => a.x - b.x)
        let last = null;
        data.forEach(({ x: _x, y: _y }) => {
            if (last && _x - last.x > 1) {
                ctx.lineTo(this.x(last.x), this.y(0));
                last = null;
            }

            const x = this.x(_x)
            const y = this.y(_y * yStep)
            const bezier = 0

            if (last == null) {
                ctx.moveTo(this.x(_x), this.y(0));
                ctx.lineTo(x, y)
            } else {
                ctx.lineTo(x, y)
                // ctx.bezierCurveTo(this.x(last.x + bezier), this.y(last.y), this.x(_x - bezier), this.y(_y), x, y)
            }






            last = { x: _x, y: _y };
        });

        ctx.lineTo(this.x(last.x), this.y(0));
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    }


}