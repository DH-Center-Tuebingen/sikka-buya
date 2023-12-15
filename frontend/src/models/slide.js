import L from '@/leaflet'
import StringUtils from '../utils/StringUtils'

export class Slide {
    static formatDisplay(options) {
        throw new Error("Required method not implemented: formatDisplay(options).")
    }
}

function getLocationRow(options, mints) {
    const [lat, lng] = options.location.split(",").map(val => parseFloat(val))
    const center = L.latLng(lat, lng)

    const targetMints = (options.selectedMints.length === 0) ? mints : mints.filter(mint => options.selectedMints.includes(mint.id))

    let nearest = { mint: null, distance: Infinity }
    for (let mint of targetMints) {
        if (!mint?.location?.coordinates?.length || mint.location.coordinates.length === 0) continue
        const distance = center.distanceTo(L.latLng(mint.location.coordinates[0], mint.location.coordinates[1]))
        if (distance < nearest.distance) {
            nearest = { mint, distance }
        }
    }
    let locationText = `${lat.toFixed(3)}, ${lng.toFixed(3)}`
    if (nearest.mint != null && nearest.distance < 1000000 /* 1000km */) {
        locationText = `${StringUtils.clip(nearest.mint.name, 8)} (${Number((nearest.distance / 1000).toPrecision(2))}km)`
    }
    return new SlideDisplayRow({
        icon: "location-icon",
        text: locationText,
        columns: 6
    })
}

function getYearRow(options) {
    return (options.year) ? new SlideDisplayRow({
        icon: "calendar-icon",
        text: options.year.toString()
    }) : null
}

function getMintRow(options) {
    return (options.selectedMints.length > 0) ? new SlideDisplayRow({
        icon: "mint-icon",
        text: options.selectedMints.length.toString()
    }) : null
}

export class PoliticalSlide extends Slide {
    static formatDisplay(slide, mints) {
        const options = slide.options
        const rows = [getLocationRow(options, mints)]

        const secondRow = []
        const yearRow = getYearRow(options)
        if (yearRow) {
            secondRow.push(yearRow)
        }

        const mintRow = getMintRow(options)
        if (mintRow) {
            secondRow.push(mintRow)
        }


        if (options.selectedRulers.length > 0) {
            secondRow.push(new SlideDisplayRow({
                icon: "ruler-icon",
                text: options.selectedRulers.length.toString(),
            }))
        }

        secondRow.forEach(row => row.columns = 6 / secondRow.length)
        rows.push(...secondRow)

        slide.display = new SlideDisplay({
            rows
        })

        return slide
    }
}

export class FilterSlide extends Slide {
    static formatDisplay(slide, mints) {
        const options = slide.options
        const rows = [getLocationRow(options, mints)]
        const secondRow = []

        const yearRow = getYearRow(options)
        if (yearRow) {
            secondRow.push(yearRow)
        }

        const mintRow = getMintRow(options)
        if (mintRow) {
            secondRow.push(mintRow)
        }

        secondRow.forEach(row => row.columns = 6 / secondRow.length)

        slide.display = { rows: [...rows, ...secondRow] }

        return slide
    }
}

export class SlideDisplay {
    constructor({ rows } = {}) {
        this.rows = rows
    }
}

export class SlideDisplayRow {
    constructor({ icon, text, columns } = {}) {
        this.icon = icon
        this.text = text
        this.columns = columns
    }
}