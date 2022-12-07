export default class Color {

    static _hexColorGuard(hex) {
        if (typeof hex !== "string" || hex.length != 7) throw new Error(`Invalid hex value!`, hex)
    }
    static _rgbGuard(rgb) {
        if (!Array.isArray(rgb) || rgb.length != 3 || rgb.some((val) => isNaN(val) || val < 0 || val > 255)) throw new Error("Invalid RGB value passed", rgb)
    }

    static rgbToHEX(rgb) {
        this._rgbGuard(rgb)
        let cols = rgb.map(val => parseInt(val).toString(16))
        return `#${cols.join("")}`
    }

    static hexToRGB(hex) {
        this._hexColorGuard(hex)
        let colors = []
        for (let i = 1; i < 7; i += 2) {
            let pos = (2 * (i - 1)) / 2 + 1
            let colStr = hex.substring(pos, pos + 2)
            colors.push(parseInt(colStr, 16))
        }
        return colors
    }

    static hexBrighten(hex, ratio, targetColor = "#ffffff") {
        if (isNaN(ratio) || ratio > 1 || ratio < 0) throw new Error("Ratio outside scope. Must be inbetween 0 and 1 (both inclusive).")

        const colors = this.hexToRGB(hex)
        targetColor = this.hexToRGB(targetColor)

        for (let i in colors) {
            let col = colors[i]
            colors[i] += (targetColor[i] - col) * ratio
        }
        return this.rgbToHEX(colors)
    }

    static hexToRGBA(hex, alpha) {
        const [r, g, b] = this.hexToRGB(hex)
        return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }

    static get Debug() {
        return "#ff00ff";
    }

    static get MissingColor() {
        return Color.Debug
    }

    static getInactiveColor(color = null, intensity = 0.85) {
        const inactiveColor = Color.Gray
        if (color == null)
            return "#dddddd"
        else
            return this.hexBrighten(color, intensity, inactiveColor)
    }

    static get Black() {
        return "#111111";
    }

    static get White() {
        return "#eeeeee"
    }

    static get Gray() {
        return "#dddddd"
    }
}