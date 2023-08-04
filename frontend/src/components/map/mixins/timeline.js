import Query from '../../../database/query';
import RequestBuffer from '../../../models/request-buffer';
import URLParams from '../../../utils/URLParams';

/**
 * The methods inside the object get merged with 
 * the implementing component.
 * 
 * To prevent giving internal methods a weird
 * prefix and harming readablilty, we just 
 * put them outside the object making them private.
 * 
 * Note: You must call the function with `method.call(this)` 
 * if you want to have access to `this`. 
 */
function save() {
    const option = { year: this.raw_timeline.value, timelineActive: this.timelineActive }
    localStorage.setItem('map-timeline', JSON.stringify(option));
}

function load(options = {
    year: 433,
    timelineActive: true
}) {
    const optionsString = localStorage.getItem('map-timeline')

    try {
        let loadedOptions = JSON.parse(optionsString)
        Object.assign(options, loadedOptions)
    } catch (e) {
        console.warn(e)
    }

    return {
        year: URLParams.getInteger('year', options.year),
        timelineActive: URLParams.getBoolean('timelineActive', options.timelineActive)
    }
}



export default function ({ from = 0, to = 100, value = 50 } = {}) {
    return {
        data: function () {
            return {
                timelineActive: false,
                raw_timeline: { from, to, value },
                timeBuffer: null
            }
        },
        mounted() {
            this.timeBuffer = new RequestBuffer(100)
        },
        methods: {
            timeline_mixin_toggleTimeline() {
                this.timelineActive = !this.timelineActive
                save.call(this)
            },
            timeChanged: async function (val) {
                this.timeBuffer.update(val, () => {
                    this.raw_timeline.value = val;
                    /** 
                     * To allow proper editing, but also preventing the timeline
                     * to go above min and above max, we clamp the values for the 
                     * timelineUpdated.
                     */
                    this.timelineUpdated();
                    save.call(this)
                })

            },
            timeline_mixin_set({ from = null, to = null, value = null } = {}) {
                if (from !== null) this.raw_timeline.from = from
                if (to !== null) this.raw_timeline.to = to
                if (value !== null) this.raw_timeline.value = value
            },
            initTimeline: async function () {
                let options = load.call(this)

                try {
                    let result = await Query.raw(
                        `{
                        timespan {
                          from
                          to
                        }
                }`);

                    let timeline = result.data.data.timespan;
                    timeline.value = options.year || 433;
                    this.raw_timeline = timeline;
                    this.timelineActive = options.timelineActive
                } catch (e) {
                    console.error(e);
                }
            },
            timelineUpdated() {
                throw new Error("Mixin requires method 'timelineUpdated'.")
            },
            getTimelineOptions() {
                return {
                    year: (this.timelineActive) ? this.raw_timeline.value : null,
                    timelineActive: this.timelineActive
                }
            }
        },
        computed: {
            timeline() {
                return Object.assign({}, this.raw_timeline, {
                    value: Math.min(Math.max(this.raw_timeline.value, this.raw_timeline.from), this.raw_timeline.to)
                })
            },
            timelineValid() {
                return this.timeline.value === this.raw_timeline.value
            },
        }
    }
}