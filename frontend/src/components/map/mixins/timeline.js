import Query from '../../../database/query';
import RequestBuffer from '../../../models/request-buffer';
import URLParams from '../../../utils/URLParams';

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
            timeline_mixin_save() {
                const option = { year: this.raw_timeline.value, timelineActive: this.timelineActive }
                localStorage.setItem('map-timeline', JSON.stringify(option));
            },
            timeline_mixin_load() {

                const queryOptions ={
                    year: URLParams.getInteger('year'),
                    timelineActive: URLParams.getBoolean('timelineActive')
                }

                let managedOptions = {
                    timelineActive: this.$mconfig.getBoolean("map.default.timeline.active"),
                    year: this.$mconfig.getInteger("map.default.timeline.startYear")
                }
                const optionsString = localStorage.getItem('map-timeline')
                let loadedOptions = {}
                try {
                    loadedOptions = JSON.parse(optionsString)
                } catch (e) {
                    console.warn(e)
                }
                
                return this.$utils.objectCombine({
                    year: 433,
                    timelineActive: false
                }, managedOptions,  loadedOptions, queryOptions)
            },
            timeline_mixin_toggleTimeline() {
                this.timelineActive = !this.timelineActive
                this.timeline_mixin_save()
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
                    this.timeline_mixin_save()
                })

            },
            timeline_mixin_set({ from = null, to = null, value = null } = {}) {
                if (from !== null) this.raw_timeline.from = from
                if (to !== null) this.raw_timeline.to = to
                if (value !== null) this.raw_timeline.value = value
            },
            initTimeline: async function () {
                let options = this.timeline_mixin_load();

                try {
                    let result = await Query.raw(
                        `{
                        timespan {
                          from
                          to
                        }
                }`);

                    let timeline = result.data.data.timespan;
                    timeline.value = options.year;
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