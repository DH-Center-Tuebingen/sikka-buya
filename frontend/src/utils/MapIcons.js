import L from 'leaflet'

function makeMarker(options){
    if(!options. iconUrl) throw new Error("No iconUrl provided.")


    const width = 14
    const height = width * 2

    return L.icon(Object.assign({
        iconSize: [width, height],
        iconAnchor: [width/2, height],
        popupAnchor: [0, -height],
    }, options))
}

export const WhiteMarkerIcon = makeMarker({
    iconUrl: require('../assets/leaflet/marker-white.svg'),
})

export const BlackMarkerIcon = makeMarker({
    iconUrl: require('../assets/leaflet/marker-black.svg'),
})
