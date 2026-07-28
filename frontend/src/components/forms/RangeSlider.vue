<template>
    <div
        class="range-slider"
        :class="{ disabled: disabled }"
    >
        <div class="range-slider-track">
            <div
                ref="innerTrack"
                class="range-slider-inner-track"
            >
                <div
                    class="range-slider-active-track"
                    :style="activeTrackStyle"
                />
                <div
                    class="range-slider-active-track"
                    :style="activeTrackStyle"
                />


                <div
                    class="range-slider-caret-container range-slider-start user-select-none"
                    role="button"
                    :style="startStyle"
                    @pointerdown="startDrag('from')"
                >
                    <div
                        class="range-slider-caret"
                        :class="getDraggedClass('from')"
                    />

                    <span class="range-slider-caret-value">
                        {{ startLabelText }}
                    </span>
                </div>


                <div
                    class="range-slider-caret-container range-slider-end user-select-none"
                    role="button"
                    :style="endStyle"
                    @pointerdown="startDrag('to')"
                >
                    <div
                        class="range-slider-caret"
                        :class="getDraggedClass('to')"
                    />
                    <span class="range-slider-caret-value">
                        {{ endLabelText }}
                    </span>
                </div>
            </div>


            <canvas
                v-if="requireCanvas"
                ref="canvas"
            >
                No canvas support
            </canvas>
        </div>
    </div>
</template>

<script>
const defaultFontSize = 12;
const defaultLabelPadding = 5;

export default {
    name: 'RangeSlider',

    model: {
        prop: 'value',
        event: 'input'
    },

    props: {
        value: {
            type: Object,
            default: null
        },
        disabled: {
            type: Boolean,
            default: false
        },
        min: {
            type: Number,
            default: 0
        },
        max: {
            type: Number,
            default: 100
        },
        step: {
            type: Number,
            default: 0
        },
        ctrlSnap: {
            type: Number,
            default: 1
        },
        shiftSnap: {
            type: Number,
            default: 10
        },
        altSnap: {
            type: Number,
            default: 0.1
        },
        enforceMinMax: {
            type: Boolean,
            default: false
        },
        rulers: {
            type: Array,
            default: null
        }
    },

    data() {
        return {
            dragging: null,
            internalValue: this.value ? { ...this.value } : { from: this.min, to: this.max },
        };
    },

    computed: {
        start() {
            return this.internalValue ? this.internalValue.from : this.min;
        },
        end() {
            return this.internalValue ? this.internalValue.to : this.max;
        },
        requireCanvas() {
            if (!this.rulers) { return false; }
            if (!Array.isArray(this.rulers)) { return true; }
            return this.rulers.length > 0;
        },
        rulerArray() {
            if (!this.rulers) { return []; }
            if (Array.isArray(this.rulers)) { return this.rulers; }
            return [this.rulers];
        },
        startLabelText() {
            return this.makeTextLabel(this.start);
        },
        endLabelText() {
            return this.makeTextLabel(this.end);
        },
        startStyle() {
            return { left: `${this.getPosition(this.start)}%` };
        },
        endStyle() {
            return { left: `${this.getPosition(this.end)}%` };
        },
        activeTrackStyle() {
            return {
                left: `${this.getPosition(this.start)}%`,
                width: `${this.getPosition(this.end) - this.getPosition(this.start)}%`
            };
        }
    },

    watch: {
        value(newVal) {
            if (newVal) {
                this.internalValue = { ...newVal };
            }
        }
    },

    mounted() {
        this.updateCanvas();

        if (this.$refs.canvas) {
            const obs = new ResizeObserver(() => this.updateCanvas());
            obs.observe(this.$refs.canvas);
        } else {
            console.error('Could not attach resize observer to canvas!');
        }
    },

    methods: {
        makeTextLabel(value) {
            return (this.step <= 0) ? value.toFixed(2) : value.toFixed(0);
        },

        getDraggedClass(index) {
            return this.dragging === index ? 'dragged' : '';
        },

        getPosition(value) {
            const range = this.max - this.min;
            const percentage = (value - this.min) / range;
            return Math.max(0, Math.min(100, percentage * 100));
        },

        updateCanvas() {
            if (!this.$refs.canvas || !this.requireCanvas) { return; }

            const bb = this.$refs.canvas.getBoundingClientRect();

            let requiredHeight = this.rulerArray.reduce((max, ruler) => {
                let fontSize = defaultFontSize;
                let labelPadding = defaultLabelPadding;
                if (ruler && typeof ruler.label === 'object') {
                    fontSize = ruler.label && ruler.label.size != null ? ruler.label.size : fontSize;
                    labelPadding = ruler.label && ruler.label.padding != null ? ruler.label.padding : labelPadding;
                }

                const length = ruler && ruler.length != null ? ruler.length : 0;

                // When the value is calculated perfectly, the text is still cropped
                // So we add a safety Padding to the fontSize
                const safetyPaddedFontSize = fontSize * 1.2;
                const totalLength = safetyPaddedFontSize + labelPadding + length;
                return (totalLength > max) ? totalLength : max;
            }, 0);

            const canvasHeight = requiredHeight;
            this.$refs.canvas.height = canvasHeight;
            this.$refs.canvas.width = bb.width;
            this.$refs.canvas.style.bottom = -canvasHeight + 'px';

            const ctx = this.$refs.canvas.getContext('2d');
            if (!ctx) { return; }
            this.drawRulers(ctx);
        },

        applyStep(value, step) {
            if (!step) { step = this.step; }
            // normalize the offset to -step/2 < 0 < step/2
            let offset = Math.abs(value % step);
            const sign = Math.sign(value);
            if (offset > step / 2) { offset = offset - step; }
            offset *= sign;

            // Remove the existing offset from the value
            // which will always be between -step/2 and step/2
            return value - offset;
        },

        performDrag(event) {
            if (!this.internalValue || this.dragging == null || !this.$refs.innerTrack) { return; }

            const track = this.$refs.innerTrack.getBoundingClientRect();
            const percentage = (event.clientX - track.left) / track.width;
            let value = this.min + percentage * (this.max - this.min);

            if (event.shiftKey) {
                value = this.applyStep(value, this.shiftSnap);
            } else if (event.ctrlKey) {
                value = this.applyStep(value, this.ctrlSnap);
            } else if (event.altKey) {
                value = this.applyStep(value, this.altSnap);
            }

            if (this.step != 0) {
                value = this.applyStep(value);
            }

            value = this.enforceLimit(value);
            value = this.enforceLimit(value, true);

            this.swapCaretWhenCrossing(value);
            this.$set(this.internalValue, this.dragging, value);
            this.$emit('input', { ...this.internalValue });
        },

        enforceLimit(value, upper) {
            upper = upper || false;
            const step = this.step;
            const doesViolate = (val) => upper ? (val > this.max) : (val < this.min);

            if (doesViolate(value)) {
                if (step && !this.enforceMinMax) {
                    while (doesViolate(value)) {
                        const fstep = upper ? -step : step;
                        value += fstep;
                    }
                } else {
                    value = upper ? this.max : this.min;
                }
            }
            return value;
        },

        swapCaretWhenCrossing(value) {
            if (!this.internalValue || this.dragging == null) { return; }
            const otherKey = this.dragging === 'from' ? 'to' : 'from';
            if (this.dragging === 'from' && value > this.internalValue.to) {
                this.$set(this.internalValue, this.dragging, this.internalValue[otherKey]);
                this.dragging = 'to';
            } else if (this.dragging === 'to' && value < this.internalValue.from) {
                this.$set(this.internalValue, this.dragging, this.internalValue[otherKey]);
                this.dragging = 'from';
            }
        },

        startDrag(target) {
            this.dragging = target;
            window.addEventListener('pointermove', this.performDrag);
            window.addEventListener('pointerup', this.endDrag);
            window.addEventListener('pointercancel', this.endDrag);
        },

        endDrag() {
            this.dragging = null;
            window.removeEventListener('pointermove', this.performDrag);
            window.removeEventListener('pointerup', this.endDrag);
            window.removeEventListener('pointercancel', this.endDrag);
        },

        drawRulers(ctx) {
            if (!this.rulers || !this.$refs.canvas) { return; }

            const halfCircleSize = 10;
            const pxPerStep = (this.$refs.canvas.width - 2 * halfCircleSize) / (this.max - this.min);
            const rulers = (!Array.isArray(this.rulers)) ? [this.rulers] : this.rulers;
            let biggerSteps = [...rulers].sort((a, b) => b.step - a.step).map(sd => sd.step);
            rulers.forEach(({ step, length, width: configWidth, color, label }) => {
                let width = configWidth ? configWidth : 1;
                biggerSteps.pop();
                if ((pxPerStep * step) > 5 * width) {
                    let startOffset = this.min % step;
                    const startPosition = this.min - startOffset;

                    for (let stepPosition = startPosition; stepPosition <= (this.max - this.min); stepPosition += step) {
                        let skipPaint = false;
                        for (let beforeStep of biggerSteps) {
                            if (stepPosition % beforeStep === 0) {
                                skipPaint = true;
                            }
                        }

                        if (skipPaint) { continue; }

                        const lastStyle = ctx.fillStyle;
                        ctx.fillStyle = color || 'black';

                        const xPosition = halfCircleSize + (stepPosition - this.min) * pxPerStep;
                        ctx.fillRect(xPosition - width / 2, 0, width, length);

                        if (label) {
                            const textContent = stepPosition.toString();

                            let size = defaultFontSize;
                            let family = 'sans-serif';
                            let weight = 400;
                            let italic = false;
                            let padding = defaultLabelPadding;

                            if (typeof label === 'object') {
                                const merged = Object.assign({ size, family, weight, italic, padding }, label);
                                size = merged.size;
                                family = merged.family;
                                weight = merged.weight;
                                italic = merged.italic;
                                padding = merged.padding;
                            }

                            ctx.font = `${italic ? 'italic' : ''} ${weight} ${size}px ${family}`;
                            const measured = ctx.measureText(textContent);
                            let xLabelStart = xPosition - measured.width / 2;

                            const canvasWidth = this.$refs.canvas ? this.$refs.canvas.width : 0;
                            const safetyPadding = size * 0.1;
                            // If the label is outside the canvas we move it inside the canvas with the offset of fixedXLabelStart
                            if (xLabelStart < safetyPadding) {
                                xLabelStart = safetyPadding;
                            } else if (xLabelStart + measured.width + safetyPadding > canvasWidth) {
                                xLabelStart = canvasWidth - measured.width - safetyPadding;
                            }

                            ctx.fillText(textContent, xLabelStart, length + size + padding);
                        }
                        ctx.fillStyle = lastStyle;
                    }
                }
            });
        }
    }
};
</script>

<style lang="scss">
$size: 20px;

canvas {
    position: absolute;
    z-index: -1;
    width: 100%;
}

.range-slider {
    position: relative;
    min-width: 200px;
    min-height: $size + 10px;
    height: $size + 10px;
    // background-color: rgb(24, 201, 53);

    &.disabled {
        pointer-events: none;
        opacity: 0.5;
    }
}

.range-slider-track {
    position: absolute;
    bottom: 0;
    height: $size/2;
    width: 100%;
    border-radius: 5px;
    background-color: white;
    transform: translateY(-50%);
}

.range-slider-inner-track {
    position: absolute;
    background-color: rgb(255, 255, 255);
    left: $size/2;
    width: calc(100% - #{$size});
    height: 100%;
}

.range-slider-active-track {
    position: absolute;
    background-color: $primary-color;
    height: 100%;
}

.range-slider-caret-container {
    height: 0 !important;
    width: 0 !important;

    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
}

.range-slider-caret {
    position: absolute;
    top: 0;
    left: 0;
    transform: translate(-50%, -50%) scale(1);

    height: $size;
    width: $size;

    background: rgba(255, 255, 255, 0.8);
    border-radius: 50%;
    box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.25);

    user-select: none;

    transition: transform 0.3s ease;

    &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 60%;
        height: 60%;
        background-color: $primary-color;
        border-radius: 50%;
    }

    &.dragged {
        transform: translate(-50%, -50%) scale(.9);
    }
}

.range-slider-caret-value {
    position: absolute;
    top: -24px;
    left: 50%;
    transform: translateX(-50%);
    color: rgb(177, 177, 177);
    font-size: 10px;
    font-weight: bold;
}
</style>