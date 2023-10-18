import TimelineChart, { HighlightGraph } from '../../models/timeline/TimelineChart'
import Mixin from '../../utils/Mixin'

const thMixin = new Mixin('Timeline Highlight')

export default function ({ canvasRef, timelineRef, tooltipCallback = () => ({}) } = {}) {
    return {
        data() {
            return {
                [thMixin.member("timelineChart")]: null,
                [thMixin.member("highlightRect")]: null,
                [thMixin.member("graph")]: new HighlightGraph(null),
                [thMixin.member("tooltip")]: null,
                [thMixin.member("tooltipCallback")]: tooltipCallback
            }
        },
        mounted() {
            if (!this.timeline)
                thMixin.throw(`Timeline is not defined: a member called 'timeline' must provide the timeline. Normally this is provided using the 'Timeline Mixin'`)

            if (!this[thMixin.member("canvas")]) {
                thMixin.throw(`Canvas is not defined, the 'canvasRef' must point to a valid canvas element.`)
            }

            if (!this[thMixin.member("timeline")]) {
                thMixin.throw(`Timeline component is not defined, the 'timelineRef' must point to a valid timeline element.`)
            }


            this[thMixin.member("timelineChart")] = new TimelineChart(
                this[thMixin.member("canvas")],
                this.timeline,
                [this[thMixin.member("graph")]]
            )
            this[thMixin.member("timelineChart")].updateSize()


            this[thMixin.member("timelineContainer")].addEventListener("mousemove", this[thMixin.member("mousemove")])
            this[thMixin.member("timelineContainer")].addEventListener("mouseenter", this[thMixin.member("mouseenter")])
            this[thMixin.member("timelineContainer")].addEventListener("mouseleave", this[thMixin.member("mouseleave")])
            this[thMixin.member("timelineContainer")].addEventListener("mouseout", this[thMixin.member("mouseleave")])

            window.addEventListener("resize", this[[thMixin.member("resize")]])
        },
        beforeDestroy() {
            this[thMixin.member("timelineContainer")].removeEventListener("mousemove", this[thMixin.member("mousemove")])
            this[thMixin.member("timelineContainer")].removeEventListener("mouseenter", this[thMixin.member("mouseenter")])
            this[thMixin.member("timelineContainer")].removeEventListener("mouseleave", this[thMixin.member("mouseleave")])
            this[thMixin.member("timelineContainer")].removeEventListener("mouseout", this[thMixin.member("mouseleave")])

            window.removeEventListener("resize", this[[thMixin.member("resize")]])
        },
        watch: {
            timeline: {
                handler: function (timeline) {
                    this[thMixin.member("timelineChart")].updateTimeline(timeline)
                },
                deep: true
            }
        },
        methods: {
            [thMixin.member("resize")]: function () {
                this[thMixin.member("timelineChart")].updateSize()
            },
            [thMixin.member("mouseenter")]: function (event) {
                this[thMixin.member("createTooltip")]()
                this[thMixin.member("update")]({ x: event.offsetX, y: event.offsetY })
            },
            [thMixin.member("mouseleave")]: function (event) {
                this[thMixin.member("update")](null)
                this[thMixin.member("removeTooltip")]()
            },
            [thMixin.member("mousemove")]: function (event) {
                this[thMixin.member("update")]({ x: event.offsetX, y: event.offsetY })
                this[thMixin.member("updateTooltip")]({ x: event.pageX, y: event.pageY })
            },
            [thMixin.member("update")]: function (position) {
                this[thMixin.member("graph")].update(position)
                this[thMixin.member("timelineChart")].update()
            },
            [thMixin.member("createTooltip")]: function () {
                const tooltip = document.createElement("div")
                tooltip.className = "timeline-highlight-tooltip"
                tooltip.innerText = "test"
                tooltip.style.opacity = 0
                tooltip.style.transition = "opacity 0.2s ease-in-out"
                document.body.appendChild(tooltip)
                this[thMixin.member("tooltip")] = tooltip
            },
            [thMixin.member("updateTooltip")]: function (position) {
                const tooltip = this[thMixin.member("tooltip")]

                const containerRect = this[thMixin.member("timelineContainer")].getBoundingClientRect()
                const relativePosition = {
                    x: position.x - containerRect.left,
                    y: position.y - containerRect.top
                }

                const { year } = this[thMixin.member("timelineChart")].getCell(relativePosition)
                this[thMixin.member("tooltipCallback")](tooltip, year)

                Object.assign(tooltip.style, {
                    position: "absolute",
                    left: `${parseInt(position.x)}px`,
                    top: `${parseInt(position.y) - 5}px`,
                    backgroundColor: "white",
                    zIndex: 1000,
                    pointerEvents: "none",
                    padding: "3px 5px",
                    borderRadius: "3px",
                    border: "1px solid whitesmoke",
                    transform: "translate(-50%, -100%)",
                    opacity: tooltip.textContent ? 1 : 0
                })
            },
            [thMixin.member("removeTooltip")]: function () {
                const tooltip = this[thMixin.member("tooltip")]
                if (tooltip) {
                    tooltip.style.opacity = 0
                    setTimeout(() => {
                        tooltip.remove()
                    }, 200)
                    this[thMixin.member("tooltip")] = null
                }
            }
        },
        computed: {
            [thMixin.member("timeline")]: function () { return this.$refs[timelineRef].$el },
            [thMixin.member("timelineContainer")]: function () { return this.$refs[timelineRef].container },
            [thMixin.member("canvas")]: function () { return this.$refs[canvasRef] },
        }
    }
}